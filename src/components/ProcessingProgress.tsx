'use client';

import React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

interface ProcessingProgressProps {
  isOpen: boolean;
  progressMessage: string;
  currentStep: number;
  totalSteps: number;
  onCancel?: () => void;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  isOpen,
  progressMessage,
  currentStep,
  totalSteps,
  onCancel,
}) => {
  if (!isOpen) return null;

  const percentage = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center">
        {/* Animated Icon */}
        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
          <div className="relative p-4 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            Menggabungkan Dokumen PDF...
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2 leading-relaxed">
            {progressMessage}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-black text-slate-700 dark:text-slate-300">
            <span>Progres Pemrosesan</span>
            <span className="text-blue-600 dark:text-sky-400">{percentage}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-500 transition-all duration-300 shadow-sm"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Pemrosesan berlangsung 100% lokal di RAM perangkat</span>
        </div>

        {/* Cancel Button */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors btn-press-effect"
          >
            Batalkan Proses
          </button>
        )}
      </div>
    </div>
  );
};

export default ProcessingProgress;
