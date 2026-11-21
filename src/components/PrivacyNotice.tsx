import React from 'react';
import { ShieldCheck, ServerOff, Lock, Sparkles } from 'lucide-react';
import { TranslationDictionary } from '@/lib/i18n/translations';

interface PrivacyNoticeProps {
  t: TranslationDictionary;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ t }) => {
  return (
    <div className="glass-card w-full mt-auto p-4 sm:p-4.5 rounded-2xl">
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs text-[#0A1128]/75 dark:text-white/75 font-medium">
        <div className="flex items-center gap-2.5 font-bold text-[#0A1128] dark:text-white">
          <div className="p-1.5 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.16] text-[#0A1128]/80 dark:text-white/85 shrink-0">
            <ShieldCheck className="w-4 h-4" strokeWidth={1.85} />
          </div>
          <span className="tracking-tight text-sm">{t.privacyTitle}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] font-semibold text-[#0A1128]/65 dark:text-white/65">
          <span className="flex items-center gap-1.5">
            <ServerOff className="w-3.5 h-3.5" strokeWidth={1.85} />
            {t.noServerUpload}
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" strokeWidth={1.85} />
            {t.localProcessing}
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.85} />
            {t.adFree}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PrivacyNotice;
