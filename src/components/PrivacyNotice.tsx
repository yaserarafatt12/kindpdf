import React from 'react';
import { ShieldCheck, ServerOff, Lock, Sparkles } from 'lucide-react';
import { TranslationDictionary } from '@/lib/i18n/translations';

interface PrivacyNoticeProps {
  t: TranslationDictionary;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ t }) => {
  return (
    <div className="w-full p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-200 font-medium">
        <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
          <div className="p-1.5 rounded-xl bg-blue-600 text-white shadow-sm shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="tracking-tight text-sm">{t.privacyTitle}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <ServerOff className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            {t.noServerUpload}
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {t.localProcessing}
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {t.adFree}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PrivacyNotice;
