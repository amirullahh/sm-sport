'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const hasCookie = document.cookie.includes('sm-sport-logged-in');
    setIsLoggedIn(hasCookie);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    // Clear the client-readable cookie too
    document.cookie = 'sm-sport-logged-in=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    setIsLoggedIn(false);
    router.push('/');
    router.refresh();
  };

  // Hide navbar on admin pages (admin has its own sidebar)
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed w-full z-50 glass-card rounded-none border-t-0 border-l-0 border-r-0 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500" style={{ fontFamily: 'Poppins, sans-serif' }}>
              ⚽ SM Sport Center
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
              Beranda
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/reservasi/baru" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/reservasi/baru' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                  Booking
                </Link>
                <Link href="/reservasi" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/reservasi' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                  Reservasi Saya
                </Link>
                <button onClick={handleLogout} className="ml-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                  Login
                </Link>
                <Link href="/register" className="ml-2 btn-primary text-sm px-4 py-2">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-slate-300 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1 animate-fadeIn">
            <Link href="/" className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5">Beranda</Link>
            {isLoggedIn ? (
              <>
                <Link href="/reservasi/baru" className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5">Booking</Link>
                <Link href="/reservasi" className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5">Reservasi Saya</Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5">Login</Link>
                <Link href="/register" className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 hover:bg-emerald-400/10">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
