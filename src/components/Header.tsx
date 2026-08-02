'use client';

import React from 'react';
import {
  FileStack,
  Scissors,
  Layers,
  FileImage,
  FileOutput,
  ShieldCheck,
  Github,
} from 'lucide-react';

export type ToolTab = 'merge' | 'split' | 'organize' | 'extract' | 'image-to-pdf';

interface HeaderProps {
  activeTab: ToolTab;
  onTabChange: (tab: ToolTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const tools = [
    {
      id: 'merge' as ToolTab,
      label: 'Gabungkan PDF',
      icon: <FileStack className="w-4 h-4" />,
      active: true,
    },
    {
      id: 'split' as ToolTab,
      label: 'Pisahkan PDF',
      icon: <Scissors className="w-4 h-4" />,
      badge: 'Soon',
      active: false,
    },
    {
      id: 'organize' as ToolTab,
      label: 'Atur Halaman',
      icon: <Layers className="w-4 h-4" />,
      badge: 'Soon',
      active: false,
    },
    {
      id: 'extract' as ToolTab,
      label: 'Ekstrak Halaman',
      icon: <FileOutput className="w-4 h-4" />,
      badge: 'Soon',
      active: false,
    },
    {
      id: 'image-to-pdf' as ToolTab,
      label: 'Gambar ke PDF',
      icon: <FileImage className="w-4 h-4" />,
      badge: 'Soon',
      active: false,
    },
  ];

  return (
    <header className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 flex items-center justify-center">
            <FileStack className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Local<span className="text-indigo-600 dark:text-indigo-400">PDF</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black">
                by edsheero
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Your documents never leave your device
            </p>
          </div>
        </div>

        {/* Tools Tab Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          {tools.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                if (t.active) onTabChange(t.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 btn-press-effect ${
                activeTab === t.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                  : t.active
                  ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-slate-400 dark:text-slate-500 opacity-60 cursor-not-allowed'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.badge && (
                <span className="px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-bold">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* GitHub Link */}
        <a
          href="https://github.com/yaserarafatt12/localpdf"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
        >
          <Github className="w-4 h-4 text-indigo-500" />
          <span>GitHub</span>
        </a>
      </div>
    </header>
  );
};

export default Header;
