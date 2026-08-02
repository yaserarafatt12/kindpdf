'use client';

import React from 'react';
import { TranslationDictionary } from '@/lib/i18n/translations';
import {
  MergePdfIcon,
  SplitPdfIcon,
  OrganizePagesIcon,
  ExtractPagesIcon,
  ImageToPdfIcon,
} from './icons/CustomPdfIcons';
import { FileImage, Lock, Unlock, Hash, Stamp } from 'lucide-react';
import { ViewMode } from './Header';

export type ToolId = Extract<
  ViewMode,
  'merge' | 'split' | 'organize' | 'extract' | 'image-to-pdf' | 'pdf-to-image' | 'protect' | 'unlock' | 'page-numbers' | 'watermark'
>;

interface ToolGridProps {
  onSelectTool: (toolId: ToolId) => void;
  t: TranslationDictionary;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool, t }) => {
  const tools = [
    {
      id: 'merge' as ToolId,
      title: t.mergePdf,
      description: t.mergeHeroSubtitle,
      icon: <MergePdfIcon className="w-6 h-6" />,
      iconBg: 'bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900',
      badge: null,
      isReady: true,
    },
    {
      id: 'split' as ToolId,
      title: t.splitPdf,
      description: 'Separate one page or a whole set into independent PDF files.',
      icon: <SplitPdfIcon className="w-6 h-6" />,
      iconBg: 'bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-900',
      badge: null,
      isReady: true,
    },
    {
      id: 'organize' as ToolId,
      title: t.organizePages,
      description: 'Reorder, rotate (90°, 180°, 270°), or delete pages from your PDF document.',
      icon: <OrganizePagesIcon className="w-6 h-6" />,
      iconBg: 'bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-900',
      badge: null,
      isReady: true,
    },
    {
      id: 'extract' as ToolId,
      title: t.extractPages,
      description: 'Extract specific pages from your PDF into a brand new PDF document.',
      icon: <ExtractPagesIcon className="w-6 h-6" />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-900',
      badge: null,
      isReady: true,
    },
    {
      id: 'image-to-pdf' as ToolId,
      title: t.imagesToPdf,
      description: 'Convert JPG, PNG, and WEBP images to PDF with custom page size and margins.',
      icon: <ImageToPdfIcon className="w-6 h-6" />,
      iconBg: 'bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900',
      badge: null,
      isReady: true,
    },
    {
      id: 'pdf-to-image' as ToolId,
      title: 'PDF to Images',
      description: 'Render and extract all PDF pages into high-DPI PNG or JPG image files.',
      icon: <FileImage className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-900',
      badge: null,
      isReady: true,
    },
    {
      id: 'protect' as ToolId,
      title: 'Protect PDF',
      description: 'Encrypt your PDF with password security to prevent unauthorized access.',
      icon: <Lock className="w-6 h-6 text-slate-700 dark:text-slate-300" />,
      iconBg: 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700',
      badge: null,
      isReady: true,
    },
    {
      id: 'unlock' as ToolId,
      title: 'Unlock PDF',
      description: 'Remove password encryption and security restrictions from your PDF.',
      icon: <Unlock className="w-6 h-6 text-teal-600 dark:text-teal-400" />,
      iconBg: 'bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-900',
      badge: null,
      isReady: true,
    },
    {
      id: 'page-numbers' as ToolId,
      title: 'Add Page Numbers',
      description: 'Insert customizable page numbers with flexible alignment into your PDF.',
      icon: <Hash className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
      iconBg: 'bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-900',
      badge: null,
      isReady: true,
    },
    {
      id: 'watermark' as ToolId,
      title: 'Add Watermark',
      description: 'Overlay custom text watermarks across every page of your PDF.',
      icon: <Stamp className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
      iconBg: 'bg-violet-50 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-900',
      badge: null,
      isReady: true,
    },
  ];

  return (
    <div className="space-y-4 py-2">
      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {tools.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (item.isReady) onSelectTool(item.id);
            }}
            className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 transition-all duration-200 flex flex-col justify-between gap-2.5 group ${
              item.isReady
                ? 'border-slate-300 dark:border-slate-800 hover:border-blue-600 dark:hover:border-sky-500 shadow-sm hover:shadow-xl cursor-pointer hover:-translate-y-0.5'
                : 'border-slate-200 dark:border-slate-800/80 opacity-70 cursor-not-allowed shadow-xs'
            }`}
          >
            {/* Top Row: Custom SVG Icon + Title Inline */}
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${item.iconBg} shadow-xs shrink-0 group-hover:scale-105 transition-transform`}>
                {item.icon}
              </div>

              <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors truncate">
                  {item.title}
                </h3>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 shrink-0">
                    {item.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Description Text */}
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolGrid;
