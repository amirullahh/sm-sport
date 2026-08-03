/**
 * @file app/api/lapangan/route.ts
 * @description API route untuk manajemen lapangan.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LapanganSchema } from '@/lib/validasi';
import { getCurrentUser } from '@/lib/auth';

/**
 * List semua lapangan yang aktif.
 * @returns Response JSON
 */
export async function GET() {
  try {
    // Admin sees all, public sees only aktif
    const user = await getCurrentUser();
    const isAdmin = user?.role === 'admin';
    const lapangan = isAdmin
      ? db.prepare('SELECT id, nama, jenis, harga_per_jam, status, created_at FROM lapangan').all()
      : db.prepare('SELECT id, nama, jenis, harga_per_jam, status, created_at FROM lapangan WHERE status = ?').all('aktif');
    return NextResponse.json({ data: lapangan }, { status: 200 });
  } catch (error) {
    console.error('Error get lapangan:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}

/**
 * Membuat lapangan baru (hanya admin).
 * @param request Request HTTP
 * @returns Response JSON
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const result = LapanganSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { nama, jenis, harga_per_jam } = result.data;

    const info = db.prepare(
      'INSERT INTO lapangan (nama, jenis, harga_per_jam, status) VALUES (?, ?, ?, ?)'
    ).run(nama, jenis, harga_per_jam, 'aktif');

    return NextResponse.json({
      message: 'Lapangan berhasil dibuat',
      data: {
        id: info.lastInsertRowid,
        nama,
        jenis,
        harga_per_jam,
        status: 'aktif'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error create lapangan:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
