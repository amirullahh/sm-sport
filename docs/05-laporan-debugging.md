# Laporan Debugging
**Proyek:** Sistem Reservasi Lapangan SM Sport Center
**Skema Sertifikasi BNSP:** Analis Program (SKM-2019-62010-002)

## 1. Judul dan Deskripsi Masalah
**Judul:** Bug pada Validasi Bentrok Jadwal Reservasi
**Deskripsi Masalah:** Terdapat kegagalan logika pada sistem saat melakukan pengecekan ketersediaan jadwal. Sistem membiarkan pengguna mem-booking jadwal yang bersinggungan (*overlap*) dengan jadwal yang sudah ada, selama jam mulai pesanan tidak sama persis dengan yang sudah dipesan. Ini berakibat pada jadwal *double-booked* di lapangan dan jam yang sama.

## 2. Langkah Reproduksi (Step-by-Step)
Masalah dapat diuji dan direproduksi dengan langkah berikut:
1. Pengguna A membuat reservasi Lapangan **Futsal A** untuk tanggal **2023-12-01** jam **09:00 - 10:00**.
   *(Sistem menerima reservasi — BERHASIL)*
2. Pengguna B mencoba membuat reservasi Lapangan **Futsal A** untuk tanggal **2023-12-01** jam **09:30 - 10:30**.
   *(Sistem Menerima reservasi tersebut — **BUG**, seharusnya DITOLAK karena sebagian waktu lapangan masih digunakan Pengguna A).*

## 3. Root Cause Analysis
Sumber permasalahan (*Root Cause*) terletak pada logika fungsi `cekBentrok()` di berkas `lib/validasi.ts`. Pada kode awal (commit `ba9f856`), *query database* hanya mengecek apakah jam mulai (`jam_mulai`) jadwal baru sama persis dengan jadwal yang ada (`jam_mulai = ?`).
Logika *Exact Match* ini gagal mengatasi kondisi jadwal yang bersinggungan. Pendekatan yang benar adalah menggunakan kalkulasi *Range Overlap* (Irisan Rentang Waktu), yaitu: jadwal bentrok apabila Jam Mulai yang baru lebih kecil dari Jam Selesai yang lama, **DAN** Jam Selesai yang baru lebih besar dari Jam Mulai yang lama.

## 4. Analisis Kode Program

### Kode Sebelum Perbaikan (Commit `ba9f856`)
```typescript
// Fungsi cek bentrok yang salah
export function cekBentrok(lapangan_id: number, tanggal: string, jam_mulai: string, jam_selesai: string) {
  const existing = db.prepare(`
    SELECT * FROM reservasi 
    WHERE lapangan_id = ? 
    AND tanggal = ? 
    AND jam_mulai = ? 
    AND status != 'cancelled'
  `).get(lapangan_id, tanggal, jam_mulai);
  
  return !!existing;
}
```

### Kode Sesudah Perbaikan (Commit `418d6ef`)
```typescript
// Fungsi cek bentrok yang benar dengan Range Overlap
export function cekBentrok(lapangan_id: number, tanggal: string, jam_mulai: string, jam_selesai: string) {
  const existing = db.prepare(`
    SELECT * FROM reservasi 
    WHERE lapangan_id = ? 
    AND tanggal = ? 
    AND jam_mulai < ? 
    AND jam_selesai > ? 
    AND status != 'cancelled'
  `).get(lapangan_id, tanggal, jam_selesai, jam_mulai);
  
  return !!existing;
}
```

### Perbedaan Kode (Diff)
```diff
-   AND jam_mulai = ? 
-   AND status != 'cancelled'
- `).get(lapangan_id, tanggal, jam_mulai);
+   AND jam_mulai < ? 
+   AND jam_selesai > ? 
+   AND status != 'cancelled'
+ `).get(lapangan_id, tanggal, jam_selesai, jam_mulai);
```

## 5. Hasil Verifikasi
Setelah perbaikan (*fix*) diimplementasikan, *Unit Test* khusus untuk fungsi bentrok dijalankan dan mendapatkan hasil yang sesuai harapan (hijau):
- **Test Case 4:** Reservasi bentrok penuh (waktu sama persis) → **PASS** (Ditolak Sistem)
- **Test Case 5:** Reservasi bentrok sebagian (seperti langkah reproduksi 09:30-10:30) → **PASS** (Ditolak Sistem)

## 6. Kronologi Git Commit
Riwayat commit menunjukkan proses pelacakan bug dan perbaikannya:
- `ba9f856` bug: cekBentrok hanya cek exact-match jam_mulai, tidak cek overlap range (Identifikasi Bug)
- `418d6ef` fix: cekBentrok menggunakan formula overlap range yang benar (Penyelesaian Bug)

## 7. Kesimpulan dan Lessons Learned
Kesalahan dalam logika logika penanggalan/waktu (*datetime logic*) sangat umum terjadi. Pelajaran dari masalah ini adalah:
1. Pemrosesan rentang waktu (rentang mulai dan akhir) harus selalu menggunakan pendekatan *interval overlap*, bukan persamaan titik waktu tunggal.
2. Keberadaan kerangka *Unit Testing* terbukti krusial. Uji coba seharusnya tidak hanya menguji kasus *happy path* (kasus normal), tapi juga *edge cases* seperti jadwal yang beririsan di tengah, atau persis menyentuh garis akhir (09:00-10:00 dan 10:00-11:00 yang mana boleh terjadi).
