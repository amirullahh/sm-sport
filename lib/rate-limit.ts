/**
 * @file lib/rate-limit.ts
 * @description Rate limiter sederhana berbasis memori (fixed window) untuk
 * memproteksi endpoint login dari brute-force / credential stuffing.
 *
 * CATATAN: State disimpan in-memory per process. Cukup untuk deploy
 * single-instance. Untuk multi-instance (serverless/HA) gunakan Redis
 * atau penyimpanan bersama agar limit tetap konsisten lintas instance.
 */

/**
 * Record per key dalam window berjalan.
 */
interface WindowEntry {
  count: number;
  resetAt: number;
}

/** Map key → window entry. Bersih sendiri saat window kedaluwarsa. */
const windows = new Map<string, WindowEntry>();

// Bersihkan entry lama secara berkala agar Map tidak membengkak.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of windows) {
    if (now > entry.resetAt) windows.delete(key);
  }
}, 60_000).unref?.();

/**
 * Cek apakah request untuk `key` masih diizinkan dalam window.
 * @param key  Identitas pemanggil, misal "login:1.2.3.4:admin@mail.com"
 * @param limit  Maksimum percobaan yang diizinkan dalam window
 * @param windowMs  Panjang window dalam milidetik
 * @returns
 *  - allowed: true jika masih diizinkan (count ditambah),
 *  - retryAfterSeconds: berapa detik lagi harus menunggu (0 jika allowed)
 */
export function checkRateLimit(
  key: string,
  limit = 5,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = windows.get(key);

  // Window baru / sudah kedaluwarsa → mulai dari 1.
  if (!entry || now > entry.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Hapus window untuk `key` — dipanggil setelah login berhasil,
 * agar percobaan yang gagal tidak "menghukum" login yang benar berikutnya.
 */
export function clearRateLimit(key: string): void {
  windows.delete(key);
}

/**
 * Ambil IP client dari request. Di Vercel/Next.js, IP asli ada di header
 * `x-forwarded-for`. Fallback ke `x-real-ip`, lalu 'unknown'.
 */
export function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}
