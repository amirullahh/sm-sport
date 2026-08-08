PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE lapangan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  jenis TEXT NOT NULL CHECK (jenis IN ('futsal','badminton')),
  harga_per_jam INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif','nonaktif')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE pelanggan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  no_hp TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE admin (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

CREATE TABLE reservasi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lapangan_id INTEGER NOT NULL REFERENCES lapangan(id),
  pelanggan_id INTEGER NOT NULL REFERENCES pelanggan(id),
  tanggal TEXT NOT NULL,           -- 'YYYY-MM-DD'
  jam_mulai TEXT NOT NULL,         -- 'HH:MM'
  jam_selesai TEXT NOT NULL,       -- 'HH:MM'
  total_harga INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('pending','confirmed','cancelled','completed')),
  catatan TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index untuk mencegah query cek-bentrok jadi lambat saat data banyak
CREATE INDEX idx_reservasi_lapangan_tanggal ON reservasi (lapangan_id, tanggal);
CREATE INDEX idx_reservasi_pelanggan ON reservasi (pelanggan_id);

-- Pastikan updated_at selalu ter-update setiap kali baris reservasi berubah.
CREATE TRIGGER trg_reservasi_updated_at
AFTER UPDATE ON reservasi
FOR EACH ROW
BEGIN
  UPDATE reservasi SET updated_at = datetime('now')
  WHERE id = OLD.id;
END;
