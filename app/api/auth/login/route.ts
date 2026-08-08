/**
 * @file app/api/auth/login/route.ts
 * @description API route untuk login pelanggan.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LoginSchema } from '@/lib/validasi';
import { signToken, setAuthCookie } from '@/lib/auth';
import { checkRateLimit, clearRateLimit, getClientIp } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';

/**
 * Login pelanggan.
 * @param request Request HTTP
 * @returns Response JSON
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { email, password } = result.data;

    // Normalisasi email (sama seperti di register) agar case tidak membuat
    // akun tidak bisa login.
    const normalizedEmail = email.trim().toLowerCase();

    // Rate limit: gabungkan IP + email agar satu akun tidak diburu brute-force,
    // tanpa mengunci semua user pada IP yang sama.
    const rateKey = `login:${getClientIp(request)}:${normalizedEmail}`;
    const rate = checkRateLimit(rateKey);
    if (!rate.allowed) {
      return NextResponse.json({
        error: `Terlalu banyak percobaan login. Coba lagi dalam ${rate.retryAfterSeconds} detik.`
      }, { status: 429 });
    }

    const pelanggan = db.prepare('SELECT id, nama, email, password_hash FROM pelanggan WHERE email = ?').get(normalizedEmail) as
      | { id: number; nama: string; email: string; password_hash: string }
      | undefined;

    if (!pelanggan) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const isMatch = bcrypt.compareSync(password, pelanggan.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    // Login berhasil → reset counter percobaan gagal untuk key ini.
    clearRateLimit(rateKey);

    const tokenPayload = {
      id: pelanggan.id,
      role: 'pelanggan' as const,
      nama: pelanggan.nama,
      email: pelanggan.email
    };

    const token = await signToken(tokenPayload);
    await setAuthCookie(token);

    return NextResponse.json({
      message: 'Login berhasil',
      data: {
        id: pelanggan.id,
        nama: pelanggan.nama,
        email: pelanggan.email
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error login:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
