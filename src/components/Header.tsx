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

  // Explicit theme-aware header & button styles (matches Quest NavigasiAtas: sleek dark tempered glass, NEVER milky gray!)
  const headerBarClass = isDarkMode
    ? 'bg-[#0B172E]/65 border-b border-white/10 shadow-[0_10px_32px_rgba(0,0,0,0.35),inset_0_-1px_0_rgba(255,255,255,0.06)]'
    : 'bg-[#E5F0FC]/75 border-b border-black/[0.07] shadow-[0_6px_24px_rgba(10,17,40,0.05)]';

  const headerBtnClass = isDarkMode
    ? 'bg-white/[0.08] border border-white/[0.18] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] hover:bg-white/[0.14] hover:border-white/25 hover:text-white backdrop-blur-xl transition-all duration-200'
    : 'bg-white/75 border border-black/[0.08] text-[#0A1128]/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(10,17,40,0.06)] hover:bg-white/95 hover:text-[#0A1128] backdrop-blur-xl transition-all duration-200';

  return (
    <>
      <header className={`w-full sticky top-0 z-40 backdrop-blur-2xl ${headerBarClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Left Side: Hamburger + Sleek Custom KindPDF Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsAppDrawerOpen(true)}
              aria-label="Open tool menu"
              className={`w-9 h-9 rounded-full flex items-center justify-center btn-press-effect focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${headerBtnClass}`}
              title="Menu"
            >
              <Menu className="w-4 h-4" strokeWidth={1.85} />
            </button>

            <button
              type="button"
              onClick={() => onViewChange('grid')}
              className="cursor-pointer group flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] rounded-xl"
            >
              <KindpdfLogo size="md" isDarkMode={isDarkMode} />
            </button>
          </div>

          {/* Right Side Crisp Tempered Glass Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* GitHub Link (Desktop) */}
            <a
              href="https://github.com/yaserarafatt12/kindpdf"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden sm:flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-semibold btn-press-effect focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${headerBtnClass}`}
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
              className={`w-9 h-9 rounded-full flex items-center justify-center btn-press-effect focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${headerBtnClass}`}
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
                className={`h-9 px-3 rounded-full text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 btn-press-effect focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${headerBtnClass}`}
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
                <div
                  className={`absolute right-0 mt-2.5 w-32 rounded-2xl py-1.5 z-50 animate-scale-up backdrop-blur-2xl border ${
                    isDarkMode
                      ? 'bg-[#0C1930]/90 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.2)]'
                      : 'bg-white/90 border-black/10 shadow-[0_16px_40px_rgba(10,17,40,0.14),inset_0_1px_0_rgba(255,255,255,0.95)]'
                  }`}
                >
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
                          ? isDarkMode
                            ? 'bg-white/[0.12] text-white'
                            : 'bg-black/[0.06] text-[#0A1128]'
                          : isDarkMode
                            ? 'text-white/70 hover:bg-white/[0.07] hover:text-white'
                            : 'text-[#0A1128]/70 hover:bg-black/[0.04] hover:text-[#0A1128]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {lang === item.code && (
                        <Check
                          className={`w-3.5 h-3.5 ${isDarkMode ? 'text-[#38BDF8]' : 'text-[#00A3FF]'}`}
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
              className={`w-9 h-9 rounded-full flex items-center justify-center btn-press-effect focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] ${headerBtnClass}`}
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
          <div
            className={`relative w-full max-w-xs backdrop-blur-2xl h-full flex flex-col z-50 animate-slide-in ${
              isDarkMode
                ? 'bg-[#0C1930]/90 border-r border-white/[0.18] shadow-[16px_0_48px_rgba(0,0,0,0.5),inset_-1px_0_0_rgba(255,255,255,0.12)]'
                : 'bg-white/90 border-r border-black/[0.08] shadow-[16px_0_48px_rgba(10,17,40,0.18)]'
            }`}
          >
            {/* Drawer Header */}
            <div
              className={`p-4 sm:p-5 border-b flex items-center justify-between ${
                isDarkMode ? 'border-white/[0.12]' : 'border-black/[0.07]'
              }`}
            >
              <KindpdfLogo size="sm" suffix="Suite" isDarkMode={isDarkMode} />
              <button
                type="button"
                onClick={() => setIsAppDrawerOpen(false)}
                aria-label="Close menu"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isDarkMode
                    ? 'text-white/60 hover:text-white hover:bg-white/10'
                    : 'text-[#0A1128]/60 hover:text-[#0A1128] hover:bg-black/[0.05]'
                }`}
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
                      <h4
                        className={`text-[10px] font-bold tracking-[0.12em] uppercase ${
                          isDarkMode ? 'text-white/45' : 'text-[#0A1128]/45'
                        }`}
                      >
                        {catMeta.title}
                      </h4>
                      <p
                        className={`text-[11px] mt-0.5 leading-snug ${
                          isDarkMode ? 'text-white/50' : 'text-[#0A1128]/55'
                        }`}
                      >
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
                          className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all btn-press-effect ${
                            isDarkMode
                              ? 'text-white/80 hover:bg-white/[0.08] hover:text-white'
                              : 'text-[#0A1128]/80 hover:bg-black/[0.05] hover:text-[#0A1128]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText
                              className={`w-4 h-4 shrink-0 ${
                                isDarkMode ? 'text-white/50' : 'text-[#0A1128]/50'
                              }`}
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
