'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Sun,
  Moon,
  Github,
  ChevronDown,
  Check,
  LayoutGrid,
  X,
} from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import {
  MergePdfIcon,
  SplitPdfIcon,
  OrganizePagesIcon,
  ExtractPagesIcon,
  ImageToPdfIcon,
} from './icons/CustomPdfIcons';

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
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);
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

  // Full categorized menu items (matching iLovePDF full suite layout)
  const menuCategories = [
    {
      title: 'ORGANIZE PDF',
      items: [
        { id: 'merge' as ViewMode, label: t.mergePdf, icon: <MergePdfIcon className="w-4 h-4" />, active: true },
        { id: 'split' as ViewMode, label: t.splitPdf, icon: <SplitPdfIcon className="w-4 h-4" />, active: false },
        { id: 'extract' as ViewMode, label: t.extractPages, icon: <ExtractPagesIcon className="w-4 h-4" />, active: false },
        { id: 'organize' as ViewMode, label: t.organizePages, icon: <OrganizePagesIcon className="w-4 h-4" />, active: false },
      ],
    },
    {
      title: 'CONVERT TO PDF',
      items: [
        { id: 'image-to-pdf' as ViewMode, label: t.imagesToPdf, icon: <ImageToPdfIcon className="w-4 h-4" />, active: false },
        { id: 'word-to-pdf' as any, label: 'WORD to PDF', icon: <ImageToPdfIcon className="w-4 h-4" />, active: false },
        { id: 'excel-to-pdf' as any, label: 'EXCEL to PDF', icon: <ImageToPdfIcon className="w-4 h-4" />, active: false },
      ],
    },
    {
      title: 'CONVERT FROM PDF',
      items: [
        { id: 'pdf-to-jpg' as any, label: 'PDF to JPG', icon: <ImageToPdfIcon className="w-4 h-4" />, active: false },
        { id: 'pdf-to-word' as any, label: 'PDF to WORD', icon: <ImageToPdfIcon className="w-4 h-4" />, active: false },
      ],
    },
  ];

  return (
    <>
      <header className="w-full bg-white dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3">
          {/* Left Side: 4-Grid App Menu Icon + Brand Logo (Kindpdf) */}
          <div className="flex items-center gap-3">
            {/* 4-Grid App Launcher Button */}
            <button
              type="button"
              onClick={() => setIsAppDrawerOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 transition-colors btn-press-effect shadow-sm"
              title="All PDF Tools Menu"
            >
              <LayoutGrid className="w-5 h-5 text-blue-600 dark:text-sky-400" />
            </button>

            {/* Logo */}
            <div
              onClick={() => onViewChange('grid')}
              className="cursor-pointer group flex items-center"
            >
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans tracking-[0.06em] leading-none">
                Kind<span className="text-blue-600 dark:text-sky-400">pdf</span>
              </h1>
            </div>
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

      {/* FULL CATEGORIZED APP DRAWER MENU (iLovePDF Style Slide-Over) */}
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
              {menuCategories.map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-[11px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                    {cat.title}
                  </h4>
                  <div className="space-y-1">
                    {cat.items.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          if (item.active) onViewChange(item.id);
                          setIsAppDrawerOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                          item.active
                            ? 'text-slate-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600'
                            : 'text-slate-400 dark:text-slate-500 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        {!item.active && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] text-slate-400 font-bold">
                            {t.soon}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
