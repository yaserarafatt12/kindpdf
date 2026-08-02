import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'K I N D P D F — Privacy-First Local PDF Tools',
  description: 'Process, merge, split, and organize PDF documents directly inside your browser. Your files never leave your device.',
  keywords: ['PDF', 'KindPDF', 'Merge PDF', 'Local PDF', 'Privacy', 'Offline PDF', 'PDF tools'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
