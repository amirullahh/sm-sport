/**
 * @file app/api/admin/login/route.ts
 * @description API route untuk login admin.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AdminLoginSchema } from '@/lib/validasi';
import { signToken, setAuthCookie } from '@/lib/auth';
import { checkRateLimit, clearRateLimit, getClientIp } from '@/lib/rate-limit';
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

    // Rate limit khusus admin: lebih ketat (5 percobaan / 15 menit / IP+username).
    const rateKey = `admin-login:${getClientIp(request)}:${username.toLowerCase()}`;
    const rate = checkRateLimit(rateKey, 5, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json({
        error: `Terlalu banyak percobaan login. Coba lagi dalam ${rate.retryAfterSeconds} detik.`
      }, { status: 429 });
    }

    const admin = db.prepare('SELECT id, username, password_hash FROM admin WHERE username = ?').get(username) as
      | { id: number; username: string; password_hash: string }
      | undefined;

    if (!admin) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const isMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    clearRateLimit(rateKey);

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
