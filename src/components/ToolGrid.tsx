'use client';

import React, { useState } from 'react';
import { TranslationDictionary } from '@/lib/i18n/translations';
import { tools, ToolDefinition, ToolCategory } from '@/lib/tools/manifest';
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
  Layers,
  Split,
  RotateCw,
  Copy,
  Image,
  Search,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { ViewMode } from './Header';
import LiquidGlassPillBar from './LiquidGlassPillBar';

export type ToolId = ViewMode;

interface ToolGridProps {
  onSelectTool: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  isDarkMode?: boolean;
}

type CategoryFilter = 'all' | 'popular' | ToolCategory;

const CATEGORY_ORDER: ToolCategory[] = [
  'organize',
  'convert-to',
  'convert-from',
  'edit',
  'security',
  'utilities',
];

const ICON_CLASS = 'w-5 h-5 text-[#0A1128]/80 dark:text-white/85';

export const getToolIcon = (id: string) => {
  switch (id) {
    case 'merge':
      return <Layers className={ICON_CLASS} strokeWidth={1.8} />;
    case 'split':
      return <Split className={ICON_CLASS} strokeWidth={1.8} />;
    case 'organize':
      return <RotateCw className={ICON_CLASS} strokeWidth={1.8} />;
    case 'extract':
      return <Copy className={ICON_CLASS} strokeWidth={1.8} />;
    case 'image-to-pdf':
      return <Image className={ICON_CLASS} strokeWidth={1.8} />;
    case 'pdf-to-image':
      return <FileImage className={ICON_CLASS} strokeWidth={1.8} />;
    case 'protect':
      return <Lock className={ICON_CLASS} strokeWidth={1.8} />;
    case 'unlock':
      return <Unlock className={ICON_CLASS} strokeWidth={1.8} />;
    case 'page-numbers':
      return <Hash className={ICON_CLASS} strokeWidth={1.8} />;
    case 'watermark':
      return <Stamp className={ICON_CLASS} strokeWidth={1.8} />;
    case 'crop':
      return <Crop className={ICON_CLASS} strokeWidth={1.8} />;
    case 'edit-pdf':
      return <Edit3 className={ICON_CLASS} strokeWidth={1.8} />;
    case 'scan-to-pdf':
      return <Camera className={ICON_CLASS} strokeWidth={1.8} />;
    case 'sign':
      return <PenTool className={ICON_CLASS} strokeWidth={1.8} />;
    case 'redact':
      return <EyeOff className={ICON_CLASS} strokeWidth={1.8} />;
    case 'compare':
      return <GitCompare className={ICON_CLASS} strokeWidth={1.8} />;
    case 'repair':
      return <Wrench className={ICON_CLASS} strokeWidth={1.8} />;
    case 'compress':
      return <Minimize2 className={ICON_CLASS} strokeWidth={1.8} />;
    case 'html-to-pdf':
      return <Code className={ICON_CLASS} strokeWidth={1.8} />;
    case 'pdf-to-pdfa':
      return <Archive className={ICON_CLASS} strokeWidth={1.8} />;
    case 'word-to-pdf':
      return <FileText className={ICON_CLASS} strokeWidth={1.8} />;
    case 'pdf-to-word':
      return <FileText className={ICON_CLASS} strokeWidth={1.8} />;
    case 'ocr-pdf':
      return <ScanText className={ICON_CLASS} strokeWidth={1.8} />;
    default:
      return <FileText className={ICON_CLASS} strokeWidth={1.8} />;
  }
};

export const getIconBg = (_id?: string) =>
  'bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]';

const renderStatusBadge = (status: 'stable' | 'beta' | 'experimental') => {
  if (status === 'beta') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wide bg-black/[0.04] dark:bg-white/[0.07] text-[#0A1128]/60 dark:text-white/65 border border-black/[0.08] dark:border-white/[0.16] shrink-0">
        Beta
      </span>
    );
  }
  if (status === 'experimental') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wide bg-black/[0.04] dark:bg-white/[0.07] text-[#0A1128]/55 dark:text-white/60 border border-black/[0.08] dark:border-white/[0.16] shrink-0">
        Labs
      </span>
    );
  }
  return null;
};

