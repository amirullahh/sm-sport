# Sistem Reservasi Lapangan SM Sport Center

Sistem aplikasi web manajemen pemesanan fasilitas olahraga (futsal dan badminton) secara mandiri untuk pelanggan dan admin. Proyek ini disusun untuk pemenuhan sertifikasi **BNSP Skema Analis Program (SKM-2019-62010-002)**.

**Author:** Asep padjri fadillah
## 🛠️ Teknologi yang Digunakan (Tech Stack)
- **Framework:** Next.js 16 (App Router)
- **Bahasa Pemrograman:** TypeScript
- **Basis Data:** SQLite (menggunakan modul `better-sqlite3`)
- **Desain UI:** Tailwind CSS (dengan efek modern *Glassmorphism*)
- **Keamanan & Validasi:** `jose` (JWT Auth Cookies), `zod` (Skema Validasi Request)

## 🚀 Memulai Proyek (Quick Start)
Untuk menjalankan aplikasi secara lokal di mesin Anda, jalankan instruksi di bawah ini:

1. **Unduh Dependensi**
   ```bash
   npm install
   ```

2. **Inisialisasi Basis Data**
   Tindakan ini akan membuat skema tabel SQLite baru dan mengisi benih data master lapangan dan akun admin.
   ```bash
   npm run db:init
   ```

3. **Jalankan *Server Development***
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses via peramban di alamat: [http://localhost:3000](http://localhost:3000).

## 📂 Struktur Direktori Utama
```text
sm-sport-reservasi/
├── app/                  # Rute Halaman (Pages) dan Rute API (Endpoints) Next.js
│   ├── admin/            # Area dashboard pengelola sistem
│   ├── api/              # Kumpulan modul backend REST API
│   └── reservasi/        # Area khusus bagi member untuk booking lapangan
├── db/                   # Repositori script struktur tabel database
├── docs/                 # [DOKUMEN BNSP] Analisis, ERD, Laporan Testing/Debugging
├── lib/                  # Logika bisnis inti (konektor db, autentikasi, fungsi validasi)
└── middleware.ts         # Penjaga rute sistem
```
*(Lihat `docs/04-dokumentasi-kode.md` untuk deskripsi arsitektur penuh).*

## 🔐 Kredensial Akun (Demo)
Gunakan kredensial berikut untuk menguji *backend* manajemen:
- **Hak Akses Admin:**
  - Login Page: `http://localhost:3000/admin/login`
  - Username: `admin`
  - Password: `admin123`
- **Hak Akses Publik:**
  - Silakan daftarkan akun baru di menu **Register** untuk bertransaksi sebagai pelanggan reguler.

## 🧪 Pengujian (Testing)
Aplikasi terintegrasi dengan modul penguji otomatis. Seluruh tes mencakup fungsi logika kalkulasi harga, proteksi *overlap* jadwal, hingga skenario interaksi basis data.
```bash
npm run test
```
Sistem dipastikan melampaui metrik dengan hasil uji `PASS 12/12`. *(Lihat `docs/07-hasil-testing.md` untuk detail lebih lanjut).*

## 🖼️ Tampilan Antarmuka (Screenshots)
*(Ruang untuk lampiran tangkapan layar sistem. Tambahkan path image Anda di sini)*
- [Landing Page Image Placeholder]
- [Admin Dashboard Image Placeholder]
- [Booking Wizard Image Placeholder]

---
Dikembangkan oleh Kandidat Analis Program.
