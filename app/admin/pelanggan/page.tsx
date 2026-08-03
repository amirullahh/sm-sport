'use client';

export default function AdminPelanggan() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-[#F8FAFC]">Data Pelanggan</h1>
        <p className="text-[#94A3B8] mt-2">Manajemen pengguna dan histori pemesanan mereka.</p>
      </div>

      <div className="glass-card p-4 rounded-xl flex gap-4">
        <input 
          type="text" 
          placeholder="Cari berdasarkan nama, email, atau no HP..." 
          className="input-field flex-1" 
        />
        <button className="btn-secondary px-6">Cari</button>
      </div>

      <div className="table-container rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[#94A3B8] text-sm bg-white/5">
              <th className="py-4 px-4 font-medium">#</th>
              <th className="py-4 px-4 font-medium">Nama Pelanggan</th>
              <th className="py-4 px-4 font-medium">Email</th>
              <th className="py-4 px-4 font-medium">No HP</th>
              <th className="py-4 px-4 font-medium">Terdaftar Sejak</th>
              <th className="py-4 px-4 font-medium text-center">Jumlah Reservasi</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 1, name: 'Budi Santoso', email: 'budi@example.com', hp: '081234567890', join: '10 Jan 2024', count: 12 },
              { id: 2, name: 'Andi Wijaya', email: 'andi@example.com', hp: '082345678901', join: '15 Feb 2024', count: 5 },
              { id: 3, name: 'Siti Aminah', email: 'siti@example.com', hp: '083456789012', join: '02 Mar 2024', count: 8 },
            ].map((row, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-4 px-4 text-[#94A3B8]">{row.id}</td>
                <td className="py-4 px-4 text-[#F8FAFC] font-medium">{row.name}</td>
                <td className="py-4 px-4 text-[#94A3B8]">{row.email}</td>
                <td className="py-4 px-4 text-[#94A3B8]">{row.hp}</td>
                <td className="py-4 px-4 text-[#94A3B8]">{row.join}</td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] font-bold">
                    {row.count}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
