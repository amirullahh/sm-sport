/**
 * @file app/api/auth/login/route.ts
 * @description API route untuk login pelanggan.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LoginSchema } from '@/lib/validasi';
import { signToken, setAuthCookie } from '@/lib/auth';
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

    const pelanggan = db.prepare('SELECT id, nama, email, password_hash FROM pelanggan WHERE email = ?').get(email) as any;
    
    if (!pelanggan) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const isMatch = bcrypt.compareSync(password, pelanggan.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

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
