# Hasil Profiling Performa
**Proyek:** Sistem Reservasi Lapangan SM Sport Center
**Skema Sertifikasi BNSP:** Analis Program (SKM-2019-62010-002)

## 1. Panduan Profiling dengan Chrome DevTools
Untuk memastikan aplikasi berjalan dengan responsif, profil kecepatan respon API (*Network Profiling*) dapat dilakukan mengikuti langkah berikut:
1. Buka Sistem SM Sport Center di peramban (Chrome).
2. Tekan `F12` atau klik kanan > `Inspect` untuk membuka Developer Tools.
3. Buka tab **Network**.
4. Pastikan opsi `Disable cache` tercentang jika ingin menguji tanpa memori sementara.
5. Lakukan navigasi halaman atau eksekusi fungsi tertentu di aplikasi.
6. Catat metrik waktu (kolom `Time`) dan ukuran respon (kolom `Size`) dari baris request API yang ingin diukur.

## 2. Tabel Hasil Profiling (Template Analisis)
Silakan isi bagian *Sebelum Optimasi* dan *Sesudah Optimasi* apabila Anda melakukan *testing* di mesin lokal. Nilai di bawah ini merupakan estimasi pengukuran rata-rata *backend*.

| Rute Endpoint API | Kondisi Pengujian | Waktu Respons (ms) | Rekomendasi/Analisis |
|------------------|-------------------|--------------------|----------------------|
| `GET /api/lapangan` | Pengambilan daftar 5 lapangan | ~20 - 45 ms | *Simple query*, sangat cepat. Belum butuh optimasi tambahan. |
| `POST /api/reservasi` | Cek ketersediaan dan proses pemesanan (Transaksi) | ~80 - 150 ms | Karena melibatkan `db.transaction()` dan fungsi *overlap*, waktu respon sedikit naik namun masih di bawah standar 500ms. Indeks pada tanggal membantu mempertahankan kecepatan ini. |
| `GET /api/laporan` | Kalkulasi omset (SUM) dan agregat pendapatan bulanan/tahunan | ~150 - 300 ms | Melibatkan operasi `GROUP BY`. Ini adalah API terberat. Jika data sudah berjumlah puluhan ribu, kecepatan berisiko turun ke >1 detik. |

## 3. Peran Indeks dalam Performa
Sistem telah menerapkan indeks basis data:
`CREATE INDEX idx_reservasi_tanggal ON reservasi(lapangan_id, tanggal);`

Indeks berfungsi seperti daftar isi buku. Saat fungsi *Cek Bentrok* atau melihat Jadwal Lapangan berjalan, *database* tidak perlu mencari satu-per-satu ke seluruh puluhan ribu data (*Table Scan*), melainkan langsung meloncat ke halaman "daftar isi" lapangan dan tanggal spesifik. Hal ini mencegah *bottleneck* performa secara signifikan.

## 4. Rekomendasi Optimisasi Masa Depan
1. **Laporan Asinkron**: Jika tabel laporan nantinya melambat drastis, perhitungkan fungsi hitung pendapatan dilakukan secara asinkron setiap tengah malam untuk membuat "Tabel Ringkasan", alih-alih menghitung ulang ribuan tabel utama saat admin menekan menu laporan.
2. **Server-side Rendering**: Memanfaatkan SSR Next.js secara optimal agar proses pengambilan data lapangan bisa langsung terangkai di HTML dari peladen, tanpa menunggu Javascript berjalan di klien.

## 5. Catatan Lighthouse (User Test)
*Bagi asesor/developer:* Anda dapat menggunakan tab `Lighthouse` di Chrome DevTools, pilih mode *Navigation* dan klik *Analyze Page Load*. Sistem akan memberikan skor performa UI secara keseluruhan (FCP, LCP, CLS). Diharapkan sistem ini mencapai skor > 90 (Hijau) pada metrik aksesibilitas dan performa. Silakan pasang *Screenshot* hasil Lighthouse Anda di bawah dokumen ini.
