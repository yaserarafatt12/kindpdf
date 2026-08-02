'use client';

import React from 'react';
import { FileText, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { formatFileSize } from '@/lib/files/formatFileSize';

export interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

interface FileCardProps {
  item: PdfFileItem;
  index: number;
  totalItems: number;
  onRemove: (id: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  isDragging?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  item,
  index,
  totalItems,
  onRemove,
  onMoveUp,
  onMoveDown,
  isDragging = false,
}) => {
  return (
    <div
      className={`w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 flex items-center justify-between gap-3 shadow-sm ${
        isDragging
          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-lg scale-[1.01]'
          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 hover:shadow-md'
      }`}
    >
      {/* Reorder Grip Handle */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-black text-xs">
          #{index + 1}
        </div>
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
            {item.name}
          </h4>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold">
            {item.pageCount} halaman
          </span>
          <span>{formatFileSize(item.size)}</span>
        </div>
      </div>

      {/* Action Controls (Move & Delete) */}
      <div className="flex items-center gap-1 shrink-0">
        {onMoveUp && index > 0 && (
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            title="Pindahkan Ke Atas"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors btn-press-effect"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        )}
        {onMoveDown && index < totalItems - 1 && (
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            title="Pindahkan Ke Bawah"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors btn-press-effect"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          title="Hapus dari Daftar"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors btn-press-effect ml-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FileCard;
