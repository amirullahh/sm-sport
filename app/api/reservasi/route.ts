/**
 * @file app/api/reservasi/route.ts
 * @description API route untuk manajemen reservasi.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ReservasiSchema, buatReservasi, validasiJamOperasional } from '@/lib/validasi';
import { getCurrentUser } from '@/lib/auth';

/**
 * List reservasi.
 * Jika pelanggan: hanya melihat miliknya.
 * Jika admin: melihat semua dengan filter (tanggal, status, lapangan_id, search).
 * @param request Request HTTP
 * @returns Response JSON
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get('tanggal');
    const status = searchParams.get('status');
    const lapangan_id = searchParams.get('lapangan_id');
    const search = searchParams.get('search');

    let query = `
      SELECT r.*, l.nama as lapangan_nama, p.nama as pelanggan_nama
      FROM reservasi r
      JOIN lapangan l ON r.lapangan_id = l.id
      JOIN pelanggan p ON r.pelanggan_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (user.role === 'pelanggan') {
      query += ` AND r.pelanggan_id = ?`;
      params.push(user.id);
    } else {
      // Admin filters
      if (tanggal) {
        query += ` AND r.tanggal = ?`;
        params.push(tanggal);
      }
      if (status) {
        query += ` AND r.status = ?`;
        params.push(status);
      }
      if (lapangan_id) {
        query += ` AND r.lapangan_id = ?`;
        params.push(lapangan_id);
      }
      if (search) {
        query += ` AND p.nama LIKE ?`;
        params.push(`%${search}%`);
      }
    }

    query += ` ORDER BY r.tanggal DESC, r.jam_mulai DESC`;

    const reservasi = db.prepare(query).all(...params);
    return NextResponse.json({ data: reservasi }, { status: 200 });

  } catch (error) {
    console.error('Error get reservasi:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}

/**
 * Membuat reservasi baru (hanya pelanggan).
 * @param request Request HTTP
 * @returns Response JSON
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'pelanggan') {
      return NextResponse.json({ error: 'Unauthorized, hanya pelanggan yang dapat membuat reservasi' }, { status: 403 });
    }

    const body = await request.json();
    const result = ReservasiSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { lapangan_id, tanggal, jam_mulai, jam_selesai, catatan } = body;

    if (!validasiJamOperasional(jam_mulai, jam_selesai)) {
      return NextResponse.json({ error: 'Jam booking harus dalam jam operasional (08:00 - 23:00)' }, { status: 400 });
    }

    try {
      const res = buatReservasi({
        lapangan_id,
        pelanggan_id: user.id,
        tanggal,
        jam_mulai,
        jam_selesai,
        catatan
      });

      return NextResponse.json({
        message: 'Reservasi berhasil dibuat',
        data: res
      }, { status: 201 });
      
    } catch (err: any) {
      if (err.message === 'BENTROK_JADWAL') {
        return NextResponse.json({ error: 'Jadwal bentrok dengan reservasi lain' }, { status: 409 });
      } else if (err.message === 'LAPANGAN_TIDAK_DITEMUKAN') {
        return NextResponse.json({ error: 'Lapangan tidak ditemukan' }, { status: 404 });
      } else if (err.message === 'LAPANGAN_NONAKTIF') {
        return NextResponse.json({ error: 'Lapangan sedang tidak aktif' }, { status: 400 });
      } else if (err.message === 'DURASI_INVALID') {
        return NextResponse.json({ error: 'Durasi jam tidak valid' }, { status: 400 });
      }
      throw err;
    }

  } catch (error) {
    console.error('Error create reservasi:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
