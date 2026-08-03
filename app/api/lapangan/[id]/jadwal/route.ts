/**
 * @file app/api/lapangan/[id]/jadwal/route.ts
 * @description API route untuk melihat jadwal reservasi pada lapangan dan tanggal tertentu.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Mengambil jadwal reservasi untuk lapangan tertentu pada tanggal tertentu.
 * @param request Request HTTP
 * @param params Parameter URL (id lapangan)
 * @returns Response JSON
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get('tanggal');

    if (!tanggal) {
      return NextResponse.json({ error: 'Parameter tanggal diperlukan (YYYY-MM-DD)' }, { status: 400 });
    }

    const jadwal = db.prepare(`
      SELECT id, jam_mulai, jam_selesai, status
      FROM reservasi
      WHERE lapangan_id = ? 
        AND tanggal = ?
        AND status IN ('pending', 'confirmed')
      ORDER BY jam_mulai ASC
    `).all(id, tanggal);

    return NextResponse.json({ data: jadwal }, { status: 200 });

  } catch (error) {
    console.error('Error get jadwal lapangan:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
