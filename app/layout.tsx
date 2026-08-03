import type { Metadata } from 'next';
import './globals.css';
import Navbar from './components/Navbar';

export const metadata: Metadata = {
  title: 'SM Sport Center — Reservasi Lapangan Online',
  description: 'Reservasi Lapangan Futsal & Badminton di SM Sport Center. Booking mudah, cepat, dan aman.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
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
      </body>
    </html>
  );
}
