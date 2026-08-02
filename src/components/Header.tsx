'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Sun, Moon, Github, ChevronDown, Check } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';

export type ViewMode = 'grid' | 'merge' | 'split' | 'organize' | 'extract' | 'image-to-pdf';

interface HeaderProps {
  onViewChange: (view: ViewMode) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  t: TranslationDictionary;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onViewChange,
  lang,
  onLangChange,
  t,
  isDarkMode,
  onThemeToggle,
}) => {
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en' as Language, label: 'EN' },
    { code: 'id' as Language, label: 'ID' },
  ];

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3">
        {/* Left Side: Brand Logo (Kindpdf) */}
        <div
          onClick={() => onViewChange('grid')}
          className="cursor-pointer group flex items-center"
        >
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans tracking-[0.06em] leading-none">
            Kind<span className="text-blue-600 dark:text-sky-400">pdf</span>
          </h1>
        </div>

        {/* Right Side Controls: Language Dropdown, Theme, & GitHub */}
        <div className="flex items-center gap-2">
          {/* GitHub Link (Desktop) */}
          <a
            href="https://github.com/yaserarafatt12/localpdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors shadow-sm"
          >
            <Github className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            <span>GitHub</span>
          </a>

          {/* Interactive Language Dropdown - Short Clean ID / EN */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-300 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1 transition-colors btn-press-effect shadow-sm"
            >
              <Globe className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <span>{lang.toUpperCase()}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Options Menu */}
            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-28 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-xl py-1.5 z-50 animate-fade-in">
                {languages.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      onLangChange(item.code);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs font-extrabold flex items-center justify-between transition-colors ${
                      lang === item.code
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 font-black'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    {lang === item.code && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onThemeToggle}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 transition-colors btn-press-effect shadow-sm"
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
