/**
 * @file lib/validasi.ts
 * @description Business logic inti: validasi bentrok jadwal, kalkulasi harga,
 * dan transaction atomik untuk pembuatan reservasi.
 * 
 * PENTING: Fungsi cekBentrok() menggunakan formula overlap yang BENAR:
 * Dua rentang waktu bentrok jika: mulai_baru < selesai_lama AND selesai_baru > mulai_lama
 * 
 * Fungsi buatReservasi() dibungkus dalam db.transaction() sehingga
 * cek-bentrok + insert berjalan atomik — tidak ada race condition.
 */

import { db } from './db';
import { z } from 'zod';

// ============================================================
// ZOD SCHEMAS — Validasi Input
// ============================================================

/** Schema validasi untuk registrasi pelanggan */
export const RegisterSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  no_hp: z.string().min(10, 'Nomor HP minimal 10 digit'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

/** Schema validasi untuk login pelanggan */
export const LoginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
});

/** Schema validasi untuk login admin */
export const AdminLoginSchema = z.object({
  username: z.string().min(1, 'Username harus diisi'),
  password: z.string().min(1, 'Password harus diisi'),
});

/** Schema validasi untuk data lapangan */
export const LapanganSchema = z.object({
  nama: z.string().min(1, 'Nama lapangan harus diisi'),
  jenis: z.enum(['futsal', 'badminton'], {
    errorMap: () => ({ message: 'Jenis harus futsal atau badminton' }),
  }),
  harga_per_jam: z.number().positive('Harga harus lebih dari 0'),
});

/** Schema validasi untuk pembuatan reservasi */
export const ReservasiSchema = z.object({
  lapangan_id: z.number().positive('ID lapangan harus valid'),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal: YYYY-MM-DD'),
  jam_mulai: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam: HH:MM'),
  jam_selesai: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam: HH:MM'),
});

// ============================================================
// BUSINESS LOGIC — Validasi Bentrok & Kalkulasi
// ============================================================

/** Parameter untuk fungsi cekBentrok */
interface CekBentrokParams {
  lapangan_id: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  reservasi_id_exclude?: number;
}

/**
 * Mengecek apakah ada reservasi yang bentrok di lapangan & tanggal yang sama.
 * 
 * FIX: Menggunakan formula overlap yang BENAR:
 * Dua rentang waktu [A_start, A_end] dan [B_start, B_end] OVERLAP jika:
 *   A_start < B_end AND A_end > B_start
 * 
 * Sebelumnya (BUG): hanya cek exact-match jam_mulai (=),
 * sehingga reservasi yang overlap sebagian lolos validasi.
 * 
 * @param p - Parameter berisi lapangan_id, tanggal, jam_mulai, jam_selesai
 * @returns true jika ADA bentrok, false jika TIDAK ada bentrok
 */
export function cekBentrok(p: CekBentrokParams): boolean {
  const query = `
    SELECT COUNT(*) as jumlah
    FROM reservasi
    WHERE lapangan_id = ?
      AND tanggal = ?
      AND status IN ('pending','confirmed')
      AND jam_mulai < ?
      AND jam_selesai > ?
      ${p.reservasi_id_exclude ? 'AND id != ?' : ''}
  `;
  const params: (string | number)[] = [
    p.lapangan_id,
    p.tanggal,
    p.jam_selesai,  // jam_mulai_existing < jam_selesai_baru
    p.jam_mulai,    // jam_selesai_existing > jam_mulai_baru
  ];
  if (p.reservasi_id_exclude) params.push(p.reservasi_id_exclude);

  const row = db.prepare(query).get(...params) as { jumlah: number };
  return row.jumlah > 0;
}

/**
 * Menghitung durasi dalam jam dari jam_mulai dan jam_selesai.
 * 
 * @param jamMulai - Format 'HH:MM'
 * @param jamSelesai - Format 'HH:MM'
 * @returns Durasi dalam jam (bisa desimal, misal 1.5 jam)
 * @throws Error jika jam_selesai <= jam_mulai
 */
export function hitungDurasiJam(jamMulai: string, jamSelesai: string): number {
  const [h1, m1] = jamMulai.split(':').map(Number);
  const [h2, m2] = jamSelesai.split(':').map(Number);
  const durasi = ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
  if (durasi <= 0) {
    throw new Error('DURASI_INVALID');
  }
  return durasi;
}

/**
 * Validasi bahwa jam booking berada dalam jam operasional (08:00-23:00).
 * 
 * @param jamMulai - Format 'HH:MM'
 * @param jamSelesai - Format 'HH:MM'
 * @returns true jika valid, false jika di luar jam operasional
 */
export function validasiJamOperasional(jamMulai: string, jamSelesai: string): boolean {
  const [h1] = jamMulai.split(':').map(Number);
  const [h2, m2] = jamSelesai.split(':').map(Number);
  // Jam operasional: 08:00 - 23:00
  if (h1 < 8 || h2 > 23 || (h2 === 23 && m2 > 0)) return false;
  return true;
}

/** Parameter untuk pembuatan reservasi */
interface BuatReservasiParams {
  lapangan_id: number;
  pelanggan_id: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  catatan?: string;
}

/**
 * Membuat reservasi baru secara ATOMIK (cek bentrok + insert dalam satu transaction).
 * 
 * better-sqlite3 bersifat synchronous, jadi db.transaction() menjamin
 * tidak ada request lain yang bisa nyelip di antara cek dan insert.
 * Ini mencegah race condition yang bisa menyebabkan double booking.
 * 
 * @param data - Data reservasi baru
 * @returns ID reservasi yang baru dibuat
 * @throws Error 'BENTROK_JADWAL' jika jadwal bentrok
 * @throws Error 'LAPANGAN_TIDAK_DITEMUKAN' jika lapangan tidak ada
 * @throws Error 'DURASI_INVALID' jika durasi tidak valid
 */
export const buatReservasi = db.transaction((data: BuatReservasiParams) => {
  // 1. Cek bentrok jadwal
  if (cekBentrok(data)) {
    throw new Error('BENTROK_JADWAL');
  }

  // 2. Ambil harga lapangan
  const lapangan = db.prepare('SELECT harga_per_jam, status FROM lapangan WHERE id = ?')
    .get(data.lapangan_id) as { harga_per_jam: number; status: string } | undefined;

  if (!lapangan) {
    throw new Error('LAPANGAN_TIDAK_DITEMUKAN');
  }

  if (lapangan.status === 'nonaktif') {
    throw new Error('LAPANGAN_NONAKTIF');
  }

  // 3. Hitung total harga
  const durasi = hitungDurasiJam(data.jam_mulai, data.jam_selesai);
  const total_harga = lapangan.harga_per_jam * durasi;

  // 4. Insert reservasi
  const info = db.prepare(`
    INSERT INTO reservasi (lapangan_id, pelanggan_id, tanggal, jam_mulai, jam_selesai, total_harga, status, catatan)
    VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?)
  `).run(
    data.lapangan_id,
    data.pelanggan_id,
    data.tanggal,
    data.jam_mulai,
    data.jam_selesai,
    total_harga,
    data.catatan || null
  );

  return {
    id: info.lastInsertRowid,
    total_harga,
    durasi,
  };
});
