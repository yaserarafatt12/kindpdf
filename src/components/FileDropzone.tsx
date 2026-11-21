'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, ShieldCheck } from 'lucide-react';
import { TranslationDictionary } from '@/lib/i18n/translations';

export type DropzoneColorTheme =
  | 'blue'
  | 'purple'
  | 'amber'
  | 'emerald'
  | 'rose'
  | 'teal'
  | 'sky'
  | 'violet'
  | 'slate'
  | 'indigo';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  t: TranslationDictionary;
  colorTheme?: DropzoneColorTheme;
}

const getGradientClasses = (theme: DropzoneColorTheme) => {
  switch (theme) {
    case 'purple':
      return 'bg-gradient-to-r from-purple-600 via-indigo-500 to-violet-500 hover:from-purple-500 hover:to-violet-400 shadow-purple-500/35';
    case 'amber':
      return 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/35';
    case 'emerald':
      return 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/35';
    case 'rose':
      return 'bg-gradient-to-r from-rose-600 via-pink-500 to-rose-500 hover:from-rose-500 hover:to-pink-400 shadow-rose-500/35';
    case 'teal':
      return 'bg-gradient-to-r from-teal-600 via-cyan-500 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 shadow-teal-500/35';
    case 'sky':
      return 'bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 shadow-sky-500/35';
    case 'violet':
      return 'bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 hover:from-violet-500 hover:to-purple-400 shadow-violet-500/35';
    case 'slate':
      return 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 hover:from-slate-600 hover:to-slate-800 shadow-slate-900/40';
    case 'indigo':
      return 'bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 shadow-indigo-500/35';
    case 'blue':
    default:
      return 'bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-sky-500/35';
  }
};

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFilesSelected,
  disabled = false,
  t,
  colorTheme = 'blue',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesSelected(droppedFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onFilesSelected(selectedFiles);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        if (!disabled && fileInputRef.current) {
          fileInputRef.current.click();
        }
      }}
      className={`relative overflow-hidden w-full max-w-xl mx-auto rounded-3xl border border-dashed p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-5 transition-all duration-300 cursor-pointer backdrop-blur-2xl ${
        isDragOver
          ? 'border-sky-400 bg-sky-500/15 dark:bg-[#0E2242]/90 scale-[1.015] shadow-[0_20px_56px_rgba(56,189,248,0.22),inset_0_1px_0_rgba(255,255,255,0.35)]'
          : 'border-slate-300/90 dark:border-white/[0.22] bg-white/80 dark:bg-[#0C1930]/[0.82] hover:border-sky-400/80 dark:hover:border-sky-400/60 shadow-[0_12px_36px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_18px_48px_rgba(2,6,23,0.52),inset_0_1px_0_rgba(255,255,255,0.24)]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* Subtle Top Tempered Glass Sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 dark:from-white/[0.08] to-transparent" />

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Frosted Halo Icon */}
      <div className="relative z-10 w-14 h-14 rounded-2xl bg-sky-500/10 dark:bg-sky-400/15 border border-sky-500/20 dark:border-white/20 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
        <UploadCloud className="w-7 h-7 text-sky-600 dark:text-sky-300" />
      </div>

      {/* Prominent Liquid Glass Primary CTA Button */}
      <div className="relative z-10 space-y-3 flex flex-col items-center w-full">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          className={`w-full sm:w-auto px-8 py-4 rounded-2xl glass-cta ${getGradientClasses(
            colorTheme
          )} text-white font-black text-base sm:text-lg btn-press-effect flex items-center justify-center gap-2.5`}
        >
          <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
          <span>{t.dropzoneClick}</span>
        </button>

        <p className="text-xs text-slate-500 dark:text-slate-300/80 font-medium pt-1">
          {t.dropzoneTitle}
        </p>

        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          {t.localProcessing}
        </span>
      </div>
    </div>
  );
};

export default FileDropzone;
