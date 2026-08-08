/**
 * @file app/api/reservasi/[id]/route.ts
 * @description API route untuk get detail dan update status reservasi.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { validasiTanggalMasaLalu } from '@/lib/validasi';

/**
 * Mengambil detail reservasi tunggal.
 * @param request Request HTTP
 * @param params Parameter URL (id reservasi)
 * @returns Response JSON
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const reservasi = db.prepare(`
      SELECT r.*, l.nama as lapangan_nama, p.nama as pelanggan_nama, p.no_hp
      FROM reservasi r
      JOIN lapangan l ON r.lapangan_id = l.id
      JOIN pelanggan p ON r.pelanggan_id = p.id
      WHERE r.id = ?
    `).get(id) as
      | {
          id: number;
          lapangan_id: number;
          pelanggan_id: number;
          tanggal: string;
          jam_mulai: string;
          jam_selesai: string;
          total_harga: number;
          status: string;
          lapangan_nama: string;
          pelanggan_nama: string;
          no_hp: string;
        }
      | undefined;

    if (!reservasi) {
      return NextResponse.json({ error: 'Reservasi tidak ditemukan' }, { status: 404 });
    }

    if (user.role === 'pelanggan' && reservasi.pelanggan_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ data: reservasi }, { status: 200 });

  } catch (error) {
    console.error('Error get detail reservasi:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}

/**
 * Update status reservasi.
 * Pelanggan: hanya bisa membatalkan (canceled) reservasi sendiri sebelum jadwal dimulai.
 * Admin: bisa update status (confirmed/canceled) bebas.
 * @param request Request HTTP
 * @param params Parameter URL (id reservasi)
 * @returns Response JSON
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
    }

    const reservasi = db.prepare('SELECT * FROM reservasi WHERE id = ?').get(id) as
      | {
          id: number;
          pelanggan_id: number;
          tanggal: string;
          jam_mulai: string;
          status: string;
        }
      | undefined;

    if (!reservasi) {
      return NextResponse.json({ error: 'Reservasi tidak ditemukan' }, { status: 404 });
    }

    if (user.role === 'pelanggan') {
      if (reservasi.pelanggan_id !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      if (status !== 'cancelled') {
        return NextResponse.json({ error: 'Pelanggan hanya bisa membatalkan reservasi' }, { status: 403 });
      }
      if (reservasi.status !== 'pending' && reservasi.status !== 'confirmed') {
        return NextResponse.json({ error: 'Reservasi tidak dapat dibatalkan' }, { status: 400 });
      }

      // Pelanggan hanya boleh membatalkan SEBELUM jadwal dimulai.
      // Menangani tanggal masa lalu sekaligus jadwal hari ini yang sudah lewat.
      if (!validasiTanggalMasaLalu(reservasi.tanggal, reservasi.jam_mulai)) {
        return NextResponse.json({ error: 'Tidak dapat membatalkan reservasi yang sudah lewat atau sedang berlangsung' }, { status: 400 });
      }
    }

    // Admin / pelanggan: setiap perubahan status mencatat updated_at.
    db.prepare(
      `UPDATE reservasi SET status = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(status, id);

    return NextResponse.json({ message: 'Status reservasi berhasil diupdate' }, { status: 200 });

  } catch (error) {
    console.error('Error update reservasi:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
