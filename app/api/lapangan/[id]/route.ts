/**
 * @file app/api/lapangan/[id]/route.ts
 * @description API route untuk update dan delete lapangan (soft delete).
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LapanganSchema } from '@/lib/validasi';
import { getCurrentUser } from '@/lib/auth';

/**
 * Update data lapangan (hanya admin).
 * @param request Request HTTP
 * @param params Parameter URL (id lapangan)
 * @returns Response JSON
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = LapanganSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { nama, jenis, harga_per_jam } = result.data;

    const existingLapangan = db.prepare('SELECT id FROM lapangan WHERE id = ?').get(id);
    if (!existingLapangan) {
      return NextResponse.json({ error: 'Lapangan tidak ditemukan' }, { status: 404 });
    }

    db.prepare(
      'UPDATE lapangan SET nama = ?, jenis = ?, harga_per_jam = ? WHERE id = ?'
    ).run(nama, jenis, harga_per_jam, id);

    return NextResponse.json({
      message: 'Lapangan berhasil diupdate',
      data: { id: Number(id), nama, jenis, harga_per_jam }
    }, { status: 200 });

  } catch (error) {
    console.error('Error update lapangan:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}

/**
 * Soft delete lapangan (set status jadi 'nonaktif') (hanya admin).
 * @param request Request HTTP
 * @param params Parameter URL (id lapangan)
 * @returns Response JSON
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    const existingLapangan = db.prepare('SELECT id FROM lapangan WHERE id = ?').get(id);
    if (!existingLapangan) {
      return NextResponse.json({ error: 'Lapangan tidak ditemukan' }, { status: 404 });
    }

    db.prepare('UPDATE lapangan SET status = ? WHERE id = ?').run('nonaktif', id);

    return NextResponse.json({ message: 'Lapangan berhasil dinonaktifkan' }, { status: 200 });

  } catch (error) {
    console.error('Error delete lapangan:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
