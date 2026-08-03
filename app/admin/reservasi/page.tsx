'use client';
import { useState } from 'react';

export default function AdminReservasi() {
  const [loading] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-[#F8FAFC]">Kelola Reservasi</h1>
        <p className="text-[#94A3B8] mt-2">Atur dan pantau semua booking masuk.</p>
      </div>

      <div className="glass-card p-4 rounded-xl flex flex-wrap gap-4 items-center">
        <input type="text" placeholder="Cari pelanggan..." className="input-field flex-1 min-w-[200px]" />
        <input type="date" className="input-field flex-1 min-w-[150px]" />
        <select className="input-field flex-1 min-w-[150px] appearance-none">
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="btn-secondary whitespace-nowrap">Filter</button>
      </div>

      <div className="table-container rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[#94A3B8] text-sm bg-white/5">
              <th className="py-4 px-4 font-medium">#</th>
              <th className="py-4 px-4 font-medium">Pelanggan</th>
              <th className="py-4 px-4 font-medium">Lapangan</th>
              <th className="py-4 px-4 font-medium">Waktu</th>
              <th className="py-4 px-4 font-medium">Durasi</th>
              <th className="py-4 px-4 font-medium">Total Harga</th>
              <th className="py-4 px-4 font-medium">Status</th>
              <th className="py-4 px-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 'RSV-001', name: 'Budi Santoso', lap: 'Futsal 1', date: '25 Ags 2024, 19:00', dur: '2 Jam', price: 300000, status: 'pending' },
              { id: 'RSV-002', name: 'Andi Wijaya', lap: 'Badminton A', date: '25 Ags 2024, 20:00', dur: '1 Jam', price: 50000, status: 'confirmed' },
              { id: 'RSV-003', name: 'Siti Aminah', lap: 'Badminton B', date: '26 Ags 2024, 16:00', dur: '2 Jam', price: 100000, status: 'cancelled' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-4 px-4 text-[#94A3B8]">{row.id}</td>
                <td className="py-4 px-4 text-[#F8FAFC] font-medium">{row.name}</td>
                <td className="py-4 px-4 text-[#F8FAFC]">{row.lap}</td>
                <td className="py-4 px-4 text-[#94A3B8]">{row.date}</td>
                <td className="py-4 px-4 text-[#94A3B8]">{row.dur}</td>
                <td className="py-4 px-4 text-[#10B981]">Rp {row.price.toLocaleString('id-ID')}</td>
                <td className="py-4 px-4">
                  <span className={
                    row.status === 'confirmed' ? 'badge-confirmed' :
                    row.status === 'pending' ? 'badge-pending' : 'badge-cancelled'
                  }>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-4 flex gap-2 justify-end">
                  {row.status === 'pending' && (
                    <button className="bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                      Konfirmasi
                    </button>
                  )}
                  {row.status !== 'cancelled' && (
                    <button className="bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                      Batalkan
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center text-sm text-[#94A3B8] px-2">
        <span>Menampilkan 1-3 dari 3 reservasi</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 disabled:opacity-50" disabled>Prev</button>
          <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 disabled:opacity-50" disabled>Next</button>
        </div>
      </div>
    </div>
  );
}
