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
      className={`w-full py-4 sm:py-5 px-3.5 sm:px-6 rounded-2xl bg-white dark:bg-slate-900 border-2 transition-all duration-200 flex items-center justify-between gap-2.5 sm:gap-4 shadow-xs ${
        isDragging
          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-lg scale-[1.01]'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-blue-500 hover:shadow-md'
      }`}
    >
      {/* File Info */}
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-center gap-2 sm:gap-3">
          <FileText className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
            {item.name}
          </h4>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 sm:mt-2.5">
          <span>{item.pageCount} pages</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>{formatFileSize(item.size)}</span>
        </div>
      </div>

      {/* Action Controls: Unboxed Vertical Stacked Reorder [▲/▼] + Trash Button */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Vertical Stacked Up/Down Column (Clean Unboxed) */}
        {(onMoveUp || onMoveDown) && (
          <div className="flex flex-col justify-center gap-0.5 w-7 h-[44px] shrink-0">
            <button
              type="button"
              onClick={() => onMoveUp && onMoveUp(index)}
              disabled={!onMoveUp || index === 0}
              title="Move Up"
              className={`flex-1 w-full rounded-md flex items-center justify-center transition-colors ${
                index === 0
                  ? 'text-slate-200 dark:text-slate-800 cursor-not-allowed pointer-events-none'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 btn-press-effect'
              }`}
            >
              <ChevronUp className="w-4 h-4" strokeWidth={2.75} />
            </button>
            <button
              type="button"
              onClick={() => onMoveDown && onMoveDown(index)}
              disabled={!onMoveDown || index === totalItems - 1}
              title="Move Down"
              className={`flex-1 w-full rounded-md flex items-center justify-center transition-colors ${
                index === totalItems - 1
                  ? 'text-slate-200 dark:text-slate-800 cursor-not-allowed pointer-events-none'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 btn-press-effect'
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
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors btn-press-effect shrink-0 ml-0.5"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FileCard;
