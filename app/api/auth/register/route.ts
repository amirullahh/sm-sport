/**
 * @file app/api/auth/register/route.ts
 * @description API route untuk registrasi pelanggan baru.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RegisterSchema } from '@/lib/validasi';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';

/**
 * Mendaftarkan pelanggan baru.
 * @param request Request HTTP
 * @returns Response JSON
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { nama, email, no_hp, password } = result.data;

    // Rate limit registrasi per IP untuk mencegah spam akun.
    const rateKey = `register:${getClientIp(request)}`;
    const rate = checkRateLimit(rateKey, 10, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json({
        error: `Terlalu banyak pendaftaran. Coba lagi dalam ${rate.retryAfterSeconds} detik.`
      }, { status: 429 });
    }

    // Normalisasi email: lowercase untuk cek duplikat yang konsisten.
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = db.prepare('SELECT id FROM pelanggan WHERE email = ?').get(normalizedEmail);
    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
      const info = db.prepare(
        'INSERT INTO pelanggan (nama, email, no_hp, password_hash) VALUES (?, ?, ?, ?)'
      ).run(nama, normalizedEmail, no_hp, hashedPassword);

      return NextResponse.json({
        message: 'Registrasi berhasil',
        data: {
          id: info.lastInsertRowid,
          nama,
          email: normalizedEmail,
          no_hp
        }
      }, { status: 201 });
    } catch (error: unknown) {
      // SQLite UNIQUE constraint — race condition saat dua request daftar
      // dengan email sama bersamaan. Tangani dengan pesan 409, bukan 500.
      if (error instanceof Error && error.message.includes('UNIQUE')) {
        return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 });
      }
      throw error;
    }

  } catch (error) {
    console.error('Error register:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
