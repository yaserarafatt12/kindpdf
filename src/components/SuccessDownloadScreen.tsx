'use client';

import React from 'react';
import { Download, ArrowLeft, ChevronRight } from 'lucide-react';
import { TranslationDictionary, Language } from '@/lib/i18n/translations';
import { tools, ToolDefinition } from '@/lib/tools/manifest';
import { getToolIcon, getIconBg } from './ToolGrid';
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
  lang,
}) => {
  // Pull REAL Popular Tools directly from Single Source of Truth Manifest (manifest.ts)
  const realPopularTools: ToolDefinition[] = tools.filter(
    (item) => item.popular && item.route !== 'merge'
  );

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-6 space-y-6 sm:space-y-8 animate-fade-in px-2 sm:px-0">
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
      <div className="text-center space-y-6 py-2 sm:py-4">
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>

        {/* Big Prominent High-Impact Download Button */}
        <div className="pt-2 max-w-lg mx-auto space-y-3">
          <button
            type="button"
            onClick={onDownload}
            className="w-full py-5 sm:py-6 px-8 sm:px-10 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-500 hover:to-sky-500 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-3.5 shadow-2xl shadow-blue-600/35 hover:shadow-blue-500/50 scale-[1.01] hover:scale-[1.03] transition-all duration-200 btn-press-effect"
          >
            <Download className="w-7 h-7 stroke-[3] shrink-0" />
            <span>{lang === 'en' ? 'Download Merged PDF' : 'Unduh Merged PDF'}</span>
          </button>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold truncate px-4">
            {downloadFileName}
          </p>
        </div>
      </div>

      {/* "Continue to..." Recommendations Box (REAL Popular Tools from Manifest) */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            {lang === 'en' ? 'Continue to...' : 'Lanjutkan ke alur kerja populer...'}
          </h3>
          <span className="text-[10px] font-extrabold text-blue-600 dark:text-sky-400 uppercase tracking-wider">
            {lang === 'en' ? 'Popular Tools' : 'Alat Populer'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {realPopularTools.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTool(item.route)}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200/80 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-sky-500 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all flex items-center justify-between text-left group btn-press-effect"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`p-2.5 rounded-xl ${getIconBg(item.id)} shrink-0 group-hover:scale-105 transition-transform shadow-xs`}>
                  {getToolIcon(item.id)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    {item.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-sky-400 shrink-0 transition-transform group-hover:translate-x-1 ml-2" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuccessDownloadScreen;
