'use client';

import React from 'react';
import { Globe, Sun, Moon, Github } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';

export type ViewMode = 'grid' | 'merge' | 'split' | 'organize' | 'extract' | 'image-to-pdf';

interface HeaderProps {
  onViewChange: (view: ViewMode) => void;
  lang: Language;
  onLangToggle: () => void;
  t: TranslationDictionary;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onViewChange,
  lang,
  onLangToggle,
  t,
  isDarkMode,
  onThemeToggle,
}) => {
  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left Side: Brand Logo (Kindpdf) */}
        <div
          onClick={() => onViewChange('grid')}
          className="cursor-pointer group flex flex-col items-start"
        >
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
            Kind<span className="text-blue-600 dark:text-sky-400">pdf</span>
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-normal">
            {t.tagline}
          </p>
        </div>

        {/* Right Side Controls: Language, Theme, & GitHub */}
        <div className="flex items-center gap-2">
          {/* GitHub Link (Desktop) */}
          <a
            href="https://github.com/yaserarafatt12/localpdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            <Github className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            <span>GitHub</span>
          </a>

          {/* Language Switcher Button */}
          <button
            type="button"
            onClick={onLangToggle}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5 transition-colors btn-press-effect"
            title="Switch Language (EN | ID)"
          >
            <Globe className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            <span>{lang === 'en' ? 'EN | ID' : 'ID | EN'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onThemeToggle}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 transition-colors btn-press-effect"
            title="Toggle Light / Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
