'use client';

import './globals.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Simple client side cookie check
    const checkLogin = () => {
      const isLogged = document.cookie.includes('user_token');
      setIsLoggedIn(isLogged);
    };
    checkLogin();
  }, [pathname]);

  const handleLogout = () => {
    document.cookie = 'user_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <html lang="id">
      <head>
        <title>SM Sport Center — Reservasi Lapangan Online</title>
        <meta name="description" content="Reservasi Lapangan Futsal & Badminton di SM Sport Center" />
      </head>
      <body>
        <nav className="fixed w-full z-50 glass-card rounded-none border-t-0 border-l-0 border-r-0 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0">
                <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500 font-heading">
                  SM Sport Center
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/' ? 'text-emerald-400' : 'text-slate-300 hover:text-white'}`}>Beranda</Link>
                  <Link href="/jadwal" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/jadwal' ? 'text-emerald-400' : 'text-slate-300 hover:text-white'}`}>Jadwal</Link>
                  {isLoggedIn ? (
                    <>
                      <Link href="/reservasi" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/reservasi' ? 'text-emerald-400' : 'text-slate-300 hover:text-white'}`}>Reservasi Saya</Link>
                      <button onClick={handleLogout} className="px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:text-red-300 transition-colors">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white transition-colors">Login</Link>
                      <Link href="/register" className="btn-primary text-sm px-4 py-2">Register</Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="pt-16 min-h-screen relative overflow-hidden">
          {/* Background orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px] -z-10 pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] -z-10 pointer-events-none"></div>
          
          {children}
        </main>
        <footer className="border-t border-white/10 mt-auto py-8 glass-card rounded-none border-b-0 border-l-0 border-r-0">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} SM Sport Center. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
