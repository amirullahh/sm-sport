/**
 * @file app/api/admin/login/route.ts
 * @description API route untuk login admin.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminLoginSchema } from '@/lib/validasi';
import { signToken, setAuthCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

/**
 * Login admin.
 * @param request Request HTTP
 * @returns Response JSON
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = AdminLoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { username, password } = result.data;

    const admin = db.prepare('SELECT id, username, password_hash FROM admin WHERE username = ?').get(username) as any;
    
    if (!admin) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const isMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const tokenPayload = {
      id: admin.id,
      role: 'admin' as const,
      nama: admin.username,
      username: admin.username
    };

    const token = await signToken(tokenPayload);
    await setAuthCookie(token);

    return NextResponse.json({
      message: 'Login berhasil',
      data: {
        id: admin.id,
        nama: admin.username,
        username: admin.username
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error admin login:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
