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
import { tools, ToolCategory } from '@/lib/tools/manifest';
import SettingsModal from './SettingsModal';
import KindpdfLogo from './KindpdfLogo';

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

const DRAWER_CATEGORY_KEYS: ToolCategory[] = [
  'organize',
  'convert-to',
  'convert-from',
  'edit',
  'security',
  'utilities',
];

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

  return (
    <>
      <header className="w-full sticky top-0 z-40 bg-[#E5F0FC]/70 dark:bg-[#0B1931]/72 backdrop-blur-2xl border-b border-black/[0.07] dark:border-white/[0.12] shadow-[0_6px_24px_rgba(10,17,40,0.05)] dark:shadow-[0_10px_32px_rgba(0,0,0,0.35),inset_0_-1px_0_rgba(255,255,255,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Left Side: Hamburger + Sleek Monochrome KindPDF Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsAppDrawerOpen(true)}
              aria-label="Open tool menu"
              className="w-9 h-9 rounded-full glass-pill flex items-center justify-center btn-press-effect focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A3FF] dark:focus-visible:ring-[#38BDF8]"
              title="Menu"
            >
              <Menu className="w-4 h-4" strokeWidth={1.85} />
            </button>

            <button
              type="button"
              onClick={() => onViewChange('grid')}
              className="cursor-pointer group flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A3FF] dark:focus-visible:ring-[#38BDF8] rounded-xl"
            >
              <KindpdfLogo size="md" />
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-black/[0.04] dark:bg-white/[0.07] text-[#0A1128]/70 dark:text-white/75 border border-black/[0.08] dark:border-white/[0.16]">
                <ShieldCheck className="w-3 h-3" strokeWidth={1.85} />
                {t.localBadge}
              </span>
            </button>
          </div>

          {/* Right Side Cohesive Monochrome Liquid Glass Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* GitHub Link (Desktop) */}
            <a
              href="https://github.com/yaserarafatt12/kindpdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 h-9 px-3.5 rounded-full glass-pill text-xs font-semibold btn-press-effect focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A3FF] dark:focus-visible:ring-[#38BDF8]"
            >
              <Github className="w-3.5 h-3.5" strokeWidth={1.85} />
              <span>GitHub</span>
            </a>

            {/* Theme Toggle Pill */}
            <button
              type="button"
              onClick={onThemeToggle}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-9 h-9 rounded-full glass-pill flex items-center justify-center btn-press-effect focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A3FF] dark:focus-visible:ring-[#38BDF8]"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" strokeWidth={1.85} />
              ) : (
                <Moon className="w-4 h-4" strokeWidth={1.85} />
              )}
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="h-9 px-3 rounded-full glass-pill text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 btn-press-effect focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A3FF] dark:focus-visible:ring-[#38BDF8]"
              >
                <Globe className="w-3.5 h-3.5 shrink-0" strokeWidth={1.85} />
                <span>{lang.toUpperCase()}</span>
                <ChevronDown
                  className={`w-3 h-3 opacity-60 shrink-0 transition-transform duration-200 ${
                    isLangDropdownOpen ? 'rotate-180' : ''
                  }`}
                  strokeWidth={2}
                />
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
                      className={`w-full px-3.5 py-2 text-xs font-semibold text-left flex items-center justify-between transition-colors ${
                        lang === item.code
                          ? 'bg-black/[0.06] dark:bg-white/[0.12] text-[#0A1128] dark:text-white'
                          : 'text-[#0A1128]/70 dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.07]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {lang === item.code && (
                        <Check
                          className="w-3.5 h-3.5 text-[#00A3FF] dark:text-[#38BDF8]"
                          strokeWidth={2.2}
                        />
                      )}
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
              className="w-9 h-9 rounded-full glass-pill flex items-center justify-center btn-press-effect focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A3FF] dark:focus-visible:ring-[#38BDF8]"
              title="Settings & User Guide"
            >
              <Settings className="w-4 h-4" strokeWidth={1.85} />
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
          <div className="relative w-full max-w-xs bg-white/[0.90] dark:bg-[#0C1930]/[0.86] backdrop-blur-2xl border-r border-black/[0.08] dark:border-white/[0.18] shadow-[16px_0_48px_rgba(0,0,0,0.45),inset_-1px_0_0_rgba(255,255,255,0.12)] h-full flex flex-col z-50 animate-slide-in">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-black/[0.07] dark:border-white/[0.12] flex items-center justify-between">
              <KindpdfLogo size="sm" suffix="Suite" />
              <button
                type="button"
                onClick={() => setIsAppDrawerOpen(false)}
                aria-label="Close menu"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#0A1128]/60 dark:text-white/60 hover:text-[#0A1128] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.10] transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1.85} />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {DRAWER_CATEGORY_KEYS.map((catKey) => {
                const catMeta = t.categories[catKey];
                const catTools = tools.filter((item) => item.category === catKey);
                return (
                  <div key={catKey} className="space-y-1.5">
                    <div className="px-2.5">
                      <h4 className="text-[10px] font-bold tracking-[0.12em] text-[#0A1128]/45 dark:text-white/45 uppercase">
                        {catMeta.title}
                      </h4>
                      <p className="text-[11px] text-[#0A1128]/55 dark:text-white/50 mt-0.5 leading-snug">
                        {catMeta.helper}
                      </p>
                    </div>
                    <div className="space-y-0.5 pt-1">
                      {catTools.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            onViewChange(item.route);
                            setIsAppDrawerOpen(false);
                          }}
                          className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between text-[#0A1128]/80 dark:text-white/80 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:text-[#0A1128] dark:hover:text-white transition-all btn-press-effect"
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText
                              className="w-4 h-4 text-[#0A1128]/50 dark:text-white/50 shrink-0"
                              strokeWidth={1.8}
                            />
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
