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
  ShieldCheck,
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
      <header className="w-full sticky top-0 z-40 bg-white/75 dark:bg-[#081226]/80 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/[0.12] shadow-[0_8px_32px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_36px_rgba(0,0,0,0.45),inset_0_-1px_0_rgba(255,255,255,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Left Side: Hamburger + Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAppDrawerOpen(true)}
              aria-label="Open tool menu"
              className="p-2 rounded-full glass-pill text-slate-800 dark:text-slate-100 btn-press-effect"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo */}
            <button
              type="button"
              onClick={() => onViewChange('grid')}
              className="cursor-pointer group flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_6px_18px_rgba(56,189,248,0.35),inset_0_1px_1px_rgba(255,255,255,0.55)] group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.4]" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  Kind<span className="bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-400 dark:to-cyan-300 bg-clip-text text-transparent">pdf</span>
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-emerald-500/15 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                  <ShieldCheck className="w-3 h-3" />
                  100% Local
                </span>
              </div>
            </button>
          </div>

          {/* Right Side Liquid Glass Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* GitHub Link (Desktop) */}
            <a
              href="https://github.com/yaserarafatt12/kindpdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-pill text-xs font-bold btn-press-effect"
            >
              <Github className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>GitHub</span>
            </a>

            {/* Quick Theme Toggle Pill */}
            <button
              type="button"
              onClick={onThemeToggle}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-full glass-pill text-slate-700 dark:text-sky-300 btn-press-effect"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="px-3 py-1.5 rounded-full glass-pill text-[11px] sm:text-xs font-extrabold flex items-center gap-1.5 btn-press-effect"
              >
                <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>{lang.toUpperCase()}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-32 rounded-2xl glass-modal py-1.5 z-50 animate-scale-up">
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        onLangChange(item.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-xs font-bold text-left flex items-center justify-between transition-colors ${
                        lang === item.code
                          ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {lang === item.code && <Check className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Settings & User Guide Button */}
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              aria-label="Settings & User Guide"
              className="p-2 rounded-full glass-pill text-slate-700 dark:text-slate-100 btn-press-effect"
              title="Settings & User Guide"
            >
              <Settings className="w-4 h-4 text-sky-600 dark:text-sky-400" />
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
            className="fixed inset-0 bg-[#040914]/70 backdrop-blur-md animate-fade-in"
          />

          {/* Midnight Navy Tempered Glass Drawer */}
          <div className="relative w-full max-w-xs bg-white/[0.92] dark:bg-[#0C1930]/[0.92] backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/[0.18] shadow-[16px_0_48px_rgba(0,0,0,0.45),inset_-1px_0_0_rgba(255,255,255,0.12)] h-full flex flex-col z-50 animate-slide-in">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/[0.12] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/25">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Kind<span className="text-sky-500 dark:text-sky-400">pdf</span> Suite
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAppDrawerOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {drawerCategories.map((cat) => {
                const catTools = tools.filter((item) => item.category === cat.key);
                return (
                  <div key={cat.key} className="space-y-1.5">
                    <h4 className="px-2.5 text-[10px] font-black tracking-[0.12em] text-slate-400 dark:text-sky-300/60 uppercase">
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
                          className="w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between text-slate-700 dark:text-slate-200 hover:bg-sky-500/15 dark:hover:bg-white/[0.08] hover:text-sky-600 dark:hover:text-sky-300 transition-all btn-press-effect"
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
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
