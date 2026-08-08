/**
 * @file app/api/laporan/route.ts
 * @description API route untuk laporan pendapatan.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

/** Baris hasil query laporan per lapangan. */
interface LaporanRow {
  lapangan_id: number;
  lapangan_nama: string;
  total_booking: number | null;
  total_jam: number | null;
  total_revenue: number | null;
}

/**
 * Amankan sel CSV dari formula injection.
 * Excel/Google Sheets mengeksekusi sel yang diawali =, +, -, atau @.
 */
function sanitizeCsvCell(value: unknown): string {
  const str = String(value ?? '');
  return /^[=+\-@]/.test(str) ? `'${str}` : str;
}

/**
 * Mendapatkan laporan pendapatan reservasi (hanya admin).
 * @param request Request HTTP
 * @returns Response JSON / CSV
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const dari = searchParams.get('dari');
    const sampai = searchParams.get('sampai');
    const lapangan_id = searchParams.get('lapangan_id');
    const format = searchParams.get('format');

    let query = `
      SELECT 
        l.id as lapangan_id,
        l.nama as lapangan_nama,
        COUNT(r.id) as total_booking,
        SUM(
          (strftime('%s', '1970-01-01 ' || r.jam_selesai || ':00') - strftime('%s', '1970-01-01 ' || r.jam_mulai || ':00')) / 3600.0
        ) as total_jam,
        SUM(r.total_harga) as total_revenue
      FROM lapangan l
      LEFT JOIN reservasi r ON l.id = r.lapangan_id AND r.status IN ('confirmed', 'completed')
    `;
    
    const whereConditions: string[] = [];
    const params: (string | number)[] = [];

    if (dari) {
      whereConditions.push(`r.tanggal >= ?`);
      params.push(dari);
    }
    if (sampai) {
      whereConditions.push(`r.tanggal <= ?`);
      params.push(sampai);
    }
    if (lapangan_id) {
      whereConditions.push(`l.id = ?`);
      params.push(lapangan_id);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ` + whereConditions.join(' AND ');
    }

    query += ` GROUP BY l.id, l.nama`;

    const laporan = db.prepare(query).all(...params) as LaporanRow[];

    // Calculate grand totals
    const grand_total = laporan.reduce((acc, curr) => ({
      total_booking: acc.total_booking + (curr.total_booking || 0),
      total_jam: acc.total_jam + (curr.total_jam || 0),
      total_revenue: acc.total_revenue + (curr.total_revenue || 0)
    }), { total_booking: 0, total_jam: 0, total_revenue: 0 });

    if (format === 'csv') {
      const header = 'ID Lapangan,Nama Lapangan,Total Booking,Total Jam,Total Revenue';
      const rows = laporan.map(row => [
        sanitizeCsvCell(row.lapangan_id),
        sanitizeCsvCell(row.lapangan_nama),
        sanitizeCsvCell(row.total_booking ?? 0),
        sanitizeCsvCell(row.total_jam ?? 0),
        sanitizeCsvCell(row.total_revenue ?? 0),
      ].join(','));
      const grandRow = [
        'Grand Total', '',
        sanitizeCsvCell(grand_total.total_booking),
        sanitizeCsvCell(grand_total.total_jam),
        sanitizeCsvCell(grand_total.total_revenue),
      ].join(',');

      const csv = [header, ...rows, grandRow].join('\n');
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="laporan_pendapatan.csv"`
        }
      });
    }

    return NextResponse.json({
      data: laporan,
      grand_total
    }, { status: 200 });

  } catch (error) {
    console.error('Error get laporan:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
