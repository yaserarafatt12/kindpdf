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
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-semibold btn-press-effect"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.9} />
          <span>{lang === 'en' ? 'Back to Tool' : 'Kembali'}</span>
        </button>
      </div>

      {/* Hero Success Download Tempered Glass Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 text-center space-y-5">
        <div className="relative z-10 flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.18] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
            <CheckCircle2
              className="w-7 h-7 text-[#0A1128]/85 dark:text-white"
              strokeWidth={1.85}
            />
          </div>
        </div>

        <h2 className="relative z-10 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1128] dark:text-white">
          {title}
        </h2>

        {/* Optional Stats Badge */}
        {statBadge && (
          <div className="relative z-10 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.16] text-[#0A1128]/80 dark:text-white/85 font-semibold text-xs">
            <span className="px-2 py-0.5 rounded-full bg-[#0A1128] dark:bg-white text-white dark:text-[#071124] font-bold text-[11px]">
              {statBadge.label}
            </span>
            {statBadge.detail && <span className="font-medium text-xs">{statBadge.detail}</span>}
          </div>
        )}

        {/* Primary Quest Monochrome CTA */}
        <div className="relative z-10 pt-2 max-w-md mx-auto space-y-4">
          <button
            type="button"
            onClick={() => onDownload(fileName)}
            className="w-full py-4 px-6 sm:px-8 rounded-2xl glass-cta font-bold text-base flex items-center justify-center gap-3 btn-press-effect"
          >
            <Download className="w-5 h-5 stroke-[2.2] shrink-0" />
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
                  className="flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/85 dark:bg-white/[0.08] border border-[#00A3FF] dark:border-[#38BDF8] text-[#0A1128] dark:text-white outline-none shadow-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold glass-cta btn-press-effect shrink-0"
                >
                  {lang === 'en' ? 'Save' : 'Simpan'}
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
                <span className="text-xs sm:text-sm font-semibold text-[#0A1128]/75 dark:text-white/75 truncate min-w-0 flex-1 text-center">
                  {fileName}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-semibold text-[#0A1128]/60 dark:text-white/60 hover:text-[#0A1128] dark:hover:text-white underline underline-offset-2 shrink-0"
                >
                  {lang === 'en' ? 'Edit name' : 'Ubah nama'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* "Continue to..." Recommendations */}
      <div className="pt-4 border-t border-black/[0.08] dark:border-white/[0.10] space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-bold text-[#0A1128] dark:text-white tracking-tight">
            {lang === 'en' ? 'Continue to...' : 'Lanjutkan ke alat populer...'}
          </h3>
          <span className="text-[10px] font-semibold text-[#0A1128]/50 dark:text-white/50 uppercase tracking-wider">
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
                <div
                  className={`w-10 h-10 rounded-xl ${getIconBg(item.id)} flex items-center justify-center shrink-0 group-hover:scale-[1.04] transition-transform`}
                >
                  {getToolIcon(item.id)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-[#0A1128] dark:text-white truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#0A1128]/60 dark:text-white/55 font-normal truncate">
                    {item.description}
                  </p>
                </div>
              </div>
              <ChevronRight
                className="relative z-10 w-4 h-4 text-[#0A1128]/40 dark:text-white/40 group-hover:text-[#0A1128] dark:group-hover:text-white shrink-0 transition-transform group-hover:translate-x-0.5 ml-2"
                strokeWidth={2}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuccessDownloadScreen;
