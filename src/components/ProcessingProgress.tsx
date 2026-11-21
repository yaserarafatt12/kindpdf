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
        {/* 1. Header Title & Subtitle */}
        <div className="relative z-10 space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-[#0A1128] dark:text-white tracking-tight">
            {t.mergingTitle || 'Merging PDF Documents...'}
          </h3>
          <p className="text-xs text-[#0A1128]/60 dark:text-white/65 font-normal px-2 leading-relaxed">
            {progressMessage}
          </p>
        </div>

        {/* 2. Centered Monochrome Glass Spinner */}
        <div className="relative z-10 py-1 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.18] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
            <Loader2 className="w-8 h-8 text-[#0A1128]/80 dark:text-white/85 animate-spin stroke-[2]" />
          </div>
        </div>

        {/* Subtle progress bar */}
        {totalSteps > 0 && (
          <div className="relative z-10 space-y-1.5">
            <div className="w-full h-1.5 rounded-full bg-black/[0.08] dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#00A3FF] dark:bg-[#38BDF8] transition-all duration-300"
                style={{ width: `${Math.max(8, pct)}%` }}
              />
            </div>
            <p className="text-[11px] font-semibold text-[#0A1128]/50 dark:text-white/50">
              {currentStep} / {totalSteps}
            </p>
          </div>
        )}

        {/* Cancel Button */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="relative z-10 px-4 py-1.5 rounded-full glass-pill text-xs font-semibold btn-press-effect"
          >
            {t.cancelProcess || 'Cancel'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProcessingProgress;
