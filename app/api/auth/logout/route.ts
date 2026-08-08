/**
 * @file app/api/auth/logout/route.ts
 * @description API route untuk logout.
 */

import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

/**
 * Logout user.
 * @param request Request HTTP
 * @returns Response JSON
 */
export async function POST() {
  try {
    await clearAuthCookie();
    return NextResponse.json({ message: 'Logout berhasil' }, { status: 200 });
  } catch (error) {
    console.error('Error logout:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
