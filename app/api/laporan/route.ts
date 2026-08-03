/**
 * @file app/api/laporan/route.ts
 * @description API route untuk laporan pendapatan.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

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
    const params: any[] = [];

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

    const laporan = db.prepare(query).all(...params) as any[];

    // Calculate grand totals
    const grand_total = laporan.reduce((acc, curr) => ({
      total_booking: acc.total_booking + (curr.total_booking || 0),
      total_jam: acc.total_jam + (curr.total_jam || 0),
      total_revenue: acc.total_revenue + (curr.total_revenue || 0)
    }), { total_booking: 0, total_jam: 0, total_revenue: 0 });

    if (format === 'csv') {
      let csv = 'ID Lapangan,Nama Lapangan,Total Booking,Total Jam,Total Revenue\n';
      laporan.forEach(row => {
        csv += `${row.lapangan_id},${row.lapangan_nama},${row.total_booking || 0},${row.total_jam || 0},${row.total_revenue || 0}\n`;
      });
      csv += `Grand Total,,${grand_total.total_booking},${grand_total.total_jam},${grand_total.total_revenue}\n`;
      
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
