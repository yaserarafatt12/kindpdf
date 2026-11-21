'use client';

import React from 'react';
import { Download, ArrowLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { TranslationDictionary, Language } from '@/lib/i18n/translations';
import { tools, ToolDefinition } from '@/lib/tools/manifest';
import { getToolIcon, getIconBg } from './ToolGrid';
import { ViewMode } from './Header';

interface SuccessDownloadScreenProps {
  title: string;
  downloadFileName: string;
  downloadButtonText?: string;
  statBadge?: { label: string; detail?: string };
  onDownload: (customName?: string) => void;
  onStartOver: () => void;
  onSelectTool: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: Language;
}

export const SuccessDownloadScreen: React.FC<SuccessDownloadScreenProps> = ({
  title,
  downloadFileName,
  downloadButtonText,
  statBadge,
  onDownload,
  onStartOver,
  onSelectTool,
  lang,
}) => {
  const [fileName, setFileName] = React.useState(downloadFileName);
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    setFileName(downloadFileName);
  }, [downloadFileName]);

  const POPULAR_RANK: Record<string, number> = {
    compress: 1,
    'pdf-to-word': 2,
    split: 3,
    'word-to-pdf': 4,
    'image-to-pdf': 5,
    'pdf-to-image': 6,
    organize: 7,
    protect: 8,
    unlock: 9,
    'page-numbers': 10,
    watermark: 11,
  };

  const realPopularTools: ToolDefinition[] = tools
    .filter((item) => item.popular && item.route !== 'merge')
    .sort((a, b) => (POPULAR_RANK[a.id] || 99) - (POPULAR_RANK[b.id] || 99))
    .slice(0, 4);

  const getExtension = (name: string): string => {
    const match = name.match(/\.[a-zA-Z0-9]+$/);
    return match ? match[0].toLowerCase() : '.pdf';
  };

  const handleSaveRename = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let trimmed = fileName.trim();
    if (!trimmed) {
      setFileName(downloadFileName);
      setIsEditing(false);
      return;
    }

    const expectedExt = getExtension(downloadFileName);
    if (!trimmed.toLowerCase().endsWith(expectedExt)) {
      const lastDot = trimmed.lastIndexOf('.');
      if (lastDot > 0) {
        trimmed = trimmed.substring(0, lastDot);
      }
      trimmed = `${trimmed}${expectedExt}`;
    }

    setFileName(trimmed);
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-6 space-y-8 sm:space-y-10 animate-fade-in px-2 sm:px-0">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-extrabold btn-press-effect"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'en' ? 'Back to Tool' : 'Kembali'}</span>
        </button>
      </div>

      {/* Hero Success Download Tempered Glass Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 text-center space-y-5">
        <div className="relative z-10 flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shadow-[0_0_28px_rgba(16,185,129,0.22),inset_0_1px_0_rgba(255,255,255,0.35)]">
            <CheckCircle2 className="w-7 h-7 text-emerald-500 dark:text-emerald-300" />
          </div>
        </div>

        <h2 className="relative z-10 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>

        {/* Optional Stats Badge */}
        {statBadge && (
          <div className="relative z-10 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-800 dark:text-emerald-200 font-extrabold text-xs">
            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[11px]">
              {statBadge.label}
            </span>
            {statBadge.detail && <span className="font-bold text-xs">{statBadge.detail}</span>}
          </div>
        )}

        {/* Primary Liquid Glass Download CTA */}
        <div className="relative z-10 pt-2 max-w-md mx-auto space-y-4">
          <button
            type="button"
            onClick={() => onDownload(fileName)}
            className="w-full py-4 px-6 sm:px-8 rounded-2xl glass-cta bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-base flex items-center justify-center gap-3 scale-[1.01] hover:scale-[1.02] btn-press-effect"
          >
            <Download className="w-5 h-5 stroke-[2.5] shrink-0" />
            <span>
              {downloadButtonText || (lang === 'en' ? 'Download File' : 'Unduh Berkas')}
            </span>
          </button>

          {/* Output Filename + Inline Rename */}
          <div className="px-2 pt-1">
            {isEditing ? (
              <form onSubmit={handleSaveRename} className="flex items-center gap-2 max-w-md mx-auto">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  autoFocus
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-white/90 dark:bg-[#081226]/90 border border-sky-400/70 text-slate-900 dark:text-white outline-none shadow-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black bg-sky-500 text-white hover:bg-sky-400 transition-colors btn-press-effect shrink-0"
                >
                  {lang === 'en' ? 'Save' : 'Simpan'}
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
                <span className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-200 truncate min-w-0 flex-1 text-center">
                  {fileName}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-extrabold text-sky-600 dark:text-sky-400 hover:underline shrink-0"
                >
                  ({lang === 'en' ? 'Edit name' : 'Ubah nama'})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* "Continue to..." Recommendations */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.1] space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-wide">
            {lang === 'en' ? 'Continue to...' : 'Lanjutkan ke alur kerja populer...'}
          </h3>
          <span className="text-[10px] font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            {lang === 'en' ? 'Popular Tools' : 'Alat Populer'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {realPopularTools.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTool(item.route)}
              className="glass-card-interactive p-4 rounded-2xl flex items-center justify-between text-left group btn-press-effect"
            >
              <div className="relative z-10 flex items-center gap-3 min-w-0 flex-1">
                <div className={`p-2.5 rounded-xl ${getIconBg(item.id)} shrink-0 group-hover:scale-105 transition-transform`}>
                  {getToolIcon(item.id)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    {item.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="relative z-10 w-4 h-4 text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-300 shrink-0 transition-transform group-hover:translate-x-1 ml-2" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuccessDownloadScreen;
