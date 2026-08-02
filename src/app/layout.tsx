import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LocalPDF — Privacy-First Local PDF Tools',
  description: 'Process, merge, split, and organize PDF documents directly inside your browser. Your files never leave your device.',
  keywords: ['PDF', 'Merge PDF', 'Local PDF', 'Privacy', 'Offline PDF', 'PDF tools'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="font-sans antialiased min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
