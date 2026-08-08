<div align="center">

# ⚽ SM Sport Center

### Sistem Reservasi Lapangan Olahraga Online

[![CI](https://github.com/amirullahh/sm-sport/actions/workflows/ci.yml/badge.svg)](https://github.com/amirullahh/sm-sport/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

Aplikasi web manajemen reservasi lapangan futsal & badminton — built dengan Next.js 16 App Router, TypeScript, Tailwind CSS, dan SQLite.

</div>

---

## 📋 Daftar Isi

- [✨ Fitur](#-fitur)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [🔐 Akun Demo](#-akun-demo)
- [📁 Struktur Project](#-struktur-project)
- [🔒 Keamanan](#-keamanan)
- [✅ Testing](#-testing)
- [ CI/CD](#cicd-github-actions)
- [📄 License](#-license)

---

## ✨ Fitur

### 👤 Pelanggan
- 🔐 Registrasi & login dengan captcha
- 📅 Booking lapangan — wizard 3 langkah (pilih → waktu → konfirmasi)
- 📊 Lihat riwayat reservasi dengan filter & search
- ❌ Batalkan reservasi (sebelum jadwal dimulai)
- 🔍 Cek ketersediaan jadwal per lapangan & tanggal

### 🔒 Admin
- 📊 Dashboard statistik (reservasi hari ini, revenue, lapangan aktif, total pelanggan)
- 🏟️ CRUD lapangan — tambah, edit, nonaktifkan (dengan konfirmasi hapus)
- 📋 Manajemen reservasi — lihat semua, filter status, konfirmasi/batalkan
- 👥 Data pelanggan dengan pencarian
- 📈 Laporan revenue per lapangan dengan export CSV

### 🛡️ Keamanan
- JWT + httpOnly cookie (XSS-protected)
- Rate limiting (5 percobaan / 15 menit per IP+akun)
- Validasi Zod di semua input
- SQL injection protected (parameterized queries)
- Prevent double-booking (BEGIN IMMEDIATE transaction)

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) 5 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) 4 (Glassmorphism) |
| **Database** | SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| **Auth** | [jose](https://github.com/panva/jose) (JWT) + httpOnly cookie |
| **Password** | [bcryptjs](https://github.com/nicolo-ribaudo/bcryptjs) |
| **Font** | [next/font](https://nextjs.org/docs/basic-features/fonts) (self-hosted) |
| **Testing** | [Vitest](https://vitest.dev/) |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [npm](https://www.npmjs.com/) ≥ 9

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/amirullahh/sm-sport.git
cd sm-sport

# 2. Install dependencies
npm install

# 3. Buat file .env.local dari contoh
cp .env.example .env.local

# 4. Edit .env.local — isi JWT_SECRET (penting!)
#    JWT_SECRET=<ganti-dengan-string-random-kuat-min32-karakter>

# 5. Inisialisasi database & seed data
npm run db:init

# 6. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🔐 Akun Demo

| Role | URL | Kredensial |
|------|-----|-----------|
| **Admin** | `/admin/login` | `admin` / `admin123` |
| **Pelanggan** | `/login` | `budi@mail.com` / `pelanggan123` |

> ⚠️ Ganti password admin di production!

---

## 📁 Struktur Project

```
sm-sport/
├── app/
│   ├── admin/              # Admin panel (dashboard, CRUD, laporan)
│   ├── api/                # REST API endpoints
│   ├── components/         # Shared components (Navbar, LayoutShell)
│   ├── login/              # Customer login page
│   ├── register/           # Customer register page
│   └── reservasi/          # Customer reservasi pages & booking wizard
├── db/
│   ├── schema.sql          # Database schema + trigger
│   └── seed.ts             # Seed data script
├── lib/
│   ├── auth.ts             # JWT auth helpers
│   ├── db.ts               # SQLite connection
│   ├── rate-limit.ts       # In-memory rate limiter
│   └── validasi.ts         # Zod schemas + business logic
├── middleware.ts            # Route protection middleware
├── tests/
│   ├── unit/validasi.test.ts
│   └── integration/alur-reservasi.test.ts
└── .github/workflows/ci.yml
```

---

## 🔒 Keamanan

| Fitur | Implementasi |
|-------|-------------|
| **JWT Auth** | httpOnly cookie, 24 jam expiry, `sameSite: lax` |
| **JWT Secret** | FAIL-CLOSED — tidak ada hardcoded fallback |
| **Password** | bcrypt hash (10 rounds) |
| **Rate Limiting** | 5 percobaan / 15 menit per IP+akun |
| **SQL Injection** | Parameterized queries |
| **Double Booking** | SQLite BEGIN IMMEDIATE transaction |
| **Input Validation** | Zod schemas |
| **Past Date Prevention** | API menolak booking tanggal/jam yang sudah lewat |
| **CSV Injection** | Prefix `=+−@` di export CSV |

---

## ✅ Testing

```bash
# Jalankan semua test (23 test cases)
npm test

# Type check
npx tsc --noEmit

# Lint
npx eslint .

# Build production
npm run build
```

### Test Coverage
- ✅ Autentikasi (login benar/salah)
- ✅ Reservasi (buat, bentrok, validasi jam operasional)
- ✅ Validasi tanggal masa lalu
- ✅ Schema Zod (catatan max 255)
- ✅ CRUD admin (lapangan, pelanggan)
- ✅ Alur integrasi (login → reservasi → laporan)

---

## 📁 CI/CD (GitHub Actions)

Pipeline otomatis berjalan pada setiap push & pull request ke branch `main`:

```
Type Check → Lint → Test → Build
```

Semua harus PASS sebelum code di-merge.

---

## 🌐 Deployment

### Vercel (Demo)
Push ke GitHub → Hubungkan di [vercel.com](https://vercel.com) → Set `JWT_SECRET` → Deploy.

### Railway / VPS (Production)
SQLite membutuhkan filesystem persisten. Gunakan [Railway](https://railway.app/) ($5/bulan) atau VPS ([Hetzner](https://www.hetzner.com/cloud/) $5/bulan).

> ⚠️ **SQLite di Vercel:** Database bersifat ephemeral. Untuk production, gunakan [Turso](https://turso.tech/) atau [Supabase](https://supabase.com/).

---

## 📄 License

MIT License — Silakan gunakan untuk belajar dan portofolio.

---

<div align="center">

**Dibuat oleh [Amirullah Hidayat](https://github.com/amirullahh)**

</div>
