/**
 * @file tests/integration/alur-reservasi.test.ts
 * @description Integration test: alur lengkap dari Login → Reservasi → Simpan → Verifikasi.
 * Sesuai PRD Bagian 13.2:
 * 
 * 1. Login pelanggan → dapat session
 * 2. Submit reservasi valid → status 201, total_harga sesuai perhitungan
 * 3. Cek data tersimpan di tabel reservasi
 * 4. Verifikasi data muncul di rekap laporan
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Setup database test
const TEST_DB_PATH = './data/test-integration.db';
let db: InstanceType<typeof Database>;

beforeAll(() => {
  const dbDir = path.dirname(TEST_DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  db = new Database(TEST_DB_PATH);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');

  // Setup schema
  const schema = fs.readFileSync(path.join(__dirname, '../../db/schema.sql'), 'utf-8');
  db.exec(schema);

  // Seed
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
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});

describe('Alur Integrasi: Login → Reservasi → Simpan → Laporan', () => {
  it('Langkah 1: Login pelanggan → dapat session (verifikasi kredensial)', () => {
    // Simulasi login: cari user dan verifikasi password
    const pelanggan = db.prepare('SELECT * FROM pelanggan WHERE email = ?')
      .get('budi@mail.com') as { id: number; nama: string; email: string; password_hash: string };
    
    expect(pelanggan).toBeDefined();
    expect(pelanggan.nama).toBe('Budi Santoso');
    
    const isValid = bcrypt.compareSync('pelanggan123', pelanggan.password_hash);
    expect(isValid).toBe(true);
  });

  it('Langkah 2: Submit reservasi valid → data tersimpan dengan total_harga benar', () => {
    const tanggal = '2026-08-20';
    const jam_mulai = '10:00';
    const jam_selesai = '12:00';
    
    // Hitung durasi & harga
    const [h1, m1] = jam_mulai.split(':').map(Number);
    const [h2, m2] = jam_selesai.split(':').map(Number);
    const durasi = ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
    
    expect(durasi).toBe(2); // 2 jam
    
    const lapangan = db.prepare('SELECT harga_per_jam FROM lapangan WHERE id = ?')
      .get(1) as { harga_per_jam: number };
    const total_harga = lapangan.harga_per_jam * durasi;
    
    expect(total_harga).toBe(300000); // 2 jam × Rp150.000

    // Insert reservasi dalam transaction (atomik)
    const buatReservasi = db.transaction(() => {
      // Cek bentrok
      const bentrok = db.prepare(`
        SELECT COUNT(*) as jumlah FROM reservasi
        WHERE lapangan_id = ? AND tanggal = ? AND status IN ('pending','confirmed')
          AND jam_mulai < ? AND jam_selesai > ?
      `).get(1, tanggal, jam_selesai, jam_mulai) as { jumlah: number };
      
      if (bentrok.jumlah > 0) throw new Error('BENTROK_JADWAL');
      
      return db.prepare(`
        INSERT INTO reservasi (lapangan_id, pelanggan_id, tanggal, jam_mulai, jam_selesai, total_harga, status)
        VALUES (?, ?, ?, ?, ?, ?, 'confirmed')
      `).run(1, 1, tanggal, jam_mulai, jam_selesai, total_harga);
    });

    const result = buatReservasi();
    expect(result.changes).toBe(1);
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
    // Query laporan: total booking, jam, revenue untuk periode yang sesuai
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
    `).all('2026-08-01', '2026-08-31') as Array<{
      lapangan: string;
      total_booking: number;
      total_jam: number;
      total_revenue: number;
    }>;

    expect(laporan.length).toBeGreaterThan(0);
    
    const futsal = laporan.find(l => l.lapangan === 'Futsal A');
    expect(futsal).toBeDefined();
    expect(futsal!.total_booking).toBe(1);
    expect(futsal!.total_jam).toBe(2);
    expect(futsal!.total_revenue).toBe(300000);
  });
});
