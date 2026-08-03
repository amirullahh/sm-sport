'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  // Mock data for initial render
  const stats = [
    { title: 'Reservasi Hari Ini', value: '12', icon: '📊', color: 'text-[#3B82F6]', delay: 'delay-[0ms]' },
    { title: 'Revenue Bulan Ini', value: 'Rp 4.500.000', icon: '💰', color: 'text-[#10B981]', delay: 'delay-[100ms]' },
    { title: 'Lapangan Aktif', value: '4', icon: '🏟️', color: 'text-[#F59E0B]', delay: 'delay-[200ms]' },
    { title: 'Total Pelanggan', value: '128', icon: '👥', color: 'text-[#8B5CF6]', delay: 'delay-[300ms]' },
  ];

  useEffect(() => {
    // Simulate fetching data on mount
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-[#F8FAFC]">Selamat Datang, Admin 👋</h1>
        <p className="text-[#94A3B8] mt-2">Ringkasan aktivitas SM Sport Center hari ini.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="glass-card p-6 h-32 animate-pulse bg-white/5 border border-white/10 rounded-xl" />
            ))
          : stats.map((stat, i) => (
              <div key={i} className={`glass-card p-6 rounded-xl animate-slideUp ${stat.delay} border-t-2 border-t-transparent hover:border-t-[#10B981] transition-all duration-300`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#94A3B8] text-sm font-medium mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-[#F8FAFC]">{stat.value}</h3>
                  </div>
                  <div className={`text-3xl ${stat.color}`}>{stat.icon}</div>
                </div>
              </div>
            ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reservations */}
        <div className="lg:col-span-2 glass-card p-6 rounded-xl animate-slideUp delay-[400ms]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#F8FAFC]">Reservasi Terbaru</h2>
            <Link href="/admin/reservasi" className="text-[#10B981] text-sm hover:underline">Lihat Semua</Link>
          </div>
          
          <div className="table-container">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[#94A3B8] text-sm">
                  <th className="py-3 px-4 font-medium">Pelanggan</th>
                  <th className="py-3 px-4 font-medium">Lapangan</th>
                  <th className="py-3 px-4 font-medium">Waktu</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td colSpan={4} className="py-4 px-4"><div className="h-6 bg-white/5 rounded animate-pulse w-full"></div></td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-[#F8FAFC]">Budi Santoso</td>
                      <td className="py-3 px-4 text-[#94A3B8]">Futsal 1</td>
                      <td className="py-3 px-4 text-[#94A3B8]">19:00 - 21:00</td>
                      <td className="py-3 px-4"><span className="badge-confirmed">Confirmed</span></td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-[#F8FAFC]">Andi Wijaya</td>
                      <td className="py-3 px-4 text-[#94A3B8]">Badminton A</td>
                      <td className="py-3 px-4 text-[#94A3B8]">20:00 - 22:00</td>
                      <td className="py-3 px-4"><span className="badge-pending">Pending</span></td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-[#F8FAFC]">Siti Aminah</td>
                      <td className="py-3 px-4 text-[#94A3B8]">Badminton B</td>
                      <td className="py-3 px-4 text-[#94A3B8]">16:00 - 18:00</td>
                      <td className="py-3 px-4"><span className="badge-completed">Selesai</span></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 rounded-xl animate-slideUp delay-[500ms]">
          <h2 className="text-xl font-bold text-[#F8FAFC] mb-6">Aksi Cepat</h2>
          <div className="space-y-4">
            <Link href="/admin/lapangan" className="flex items-center gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors w-full">
              <span className="text-2xl">🏟️</span>
              <div className="text-left">
                <p className="text-[#F8FAFC] font-medium">Tambah Lapangan</p>
                <p className="text-[#94A3B8] text-xs">Kelola data lapangan baru</p>
              </div>
            </Link>
            <Link href="/admin/laporan" className="flex items-center gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors w-full">
              <span className="text-2xl">📥</span>
              <div className="text-left">
                <p className="text-[#F8FAFC] font-medium">Unduh Laporan</p>
                <p className="text-[#94A3B8] text-xs">Export data revenue CSV</p>
              </div>
            </Link>
            <Link href="/admin/reservasi" className="flex items-center gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors w-full">
              <span className="text-2xl">✅</span>
              <div className="text-left">
                <p className="text-[#F8FAFC] font-medium">Konfirmasi Booking</p>
                <p className="text-[#94A3B8] text-xs">Lihat reservasi pending</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
