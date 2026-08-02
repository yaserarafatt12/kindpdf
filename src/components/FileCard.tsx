'use client';

import React from 'react';
import { FileText, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
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
      className={`w-full p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 flex items-center justify-between gap-3 shadow-sm ${
        isDragging
          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-lg scale-[1.01]'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-blue-500 hover:shadow-md'
      }`}
    >
      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
            {item.name}
          </h4>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-1.5">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold border border-slate-200/80 dark:border-slate-700/80">
            {item.pageCount} pages
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold border border-slate-200/80 dark:border-slate-700/80">
            {formatFileSize(item.size)}
          </span>
        </div>
      </div>

      {/* Action Controls (Segmented Reorder Pill & Delete) */}
      <div className="flex items-center gap-2 shrink-0">
        {(onMoveUp || onMoveDown) && (
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => onMoveUp && onMoveUp(index)}
              disabled={!onMoveUp || index === 0}
              title="Move Up"
              className={`p-1.5 rounded-lg transition-all ${
                index === 0
                  ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-white dark:hover:bg-slate-700 shadow-sm btn-press-effect'
              }`}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3 bg-slate-200 dark:bg-slate-700 my-auto" />
            <button
              type="button"
              onClick={() => onMoveDown && onMoveDown(index)}
              disabled={!onMoveDown || index === totalItems - 1}
              title="Move Down"
              className={`p-1.5 rounded-lg transition-all ${
                index === totalItems - 1
                  ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-white dark:hover:bg-slate-700 shadow-sm btn-press-effect'
              }`}
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          title="Remove document"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors btn-press-effect"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FileCard;
