'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  // Admin pages get their own layout (sidebar in admin/layout.tsx)
  if (isAdmin) {
    return <>{children}</>;
  }

  // Public/customer pages get Navbar + footer
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen relative overflow-hidden">
        {/* Background orbs */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px] -z-10 pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] -z-10 pointer-events-none"></div>
        {children}
      </main>
      <footer className="border-t border-white/10 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} SM Sport Center. All rights reserved.
        </div>
      </footer>
    </>
  );
}
