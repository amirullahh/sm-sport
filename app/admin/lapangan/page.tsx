'use client';
import { useState } from 'react';

type Lapangan = {
  id: number;
  nama: string;
  jenis: string;
  harga: number;
  aktif: boolean;
};

export default function AdminLapangan() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [lapanganList, setLapanganList] = useState<Lapangan[]>([
    { id: 1, nama: 'Futsal Sintetis 1', jenis: 'Futsal ⚽', harga: 150000, aktif: true },
    { id: 2, nama: 'Futsal Vinyl', jenis: 'Futsal ⚽', harga: 120000, aktif: true },
    { id: 3, nama: 'Badminton A', jenis: 'Badminton 🏸', harga: 50000, aktif: true },
    { id: 4, nama: 'Badminton B', jenis: 'Badminton 🏸', harga: 50000, aktif: false },
  ]);

  const openModal = (id?: number) => {
    if (id) setEditingId(id);
    else setEditingId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Kelola Lapangan</h1>
          <p className="text-[#94A3B8] mt-2">Daftar lapangan dan fasilitas yang tersedia.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <span>➕</span> Tambah Lapangan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {lapanganList.map((lap) => (
          <div key={lap.id} className="glass-card p-6 rounded-xl flex flex-col justify-between border border-white/10 hover:border-[#10B981]/50 transition-all duration-300">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-3xl">{lap.jenis.includes('Futsal') ? '⚽' : '🏸'}</span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${lap.aktif ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                  {lap.aktif ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#F8FAFC]">{lap.nama}</h3>
              <p className="text-[#94A3B8] text-sm mt-1">{lap.jenis}</p>
              <p className="text-[#10B981] font-semibold mt-4">Rp {lap.harga.toLocaleString('id-ID')} <span className="text-sm font-normal text-[#94A3B8]">/ jam</span></p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={() => openModal(lap.id)} className="flex-1 bg-white/10 hover:bg-white/20 text-[#F8FAFC] py-2 rounded-lg text-sm font-medium transition-colors">
                Edit
              </button>
              <button className="flex-1 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] py-2 rounded-lg text-sm font-medium transition-colors">
                {lap.aktif ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl animate-slideUp">
            <h2 className="text-xl font-bold text-[#F8FAFC] mb-6">
              {editingId ? 'Edit Lapangan' : 'Tambah Lapangan Baru'}
            </h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">Nama Lapangan</label>
                <input type="text" className="input-field w-full" placeholder="Cth: Lapangan Futsal 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">Jenis Olahraga</label>
                <select className="input-field w-full appearance-none">
                  <option value="futsal">Futsal</option>
                  <option value="badminton">Badminton</option>
                  <option value="basket">Basket</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">Harga per Jam (Rp)</label>
                <input type="number" className="input-field w-full" placeholder="100000" />
              </div>
              <div className="flex gap-4 mt-8 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-transparent text-[#94A3B8] hover:text-white transition-colors">
                  Batal
                </button>
                <button type="submit" className="flex-1 btn-primary py-3">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
