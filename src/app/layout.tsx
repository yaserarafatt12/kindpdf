import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KindPDF — Privacy-First Local PDF Tools',
  description: 'Process, merge, split, and organize PDF documents directly inside your browser. Your files never leave your device.',
  keywords: ['PDF', 'KindPDF', 'Kindpdf', 'Merge PDF', 'Local PDF', 'Privacy', 'Offline PDF', 'PDF tools'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans antialiased min-h-screen text-[#0A1128] dark:text-white selection:bg-[#00A3FF]/25 dark:selection:bg-[#38BDF8]/30 selection:text-[#0A1128] dark:selection:text-white">
        {children}
      </body>
    </html>
  );
}
