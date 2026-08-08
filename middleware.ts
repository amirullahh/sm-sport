/**
 * @file middleware.ts
 * @description Next.js middleware untuk proteksi route.
 * - Route /reservasi/* → harus login sebagai pelanggan
 * - Route /admin/* (kecuali /admin/login) → harus login sebagai admin
 * - Redirect ke halaman login jika belum terautentikasi
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'sm-sport-session';

/**
 * Secret JWT — FAIL-CLOSED. Tanpa JWT_SECRET yang valid, middleware
 * menolak semua akses (bukan memakai fallback yang bisa dipalsukan).
 */
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable tidak di-set');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Middleware untuk mengecek autentikasi pada route yang diproteksi.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Route yang diproteksi untuk pelanggan
  const isCustomerRoute = pathname.startsWith('/reservasi');
  // Route yang diproteksi untuk admin (kecuali login)
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  // API route yang diproteksi
  const isProtectedApi = pathname.startsWith('/api/reservasi') || 
                          pathname.startsWith('/api/pelanggan') ||
                          pathname.startsWith('/api/laporan');

  if (!isCustomerRoute && !isAdminRoute && !isProtectedApi) {
    return NextResponse.next();
  }

  // Ambil token dari cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json(
        { error: 'Unauthorized — silakan login terlebih dahulu' },
        { status: 401 }
      );
    }
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    // Cek role untuk admin route
    if (isAdminRoute && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Cek role untuk customer route
    if (isCustomerRoute && payload.role !== 'pelanggan') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Tambahkan info user ke header untuk diakses di API route
    const response = NextResponse.next();
    response.headers.set('x-user-id', String(payload.id));
    response.headers.set('x-user-role', String(payload.role));
    return response;
  } catch {
    // Token invalid atau expired
    if (isProtectedApi) {
      return NextResponse.json(
        { error: 'Session expired — silakan login ulang' },
        { status: 401 }
      );
    }
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

/**
 * Konfigurasi route yang akan diproses middleware.
 * Hanya route yang cocok pattern ini yang akan melewati middleware.
 */
export const config = {
  matcher: [
    '/reservasi/:path*',
    '/admin/:path*',
    '/api/reservasi/:path*',
    '/api/pelanggan/:path*',
    '/api/laporan/:path*',
  ],
};
