/**
 * @file lib/auth.ts
 * @description Modul autentikasi: sign/verify JWT, cookie helper, getCurrentUser.
 * Menggunakan library `jose` untuk JWT dan httpOnly cookie untuk keamanan.
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

/**
 * Secret key untuk signing JWT, di-encode ke Uint8Array.
 * Dibaca lazy (saat dipakai) supaya error muncul ketika token diproses,
 * bukan saat module di-load. FAIL-CLOSED: jika JWT_SECRET tidak di-set,
 * langsung throw — tidak ada fallback hardcoded yang bisa dipalsukan.
 */
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable tidak di-set. ' +
      'Set nilai acak yang kuat (min. 32 karakter) sebelum deploy.'
    );
  }
  return new TextEncoder().encode(secret);
}

/** Nama cookie untuk session */
const COOKIE_NAME = 'sm-sport-session';

/** Durasi token: 24 jam */
const TOKEN_EXPIRY = '24h';

/**
 * Payload yang disimpan dalam JWT token.
 */
export interface TokenPayload {
  id: number;
  role: 'pelanggan' | 'admin';
  nama?: string;
  email?: string;
  username?: string;
}

/**
 * Membuat JWT token baru dengan payload yang diberikan.
 * @param payload - Data user yang akan disimpan di token
 * @returns JWT token string
 */
export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getJwtSecret());
}

/**
 * Memverifikasi dan decode JWT token.
 * @param token - JWT token string
 * @returns Payload dari token, atau null jika token invalid/expired
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Menyimpan JWT token ke httpOnly cookie.
 * httpOnly mencegah akses dari JavaScript (XSS protection).
 * @param token - JWT token string
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 jam
    path: '/',
  });
}

/**
 * Menghapus cookie session (logout).
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  // Also clear the client-side UI state cookie
  cookieStore.set('sm-sport-logged-in', '', {
    httpOnly: false,
    maxAge: 0,
    path: '/',
  });
}

/**
 * Mengambil data user yang sedang login dari cookie.
 * @returns TokenPayload jika user sudah login, null jika belum
 */
export async function getCurrentUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Mengambil token mentah dari cookie (untuk middleware).
 * @returns Token string atau undefined
 */
export function getTokenFromCookie(cookieHeader: string): string | undefined {
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match?.[1];
}
