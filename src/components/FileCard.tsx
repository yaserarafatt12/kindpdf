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
      className={`w-full py-5 px-4.5 sm:px-6 rounded-2xl bg-white dark:bg-slate-900 border-2 transition-all duration-200 flex items-center justify-between gap-4 shadow-xs ${
        isDragging
          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-lg scale-[1.01]'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-blue-500 hover:shadow-md'
      }`}
    >
      {/* File Info */}
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
            {item.name}
          </h4>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2.5">
          <span>{item.pageCount} pages</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>{formatFileSize(item.size)}</span>
        </div>
      </div>

      {/* Action Controls (Move & Delete) */}
      <div className="flex items-center gap-1 shrink-0">
        {onMoveUp && index > 0 && (
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            title="Move Up"
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors btn-press-effect"
          >
            <ChevronUp className="w-4 h-4" strokeWidth={2.75} />
          </button>
        )}
        {onMoveDown && index < totalItems - 1 && (
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            title="Move Down"
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors btn-press-effect"
          >
            <ChevronDown className="w-4 h-4" strokeWidth={2.75} />
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          title="Remove from list"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors btn-press-effect ml-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FileCard;
