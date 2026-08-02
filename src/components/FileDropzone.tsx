'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ onFilesSelected, disabled = false }) => {
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
      className={`w-full rounded-[28px] border-2 border-dashed p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer ${
        isDragOver
          ? 'border-blue-600 bg-blue-500/10 dark:bg-blue-500/15 scale-[1.01] shadow-xl'
          : 'border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:border-blue-500/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm'
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

      <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 shadow-md">
        <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce-slow" />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
          Tarik & Lepaskan Dokumen PDF ke Sini
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          atau <span className="text-blue-600 dark:text-sky-400 font-extrabold underline underline-offset-2">Pilih Dokumen dari HP/Komputer</span>
        </p>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-semibold border-t border-slate-200/60 dark:border-slate-800/60 w-full max-w-md">
        <span className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-blue-500" />
          Format .PDF
        </span>
        <span>•</span>
        <span>Maksimal 100 MB per berkas</span>
        <span>•</span>
        <span>Maksimal 10 berkas sekaligus</span>
      </div>
    </div>
  );
};

export default FileDropzone;
