# Hasil Testing Sistem
**Proyek:** Sistem Reservasi Lapangan SM Sport Center
**Skema Sertifikasi BNSP:** Analis Program (SKM-2019-62010-002)

## 1. Output Eksekusi Pengujian (Test Runner)
Sistem dilengkapi dengan serangkaian program penguji otomatis (Automated Testing) untuk memastikan keandalan *Business Logic*. Berdasarkan eksekusi perintah uji coba, aplikasi telah melewati **100% skenario tes**.

**Test Command:** `npm run test`
```text
✓ tests/integration/alur-reservasi.test.ts (4 tests) 304ms
✓ tests/unit/validasi.test.ts (8 tests) 509ms

Test Files  2 passed (2)
Tests       12 passed (12)
```

## 2. Detail Pengujian Unit (Unit Test) - 8 Skenario
Menguji fungsionalitas fungsi individual secara terisolasi (terutama `lib/validasi.ts` dan fungsi terkait).

| No | Modul / Skenario | Deskripsi Kasus | Hasil Diharapkan | Status Akhir |
|----|----------------|-----------------|------------------|--------------|
| 1. | Autentikasi | Login dengan email dan kata sandi benar | Mengembalikan data sesi | PASS |
| 2. | Autentikasi | Login dengan kata sandi yang salah | Melempar pesan Error | PASS |
| 3. | Reservasi | Membuat pemesanan dengan format data yang valid | Data Tersimpan | PASS |
| 4. | Validasi (Bugfix)| Membuat reservasi bentrok (waktu 100% sama dengan yang ada) | Ditolak | PASS |
| 5. | Validasi (Bugfix)| Membuat reservasi bentrok sebagian (irisan jam/overlap) | Ditolak | PASS |
| 6. | Validasi Input | Tanggal logis: Jam Mulai lebih besar dari Jam Selesai | Validasi Gagal/Ditolak | PASS |
| 7. | Register Pelanggan | Pendaftaran dengan email yang sudah terdaftar sebelumnya | Ditolak Duplikasi | PASS |
| 8. | Master Data | Admin menginput data lapangan tipe baru sesuai *enum* valid | Data Tersimpan | PASS |

## 3. Detail Pengujian Integrasi (Integration Test) - 4 Skenario
Menguji keterpaduan beberapa modul dan aliran data dari awal masuk hingga keluar (End-to-End simulasi).

| No | Modul / Skenario | Alur Tes Integrasi | Hasil Diharapkan | Status Akhir |
|----|----------------|--------------------|------------------|--------------|
| 1. | Sesi Pelanggan | Simulasi API hit Login Pelanggan | Memiliki Cookie Sesi Aktif | PASS |
| 2. | Transaksi Pemesanan | Submit reservasi via *endpoint* dengan *payload* JSON lengkap | Mendapat respon `201 Created` dan `total_harga` terkalkulasi dengan benar | PASS |
| 3. | Integritas Database | Memeriksa tabel `reservasi` | Data dari Skenario #2 benar-benar tercatat di *Database* | PASS |
| 4. | Laporan Admin | Admin mengambil *endpoint* ringkasan laporan bulanan | Nilai reservasi dari Skenario #2 masuk dalam ringkasan `SUM(total_harga)` | PASS |

## 4. Kesimpulan
Seluruh fungsionalitas krusial dari SM Sport Center, terutama yang menyangkut keamanan jadwal pemesanan (mencegah bentrok) dan transaksi pendapatan, telah dilindungi oleh pengujian *unit* dan *integrasi* yang komprehensif. Hasil tingkat kelulusan 12/12 memastikan sistem stabil, perbaikan bug terjamin regresi-nya, dan siap untuk tahap peluncuran (produksi).
