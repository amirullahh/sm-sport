/**
 * @file app/api/pelanggan/route.ts
 * @description API route untuk list pelanggan.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

/**
 * List semua pelanggan (hanya admin).
 * @param request Request HTTP
 * @returns Response JSON
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = `SELECT id, nama, email, no_hp, created_at FROM pelanggan`;
    const params: string[] = [];

    if (search) {
      query += ` WHERE nama LIKE ? OR email LIKE ? OR no_hp LIKE ?`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ` ORDER BY created_at DESC`;

    const pelanggan = db.prepare(query).all(...params);
    return NextResponse.json({ data: pelanggan }, { status: 200 });

  } catch (error) {
    console.error('Error get pelanggan:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
