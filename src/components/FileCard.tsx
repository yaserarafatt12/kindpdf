'use client';

import React from 'react';
import { FileText, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
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
      className={`glass-card w-full py-4 sm:py-5 px-4 sm:px-5 rounded-2xl flex items-center justify-between gap-3 sm:gap-4 ${
        isDragging
          ? 'border-sky-400/80 bg-sky-500/10 dark:bg-sky-950/50 shadow-xl scale-[1.01]'
          : 'hover:border-sky-400/60 dark:hover:border-sky-400/45'
      }`}
    >
      {/* File Info */}
      <div className="relative z-10 flex items-center gap-3.5 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-sky-500/15 dark:bg-sky-400/15 border border-sky-500/25 dark:border-sky-400/25 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
          <FileText className="w-5 h-5 text-sky-600 dark:text-sky-300" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
            {item.name}
          </h4>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.07] border border-slate-200/80 dark:border-white/[0.1] text-slate-700 dark:text-slate-200">
              {item.pageCount} pages
            </span>
            <span className="text-slate-300 dark:text-white/25">•</span>
            <span>{formatFileSize(item.size)}</span>
          </div>
        </div>
      </div>

      {/* Action Controls: Stacked Reorder [▲/▼] + Trash Button */}
      <div className="relative z-10 flex items-center gap-1.5 shrink-0">
        {(onMoveUp || onMoveDown) && (
          <div className="flex flex-col justify-center gap-0.5 w-8 h-[46px] shrink-0">
            <button
              type="button"
              onClick={() => onMoveUp && onMoveUp(index)}
              disabled={!onMoveUp || index === 0}
              title="Move Up"
              aria-label="Move Up"
              className={`flex-1 w-full rounded-lg flex items-center justify-center transition-colors ${
                index === 0
                  ? 'text-slate-300 dark:text-white/15 cursor-not-allowed pointer-events-none'
                  : 'text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-slate-100 dark:hover:bg-white/10 btn-press-effect'
              }`}
            >
              <ChevronUp className="w-4 h-4" strokeWidth={2.75} />
            </button>
            <button
              type="button"
              onClick={() => onMoveDown && onMoveDown(index)}
              disabled={!onMoveDown || index === totalItems - 1}
              title="Move Down"
              aria-label="Move Down"
              className={`flex-1 w-full rounded-lg flex items-center justify-center transition-colors ${
                index === totalItems - 1
                  ? 'text-slate-300 dark:text-white/15 cursor-not-allowed pointer-events-none'
                  : 'text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-slate-100 dark:hover:bg-white/10 btn-press-effect'
              }`}
            >
              <ChevronDown className="w-4 h-4" strokeWidth={2.75} />
            </button>
          </div>
        )}

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          title="Remove from list"
          aria-label="Remove from list"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all btn-press-effect shrink-0 ml-0.5"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FileCard;
