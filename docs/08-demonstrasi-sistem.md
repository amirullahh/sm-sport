# Panduan Demonstrasi Sistem
**Proyek:** Sistem Reservasi Lapangan SM Sport Center
**Skema Sertifikasi BNSP:** Analis Program (SKM-2019-62010-002)

## 1. Persiapan Demonstrasi (Checklist)
Sebelum melakukan presentasi di hadapan Asesor BNSP, pastikan hal berikut siap:
- [ ] Mesin lokal sudah menjalankan *server* aplikasi (Jalankan terminal: `npm run dev`).
- [ ] Akses sistem dapat dibuka lancar di *browser* pada tautan: `http://localhost:3000`.
- [ ] Basis data sudah diinisialisasi (`npm run db:init`) dan data benih (seed) lapangan & admin tersedia.
- [ ] *Browser* terhindar dari plugin *blocker* yang agresif, gunakan *Incognito mode* jika ragu.

## 2. Kredensial Akun (Akun Demo)
Gunakan akun ini saat mendemonstrasikan sistem:
- **Akun Admin Utama**
  - URL Login: `http://localhost:3000/admin/login`
  - Username: `admin`
  - Password: `admin123`
- **Akun Pelanggan (Contoh / Bisa Buat Baru)**
  - URL Login: `http://localhost:3000/login`
  - Email: Bebas (buat via menu Register saat demo)

## 3. Skenario Alur Demonstrasi End-to-End (15 Menit)

**Tahap 1: Pengalaman Publik & Pelanggan Baru**
1. Buka laman utama `http://localhost:3000`. Tunjukkan *Landing Page* dan daftar lapangan fasilitas SM Sport Center.
2. Arahkan kursor ke pendaftaran akun (`/register`) dan buatlah pelanggan baru bernama "Budi".
3. Log masuk (`/login`) dengan akun Budi.

**Tahap 2: Proses Transaksi Pemesanan (Penting!)**
4. Arahkan pada tombol "Pesan Sekarang" (`/reservasi/baru`).
5. Peragakan proses *wizard* langkah demi langkah (Pilih Futsal A -> Pilih Tanggal & Jam).
6. Tunjukkan Rincian Konfirmasi Harga dan selesaikan pesanan.
7. Buka profil pengguna (`/reservasi`) untuk melihat status jadwal masuk dalam daftar (Riwayat).

**Tahap 3: Pembuktian Logika Keamanan Bisnis (Bukti Bugfix)**
8. Tetap di akun pelanggan, atau buat akun baru. Cobalah melakukan pemesanan pada Lapangan dan Tanggal serta Jam (overlap) **YANG SAMA PERSIS** dengan pesanan Budi tadi.
9. Tunjukkan layar bahwa sistem mengeluarkan peringatan **"Jadwal Ditolak / Tidak Tersedia"**. Ini membuktikan logika deteksi *Bentrok Overlap* berfungsi sempurna.

**Tahap 4: Pengalaman Admin**
10. Lakukan proses Logout pelanggan, atau buka *Browser* lain.
11. Buka jalur akses pengelola di `http://localhost:3000/admin/login`. Log masuk sebagai Admin.
12. Tunjukkan *Dashboard* dengan data statistik terbaru.
13. Buka menu Manajemen Reservasi (`/admin/reservasi`). Tunjukkan reservasi atas nama "Budi" dari Tahap 2, rubah statusnya menjadi **Terkonfirmasi**.
14. Buka menu Laporan Pendapatan (`/admin/laporan`), tunjukkan sistem telah merekap omset. Klik tombol **Export CSV** untuk membuktikan fungsionalitas unduhan laporan berfungsi baik.

## 4. Antisipasi Pertanyaan Asesor
Asesor umumnya menanyakan poin berikut:
- *T: Bagaimana Anda mencegah lapangan di-booking ganda pada jam yang sama?*
  - **Jawab:** Pada modul `lib/validasi.ts` di dalam transaksi *database*, sistem mengecek range bentrok (menggunakan operator jam mulai < jadwal lama DAN jam selesai > jadwal lama) sebelum data disimpan.
- *T: Database yang digunakan apa, dan bagaimana jika penggunanya ribuan?*
  - **Jawab:** Menggunakan SQLite dengan mode WAL. Berdasarkan dokumen skalabilitas, sistem ini sangat sanggup menampung hingga 50,000+ data reservasi operasional gedung ini, dibantu oleh konfigurasi indeks pada *query* yang berat.
- *T: Apa itu JWT dan kenapa dipakai?*
  - **Jawab:** *JSON Web Token* digunakan untuk mengenali pengguna (Admin atau Pelanggan) melalui penyimpanan *Cookie HttpOnly*. Digunakan untuk keamanan *middleware* agar pengguna biasa tidak bisa menyusup membuka URL Laporan Admin.
