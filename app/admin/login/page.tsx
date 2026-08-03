'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/admin');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] mb-2">Admin Panel — SM Sport Center</h1>
          <p className="text-[#94A3B8]">Silakan masuk untuk melanjutkan</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Username</label>
            <input 
              type="text" 
              required
              className="input-field w-full" 
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#94A3B8] mb-2">Password</label>
            <input 
              type="password" 
              required
              className="input-field w-full" 
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full h-12 text-lg mt-4 flex items-center justify-center"
          >
            {loading ? (
               <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : 'Masuk ke Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
