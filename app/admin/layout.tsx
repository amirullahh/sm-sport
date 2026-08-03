'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Dont show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const links = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/lapangan', label: 'Lapangan', icon: '🏟️' },
    { href: '/admin/reservasi', label: 'Reservasi', icon: '🗓️' },
    { href: '/admin/pelanggan', label: 'Pelanggan', icon: '👥' },
    { href: '/admin/laporan', label: 'Laporan', icon: '📈' },
  ];

  return (
    <div className="flex h-screen bg-[#0F172A] text-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 glass-card border-r border-white/10 flex flex-col p-4 rounded-none h-full">
        <div className="text-2xl font-bold text-[#10B981] mb-8 px-4 flex items-center gap-2">
          <span>⚙️</span> Admin Panel
        </div>
        <nav className="flex-1 space-y-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 'hover:bg-white/5 text-[#94A3B8] hover:text-[#F8FAFC]'}`}
              >
                <span>{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <Link
            href="/admin/login"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#EF4444] hover:bg-[#EF4444]/10 transition-all duration-200 font-medium"
          >
            <span>🚪</span>
            <span>Logout</span>
          </Link>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#0F172A] p-8">
        {children}
      </main>
    </div>
  );
}
