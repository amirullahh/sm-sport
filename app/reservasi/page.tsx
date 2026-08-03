'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Interface untuk data reservasi
 */
interface Reservasi {
  id: string;
  lapanganId: string;
  namaLapangan: string;
  tanggal: string;
  waktuMulai: string;
  waktuSelesai: string;
  durasi: number;
  totalHarga: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export default function RiwayatReservasiPage() {
  const [reservasiList, setReservasiList] = useState<Reservasi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedReservasiToCancel, setSelectedReservasiToCancel] = useState<Reservasi | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchReservasi();
  }, []);

  const fetchReservasi = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reservasi');
      if (response.ok) {
        const json = await response.json();
        const rows = json.data || [];
        // Map DB column names to component interface
        const mapped = rows.map((r: any) => ({
          id: String(r.id),
          lapanganId: String(r.lapangan_id),
          namaLapangan: r.lapangan_nama || 'Lapangan',
          tanggal: r.tanggal,
          waktuMulai: r.jam_mulai,
          waktuSelesai: r.jam_selesai,
          durasi: (() => {
            const [sh, sm] = (r.jam_mulai || '0:0').split(':').map(Number);
            const [eh, em] = (r.jam_selesai || '0:0').split(':').map(Number);
            return (eh + em / 60) - (sh + sm / 60);
          })(),
          totalHarga: r.total_harga || 0,
          status: r.status,
        }));
        setReservasiList(mapped);
      } else {
        setReservasiList([]);
      }
    } catch (error) {
      console.error('Error fetching reservasi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReservasi = async () => {
    if (!selectedReservasiToCancel) return;
    
    setIsCancelling(true);
    try {
      const response = await fetch(`/api/reservasi/${selectedReservasiToCancel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      
      if (response.ok) {
        setReservasiList(prev => prev.map(res => 
          res.id === selectedReservasiToCancel.id ? { ...res, status: 'cancelled' as const } : res
        ));
      }
      
      setIsCancelModalOpen(false);
      setSelectedReservasiToCancel(null);
    } catch (error) {
      console.error('Error cancelling reservasi:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const openCancelModal = (reservasi: Reservasi) => {
    setSelectedReservasiToCancel(reservasi);
    setIsCancelModalOpen(true);
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(new Date(dateString));
  };

  const isCancellable = (status: string, tanggal: string) => {
    if (status !== 'confirmed' && status !== 'pending') return false;
    const reservasiDate = new Date(tanggal);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return reservasiDate >= today;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'badge-confirmed';
      case 'pending': return 'badge-pending';
      case 'cancelled': return 'badge-cancelled';
      case 'completed': return 'bg-secondary/20 text-secondary border border-secondary/30 px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase';
      default: return 'bg-muted/20 text-muted border border-muted/30 px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Dikonfirmasi';
      case 'pending': return 'Menunggu';
      case 'cancelled': return 'Dibatalkan';
      case 'completed': return 'Selesai';
      default: return status;
    }
  };

  const filteredReservasi = reservasiList.filter(res => {
    const matchSearch = res.namaLapangan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'Semua' || res.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen p-6 md:p-12 animate-fadeIn text-foreground">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-poppins text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Reservasi Saya
            </h1>
            <p className="text-muted mt-2 font-inter">Kelola jadwal olahraga Anda di SM Sport Center</p>
          </div>
          <Link href="/reservasi/baru" className="btn-primary flex items-center justify-center gap-2 group w-full md:w-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Booking Baru
          </Link>
        </div>

        <div className="glass-card p-6 rounded-2xl mb-8 animate-slideUp">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-muted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari lapangan..."
                className="input-field pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <select 
                className="input-field w-full appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394A3B8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7rem] bg-[right_1rem_center] bg-no-repeat pr-10"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="Semua">Semua Status</option>
                <option value="Pending">Menunggu</option>
                <option value="Confirmed">Dikonfirmasi</option>
                <option value="Completed">Selesai</option>
                <option value="Cancelled">Dibatalkan</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card p-6 rounded-2xl animate-pulse flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-1/4 h-24 bg-surface/50 rounded-xl"></div>
                <div className="w-full md:flex-grow space-y-3">
                  <div className="h-6 bg-surface/50 rounded w-1/3"></div>
                  <div className="h-4 bg-surface/50 rounded w-1/2"></div>
                  <div className="h-4 bg-surface/50 rounded w-1/4"></div>
                </div>
                <div className="w-full md:w-auto flex flex-col gap-3">
                  <div className="h-8 bg-surface/50 rounded-full w-24"></div>
                  <div className="h-10 bg-surface/50 rounded-lg w-full md:w-32"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredReservasi.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center flex flex-col items-center justify-center animate-slideUp">
            <div className="w-24 h-24 rounded-full bg-surface/50 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold font-poppins text-foreground mb-2">Belum ada reservasi</h3>
            <p className="text-muted font-inter mb-6">Anda belum membuat reservasi atau tidak ada yang cocok dengan pencarian.</p>
            <Link href="/reservasi/baru" className="btn-primary">
              Mulai Booking
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 animate-slideUp">
            {filteredReservasi.map((reservasi) => (
              <div key={reservasi.id} className="glass-card p-0 rounded-2xl overflow-hidden hover:border-primary/30 transition-colors duration-300">
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center">
                  
                  {/* Left Column - Icon/Image placeholder */}
                  <div className="hidden md:flex flex-shrink-0 w-24 h-24 bg-surface/80 rounded-xl items-center justify-center border border-white/5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>

                  {/* Middle Column - Details */}
                  <div className="flex-grow space-y-3">
                    <div className="flex justify-between items-start md:items-center">
                      <h3 className="text-xl font-bold font-poppins text-foreground">{reservasi.namaLapangan}</h3>
                      <span className={`md:hidden ${getStatusBadgeClass(reservasi.status)}`}>
                        {getStatusLabel(reservasi.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm font-inter text-muted">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(reservasi.tanggal)}
                      </div>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {reservasi.waktuMulai} - {reservasi.waktuSelesai} ({reservasi.durasi} Jam)
                      </div>
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Order ID: {reservasi.id}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Price & Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 pt-4 md:pt-0 border-t border-white/5 md:border-t-0">
                    <div className="text-left md:text-right">
                      <p className="text-xs text-muted mb-1 font-inter">Total Pembayaran</p>
                      <p className="text-lg font-bold text-foreground font-poppins">{formatRupiah(reservasi.totalHarga)}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <span className={`hidden md:inline-block ${getStatusBadgeClass(reservasi.status)}`}>
                        {getStatusLabel(reservasi.status)}
                      </span>
                      
                      {isCancellable(reservasi.status, reservasi.tanggal) && (
                        <button 
                          onClick={() => openCancelModal(reservasi)}
                          className="text-sm font-medium text-destructive hover:text-red-400 transition-colors font-inter flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Batalkan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl animate-slideUp border border-white/10 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center mb-4 text-destructive mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-foreground font-poppins mb-2">Batalkan Reservasi?</h3>
            <p className="text-center text-muted font-inter mb-6">
              Apakah Anda yakin ingin membatalkan reservasi <strong>{selectedReservasiToCancel?.namaLapangan}</strong> pada tanggal <strong>{selectedReservasiToCancel ? formatDate(selectedReservasiToCancel.tanggal) : ''}</strong>? Tindakan ini tidak dapat diurungkan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsCancelModalOpen(false)}
                className="btn-secondary flex-1"
                disabled={isCancelling}
              >
                Kembali
              </button>
              <button 
                onClick={handleCancelReservasi}
                className="btn-danger flex-1 flex justify-center items-center"
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Ya, Batalkan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
