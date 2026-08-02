'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';
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
      return 'bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 shadow-purple-500/30';
    case 'amber':
      return 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/30';
    case 'emerald':
      return 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/30';
    case 'rose':
      return 'bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 shadow-rose-500/30';
    case 'teal':
      return 'bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 shadow-teal-500/30';
    case 'sky':
      return 'bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 shadow-sky-500/30';
    case 'violet':
      return 'bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 shadow-violet-500/30';
    case 'slate':
      return 'bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 shadow-slate-900/30';
    case 'indigo':
      return 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 shadow-indigo-500/30';
    case 'blue':
    default:
      return 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-blue-500/30';
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
      className={`w-full max-w-xl mx-auto rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-5 transition-all duration-300 cursor-pointer ${
        isDragOver
          ? 'border-blue-600 bg-blue-500/10 dark:bg-blue-500/15 scale-[1.01] shadow-xl'
          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Prominent Primary CTA Button with Dynamic Icon Color Theme */}
      <div className="space-y-3 flex flex-col items-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          className={`w-full sm:w-auto px-8 py-4 rounded-2xl ${getGradientClasses(
            colorTheme
          )} text-white font-black text-base sm:text-lg shadow-lg transition-all duration-200 btn-press-effect flex items-center justify-center gap-2.5`}
        >
          <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
          <span>{t.dropzoneClick}</span>
        </button>

        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
          {t.dropzoneTitle}
        </p>
      </div>
    </div>
  );
};

export default FileDropzone;
