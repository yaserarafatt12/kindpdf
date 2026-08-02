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
  currentStep,
  totalSteps,
  onCancel,
  t,
}) => {
  if (!isOpen) return null;

  const percentage = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-center">
        {/* 1. Header Title & Subtitle on Top */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            {t.mergingTitle || 'Merging PDF Documents...'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2 leading-relaxed">
            {progressMessage}
          </p>
        </div>

        {/* 2. Clean Spinning Icon below Subtitle (No Radar/Ping Glow) */}
        <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>

        {/* 3. Clean Unboxed Progress Bar (No container boxes, borders, or text clutter) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-end items-center text-xs font-black text-blue-600 dark:text-sky-400">
            <span>{percentage}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-600 dark:bg-sky-500 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors btn-press-effect"
          >
            {t.cancelProcess || 'Cancel'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProcessingProgress;
