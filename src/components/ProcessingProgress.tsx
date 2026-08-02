'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { TranslationDictionary } from '@/lib/i18n/translations';

interface ProcessingProgressProps {
  isOpen: boolean;
  progressMessage: string;
  currentStep: number;
  totalSteps: number;
  onCancel?: () => void;
  t: TranslationDictionary;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  isOpen,
  progressMessage,
  onCancel,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm p-7 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center">
        {/* 1. Header Title & Subtitle */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {t.mergingTitle || 'Merging PDF Documents...'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2 leading-relaxed">
            {progressMessage}
          </p>
        </div>

        {/* 2. Big Unboxed Centered Spinning Loader (No Background Box) */}
        <div className="py-2 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-sky-400 animate-spin stroke-[2.25]" />
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors btn-press-effect"
          >
            {t.cancelProcess || 'Cancel'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProcessingProgress;
