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

  const pct = totalSteps > 0 ? Math.min(100, Math.round((currentStep / totalSteps) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040914]/75 backdrop-blur-md animate-fade-in">
      <div className="glass-modal w-full max-w-sm p-7 sm:p-8 rounded-3xl space-y-6 text-center animate-scale-up">
        {/* Top Tempered Glass Sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 dark:from-white/[0.08] to-transparent" />

        {/* 1. Header Title & Subtitle */}
        <div className="relative z-10 space-y-1.5">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {t.mergingTitle || 'Merging PDF Documents...'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-300/80 font-medium px-2 leading-relaxed">
            {progressMessage}
          </p>
        </div>

        {/* 2. Centered Luminous Spinner */}
        <div className="relative z-10 py-1 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/15 dark:bg-sky-400/15 border border-sky-400/25 flex items-center justify-center shadow-[0_0_28px_rgba(56,189,248,0.22),inset_0_1px_0_rgba(255,255,255,0.3)]">
            <Loader2 className="w-9 h-9 text-sky-500 dark:text-sky-300 animate-spin stroke-[2.25]" />
          </div>
        </div>

        {/* Optional subtle progress bar */}
        {totalSteps > 0 && (
          <div className="relative z-10 space-y-1.5">
            <div className="w-full h-1.5 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${Math.max(8, pct)}%` }}
              />
            </div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400">
              {currentStep} / {totalSteps}
            </p>
          </div>
        )}

        {/* Cancel Button */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="relative z-10 px-4 py-1.5 rounded-full glass-pill text-xs font-bold btn-press-effect"
          >
            {t.cancelProcess || 'Cancel'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProcessingProgress;
