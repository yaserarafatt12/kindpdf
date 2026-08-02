'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import { TranslationDictionary } from '@/lib/i18n/translations';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  t: TranslationDictionary;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ onFilesSelected, disabled = false, t }) => {
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

      {/* Prominent Primary CTA Button (iLovePDF Style) */}
      <div className="space-y-3 flex flex-col items-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-black text-base sm:text-lg shadow-lg shadow-blue-500/30 transition-all duration-200 btn-press-effect flex items-center justify-center gap-2.5"
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
