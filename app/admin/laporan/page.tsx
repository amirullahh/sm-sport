'use client';

export default function AdminLaporan() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-[#F8FAFC]">Laporan & Revenue</h1>
        <p className="text-[#94A3B8] mt-2">Statistik penggunaan lapangan dan pendapatan.</p>
      </div>

      <div className="glass-card p-6 rounded-xl space-y-4">
        <h2 className="text-[#F8FAFC] font-semibold mb-4">Filter Laporan</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-[#94A3B8] mb-1">Tanggal Dari</label>
            <input type="date" className="input-field w-full" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-[#94A3B8] mb-1">Tanggal Sampai</label>
            <input type="date" className="input-field w-full" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-[#94A3B8] mb-1">Lapangan</label>
            <select className="input-field w-full appearance-none">
              <option value="all">Semua Lapangan</option>
              <option value="futsal">Futsal</option>
              <option value="badminton">Badminton</option>
            </select>
          </div>
          <button className="btn-primary h-[42px] px-8">Tampilkan</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl border border-white/10 text-center">
          <p className="text-[#94A3B8] mb-2">Total Booking</p>
          <h3 className="text-4xl font-bold text-[#F8FAFC]">142</h3>
        </div>
        <div className="glass-card p-6 rounded-xl border border-white/10 text-center">
          <p className="text-[#94A3B8] mb-2">Total Jam Sewa</p>
          <h3 className="text-4xl font-bold text-[#3B82F6]">280 <span className="text-xl text-[#94A3B8] font-normal">Jam</span></h3>
        </div>
        <div className="glass-card p-6 rounded-xl border border-[#10B981]/30 bg-[#10B981]/5 text-center">
          <p className="text-[#94A3B8] mb-2">Total Revenue</p>
          <h3 className="text-4xl font-bold text-[#10B981]">Rp 15.450.000</h3>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#F8FAFC]">Detail Pendapatan per Lapangan</h2>
          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
            <span>📥</span> Export CSV
          </button>
        </div>
        
        <div className="table-container">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[#94A3B8] text-sm">
                <th className="py-3 px-4 font-medium">Lapangan</th>
                <th className="py-3 px-4 font-medium">Jenis</th>
                <th className="py-3 px-4 font-medium text-center">Total Booking</th>
                <th className="py-3 px-4 font-medium text-center">Total Jam</th>
                <th className="py-3 px-4 font-medium text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 text-[#F8FAFC]">Futsal Sintetis 1</td>
                <td className="py-3 px-4 text-[#94A3B8]">Futsal</td>
                <td className="py-3 px-4 text-center text-[#F8FAFC]">60</td>
                <td className="py-3 px-4 text-center text-[#F8FAFC]">120</td>
                <td className="py-3 px-4 text-right text-[#10B981] font-medium">Rp 18.000.000</td>
              </tr>
              <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 text-[#F8FAFC]">Badminton A</td>
                <td className="py-3 px-4 text-[#94A3B8]">Badminton</td>
                <td className="py-3 px-4 text-center text-[#F8FAFC]">82</td>
                <td className="py-3 px-4 text-center text-[#F8FAFC]">160</td>
                <td className="py-3 px-4 text-right text-[#10B981] font-medium">Rp 8.000.000</td>
              </tr>
              <tr className="bg-white/5 border-t-2 border-white/20 font-bold">
                <td colSpan={2} className="py-4 px-4 text-[#F8FAFC] text-right">Grand Total</td>
                <td className="py-4 px-4 text-center text-[#F8FAFC]">142</td>
                <td className="py-4 px-4 text-center text-[#F8FAFC]">280</td>
                <td className="py-4 px-4 text-right text-[#10B981]">Rp 26.000.000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
