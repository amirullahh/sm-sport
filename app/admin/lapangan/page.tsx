'use client';
import { useState, useEffect } from 'react';

type Lapangan = {
  id: number;
  nama: string;
  jenis: 'futsal' | 'badminton';
  harga_per_jam: number;
  status: string;
  created_at?: string;
};

type FormData = {
  nama: string;
  jenis: 'futsal' | 'badminton';
  harga_per_jam: number;
};

const EMPTY_FORM: FormData = { nama: '', jenis: 'futsal', harga_per_jam: 0 };

export default function AdminLapangan() {
  const [lapanganList, setLapanganList] = useState<Lapangan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Lapangan | null>(null);

  const loadLapangan = async (): Promise<Lapangan[]> => {
    const res = await fetch('/api/lapangan');
    if (!res.ok) throw new Error('Gagal memuat data lapangan');
    const json = await res.json();
    return json.data || [];
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await loadLapangan();
        if (active) setLapanganList(data);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const openModal = (lap?: Lapangan) => {
    if (lap) {
      setEditingId(lap.id);
      setFormData({ nama: lap.nama, jenis: lap.jenis, harga_per_jam: lap.harga_per_jam });
    } else {
      setEditingId(null);
      setFormData(EMPTY_FORM);
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(editingId ? `/api/lapangan/${editingId}` : '/api/lapangan', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal menyimpan lapangan');
      setIsModalOpen(false);
      setLapanganList(await loadLapangan());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/lapangan/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Gagal menghapus lapangan');
      }
      setDeleteTarget(null);
      setLapanganList(await loadLapangan());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]" style={{ fontFamily: 'Poppins, sans-serif' }}>Kelola Lapangan</h1>
          <p className="text-[#94A3B8] mt-2">Daftar lapangan dan fasilitas yang tersedia.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <span>➕</span> Tambah Lapangan
        </button>
      </div>

      {error && (
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#F87171] px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4 mt-8">
          <div className="h-40 bg-white/5 rounded-xl"></div>
          <div className="h-40 bg-white/5 rounded-xl"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {lapanganList.map((lap) => (
            <div key={lap.id} className="glass-card p-6 rounded-xl flex flex-col justify-between border border-white/10 hover:border-[#10B981]/50 transition-all duration-300">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl">{lap.jenis === 'futsal' ? '⚽' : '🏸'}</span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${lap.status !== 'nonaktif' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                    {lap.status !== 'nonaktif' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F8FAFC]" style={{ fontFamily: 'Poppins, sans-serif' }}>{lap.nama}</h3>
                <p className="text-[#94A3B8] text-sm mt-1 capitalize">{lap.jenis}</p>
                <p className="text-[#10B981] font-semibold mt-4">Rp {lap.harga_per_jam.toLocaleString('id-ID')} <span className="text-sm font-normal text-[#94A3B8]">/ jam</span></p>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => openModal(lap)} className="flex-1 bg-white/10 hover:bg-white/20 text-[#F8FAFC] py-2 rounded-lg text-sm font-medium transition-colors">
                  Edit
                </button>
                {lap.status !== 'nonaktif' && (
                  <button onClick={() => setDeleteTarget(lap)} className="flex-1 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] py-2 rounded-lg text-sm font-medium transition-colors">
                    Hapus
                  </button>
                )}
              </div>
            </div>
          ))}
          {lapanganList.length === 0 && (
            <div className="col-span-full py-8 text-center text-[#94A3B8]">Belum ada data lapangan.</div>
          )}
        </div>
      )}

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl animate-slideUp">
            <h2 className="text-xl font-bold text-[#F8FAFC] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {editingId ? 'Edit Lapangan' : 'Tambah Lapangan Baru'}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">Nama Lapangan</label>
                <input
                  type="text"
                  className="input-field w-full"
                  placeholder="Cth: Lapangan Futsal 1"
                  value={formData.nama}
                  onChange={e => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">Jenis Olahraga</label>
                {/* Nilai option harus lowercase, sama dengan CHECK constraint di DB */}
                <select
                  className="input-field w-full appearance-none"
                  value={formData.jenis}
                  onChange={e => setFormData({ ...formData, jenis: e.target.value as 'futsal' | 'badminton' })}
                >
                  <option value="futsal">Futsal</option>
                  <option value="badminton">Badminton</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1">Harga per Jam (Rp)</label>
                <input
                  type="number"
                  min={1}
                  className="input-field w-full"
                  placeholder="100000"
                  value={formData.harga_per_jam}
                  onChange={e => setFormData({ ...formData, harga_per_jam: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="flex gap-4 mt-8 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-transparent text-[#94A3B8] hover:text-white transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 btn-primary py-3">
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl animate-slideUp">
            <h2 className="text-xl font-bold text-[#F8FAFC] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Hapus Lapangan?
            </h2>
            <p className="text-[#94A3B8] mb-6">
              Lapangan <span className="text-white font-medium">{deleteTarget.nama}</span> akan di-nonaktifkan.
              Reservasi yang sudah ada tidak akan dihapus.
            </p>
            <div className="flex gap-4 pt-4 border-t border-white/10">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 bg-transparent text-[#94A3B8] hover:text-white transition-colors">
                Batal
              </button>
              <button onClick={handleDelete} disabled={isSaving} className="flex-1 py-3 bg-[#EF4444]/20 text-[#F87171] font-medium rounded-xl hover:bg-[#EF4444]/30 transition-colors">
                {isSaving ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
