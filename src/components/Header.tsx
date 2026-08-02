'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Sun,
  Moon,
  Github,
  ChevronDown,
  Check,
  Menu,
  X,
  FileText,
  Settings,
} from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { tools } from '@/lib/tools/manifest';
import SettingsModal from './SettingsModal';

export type ViewMode =
  | 'grid'
  | 'merge'
  | 'split'
  | 'organize'
  | 'extract'
  | 'image-to-pdf'
  | 'pdf-to-image'
  | 'protect'
  | 'unlock'
  | 'page-numbers'
  | 'watermark'
  | 'crop'
  | 'edit-pdf'
  | 'scan-to-pdf'
  | 'sign'
  | 'redact'
  | 'compare'
  | 'repair'
  | 'compress'
  | 'html-to-pdf'
  | 'pdf-to-pdfa'
  | 'word-to-pdf'
  | 'pdf-to-word'
  | 'ocr-pdf';

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
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
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

  const drawerCategories = [
    { key: 'organize', title: 'Organize & Pages' },
    { key: 'convert-to', title: 'Convert to PDF' },
    { key: 'convert-from', title: 'Convert from PDF' },
    { key: 'edit', title: 'Edit & Annotate' },
    { key: 'security', title: 'Security & Privacy' },
    { key: 'utilities', title: 'Utilities & Maintenance' },
  ];

  return (
    <>
      <header className="w-full bg-white dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3">
          {/* Left Side: Clean 3-Line Hamburger Icon + Brand Logo (Kindpdf) */}
          <div className="flex items-center gap-2.5">
            {/* Clean 3-Line Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setIsAppDrawerOpen(true)}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 transition-colors btn-press-effect"
              title="Menu"
            >
              <Menu className="w-6 h-6 text-slate-900 dark:text-white" />
            </button>

            {/* Logo */}
            <div
              onClick={() => onViewChange('grid')}
              className="cursor-pointer group flex items-center"
            >
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans tracking-[0.04em] leading-none">
                Kind<span className="text-blue-600 dark:text-sky-400">pdf</span>
              </h1>
            </div>
          </div>

          {/* Right Side Controls: Language Dropdown, Settings, & GitHub */}
          <div className="flex items-center gap-1.5 sm:gap-2">
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

            {/* Language Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-extrabold transition-colors flex items-center gap-1 sm:gap-1.5 shadow-sm btn-press-effect"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
                <span>{lang.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-28 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-fade-in">
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        onLangChange(item.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-xs font-bold text-left flex items-center justify-between transition-colors ${
                        lang === item.code
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400'
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

            {/* Settings & User Guide Button */}
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 transition-colors btn-press-effect shadow-sm"
              title="Settings & User Guide"
            >
              <Settings className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            </button>
          </div>
        </div>
      </header>

      {/* SETTINGS & USER GUIDE MODAL */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        lang={lang}
        onLangChange={onLangChange}
        isDarkMode={isDarkMode}
        onThemeToggle={onThemeToggle}
        t={t}
      />

      {/* FULL CATEGORIZED APP DRAWER MENU */}
      {isAppDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsAppDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs bg-white dark:bg-slate-900 border-r-2 border-slate-300 dark:border-slate-800 shadow-2xl h-full flex flex-col z-50 animate-slide-in">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-wide">
                Kind<span className="text-blue-600 dark:text-sky-400">pdf</span> Suite
              </h3>
              <button
                type="button"
                onClick={() => setIsAppDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {drawerCategories.map((cat) => {
                const catTools = tools.filter((t) => t.category === cat.key);
                return (
                  <div key={cat.key} className="space-y-2">
                    <h4 className="text-[11px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                      {cat.title}
                    </h4>
                    <div className="space-y-1">
                      {catTools.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            onViewChange(item.route);
                            setIsAppDrawerOpen(false);
                          }}
                          className="w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-sky-400 transition-colors btn-press-effect"
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{item.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
