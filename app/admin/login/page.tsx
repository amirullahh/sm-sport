'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Captcha state. Nilai awal 0 (sama di server & client) untuk menghindari
  // hydration mismatch; angka acak dibangkitkan setelah mount di client.
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');

  const generateCaptcha = useCallback(() => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setCaptchaInput('');
  }, []);

  // Bangkitkan captcha HANYA di client setelah hydration.
  useEffect(() => {
    let active = true;
    (async () => {
      await Promise.resolve();
      if (active) generateCaptcha();
    })();
    return () => { active = false; };
  }, [generateCaptcha]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate Captcha
    if (parseInt(captchaInput) !== num1 + num2) {
      setError('Jawaban captcha salah, silakan coba lagi.');
      generateCaptcha();
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal login');

      // Set readable cookie for client state detection
      document.cookie = `sm-sport-logged-in=admin; path=/; max-age=86400`;

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      // Regenerate captcha on failure for security
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Admin Panel
          </h1>
          <p className="text-[#94A3B8]">SM Sport Center — Silakan masuk</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field w-full"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
              placeholder="••••••••"
            />
          </div>
          
          {/* Captcha Field */}
          {num1 > 0 && (
            <div className="pt-2">
              <label className="block text-center text-sm font-medium text-[#94A3B8] mb-3">
                Berapa {num1} + {num2} = ?
              </label>
              <input 
                type="number" 
                className="input-field w-full text-center" 
                placeholder="Masukkan jawaban"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full h-12 text-lg mt-4 flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              'Masuk'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
