'use client';

import React from 'react';
import {
  FileStack,
  Scissors,
  Layers,
  FileImage,
  FileOutput,
  Grid,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';

export type ViewMode = 'grid' | 'merge' | 'split' | 'organize' | 'extract' | 'image-to-pdf';

interface HeaderProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  lang: Language;
  onLangToggle: () => void;
  t: TranslationDictionary;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onViewChange,
  lang,
  onLangToggle,
  t,
  isDarkMode,
  onThemeToggle,
}) => {
  const navItems = [
    {
      id: 'grid' as ViewMode,
      label: t.allTools,
      icon: <Grid className="w-4 h-4" />,
      active: true,
    },
    {
      id: 'merge' as ViewMode,
      label: t.mergePdf,
      icon: <FileStack className="w-4 h-4" />,
      active: true,
    },
    {
      id: 'split' as ViewMode,
      label: t.splitPdf,
      icon: <Scissors className="w-4 h-4" />,
      badge: t.soon,
      active: false,
    },
    {
      id: 'organize' as ViewMode,
      label: t.organizePages,
      icon: <Layers className="w-4 h-4" />,
      badge: t.soon,
      active: false,
    },
    {
      id: 'extract' as ViewMode,
      label: t.extractPages,
      icon: <FileOutput className="w-4 h-4" />,
      badge: t.soon,
      active: false,
    },
    {
      id: 'image-to-pdf' as ViewMode,
      label: t.imagesToPdf,
      icon: <FileImage className="w-4 h-4" />,
      badge: t.soon,
      active: false,
    },
  ];

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left Side: Brand Logo (Kindpdf) - Normal Spacing, Only K capitalized */}
        <div className="flex items-center justify-between w-full md:w-auto">
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

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              type="button"
              onClick={onLangToggle}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{lang.toUpperCase()}</span>
            </button>

            <button
              type="button"
              onClick={onThemeToggle}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>
          </div>
        </div>

        {/* Center: Tools Navigation Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.active) onViewChange(item.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 btn-press-effect ${
                activeView === item.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : item.active
                  ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-slate-400 dark:text-slate-500 opacity-60 cursor-not-allowed'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Desktop Right Controls: Language & Theme Switchers */}
        <div className="hidden md:flex items-center gap-2">
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
