'use client';
import { useState, useEffect } from 'react';

type Pelanggan = {
  id: number;
  nama: string;
  email: string;
  no_hp: string;
  created_at: string;
};

export default function AdminPelanggan() {
  const [pelangganList, setPelangganList] = useState<Pelanggan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPelanggan = async (query = '') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/pelanggan${query ? `?search=${encodeURIComponent(query)}` : ''}`);
      const json = await res.json();
      setPelangganList(json.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPelanggan(search);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-[#F8FAFC]" style={{ fontFamily: 'Poppins, sans-serif' }}>Data Pelanggan</h1>
        <p className="text-[#94A3B8] mt-2">Manajemen pengguna dan informasi kontak mereka.</p>
      </div>

      <div className="glass-card p-4 rounded-xl flex gap-4">
        <input 
          type="text" 
          placeholder="Cari berdasarkan nama, email, atau no HP..." 
          className="input-field flex-1" 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={() => fetchPelanggan(search)} className="btn-secondary px-6">Cari</button>
      </div>

      <div className="table-container rounded-xl">
        {loading ? (
           <div className="animate-pulse p-4 space-y-4">
              <div className="h-10 bg-white/5 rounded"></div>
              <div className="h-10 bg-white/5 rounded"></div>
           </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[#94A3B8] text-sm bg-white/5">
                <th className="py-4 px-4 font-medium">#</th>
                <th className="py-4 px-4 font-medium">Nama Pelanggan</th>
                <th className="py-4 px-4 font-medium">Email</th>
                <th className="py-4 px-4 font-medium">No HP</th>
                <th className="py-4 px-4 font-medium">Terdaftar Sejak</th>
              </tr>
            </thead>
            <tbody>
              {pelangganList.map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 text-[#94A3B8]">{row.id}</td>
                  <td className="py-4 px-4 text-[#F8FAFC] font-medium">{row.nama}</td>
                  <td className="py-4 px-4 text-[#94A3B8]">{row.email}</td>
                  <td className="py-4 px-4 text-[#94A3B8]">{row.no_hp}</td>
                  <td className="py-4 px-4 text-[#94A3B8]">{new Date(row.created_at).toLocaleDateString('id-ID')}</td>
                </tr>
              ))}
              {pelangganList.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#94A3B8]">Tidak ada data pelanggan</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