export const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool, t, isDarkMode }) => {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: t.categories.all.shortLabel },
    { id: 'popular', label: t.categories.popular.shortLabel },
    ...CATEGORY_ORDER.map((key) => ({
      id: key as CategoryFilter,
      label: t.categories[key].shortLabel,
    })),
  ];

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

  const visibleCategories = CATEGORY_ORDER.filter(
    (key) => activeFilter === 'all' || activeFilter === key
  );

  const hasAnyResults =
    (activeFilter === 'all' || activeFilter === 'popular') && popularTools.length > 0
      ? true
      : visibleCategories.some((key) =>
          tools.some((item) => item.category === key && matchesSearch(item))
        );

  const activeCategoryMeta = t.categories[activeFilter];

  const renderCard = (item: ToolDefinition) => (
    <button
      key={item.id}
      type="button"
      onClick={() => onSelectTool(item.route)}
      className="glass-card-interactive p-4 sm:p-5 rounded-2xl text-left cursor-pointer flex flex-col justify-start gap-3 h-auto sm:h-full group btn-press-effect focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A3FF]/70 dark:focus-visible:ring-[#38BDF8]/70"
    >
      <div className="relative z-10 flex items-center gap-3 w-full">
        <div
          className={`w-10 h-10 rounded-xl ${getIconBg(item.id)} flex items-center justify-center shrink-0 group-hover:scale-[1.04] transition-transform duration-200`}
        >
          {getToolIcon(item.id)}
        </div>

        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
          <h3 className="text-[13px] sm:text-sm font-bold tracking-tight text-[#0A1128] dark:text-white truncate">
            {item.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {renderStatusBadge(item.status)}
            <ArrowUpRight
              className="w-3.5 h-3.5 text-[#0A1128]/40 dark:text-white/40 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[#0A1128]/80 dark:group-hover:text-white/85 transition-all duration-200"
              strokeWidth={2}
            />
          </div>
        </div>
      </div>

      <p className="relative z-10 text-xs text-[#0A1128]/65 dark:text-white/60 leading-relaxed font-normal flex-1">
        {item.description}
      </p>
    </button>
  );

  return (
    <div className="space-y-6 py-1">
      {/* iOS 26 Liquid Glass Hold-and-Scrub Category Pill Bar + Search */}
      <div className="space-y-2.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Quest-grade iOS 26 Liquid Glass Hold-and-Scrub Category Rail */}
          <LiquidGlassPillBar<CategoryFilter>
            options={filterTabs}
            value={activeFilter}
            onChange={setActiveFilter}
            ariaLabel="Filter PDF tools by category"
            scrollable
            isDarkMode={isDarkMode}
          />

          {/* Compact Frosted Search Pill */}
          <div className="relative w-full lg:w-64 shrink-0">
            <Search
              className="w-3.5 h-3.5 text-[#0A1128]/45 dark:text-white/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={1.9}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              className="w-full h-10 pl-9 pr-8 rounded-full bg-white/[0.64] dark:bg-white/[0.08] backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.18] text-xs font-medium text-[#0A1128] dark:text-white placeholder:text-[#0A1128]/45 dark:placeholder:text-white/45 outline-none focus:border-[#00A3FF]/70 dark:focus:border-[#38BDF8]/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.20)] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#0A1128]/50 dark:text-white/50 hover:text-[#0A1128] dark:hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Subtle plain 1-line subtitle ONLY when a specific category is selected */}
        {activeFilter !== 'all' && (
          <p className="text-xs text-[#0A1128]/55 dark:text-white/50 font-medium px-1">
            {activeCategoryMeta.helper}
          </p>
        )}
      </div>

      {/* Empty Search State */}
      {!hasAnyResults && (
        <div className="glass-card rounded-3xl p-8 text-center space-y-2">
          <p className="text-sm font-bold text-[#0A1128] dark:text-white">
            {t.noToolsFoundTitle}
          </p>
          <p className="text-xs text-[#0A1128]/60 dark:text-white/55 font-medium">
            {t.noToolsFoundHint}
          </p>
        </div>
      )}

      {/* 1. POPULAR SHORTCUTS SECTION */}
      {(activeFilter === 'all' || activeFilter === 'popular') && popularTools.length > 0 && (
        <section className="space-y-3.5 animate-fade-in">
          <div className="px-0.5">
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-[#0A1128] dark:text-white">
              {t.popularTools}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {popularTools.map((item) => renderCard(item))}
          </div>
        </section>
      )}

      {/* 2. CATEGORY SUITES SECTION */}
      {activeFilter !== 'popular' &&
        visibleCategories.map((catKey) => {
          const catMeta = t.categories[catKey];
          const catTools = tools.filter((item) => item.category === catKey && matchesSearch(item));
          if (catTools.length === 0) return null;

          return (
            <section key={catKey} className="space-y-3.5 pt-1 animate-fade-in">
              <div className="px-0.5">
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-[#0A1128] dark:text-white">
                  {catMeta.title}
                </h2>
                <p className="text-xs text-[#0A1128]/60 dark:text-white/55 font-normal mt-0.5">
                  {catMeta.helper}
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
