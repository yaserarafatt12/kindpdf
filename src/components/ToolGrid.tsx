'use client';

import React, { useState } from 'react';
import { TranslationDictionary } from '@/lib/i18n/translations';
import { tools, ToolDefinition } from '@/lib/tools/manifest';
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
  Layers,
  Split,
  RotateCw,
  Copy,
  Image,
  Search,
  X,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { ViewMode } from './Header';

export type ToolId = ViewMode;

interface ToolGridProps {
  onSelectTool: (toolId: ViewMode) => void;
  t: TranslationDictionary;
}

type CategoryFilter = 'all' | 'popular' | ToolDefinition['category'];

export const getToolIcon = (id: string) => {
  switch (id) {
    case 'merge':
      return <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600 dark:text-sky-300" />;
    case 'split':
      return <Split className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-300" />;
    case 'organize':
      return <RotateCw className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-300" />;
    case 'extract':
      return <Copy className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-300" />;
    case 'image-to-pdf':
      return <Image className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 dark:text-rose-300" />;
    case 'pdf-to-image':
      return <FileImage className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-300" />;
    case 'protect':
      return <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 dark:text-slate-200" />;
    case 'unlock':
      return <Unlock className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-300" />;
    case 'page-numbers':
      return <Hash className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-300" />;
    case 'watermark':
      return <Stamp className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600 dark:text-violet-300" />;
    case 'crop':
      return <Crop className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-300" />;
    case 'edit-pdf':
      return <Edit3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-300" />;
    case 'scan-to-pdf':
      return <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-300" />;
    case 'sign':
      return <PenTool className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600 dark:text-sky-300" />;
    case 'redact':
      return <EyeOff className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 dark:text-rose-300" />;
    case 'compare':
      return <GitCompare className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-300" />;
    case 'repair':
      return <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-300" />;
    case 'compress':
      return <Minimize2 className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-300" />;
    case 'html-to-pdf':
      return <Code className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600 dark:text-sky-300" />;
    case 'pdf-to-pdfa':
      return <Archive className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-300" />;
    case 'word-to-pdf':
      return <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-sky-300" />;
    case 'pdf-to-word':
      return <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-300" />;
    case 'ocr-pdf':
      return <ScanText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-300" />;
    default:
      return <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-300" />;
  }
};

export const getIconBg = (id: string) => {
  const base = 'backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]';
  switch (id) {
    case 'merge':
    case 'word-to-pdf':
    case 'sign':
    case 'crop':
      return `${base} bg-sky-500/15 dark:bg-sky-400/15 border border-sky-500/25 dark:border-sky-400/25`;
    case 'split':
    case 'repair':
      return `${base} bg-amber-500/15 dark:bg-amber-400/15 border border-amber-500/25 dark:border-amber-400/25`;
    case 'organize':
    case 'edit-pdf':
    case 'ocr-pdf':
    case 'compare':
      return `${base} bg-purple-500/15 dark:bg-purple-400/15 border border-purple-500/25 dark:border-purple-400/25`;
    case 'extract':
    case 'scan-to-pdf':
      return `${base} bg-emerald-500/15 dark:bg-emerald-400/15 border border-emerald-500/25 dark:border-emerald-400/25`;
    case 'image-to-pdf':
    case 'redact':
      return `${base} bg-rose-500/15 dark:bg-rose-400/15 border border-rose-500/25 dark:border-rose-400/25`;
    case 'compress':
    case 'unlock':
      return `${base} bg-teal-500/15 dark:bg-teal-400/15 border border-teal-500/25 dark:border-teal-400/25`;
    case 'page-numbers':
    case 'html-to-pdf':
      return `${base} bg-cyan-500/15 dark:bg-cyan-400/15 border border-cyan-500/25 dark:border-cyan-400/25`;
    case 'watermark':
      return `${base} bg-violet-500/15 dark:bg-violet-400/15 border border-violet-500/25 dark:border-violet-400/25`;
    case 'pdf-to-image':
    case 'pdf-to-word':
    case 'pdf-to-pdfa':
      return `${base} bg-indigo-500/15 dark:bg-indigo-400/15 border border-indigo-500/25 dark:border-indigo-400/25`;
    default:
      return `${base} bg-slate-500/15 dark:bg-white/10 border border-slate-400/25 dark:border-white/20`;
  }
};

const renderStatusBadge = (status: 'stable' | 'beta' | 'experimental') => {
  if (status === 'beta') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide border bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 shrink-0">
        Beta
      </span>
    );
  }
  if (status === 'experimental') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide border bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 shrink-0">
        Experimental
      </span>
    );
  }
  return null;
};

