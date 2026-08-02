'use client';

import React from 'react';
import { TranslationDictionary } from '@/lib/i18n/translations';
import { tools, ToolDefinition, activeToolCount } from '@/lib/tools/manifest';
import {
  MergePdfIcon,
  SplitPdfIcon,
  OrganizePagesIcon,
  ExtractPagesIcon,
  ImageToPdfIcon,
} from './icons/CustomPdfIcons';
import {
  FileImage,
  Lock,
  Unlock,
  Hash,
  Stamp,
  Crop,
  Edit3,
  Camera,
  PenTool,
  EyeOff,
  GitCompare,
  Wrench,
  Minimize2,
  Code,
  Archive,
  FileText,
  ScanText,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { ViewMode } from './Header';

export type ToolId = ViewMode;

interface ToolGridProps {
  onSelectTool: (toolId: ViewMode) => void;
  t: TranslationDictionary;
}

const getToolIcon = (id: string) => {
  switch (id) {
    case 'merge':
      return <MergePdfIcon className="w-6 h-6" />;
    case 'split':
      return <SplitPdfIcon className="w-6 h-6" />;
    case 'organize':
      return <OrganizePagesIcon className="w-6 h-6" />;
    case 'extract':
      return <ExtractPagesIcon className="w-6 h-6" />;
    case 'image-to-pdf':
      return <ImageToPdfIcon className="w-6 h-6" />;
    case 'pdf-to-image':
      return <FileImage className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
    case 'protect':
      return <Lock className="w-6 h-6 text-slate-700 dark:text-slate-300" />;
    case 'unlock':
      return <Unlock className="w-6 h-6 text-teal-600 dark:text-teal-400" />;
    case 'page-numbers':
      return <Hash className="w-6 h-6 text-sky-600 dark:text-sky-400" />;
    case 'watermark':
      return <Stamp className="w-6 h-6 text-violet-600 dark:text-violet-400" />;
    case 'crop':
      return <Crop className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
    case 'edit-pdf':
      return <Edit3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
    case 'scan-to-pdf':
      return <Camera className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
    case 'sign':
      return <PenTool className="w-6 h-6 text-blue-600 dark:text-sky-400" />;
    case 'redact':
      return <EyeOff className="w-6 h-6 text-rose-600 dark:text-rose-400" />;
    case 'compare':
      return <GitCompare className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
    case 'repair':
      return <Wrench className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
    case 'compress':
      return <Minimize2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />;
    case 'html-to-pdf':
      return <Code className="w-6 h-6 text-sky-600 dark:text-sky-400" />;
    case 'pdf-to-pdfa':
      return <Archive className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
    case 'word-to-pdf':
      return <FileText className="w-6 h-6 text-blue-600 dark:text-sky-400" />;
    case 'pdf-to-word':
      return <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
    case 'ocr-pdf':
      return <ScanText className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
    default:
      return <FileText className="w-6 h-6 text-slate-600" />;
  }
};

const getIconBg = (id: string) => {
  switch (id) {
    case 'merge':
    case 'word-to-pdf':
    case 'sign':
    case 'crop':
      return 'bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900';
    case 'split':
    case 'repair':
      return 'bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-900';
    case 'organize':
    case 'edit-pdf':
    case 'ocr-pdf':
    case 'compare':
      return 'bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-900';
    case 'extract':
    case 'scan-to-pdf':
      return 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-900';
    case 'image-to-pdf':
    case 'redact':
      return 'bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900';
    case 'compress':
    case 'unlock':
      return 'bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-900';
    case 'page-numbers':
    case 'html-to-pdf':
      return 'bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-900';
    case 'watermark':
      return 'bg-violet-50 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-900';
    case 'pdf-to-image':
    case 'pdf-to-word':
    case 'pdf-to-pdfa':
      return 'bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-900';
    default:
      return 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700';
  }
};

const renderStatusBadge = (status: 'stable' | 'beta' | 'experimental') => {
  if (status === 'beta') {
    return (
      <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold border bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900 shrink-0">
        Beta
      </span>
    );
  }
  if (status === 'experimental') {
    return (
      <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold border bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 shrink-0">
        Experimental
      </span>
    );
  }
  return null;
};

export const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool, t }) => {
  const popularTools = tools.filter((t) => t.popular);

  const categories: { key: ToolDefinition['category']; title: string; subtitle: string }[] = [
    { key: 'organize', title: 'Organize & Pages', subtitle: 'Merge, split, extract, crop, and reorder PDF pages' },
    { key: 'convert-to', title: 'Convert to PDF', subtitle: 'Convert images, Word documents, HTML notes, and camera scans to PDF' },
    { key: 'convert-from', title: 'Convert from PDF', subtitle: 'Export PDF pages to images, Word files, text layers, and archival formats' },
    { key: 'edit', title: 'Edit & Annotate', subtitle: 'Add text overlays, page numbers, watermarks, and electronic signatures' },
    { key: 'security', title: 'Security & Privacy', subtitle: 'Password protection, key removal, and visual redaction blackout' },
    { key: 'utilities', title: 'Utilities & Maintenance', subtitle: 'File compression optimization, recovery, and structural comparison' },
  ];

  const renderCard = (item: ToolDefinition) => (
    <div
      key={item.id}
      onClick={() => onSelectTool(item.route)}
      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 hover:border-blue-600 dark:hover:border-sky-500 shadow-sm hover:shadow-xl cursor-pointer hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-3 group"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${getIconBg(item.id)} shadow-xs shrink-0 group-hover:scale-105 transition-transform`}>
          {getToolIcon(item.id)}
        </div>

        <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
          <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors truncate">
            {item.title}
          </h3>
          {renderStatusBadge(item.status)}
        </div>
      </div>

      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
        {item.description}
      </p>

      {item.note && (
        <p className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 line-clamp-1">
          ⚠️ {item.note}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-10 py-2">
      {/* 1. POPULAR SHORTCUTS SECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
            Popular Tools
          </h2>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Local processing
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {popularTools.map((item) => renderCard(item))}
        </div>
      </section>

      {/* 2. CATEGORY SUITES SECTION */}
      {categories.map((cat) => {
        const catTools = tools.filter((t) => t.category === cat.key);
        if (catTools.length === 0) return null;

        return (
          <section key={cat.key} className="space-y-3 pt-2">
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {cat.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {cat.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {catTools.map((item) => renderCard(item))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default ToolGrid;
