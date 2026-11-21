import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kindpdf — Privacy-First Local PDF Tools',
  description: 'Process, merge, split, and organize PDF documents directly inside your browser. Your files never leave your device.',
  keywords: ['PDF', 'Kindpdf', 'Merge PDF', 'Local PDF', 'Privacy', 'Offline PDF', 'PDF tools'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased min-h-screen bg-[#f3f6fc] dark:bg-[#060d1c] text-slate-900 dark:text-slate-100 selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
