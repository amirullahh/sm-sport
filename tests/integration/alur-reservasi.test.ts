/**
 * @file tests/integration/alur-reservasi.test.ts
 * @description Integration test: alur lengkap dari Login → Reservasi → Simpan → Laporan.
 * Sesuai PRD Bagian 13.2.
 *
 * Menggunakan fungsi PRODUKSI (buatReservasi) dari lib/validasi dan koneksi
 * db yang sama (lib/db) dengan database test terpisah.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import type BetterSqlite3 from 'better-sqlite3';

const TEST_DB_PATH = path.resolve(process.cwd(), './data/test-integration.db');

let db: InstanceType<typeof BetterSqlite3>;
let buatReservasi: typeof import('@/lib/validasi').buatReservasi;

beforeAll(async () => {
  for (const suffix of ['', '-wal', '-shm']) {
    if (fs.existsSync(TEST_DB_PATH + suffix)) {
      fs.unlinkSync(TEST_DB_PATH + suffix);
    }
  }

  process.env.DATABASE_PATH = TEST_DB_PATH;

  const dbModule = await import('@/lib/db');
  const validasi = await import('@/lib/validasi');
  db = dbModule.default;
  buatReservasi = validasi.buatReservasi;

  // Setup schema produksi + seed.
  const schema = fs.readFileSync(path.resolve(process.cwd(), 'db/schema.sql'), 'utf-8');
  db.exec(schema);

  const adminHash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admin (username, password_hash) VALUES (?, ?)').run('admin', adminHash);

  const plgHash = bcrypt.hashSync('pelanggan123', 10);
  db.prepare('INSERT INTO pelanggan (nama, email, no_hp, password_hash) VALUES (?, ?, ?, ?)')
    .run('Budi Santoso', 'budi@mail.com', '081234567890', plgHash);

  db.prepare('INSERT INTO lapangan (nama, jenis, harga_per_jam) VALUES (?, ?, ?)')
    .run('Futsal A', 'futsal', 150000);
});

afterAll(() => {
  db.close();
  for (const suffix of ['', '-wal', '-shm']) {
    if (fs.existsSync(TEST_DB_PATH + suffix)) {
      fs.unlinkSync(TEST_DB_PATH + suffix);
    }
  }
});

describe('Alur Integrasi: Login → Reservasi → Simpan → Laporan', () => {
  it('Langkah 1: Login pelanggan → verifikasi kredensial', () => {
    const pelanggan = db.prepare('SELECT * FROM pelanggan WHERE email = ?')
      .get('budi@mail.com') as { id: number; nama: string; email: string; password_hash: string };

    expect(pelanggan).toBeDefined();
    expect(pelanggan.nama).toBe('Budi Santoso');

    const isValid = bcrypt.compareSync('pelanggan123', pelanggan.password_hash);
    expect(isValid).toBe(true);
  });

  it('Langkah 2: Submit reservasi valid → tersimpan dengan total_harga benar', () => {
    const tanggal = '2026-08-20';
    const result = buatReservasi({
      lapangan_id: 1,
      pelanggan_id: 1,
      tanggal,
      jam_mulai: '10:00',
      jam_selesai: '12:00',
    });

    expect(result.durasi).toBe(2); // 2 jam
    expect(result.total_harga).toBe(300000); // 2 jam × Rp150.000
    expect(result.id).toBeGreaterThan(0);
  });

  it('Langkah 3: Cek data tersimpan di tabel reservasi', () => {
    const reservasi = db.prepare('SELECT * FROM reservasi WHERE tanggal = ?')
      .get('2026-08-20') as {
        id: number;
        lapangan_id: number;
        pelanggan_id: number;
        tanggal: string;
        jam_mulai: string;
        jam_selesai: string;
        total_harga: number;
        status: string;
      };

    expect(reservasi).toBeDefined();
    expect(reservasi.lapangan_id).toBe(1);
    expect(reservasi.pelanggan_id).toBe(1);
    expect(reservasi.jam_mulai).toBe('10:00');
    expect(reservasi.jam_selesai).toBe('12:00');
    expect(reservasi.total_harga).toBe(300000);
    expect(reservasi.status).toBe('confirmed');
  });

  it('Langkah 4: Reservasi muncul di rekap laporan', () => {
    const laporan = db.prepare(`
      SELECT
        l.nama as lapangan,
        COUNT(r.id) as total_booking,
        SUM(
          (CAST(substr(r.jam_selesai, 1, 2) AS INTEGER) * 60 + CAST(substr(r.jam_selesai, 4, 2) AS INTEGER))
          - (CAST(substr(r.jam_mulai, 1, 2) AS INTEGER) * 60 + CAST(substr(r.jam_mulai, 4, 2) AS INTEGER))
        ) / 60.0 as total_jam,
        SUM(r.total_harga) as total_revenue
      FROM reservasi r
      JOIN lapangan l ON l.id = r.lapangan_id
      WHERE r.tanggal >= ? AND r.tanggal <= ?
        AND r.status IN ('confirmed', 'completed')
      GROUP BY l.id
    `).all('2026-08-01', '2026-08-31') as {
      lapangan: string;
      total_booking: number;
      total_jam: number;
      total_revenue: number;
    }[];

    expect(laporan.length).toBeGreaterThan(0);
    expect(laporan[0].lapangan).toBe('Futsal A');
    expect(laporan[0].total_booking).toBe(1);
    expect(laporan[0].total_jam).toBe(2);
    expect(laporan[0].total_revenue).toBe(300000);
  });
});
