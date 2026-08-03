/**
 * @file app/api/auth/register/route.ts
 * @description API route untuk registrasi pelanggan baru.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RegisterSchema } from '@/lib/validasi';
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

    const existingUser = db.prepare('SELECT id FROM pelanggan WHERE email = ?').get(email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const info = db.prepare(
      'INSERT INTO pelanggan (nama, email, no_hp, password_hash) VALUES (?, ?, ?, ?)'
    ).run(nama, email, no_hp, hashedPassword);

    return NextResponse.json({
      message: 'Registrasi berhasil',
      data: {
        id: info.lastInsertRowid,
        nama,
        email,
        no_hp
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error register:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
