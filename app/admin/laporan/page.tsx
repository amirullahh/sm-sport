'use client';
import { useState, useEffect } from 'react';

type LaporanItem = {
  lapangan_id: number;
  lapangan_nama: string;
  total_booking: number;
  total_jam: number;
  total_revenue: number;
};

type LaporanData = {
  data: LaporanItem[];
  grand_total: {
    total_booking: number;
    total_jam: number;
    total_revenue: number;
  };
};

export default function AdminLaporan() {
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');
  const [lapanganId, setLapanganId] = useState('all');
  const [lapanganList, setLapanganList] = useState<{id: number, nama: string}[]>([]);
  const [laporan, setLaporan] = useState<LaporanData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/lapangan').then(res => res.json()).then(json => setLapanganList(json.data || []));
  }, []);

  const fetchLaporan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dari || !sampai) return;

    try {
      setLoading(true);
      let url = `/api/laporan?dari=${dari}&sampai=${sampai}`;
      if (lapanganId !== 'all') {
        url += `&lapangan_id=${lapanganId}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      setLaporan(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!dari || !sampai) {
      alert('Pilih tanggal dari dan sampai terlebih dahulu');
      return;
    }
    let url = `/api/laporan?format=csv&dari=${dari}&sampai=${sampai}`;
    if (lapanganId !== 'all') {
      url += `&lapangan_id=${lapanganId}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-[#F8FAFC]" style={{ fontFamily: 'Poppins, sans-serif' }}>Laporan & Revenue</h1>
        <p className="text-[#94A3B8] mt-2">Statistik penggunaan lapangan dan pendapatan.</p>
      </div>

      <div className="glass-card p-6 rounded-xl space-y-4">
        <h2 className="text-[#F8FAFC] font-semibold mb-4">Filter Laporan</h2>
        <form onSubmit={fetchLaporan} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-[#94A3B8] mb-1">Tanggal Dari</label>
            <input 
              type="date" 
              className="input-field w-full" 
              value={dari}
              onChange={e => setDari(e.target.value)}
              required
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-[#94A3B8] mb-1">Tanggal Sampai</label>
            <input 
              type="date" 
              className="input-field w-full" 
              value={sampai}
              onChange={e => setSampai(e.target.value)}
              required
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-[#94A3B8] mb-1">Lapangan</label>
            <select 
              className="input-field w-full appearance-none"
              value={lapanganId}
              onChange={e => setLapanganId(e.target.value)}
            >
              <option value="all">Semua Lapangan</option>
              {lapanganList.map(lap => (
                <option key={lap.id} value={lap.id}>{lap.nama}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary h-[42px] px-8" disabled={loading}>
            {loading ? 'Memuat...' : 'Tampilkan'}
          </button>
        </form>
      </div>

      {laporan && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-xl border border-white/10 text-center">
              <p className="text-[#94A3B8] mb-2">Total Booking</p>
              <h3 className="text-4xl font-bold text-[#F8FAFC]">{laporan.grand_total?.total_booking || 0}</h3>
            </div>
            <div className="glass-card p-6 rounded-xl border border-white/10 text-center">
              <p className="text-[#94A3B8] mb-2">Total Jam Sewa</p>
              <h3 className="text-4xl font-bold text-[#3B82F6]">{laporan.grand_total?.total_jam || 0} <span className="text-xl text-[#94A3B8] font-normal">Jam</span></h3>
            </div>
            <div className="glass-card p-6 rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 text-center">
              <p className="text-[#94A3B8] mb-2">Total Revenue</p>
              <h3 className="text-4xl font-bold text-[#10B981]">Rp {(laporan.grand_total?.total_revenue || 0).toLocaleString('id-ID')}</h3>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#F8FAFC]">Detail Pendapatan per Lapangan</h2>
              <button onClick={handleExportCSV} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                <span>📥</span> Export CSV
              </button>
            </div>
            
            <div className="table-container">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[#94A3B8] text-sm">
                    <th className="py-3 px-4 font-medium">Lapangan</th>
                    <th className="py-3 px-4 font-medium text-center">Total Booking</th>
                    <th className="py-3 px-4 font-medium text-center">Total Jam</th>
                    <th className="py-3 px-4 font-medium text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {laporan.data?.map((item, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-[#F8FAFC]">{item.lapangan_nama}</td>
                      <td className="py-3 px-4 text-center text-[#F8FAFC]">{item.total_booking}</td>
                      <td className="py-3 px-4 text-center text-[#F8FAFC]">{item.total_jam}</td>
                      <td className="py-3 px-4 text-right text-[#10B981] font-medium">Rp {item.total_revenue.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                  {(!laporan.data || laporan.data.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#94A3B8]">Tidak ada data pada periode ini</td>
                    </tr>
                  )}
                  {laporan.data?.length > 0 && (
                    <tr className="bg-white/5 border-t-2 border-white/20 font-bold">
                      <td className="py-4 px-4 text-[#F8FAFC] text-right">Grand Total</td>
                      <td className="py-4 px-4 text-center text-[#F8FAFC]">{laporan.grand_total?.total_booking || 0}</td>
                      <td className="py-4 px-4 text-center text-[#F8FAFC]">{laporan.grand_total?.total_jam || 0}</td>
                      <td className="py-4 px-4 text-right text-[#10B981]">Rp {(laporan.grand_total?.total_revenue || 0).toLocaleString('id-ID')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
