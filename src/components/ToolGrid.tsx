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

export type ToolId = 'merge' | 'split' | 'organize' | 'extract' | 'image-to-pdf';

interface ToolGridProps {
  onSelectTool: (toolId: ToolId) => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'organize' | 'convert'>('all');

  const tools = [
    {
      id: 'merge' as ToolId,
      category: 'organize',
      title: 'Merge PDF',
      description: 'Combine PDFs in the order you want with the easiest in-browser PDF merger.',
      icon: <FileStack className="w-6 h-6 text-blue-600 dark:text-sky-400" />,
      iconBg: 'bg-blue-50 dark:bg-blue-950/80',
      badge: 'Active & Ready',
      isReady: true,
    },
    {
      id: 'split' as ToolId,
      category: 'organize',
      title: 'Split PDF',
      description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
      icon: <Scissors className="w-6 h-6 text-amber-500" />,
      iconBg: 'bg-amber-50 dark:bg-amber-950/80',
      badge: 'Sprint 2',
      isReady: false,
    },
    {
      id: 'organize' as ToolId,
      category: 'organize',
      title: 'Organize Pages',
      description: 'Reorder, rotate (90°, 180°, 270°), or delete pages from your PDF document.',
      icon: <Layers className="w-6 h-6 text-purple-500" />,
      iconBg: 'bg-purple-50 dark:bg-purple-950/80',
      badge: 'Sprint 3',
      isReady: false,
    },
    {
      id: 'extract' as ToolId,
      category: 'organize',
      title: 'Extract Pages',
      description: 'Extract specific pages from your PDF into a brand new PDF document.',
      icon: <FileOutput className="w-6 h-6 text-emerald-500" />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/80',
      badge: 'Sprint 4',
      isReady: false,
    },
    {
      id: 'image-to-pdf' as ToolId,
      category: 'convert',
      title: 'Images to PDF',
      description: 'Convert JPG, PNG, and WEBP images to PDF with custom page size and margins.',
      icon: <FileImage className="w-6 h-6 text-rose-500" />,
      iconBg: 'bg-rose-50 dark:bg-rose-950/80',
      badge: 'Sprint 5',
      isReady: false,
    },
  ];

  const filteredTools = tools.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  return (
    <div className="space-y-8 py-4">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all btn-press-effect ${
            activeCategory === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Tools
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('organize')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all btn-press-effect ${
            activeCategory === 'organize'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Organize PDF
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('convert')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all btn-press-effect ${
            activeCategory === 'convert'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Convert to PDF
        </button>
      </div>

      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTools.map((t) => (
          <div
            key={t.id}
            onClick={() => {
              if (t.isReady) onSelectTool(t.id);
            }}
            className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 flex flex-col justify-between gap-4 group ${
              t.isReady
                ? 'border-slate-200/80 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-sky-500/60 hover:shadow-xl cursor-pointer hover:-translate-y-1'
                : 'border-slate-200/50 dark:border-slate-800/50 opacity-70 cursor-not-allowed'
            }`}
          >
            {/* Header Icon & Badge */}
            <div className="flex items-center justify-between gap-2">
              <div className={`p-3.5 rounded-2xl ${t.iconBg} shadow-sm group-hover:scale-110 transition-transform`}>
                {t.icon}
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                  t.isReady
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {t.badge}
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors flex items-center justify-between">
                <span>{t.title}</span>
                {t.isReady && (
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {t.description}
              </p>
            </div>

            {/* Footer Status */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                100% In-Browser
              </span>
              {t.isReady ? (
                <span className="text-blue-600 dark:text-sky-400 font-extrabold group-hover:underline">
                  Buka Alat →
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Mendatang
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
