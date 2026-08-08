'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stat {
  title: string;
  value: string;
  icon: string;
  color: string;
}

interface ReservasiRow {
  id: number;
  pelanggan_nama: string;
  lapangan_nama: string;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  status: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([
    { title: 'Reservasi Hari Ini', value: '—', icon: '📊', color: 'text-[#3B82F6]' },
    { title: 'Revenue Bulan Ini', value: '—', icon: '💰', color: 'text-[#10B981]' },
    { title: 'Lapangan Aktif', value: '—', icon: '🏟️', color: 'text-[#F59E0B]' },
    { title: 'Total Pelanggan', value: '—', icon: '👥', color: 'text-[#8B5CF6]' },
  ]);
  const [recentReservasi, setRecentReservasi] = useState<ReservasiRow[]>([]);

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const firstOfMonth = today.substring(0, 8) + '01';

        const [resReservasi, resLapangan, resPelanggan, resLaporan] = await Promise.all([
          fetch(`/api/reservasi`),
          fetch(`/api/lapangan`),
          fetch(`/api/pelanggan`),
          fetch(`/api/laporan?dari=${firstOfMonth}&sampai=${today}`),
        ]);

        const reservasiJson = resReservasi.ok ? await resReservasi.json() : { data: [] };
        const lapanganJson = resLapangan.ok ? await resLapangan.json() : { data: [] };
        const pelangganJson = resPelanggan.ok ? await resPelanggan.json() : { data: [] };
        const laporanJson = resLaporan.ok ? await resLaporan.json() : { data: { grand_total: { total_revenue: 0 } } };

        const allReservasi = (reservasiJson.data || []) as ReservasiRow[];
        const todayReservasi = allReservasi.filter((r) => r.tanggal === today);
        const lapanganCount = (lapanganJson.data || []).length;
        const pelangganCount = (pelangganJson.data || []).length;
        const revenue = laporanJson.data?.grand_total?.total_revenue || 0;

        if (!active) return;
        setStats([
          { title: 'Reservasi Hari Ini', value: String(todayReservasi.length), icon: '📊', color: 'text-[#3B82F6]' },
          { title: 'Revenue Bulan Ini', value: formatRupiah(revenue), icon: '💰', color: 'text-[#10B981]' },
          { title: 'Lapangan Aktif', value: String(lapanganCount), icon: '🏟️', color: 'text-[#F59E0B]' },
          { title: 'Total Pelanggan', value: String(pelangganCount), icon: '👥', color: 'text-[#8B5CF6]' },
        ]);

        // Recent 5 reservasi
        setRecentReservasi(allReservasi.slice(0, 5));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'badge-confirmed';
      case 'pending': return 'badge-pending';
      case 'cancelled': return 'badge-cancelled';
      case 'completed': return 'badge-completed';
      default: return '';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-[#F8FAFC]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Selamat Datang, Admin 👋
        </h1>
        <p className="text-[#94A3B8] mt-2">Ringkasan aktivitas SM Sport Center.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass-card p-6 rounded-xl animate-slideUp border-t-2 border-t-transparent hover:border-t-[#10B981] transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[#94A3B8] text-sm font-medium mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-[#F8FAFC]">
                  {loading ? <span className="inline-block w-16 h-7 bg-white/10 rounded animate-pulse" /> : stat.value}
                </h3>
              </div>
              <div className={`text-3xl ${stat.color}`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reservations */}
      <div className="glass-card p-6 rounded-xl animate-slideUp">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#F8FAFC]">Reservasi Terbaru</h2>
          <Link href="/admin/reservasi" className="text-[#10B981] text-sm hover:underline">
            Lihat Semua
          </Link>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Pelanggan</th>
                <th>Lapangan</th>
                <th>Tanggal</th>
                <th>Waktu</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5}>
                        <div className="h-6 bg-white/5 rounded animate-pulse w-full" />
                      </td>
                    </tr>
                  ))
              ) : recentReservasi.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-[#94A3B8] py-8">
                    Belum ada reservasi
                  </td>
                </tr>
              ) : (
                recentReservasi.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="text-[#F8FAFC]">{r.pelanggan_nama}</td>
                    <td className="text-[#94A3B8]">{r.lapangan_nama}</td>
                    <td className="text-[#94A3B8]">{r.tanggal}</td>
                    <td className="text-[#94A3B8]">{r.jam_mulai} - {r.jam_selesai}</td>
                    <td>
                      <span className={`badge ${getBadgeClass(r.status)}`}>{r.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/lapangan" className="glass-card p-6 rounded-xl hover:bg-white/5 transition-all group">
          <span className="text-2xl mb-2 block">🏟️</span>
          <h3 className="font-bold text-[#F8FAFC] group-hover:text-[#10B981] transition-colors">Kelola Lapangan</h3>
          <p className="text-[#94A3B8] text-sm mt-1">Tambah, edit, dan nonaktifkan lapangan</p>
        </Link>
        <Link href="/admin/reservasi" className="glass-card p-6 rounded-xl hover:bg-white/5 transition-all group">
          <span className="text-2xl mb-2 block">📋</span>
          <h3 className="font-bold text-[#F8FAFC] group-hover:text-[#10B981] transition-colors">Kelola Reservasi</h3>
          <p className="text-[#94A3B8] text-sm mt-1">Konfirmasi dan kelola booking</p>
        </Link>
        <Link href="/admin/laporan" className="glass-card p-6 rounded-xl hover:bg-white/5 transition-all group">
          <span className="text-2xl mb-2 block">📊</span>
          <h3 className="font-bold text-[#F8FAFC] group-hover:text-[#10B981] transition-colors">Laporan Revenue</h3>
          <p className="text-[#94A3B8] text-sm mt-1">Lihat laporan pendapatan</p>
        </Link>
      </div>
    </div>
  );
}
