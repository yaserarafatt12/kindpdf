import React from 'react';
import { ShieldCheck, ServerOff, Lock, Sparkles } from 'lucide-react';
import { TranslationDictionary } from '@/lib/i18n/translations';

interface PrivacyNoticeProps {
  t: TranslationDictionary;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ t }) => {
  return (
    <div className="glass-card w-full mt-auto p-4 sm:p-4.5 rounded-2xl">
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-200 font-medium">
        <div className="flex items-center gap-2.5 font-extrabold text-slate-900 dark:text-white">
          <div className="p-1.5 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="tracking-tight text-sm">{t.privacyTitle}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <ServerOff className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            {t.noServerUpload}
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            {t.localProcessing}
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            {t.adFree}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PrivacyNotice;
