'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Lapangan {
  id: number;
  nama: string;
  jenis: 'futsal' | 'badminton';
  harga_per_jam: number;
  status: 'aktif' | 'nonaktif';
}

export default function Home() {
  const [lapangan, setLapangan] = useState<Lapangan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      await Promise.resolve();
      if (active) setIsLoggedIn(document.cookie.includes('sm-sport-logged-in'));
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const fetchLapangan = async () => {
      try {
        const res = await fetch('/api/lapangan');
        if (!res.ok) throw new Error('Gagal memuat data lapangan');
        const json = await res.json();
        setLapangan(json.data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };
    fetchLapangan();
  }, []);

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative px-4 py-32 mx-auto max-w-7xl text-center flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 animate-pulseGlow">SM Sport Center</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl font-light">
          Reservasi Lapangan Futsal & Badminton premium dengan mudah dan cepat.
        </p>
        <div className="flex gap-4">
          <Link href={isLoggedIn ? '/reservasi/baru' : '/login'} className="btn-primary text-lg px-8 py-3">Lihat Jadwal</Link>
          <Link href="/register" className="btn-secondary text-lg px-8 py-3">Daftar Sekarang</Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="glass-card grid grid-cols-1 md:grid-cols-3 gap-8 p-8 text-center animate-slideUp">
          <div>
            <div className="text-4xl font-bold text-emerald-400 mb-2 font-heading">5+</div>
            <div className="text-slate-400 font-medium">Lapangan Premium</div>
          </div>
          <div className="border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0">
            <div className="text-4xl font-bold text-blue-400 mb-2 font-heading">2</div>
            <div className="text-slate-400 font-medium">Jenis Olahraga</div>
          </div>
          <div className="border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0">
            <div className="text-4xl font-bold text-amber-400 mb-2 font-heading">15</div>
            <div className="text-slate-400 font-medium">Jam Operasional (08:00-23:00)</div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Fasilitas Kami</h2>
          <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full"></div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 glass-card p-8 border-red-500/30">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lapangan.length > 0 ? (
              lapangan.map((lap, i) => (
                <div key={lap.id} className="glass-card p-6 group hover:-translate-y-2 transition-all duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    {lap.jenis === 'futsal' ? '⚽' : '🏸'}
                  </div>
                  <h3 className="text-2xl font-bold font-heading mb-2">{lap.nama}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400 text-sm">{lap.jenis}</span>
                    <span className={`badge ${lap.status === 'aktif' ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {lap.status === 'aktif' ? 'Tersedia' : 'Nonaktif'}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-emerald-400 mb-6">
                    Rp {lap.harga_per_jam.toLocaleString('id-ID')}<span className="text-sm font-normal text-slate-400"> / jam</span>
                  </div>
                  <Link href={isLoggedIn ? '/reservasi/baru' : '/login'} className="block text-center btn-secondary w-full">Cek Ketersediaan</Link>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-slate-400">Belum ada data lapangan.</div>
            )}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="px-4 py-24 mb-12">
        <div className="max-w-4xl mx-auto glass-card p-12 text-center rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10"></div>
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6 relative z-10">Siap Bermain?</h2>
          <p className="text-xl text-slate-300 mb-8 relative z-10">Pesan lapangan sekarang dan nikmati pengalaman berolahraga terbaik.</p>
          <Link href="/login" className="btn-primary text-lg px-10 py-4 inline-block relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            Reservasi Sekarang
          </Link>
        </div>
      </section>
    </div>
  );
}
