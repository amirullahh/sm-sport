import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import LayoutShell from './components/LayoutShell';

// Font di-self-host oleh next/font (lebih cepat, tidak kena layout shift,
// dan tidak bergantung CDN eksternal). Variable mengisi --font-body/--font-heading
// yang dipakai globals.css.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

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
      <body className={`${inter.variable} ${poppins.variable}`}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
