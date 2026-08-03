# Dokumentasi User Interface (Antarmuka Pengguna)
**Proyek:** Sistem Reservasi Lapangan SM Sport Center
**Skema Sertifikasi BNSP:** Analis Program (SKM-2019-62010-002)

## 1. Daftar Halaman dan Peta Situs (Sitemap)

Sistem terdiri dari 14 halaman yang diakses oleh tiga aktor berbeda (Publik, Pelanggan Terdaftar, dan Admin).

| Path | Aktor | Fungsi Utama |
|------|-------|--------|
| `/` | Publik | *Landing page*, menampilkan informasi singkat dan daftar lapangan |
| `/register` | Publik | Form pendaftaran akun pelanggan baru |
| `/login` | Publik | Autentikasi pelanggan terdaftar |
| `/jadwal` | Publik | Mengecek ketersediaan jadwal lapangan tanpa perlu login |
| `/reservasi` | Pelanggan | Menampilkan daftar dan riwayat reservasi milik pelanggan itu sendiri |
| `/reservasi/baru` | Pelanggan | Form pemesanan jadwal lapangan menggunakan metode *wizard* (3 langkah) |
| `/admin/login` | Admin | Autentikasi pengelola/admin |
| `/admin` | Admin | *Dashboard* utama, menampilkan ringkasan data statistik *real-time* |
| `/admin/lapangan` | Admin | Manajemen (CRUD) master data lapangan |
| `/admin/reservasi` | Admin | Mengelola seluruh reservasi, mengubah status (Konfirmasi/Batal) |
| `/admin/pelanggan` | Admin | Melihat daftar pelanggan terdaftar beserta fitur pencarian |
| `/admin/laporan` | Admin | Menampilkan laporan pendapatan bulanan dengan fitur *export* ke CSV |

## 2. Design System
Sistem dibangun menggunakan kerangka kerja **Tailwind CSS**.
- **Tema:** Cenderung mengadopsi elemen modern seperti efek *Glassmorphism* (panel semi-transparan dengan *blur*), memberikan kesan profesional dan bersih.
- **Palet Warna:** Warna utama yang berpusat pada nuansa kontras (*dark theme* atau *sporty colors* sesuai implementasi), memastikan keterbacaan tinggi.
- **Tipografi:** Menggunakan *font-family* standar sistem web modern (Inter / Roboto) yang mudah dibaca.
- **Responsivitas:** Semua halaman dirancang dengan pendekatan *Mobile-First*, sehingga tampilan menyesuaikan dengan baik pada perangkat *desktop*, *tablet*, maupun *smartphone*.

## 3. Navigasi dan Alur Pengguna (User Flow)

### 3.1 Alur Publik ke Pelanggan
1. Pengguna masuk ke `/` untuk melihat fasilitas.
2. Pengguna mengecek ketersediaan jadwal di `/jadwal`.
3. Pengguna yang tertarik akan mendaftar via `/register`.
4. Setelah pendaftaran berhasil, pengguna diarahkan ke `/login`.
5. Setelah login, pengguna dapat mengakses `/reservasi/baru` untuk melakukan pemesanan.
6. Hasil pemesanan tampil di `/reservasi`.

### 3.2 Alur Pemesanan (Wizard)
Pada halaman `/reservasi/baru`, pengguna melalui 3 tahapan (agar antarmuka tidak sesak):
1. Pilih Lapangan.
2. Tentukan Tanggal & Jam (dilengkapi validasi ketersediaan).
3. Konfirmasi Rincian Pemesanan dan Harga Total.

### 3.3 Alur Admin
1. Admin mengakses portal terpisah di `/admin/login`.
2. Setelah sukses, admin melihat `/admin` (*Dashboard*).
3. Admin menggunakan *sidebar* navigasi untuk mengelola data di menu Lapangan, Pelanggan, Reservasi, dan Laporan.
4. Admin dapat melakukan log keluar melalui tombol khusus yang menghapus sesi (*cookies*).
