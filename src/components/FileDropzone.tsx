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

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFilesSelected,
  disabled = false,
  t,
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
      className={`glass-card w-full max-w-xl mx-auto rounded-3xl border-dashed p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-5 transition-all duration-300 cursor-pointer ${
        isDragOver
          ? 'border-[#00A3FF] dark:border-[#38BDF8] scale-[1.01]'
          : 'hover:border-[#0A1128]/25 dark:hover:border-white/30'
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

      {/* Frosted Monochrome Icon */}
      <div className="relative z-10 w-14 h-14 rounded-2xl bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.18] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
        <UploadCloud
          className="w-7 h-7 text-[#0A1128]/80 dark:text-white/85"
          strokeWidth={1.75}
        />
      </div>

      {/* Crisp Monochrome Primary CTA Button */}
      <div className="relative z-10 space-y-3 flex flex-col items-center w-full">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glass-cta font-bold text-sm sm:text-base btn-press-effect flex items-center justify-center gap-2.5"
        >
          <UploadCloud className="w-5 h-5" strokeWidth={2} />
          <span>{t.dropzoneClick}</span>
        </button>

        <p className="text-xs text-[#0A1128]/60 dark:text-white/60 font-medium pt-0.5">
          {t.dropzoneTitle}
        </p>
      </div>
    </div>
  );
};

export default FileDropzone;
