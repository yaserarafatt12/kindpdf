'use client';

import React from 'react';
import {
  Download,
  ArrowLeft,
  ChevronRight,
  Minimize2,
  Split,
  Hash,
  Stamp,
  Lock,
  Layers,
} from 'lucide-react';
import { TranslationDictionary, Language } from '@/lib/i18n/translations';
import { ViewMode } from './Header';

interface SuccessDownloadScreenProps {
  title: string;
  downloadFileName: string;
  onDownload: () => void;
  onStartOver: () => void;
  onSelectTool: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: Language;
}

export const SuccessDownloadScreen: React.FC<SuccessDownloadScreenProps> = ({
  title,
  downloadFileName,
  onDownload,
  onStartOver,
  onSelectTool,
  t,
  lang,
}) => {
  const continueTools: { id: ViewMode; title: string; icon: React.ReactNode }[] = [
    {
      id: 'compress',
      title: lang === 'en' ? 'Compress PDF' : 'Kompres PDF',
      icon: <Minimize2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
    },
    {
      id: 'split',
      title: lang === 'en' ? 'Split PDF' : 'Pisahkan PDF',
      icon: <Split className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    },
    {
      id: 'page-numbers',
      title: lang === 'en' ? 'Add Page Numbers' : 'Tambah Nomor Halaman',
      icon: <Hash className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
    },
    {
      id: 'watermark',
      title: lang === 'en' ? 'Add Watermark' : 'Tambah Watermark',
      icon: <Stamp className="w-5 h-5 text-violet-600 dark:text-violet-400" />,
    },
    {
      id: 'organize',
      title: lang === 'en' ? 'Organize Pages' : 'Atur Halaman',
      icon: <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
    },
    {
      id: 'protect',
      title: lang === 'en' ? 'Protect PDF' : 'Proteksi PDF',
      icon: <Lock className="w-5 h-5 text-slate-700 dark:text-slate-300" />,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8 animate-fade-in">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 transition-colors btn-press-effect"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'en' ? 'Back to Merge PDF' : 'Kembali ke Merge PDF'}</span>
        </button>
      </div>

      {/* Hero Success Download Area */}
      <div className="text-center space-y-6 py-4">
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>

        {/* Big Prominent CTA Download Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onDownload}
            className="w-full sm:w-auto min-w-[280px] px-8 py-4.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-500/25 hover:shadow-2xl transition-all duration-200 btn-press-effect mx-auto"
          >
            <Download className="w-6 h-6 stroke-[2.5]" />
            <span>{lang === 'en' ? 'Download merged PDF' : 'Unduh PDF Hasil penggabungan'}</span>
          </button>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-2.5 truncate max-w-md mx-auto">
            {downloadFileName}
          </p>
        </div>
      </div>

      {/* "Continue to..." Recommendations Box */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">
          {lang === 'en' ? 'Continue to...' : 'Lanjutkan ke alur kerja lain...'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {continueTools.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTool(item.id)}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-sky-500 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all flex items-center justify-between text-left group btn-press-effect"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 shrink-0 group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-sky-400 truncate">
                  {item.title}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-sky-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuccessDownloadScreen;
