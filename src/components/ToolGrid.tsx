'use client';

import React, { useState } from 'react';
import {
  FileStack,
  Scissors,
  Layers,
  FileOutput,
  FileImage,
  ArrowRight,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { TranslationDictionary } from '@/lib/i18n/translations';

export type ToolId = 'merge' | 'split' | 'organize' | 'extract' | 'image-to-pdf';

interface ToolGridProps {
  onSelectTool: (toolId: ToolId) => void;
  t: TranslationDictionary;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool, t }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'organize' | 'convert'>('all');

  const tools = [
    {
      id: 'merge' as ToolId,
      category: 'organize',
      title: t.mergePdf,
      description: t.mergeHeroSubtitle,
      icon: <FileStack className="w-6 h-6 text-blue-600 dark:text-sky-400" />,
      iconBg: 'bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900',
      badge: null, // Removed top-right status badge
      isReady: true,
    },
    {
      id: 'split' as ToolId,
      category: 'organize',
      title: t.splitPdf,
      description: 'Separate one page or a whole set into independent PDF files.',
      icon: <Scissors className="w-6 h-6 text-amber-500" />,
      iconBg: 'bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-900',
      badge: t.soon,
      isReady: false,
    },
    {
      id: 'organize' as ToolId,
      category: 'organize',
      title: t.organizePages,
      description: 'Reorder, rotate (90°, 180°, 270°), or delete pages from your PDF document.',
      icon: <Layers className="w-6 h-6 text-purple-500" />,
      iconBg: 'bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-900',
      badge: t.soon,
      isReady: false,
    },
    {
      id: 'extract' as ToolId,
      category: 'organize',
      title: t.extractPages,
      description: 'Extract specific pages from your PDF into a brand new PDF document.',
      icon: <FileOutput className="w-6 h-6 text-emerald-500" />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-900',
      badge: t.soon,
      isReady: false,
    },
    {
      id: 'image-to-pdf' as ToolId,
      category: 'convert',
      title: t.imagesToPdf,
      description: 'Convert JPG, PNG, and WEBP images to PDF with custom page size and margins.',
      icon: <FileImage className="w-6 h-6 text-rose-500" />,
      iconBg: 'bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900',
      badge: t.soon,
      isReady: false,
    },
  ];

  const filteredTools = tools.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="space-y-8 py-2">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-black transition-all btn-press-effect border-2 ${
            activeCategory === 'all'
              ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white text-white dark:text-slate-900 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 shadow-sm'
          }`}
        >
          {t.allTools}
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('organize')}
          className={`px-4 py-2 rounded-full text-xs font-black transition-all btn-press-effect border-2 ${
            activeCategory === 'organize'
              ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white text-white dark:text-slate-900 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 shadow-sm'
          }`}
        >
          Organize PDF
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('convert')}
          className={`px-4 py-2 rounded-full text-xs font-black transition-all btn-press-effect border-2 ${
            activeCategory === 'convert'
              ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white text-white dark:text-slate-900 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 shadow-sm'
          }`}
        >
          Convert to PDF
        </button>
      </div>

      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTools.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (item.isReady) onSelectTool(item.id);
            }}
            className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 transition-all duration-200 flex flex-col justify-between gap-4 group ${
              item.isReady
                ? 'border-slate-300 dark:border-slate-800 hover:border-blue-600 dark:hover:border-sky-500 shadow-md hover:shadow-2xl cursor-pointer hover:-translate-y-1'
                : 'border-slate-200 dark:border-slate-800/80 opacity-70 cursor-not-allowed shadow-sm'
            }`}
          >
            {/* Header Icon & Optional Badge */}
            <div className="flex items-center justify-between gap-2">
              <div className={`p-3.5 rounded-2xl ${item.iconBg} shadow-sm group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              {item.badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                  {item.badge}
                </span>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors flex items-center justify-between">
                <span>{item.title}</span>
                {item.isReady && (
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                )}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {item.description}
              </p>
            </div>

            {/* Footer Status */}
            <div className="pt-3 border-t-2 border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                100% In-Browser
              </span>
              {item.isReady ? (
                <span className="text-blue-600 dark:text-sky-400 font-extrabold group-hover:underline">
                  {t.openTool}
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> {t.upcoming}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolGrid;
