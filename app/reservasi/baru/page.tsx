'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Lapangan {
  id: string;
  nama: string;
  tipe: string;
  hargaPerJam: number;
  image?: string;
}

interface TimeSlot {
  time: string;
  isBooked: boolean;
}

export default function BookingBaruPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Lapangan
  const [lapanganList, setLapanganList] = useState<Lapangan[]>([]);
  const [selectedLapangan, setSelectedLapangan] = useState<Lapangan | null>(null);

  // Step 2: Tanggal & Jam
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingJadwal, setIsLoadingJadwal] = useState(false);
  
  // Selection can be start and end
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);

  useEffect(() => {
    // Fetch lapangan
    fetchLapangan();
  }, []);

  useEffect(() => {
    if (selectedLapangan && selectedDate) {
      fetchJadwal(selectedLapangan.id, selectedDate);
    }
  }, [selectedLapangan, selectedDate]);

  const fetchLapangan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/lapangan');
      if (response.ok) {
        const data = await response.json();
        setLapanganList(data);
      } else {
        // Mockup data
        setLapanganList([
          { id: 'LAP-001', nama: 'Lapangan Futsal A (Vinyl)', tipe: 'Futsal', hargaPerJam: 150000 },
          { id: 'LAP-002', nama: 'Lapangan Futsal B (Sintetis)', tipe: 'Futsal', hargaPerJam: 120000 },
          { id: 'LAP-003', nama: 'Lapangan Badminton 1', tipe: 'Badminton', hargaPerJam: 50000 },
          { id: 'LAP-004', nama: 'Lapangan Basket Outdoor', tipe: 'Basket', hargaPerJam: 200000 },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJadwal = async (lapanganId: string, tanggal: string) => {
    setIsLoadingJadwal(true);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    try {
      const response = await fetch(`/api/lapangan/${lapanganId}/jadwal?tanggal=${tanggal}`);
      if (response.ok) {
        const data = await response.json();
        setTimeSlots(data);
      } else {
        // Generate mockup 08:00 - 23:00
        const slots: TimeSlot[] = [];
        for (let i = 8; i <= 22; i++) {
          const timeString = `${i.toString().padStart(2, '0')}:00`;
          // Randomly book some slots for mockup
          const isBooked = Math.random() > 0.7;
          slots.push({ time: timeString, isBooked });
        }
        setTimeout(() => {
          setTimeSlots(slots);
          setIsLoadingJadwal(false);
        }, 500);
        return;
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoadingJadwal(false);
  };

  const handleTimeSlotClick = (time: string, isBooked: boolean) => {
    if (isBooked) return;
    setError(null);

    if (!selectedStartTime) {
      setSelectedStartTime(time);
      setSelectedEndTime(time); // Default 1 hour
    } else if (selectedStartTime && selectedEndTime === selectedStartTime) {
      // If clicking same slot, deselect
      if (time === selectedStartTime) {
        setSelectedStartTime(null);
        setSelectedEndTime(null);
        return;
      }
      
      // Determine new start/end
      const t1 = parseInt(selectedStartTime.split(':')[0]);
      const t2 = parseInt(time.split(':')[0]);
      
      const start = Math.min(t1, t2);
      const end = Math.max(t1, t2);
      
      // Check if any slot in between is booked
      let hasConflict = false;
      for (let i = start; i <= end; i++) {
        const tStr = `${i.toString().padStart(2, '0')}:00`;
        const slot = timeSlots.find(s => s.time === tStr);
        if (slot?.isBooked) {
          hasConflict = true;
          break;
        }
      }
      
      if (hasConflict) {
        setError("BENTROK_JADWAL: Ada jadwal yang sudah terisi di antara waktu yang dipilih.");
        setTimeout(() => setError(null), 3000);
      } else {
        setSelectedStartTime(`${start.toString().padStart(2, '0')}:00`);
        setSelectedEndTime(`${end.toString().padStart(2, '0')}:00`);
      }
    } else {
      // Reset and start over
      setSelectedStartTime(time);
      setSelectedEndTime(time);
    }
  };

  const calculateDuration = () => {
    if (!selectedStartTime || !selectedEndTime) return 0;
    const start = parseInt(selectedStartTime.split(':')[0]);
    const end = parseInt(selectedEndTime.split(':')[0]);
    return end - start + 1; // +1 because selecting 08:00 means 08:00-09:00 (1 hour)
  };

  const calculateTotal = () => {
    if (!selectedLapangan) return 0;
    return calculateDuration() * selectedLapangan.hargaPerJam;
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

  const handleNextStep = () => {
    if (step === 1 && selectedLapangan) {
      setStep(2);
    } else if (step === 2 && selectedStartTime && selectedEndTime) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/reservasi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lapanganId: selectedLapangan?.id,
          tanggal: selectedDate,
          waktuMulai: selectedStartTime,
          waktuSelesai: `${(parseInt(selectedEndTime!.split(':')[0]) + 1).toString().padStart(2, '0')}:00`, // Add 1 hour to end time for exclusive end
        })
      });

      if (response.ok) {
        router.push('/reservasi');
      } else {
        // Simulasi sukses untuk mockup
        setTimeout(() => {
          router.push('/reservasi');
        }, 1500);
      }
    } catch (err) {
      setError("Gagal membuat reservasi. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 animate-fadeIn text-foreground">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold font-poppins text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Booking Baru
          </h1>
          <p className="text-muted mt-2 font-inter">Pilih lapangan dan waktu yang tersedia</p>
        </div>

        {/* Stepper */}
        <div className="mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-surface/50 -translate-y-1/2 rounded-full z-0"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary to-secondary -translate-y-1/2 rounded-full z-0 transition-all duration-500" 
               style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          
          <div className="relative z-10 flex justify-between">
            {[
              { num: 1, label: 'Pilih Lapangan' },
              { num: 2, label: 'Tanggal & Waktu' },
              { num: 3, label: 'Konfirmasi' }
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-lg
                  ${step >= s.num 
                    ? 'bg-gradient-to-br from-primary to-emerald-600 text-white border-2 border-primary/20 scale-110' 
                    : 'bg-surface border-2 border-white/10 text-muted'}`}>
                  {step > s.num ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s.num}
                </div>
                <span className={`mt-3 text-sm font-medium ${step >= s.num ? 'text-foreground' : 'text-muted'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Message Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3 animate-slideUp">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {/* STEP 1: Pilih Lapangan */}
        {step === 1 && (
          <div className="animate-slideUp">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                // Loading Skeletons
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="glass-card p-6 rounded-2xl animate-pulse flex flex-col gap-4">
                    <div className="h-12 w-12 bg-surface/50 rounded-xl"></div>
                    <div className="h-6 bg-surface/50 rounded w-3/4"></div>
                    <div className="h-4 bg-surface/50 rounded w-1/4"></div>
                    <div className="h-8 bg-surface/50 rounded w-1/2 mt-4"></div>
                  </div>
                ))
              ) : (
                lapanganList.map((lapangan) => (
                  <div 
                    key={lapangan.id} 
                    onClick={() => setSelectedLapangan(lapangan)}
                    className={`glass-card p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2
                      ${selectedLapangan?.id === lapangan.id 
                        ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-[1.02]' 
                        : 'border-white/5 hover:border-primary/50 hover:bg-white/5'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center 
                        ${selectedLapangan?.id === lapangan.id ? 'bg-primary text-white' : 'bg-surface/80 text-primary'}`}>
                        {lapangan.tipe === 'Futsal' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {lapangan.tipe === 'Badminton' && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5.5A4.5 4.5 0 0 0 14.5 1h-5A4.5 4.5 0 0 0 5 5.5v5A4.5 4.5 0 0 0 9.5 15h5a4.5 4.5 0 0 0 4.5-4.5v-5Z"/><path d="m10 15 2 7 2-7"/><path d="M8 10h8"/></svg>
                        )}
                        {lapangan.tipe === 'Basket' && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20"/><path d="M2 12h20"/><path d="M12 2a14.5 14.5 0 0 1 0 20"/></svg>
                        )}
                      </div>
                      {selectedLapangan?.id === lapangan.id && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white animate-fadeIn">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold font-poppins text-foreground mb-1">{lapangan.nama}</h3>
                    <p className="text-sm text-muted font-inter mb-4">{lapangan.tipe}</p>
                    <p className="text-lg font-bold text-primary">{formatRupiah(lapangan.hargaPerJam)} <span className="text-sm text-muted font-normal">/ Jam</span></p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Tanggal & Waktu */}
        {step === 2 && (
          <div className="animate-slideUp space-y-8">
            <div className="glass-card p-6 md:p-8 rounded-2xl">
              <h3 className="text-lg font-bold text-foreground mb-4 font-poppins flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Pilih Tanggal
              </h3>
              <input 
                type="date" 
                className="input-field w-full md:w-auto"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="glass-card p-6 md:p-8 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-foreground font-poppins flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pilih Waktu
                </h3>
                <div className="flex items-center gap-4 text-xs md:text-sm font-inter">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-surface border border-white/10"></div> Tersedia</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary"></div> Dipilih</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-destructive/80"></div> Terisi</div>
                </div>
              </div>

              {isLoadingJadwal ? (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className="h-12 bg-surface/50 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted mb-4 font-inter">Klik untuk memilih jam mulai, klik lagi di jam lain untuk memilih durasi berurutan.</p>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {timeSlots.map((slot) => {
                      const tVal = parseInt(slot.time.split(':')[0]);
                      const sVal = selectedStartTime ? parseInt(selectedStartTime.split(':')[0]) : -1;
                      const eVal = selectedEndTime ? parseInt(selectedEndTime.split(':')[0]) : -1;
                      
                      const isSelected = sVal !== -1 && eVal !== -1 && tVal >= sVal && tVal <= eVal;
                      
                      return (
                        <button
                          key={slot.time}
                          disabled={slot.isBooked}
                          onClick={() => handleTimeSlotClick(slot.time, slot.isBooked)}
                          className={`
                            py-3 rounded-lg text-sm font-medium transition-all duration-200 border
                            ${slot.isBooked 
                              ? 'bg-destructive/10 text-destructive/50 border-destructive/20 cursor-not-allowed' 
                              : isSelected
                                ? 'bg-primary text-white border-primary shadow-[0_0_10px_rgba(16,185,129,0.3)] transform scale-[1.02]'
                                : 'bg-surface text-foreground border-white/5 hover:border-primary/50 hover:bg-white/5'
                            }
                          `}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Konfirmasi */}
        {step === 3 && selectedLapangan && (
          <div className="animate-slideUp">
            <div className="glass-card p-6 md:p-10 rounded-2xl relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 z-0"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-foreground mb-8 font-poppins border-b border-white/10 pb-4">Ringkasan Reservasi</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-muted font-inter mb-1">Lapangan</p>
                      <p className="text-lg font-bold text-foreground">{selectedLapangan.nama}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted font-inter mb-1">Tanggal</p>
                      <p className="text-lg font-bold text-foreground">{formatDate(selectedDate)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted font-inter mb-1">Waktu</p>
                      <p className="text-lg font-bold text-foreground">
                        {selectedStartTime} - {`${(parseInt(selectedEndTime!.split(':')[0]) + 1).toString().padStart(2, '0')}:00`}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted font-inter mb-1">Durasi</p>
                      <p className="text-lg font-bold text-foreground">{calculateDuration()} Jam</p>
                    </div>
                  </div>
                  
                  <div className="bg-surface/50 rounded-xl p-6 border border-white/5 h-fit flex flex-col justify-center">
                    <p className="text-sm text-muted font-inter mb-2 text-center">Total Harga</p>
                    <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 text-center font-poppins mb-6">
                      {formatRupiah(calculateTotal())}
                    </p>
                    <div className="text-sm text-muted font-inter text-center space-y-1">
                      <p>{formatRupiah(selectedLapangan.hargaPerJam)} x {calculateDuration()} Jam</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-10 flex justify-between">
          <button 
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || isLoading}
            className={`btn-secondary ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            Kembali
          </button>
          
          {step < 3 ? (
            <button 
              onClick={handleNextStep}
              disabled={
                (step === 1 && !selectedLapangan) || 
                (step === 2 && (!selectedStartTime || !selectedEndTime))
              }
              className="btn-primary flex items-center gap-2 group"
            >
              Selanjutnya
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn-primary bg-gradient-to-r from-primary to-emerald-600 hover:from-emerald-500 hover:to-primary shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Konfirmasi Booking
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
