import React from 'react';
import { ShieldCheck, ServerOff, Lock, Sparkles } from 'lucide-react';

export const PrivacyNotice: React.FC = () => {
  return (
    <div className="w-full p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/30 backdrop-blur-md shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-200 font-medium">
        <div className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
          <div className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-sm shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="tracking-tight text-sm">Privasi 100% Terjaga</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <ServerOff className="w-3.5 h-3.5 text-indigo-500" />
            Tanpa Unggahan Server
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            Pemrosesan Lokal di HP & Laptop
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Bebas Iklan & Gratis
          </span>
        </div>
      </div>
    </div>
  );
};

export default PrivacyNotice;