export const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool }) => {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const matchesSearch = (item: ToolDefinition) => {
    if (!normalizedQuery) return true;
    return (
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery) ||
      item.id.toLowerCase().includes(normalizedQuery)
    );
  };

  const popularTools = tools.filter((item) => item.popular && matchesSearch(item));

  const categories: { key: ToolDefinition['category']; shortLabel: string; title: string; subtitle: string }[] = [
    { key: 'organize', shortLabel: 'Organize', title: 'Organize & Pages', subtitle: 'Merge, split, extract, crop, and reorder PDF pages' },
    { key: 'convert-to', shortLabel: 'To PDF', title: 'Convert to PDF', subtitle: 'Convert images, Word documents, HTML notes, and camera scans to PDF' },
    { key: 'convert-from', shortLabel: 'From PDF', title: 'Convert from PDF', subtitle: 'Export PDF pages to images, Word files, text layers, and archival formats' },
    { key: 'edit', shortLabel: 'Edit', title: 'Edit & Annotate', subtitle: 'Add text overlays, page numbers, watermarks, and electronic signatures' },
    { key: 'security', shortLabel: 'Security', title: 'Security & Privacy', subtitle: 'Password protection, key removal, and visual redaction blackout' },
    { key: 'utilities', shortLabel: 'Utilities', title: 'Utilities & Maintenance', subtitle: 'File compression optimization, recovery, and structural comparison' },
  ];

  const filterTabs: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: 'All Tools' },
    { id: 'popular', label: 'Popular' },
    ...categories.map((c) => ({ id: c.key as CategoryFilter, label: c.shortLabel })),
  ];

  const renderCard = (item: ToolDefinition) => (
    <button
      key={item.id}
      type="button"
      onClick={() => onSelectTool(item.route)}
      className="glass-card-interactive p-4 sm:p-5 rounded-2xl text-left cursor-pointer flex flex-col justify-start gap-3 h-auto sm:h-full group btn-press-effect focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80"
    >
      <div className="relative z-10 flex items-center gap-3 w-full">
        <div className={`p-2.5 rounded-xl ${getIconBg(item.id)} shrink-0 group-hover:scale-105 transition-transform duration-200`}>
          {getToolIcon(item.id)}
        </div>

        <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors truncate">
            {item.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            {renderStatusBadge(item.status)}
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400/70 dark:text-slate-500 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-sky-500 dark:group-hover:text-sky-300 transition-all duration-200" />
          </div>
        </div>
      </div>

      <p className="relative z-10 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300/80 leading-relaxed font-medium flex-1">
        {item.description}
      </p>
    </button>
  );

  const visibleCategories = categories.filter(
    (cat) => activeFilter === 'all' || activeFilter === cat.key
  );

  const hasAnyResults =
    (activeFilter === 'all' || activeFilter === 'popular') && popularTools.length > 0
      ? true
      : visibleCategories.some((cat) =>
          tools.some((item) => item.category === cat.key && matchesSearch(item))
        );

  return (
    <div className="space-y-8 py-2">
      {/* iOS 26 Liquid Glass Filter Pill Bar + Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Scrollable Liquid Glass Pill Rail */}
        <div
          role="tablist"
          aria-label="Filter PDF tools by category"
          className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/75 dark:bg-[#0C1930]/80 backdrop-blur-2xl border border-slate-200/85 dark:border-white/[0.15] shadow-[0_6px_24px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.18)] overflow-x-auto no-scrollbar"
        >
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-200 btn-press-effect ${
                  isActive
                    ? 'glass-pill-active'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.08]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Compact Frosted Search Pill */}
        <div className="relative w-full md:w-60 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 23 PDF tools..."
            aria-label="Search PDF tools"
            className="w-full pl-9 pr-8 py-2 rounded-full bg-white/75 dark:bg-[#0C1930]/80 backdrop-blur-2xl border border-slate-200/85 dark:border-white/[0.15] text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400/80 outline-none focus:border-sky-400/80 dark:focus:border-sky-400/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Empty Search State */}
      {!hasAnyResults && (
        <div className="glass-card rounded-3xl p-8 text-center space-y-2">
          <p className="text-sm font-black text-slate-900 dark:text-white">
            No matching PDF tools found
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Try searching for &ldquo;merge&rdquo;, &ldquo;compress&rdquo;, &ldquo;split&rdquo;, or &ldquo;sign&rdquo;.
          </p>
        </div>
      )}

      {/* 1. POPULAR SHORTCUTS SECTION */}
      {(activeFilter === 'all' || activeFilter === 'popular') && popularTools.length > 0 && (
        <section className="space-y-3.5 animate-fade-in">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                Popular Tools
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Local processing
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {popularTools.map((item) => renderCard(item))}
          </div>
        </section>
      )}

      {/* 2. CATEGORY SUITES SECTION */}
      {activeFilter !== 'popular' &&
        visibleCategories.map((cat) => {
          const catTools = tools.filter((item) => item.category === cat.key && matchesSearch(item));
          if (catTools.length === 0) return null;

          return (
            <section key={cat.key} className="space-y-3.5 pt-1 animate-fade-in">
              <div className="px-0.5">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                  {cat.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {cat.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {catTools.map((item) => renderCard(item))}
              </div>
            </section>
          );
        })}
    </div>
  );
};

export default ToolGrid;
