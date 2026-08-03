# Dokumen Analisis Skalabilitas
**Proyek:** Sistem Reservasi Lapangan SM Sport Center
**Skema Sertifikasi BNSP:** Analis Program (SKM-2019-62010-002)

## 1. Pendahuluan
Dokumen ini disusun untuk menganalisis potensi pengembangan (skalabilitas) dari Sistem Reservasi Lapangan SM Sport Center. Sistem ini dirancang menggunakan arsitektur modern dengan Next.js 16 (App Router), TypeScript, dan basis data SQLite (melalui `better-sqlite3`). Analisis ini mencakup proyeksi pertumbuhan data, evaluasi performa basis data, identifikasi potensi *bottleneck*, serta rekomendasi solusi jangka pendek dan jangka panjang.

Konteks bisnis SM Sport Center saat ini memiliki 5 lapangan (2 lapangan Futsal dan 3 lapangan Badminton) dengan jam operasional dari pukul 08:00 hingga 23:00 (15 jam operasi per hari).

## 2. Estimasi Volume Data
Untuk mengevaluasi kapasitas sistem, kita perlu memproyeksikan volume data reservasi yang akan dihasilkan.

**Asumsi:**
- Jumlah lapangan: 5
- Jam operasional: 15 jam/hari
- Kapasitas maksimal: 5 × 15 = 75 slot/hari
- Asumsi utilisasi rata-rata: 50-60% (sekitar 35 - 45 slot terisi/hari, namun untuk penyederhanaan kita asumsikan rata-rata 30 reservasi per hari karena durasi bisa >1 jam).

**Proyeksi Pertumbuhan Tabel Reservasi:**
- **Harian:** ~30 baris/hari
- **Bulanan (30 hari):** ~900 baris/bulan
- **Tahunan (365 hari):** ~10.950 baris/tahun (dibulatkan ~11.000)
- **5 Tahun:** ~54.750 baris (dibulatkan ~50.000)

## 3. Analisis Kapasitas SQLite
Sistem saat ini menggunakan **SQLite** (engine `better-sqlite3`) dengan konfigurasi `WAL (Write-Ahead Logging)` mode.
Untuk volume data ~50.000 baris dalam 5 tahun, SQLite sangat mumpuni. SQLite dapat dengan mudah menangani basis data hingga gigabytes dengan jutaan baris tanpa penurunan performa yang signifikan selama *query* dan indeks dioptimalkan dengan baik. Oleh karena itu, arsitektur basis data saat ini sepenuhnya memadai untuk skala operasional SM Sport Center dalam jangka waktu menengah (5 tahun ke depan).

## 4. Identifikasi Bottleneck dan Solusi

Berikut adalah identifikasi potensi masalah performa (*bottleneck*) dan solusinya:

| No | Potensi *Bottleneck* | Solusi yang Diterapkan / Direkomendasikan | Status |
|----|----------------------|-------------------------------------------|--------|
| 1. | *Query* validasi jadwal bentrok melambat saat tabel reservasi membesar tanpa indeks. | **Solusi:** Pembuatan indeks komposit pada kolom `(lapangan_id, tanggal)`. Ini mempercepat pencarian jadwal spesifik. | ✅ Sudah Diterapkan |
| 2. | Sifat SQLite yang hanya mendukung *single-writer* (satu proses penulisan bersamaan) dapat menyebabkan antrean jika banyak admin/pengguna *booking* bersamaan. | **Solusi (Jangka Panjang):** Jika tingkat konkurensi (transaksi per detik) meningkat drastis, migrasi ke basis data PostgreSQL disarankan karena mendukung konkurensi yang jauh lebih tinggi. | ⏳ Rencana Skalabilitas |
| 3. | *Query* agregasi pada dashboard laporan (contoh: `GROUP BY` tanggal untuk menghitung pendapatan) melambat pada data besar. | **Solusi (Jangka Pendek):** Menambahkan indeks khusus pada kolom `tanggal` di tabel reservasi, terpisah dari indeks komposit. | ⏳ Rencana Skalabilitas |
| 4. | Memuat data reservasi/pelanggan secara penuh di halaman admin memperlambat respons dan membebani memori. | **Solusi (Jangka Pendek):** Implementasi *Pagination* (menggunakan `LIMIT` dan `OFFSET`) pada API dan antarmuka tabel admin. | ⏳ Rencana Skalabilitas |

## 5. Rekomendasi
- **Jangka Pendek (0-1 Tahun):** Pertahankan penggunaan SQLite. Tambahkan fungsionalitas *pagination* pada halaman admin dan indeks pada kolom tanggal untuk optimasi *query* laporan keuangan.
- **Jangka Panjang (>2 Tahun atau ekspansi cabang):** Evaluasi ulang konkurensi pengguna. Jika cabang SM Sport Center bertambah dan pengguna aktif harian melonjak melebihi 1000 *request* per detik, lakukan migrasi arsitektur basis data ke PostgreSQL dan gunakan sistem *caching* (seperti Redis) untuk data jadwal yang sering diakses.

## 6. Kesimpulan
Sistem Reservasi SM Sport Center saat ini menggunakan teknologi yang tepat guna dan efisien. Dengan volume data yang diperkirakan hanya mencapai ~50.000 baris dalam 5 tahun, SQLite masih sangat optimal, terutama karena fitur WAL mode telah diaktifkan. Beberapa *bottleneck* terkait operasi baca/tulis telah diidentifikasi dengan solusi *scaling* yang jelas ketika sistem membutuhkan peningkatan kapasitas di masa depan.
