'use client';
import { useState, useEffect } from 'react';

type Reservasi = {
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
  created_at: string;
};

export default function AdminReservasi() {
  const [reservasiList, setReservasiList] = useState<Reservasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchReservasi = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reservasi');
      const json = await res.json();
      setReservasiList(json.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservasi();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/reservasi/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchReservasi();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredData = reservasiList.filter(item => {
    const matchSearch = item.pelanggan_nama.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? item.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-[#F8FAFC]" style={{ fontFamily: 'Poppins, sans-serif' }}>Kelola Reservasi</h1>
        <p className="text-[#94A3B8] mt-2">Atur dan pantau semua booking masuk.</p>
      </div>

      <div className="glass-card p-4 rounded-xl flex flex-wrap gap-4 items-center">
        <input 
          type="text" 
          placeholder="Cari pelanggan..." 
          className="input-field flex-1 min-w-[200px]" 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select 
          className="input-field flex-1 min-w-[150px] appearance-none"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="table-container rounded-xl">
        {loading ? (
           <div className="animate-pulse p-4 space-y-4">
              <div className="h-10 bg-white/5 rounded"></div>
              <div className="h-10 bg-white/5 rounded"></div>
              <div className="h-10 bg-white/5 rounded"></div>
           </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[#94A3B8] text-sm bg-white/5">
                <th className="py-4 px-4 font-medium">#</th>
                <th className="py-4 px-4 font-medium">Pelanggan</th>
                <th className="py-4 px-4 font-medium">Lapangan</th>
                <th className="py-4 px-4 font-medium">Tanggal</th>
                <th className="py-4 px-4 font-medium">Waktu</th>
                <th className="py-4 px-4 font-medium">Total Harga</th>
                <th className="py-4 px-4 font-medium">Status</th>
                <th className="py-4 px-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, i) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 text-[#94A3B8]">{row.id}</td>
                  <td className="py-4 px-4 text-[#F8FAFC] font-medium">{row.pelanggan_nama}</td>
                  <td className="py-4 px-4 text-[#F8FAFC]">{row.lapangan_nama}</td>
                  <td className="py-4 px-4 text-[#94A3B8]">{new Date(row.tanggal).toLocaleDateString('id-ID')}</td>
                  <td className="py-4 px-4 text-[#94A3B8]">{row.jam_mulai.substring(0,5)} - {row.jam_selesai.substring(0,5)}</td>
                  <td className="py-4 px-4 text-[#10B981]">Rp {row.total_harga.toLocaleString('id-ID')}</td>
                  <td className="py-4 px-4">
                    <span className={
                      row.status === 'confirmed' ? 'badge-confirmed' :
                      row.status === 'pending' ? 'badge-pending' :
                      row.status === 'completed' ? 'badge-completed' : 'badge-cancelled'
                    }>
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 flex gap-2 justify-end">
                    {row.status === 'pending' && (
                      <button onClick={() => updateStatus(row.id, 'confirmed')} className="bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                        Konfirmasi
                      </button>
                    )}
                    {(row.status === 'pending' || row.status === 'confirmed') && (
                      <button onClick={() => updateStatus(row.id, 'cancelled')} className="bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                        Batalkan
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#94A3B8]">Tidak ada data reservasi</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
    </div>
  );
}
