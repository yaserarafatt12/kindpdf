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
  RotateCw,
} from 'lucide-react';
import { ViewMode } from './Header';

export type ToolId = Extract<
  ViewMode,
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
  | 'ocr-pdf'
>;

interface ToolGridProps {
  onSelectTool: (toolId: ToolId) => void;
  t: TranslationDictionary;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool, t }) => {
  // Re-ordered logically by importance & category
  const tools = [
    // --- 1. ORGANIZE & OPTIMIZE (MOST USED) ---
    {
      id: 'merge' as ToolId,
      title: t.mergePdf || 'Merge PDF',
      description: 'Combine multiple PDFs into a single document in your desired order.',
      icon: <MergePdfIcon className="w-6 h-6" />,
      iconBg: 'bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900',
      badge: 'POPULAR',
      category: 'Organize',
      isReady: true,
    },
    {
      id: 'split' as ToolId,
      title: t.splitPdf || 'Split PDF',
      description: 'Separate one page or a whole set into independent PDF files.',
      icon: <SplitPdfIcon className="w-6 h-6" />,
      iconBg: 'bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-900',
      badge: 'POPULAR',
      category: 'Organize',
      isReady: true,
    },
    {
      id: 'compress' as ToolId,
      title: 'Compress PDF',
      description: 'Reduce PDF file size while maintaining document quality.',
      icon: <Minimize2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />,
      iconBg: 'bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-900',
      badge: 'POPULAR',
      category: 'Optimize',
      isReady: true,
    },
    {
      id: 'organize' as ToolId,
      title: t.organizePages || 'Organize Pages',
      description: 'Reorder, rotate (90°, 180°, 270°), or delete pages visually.',
      icon: <OrganizePagesIcon className="w-6 h-6" />,
      iconBg: 'bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-900',
      badge: null,
      category: 'Organize',
      isReady: true,
    },
    {
      id: 'extract' as ToolId,
      title: t.extractPages || 'Extract Pages',
      description: 'Extract specific pages from your PDF into a brand new document.',
      icon: <ExtractPagesIcon className="w-6 h-6" />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-900',
      badge: null,
      category: 'Organize',
      isReady: true,
    },

    // --- 2. CONVERT TO PDF ---
    {
      id: 'image-to-pdf' as ToolId,
      title: t.imagesToPdf || 'Images to PDF',
      description: 'Convert JPG, PNG, and WEBP images to PDF with custom margins.',
      icon: <ImageToPdfIcon className="w-6 h-6" />,
      iconBg: 'bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900',
      badge: 'CONVERT',
      category: 'Convert to PDF',
      isReady: true,
    },
    {
      id: 'word-to-pdf' as ToolId,
      title: 'Word to PDF',
      description: 'Convert Word documents (.docx) into formatted PDF files.',
      icon: <FileText className="w-6 h-6 text-blue-600 dark:text-sky-400" />,
      iconBg: 'bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900',
      badge: 'CONVERT',
      category: 'Convert to PDF',
      isReady: true,
    },
    {
      id: 'html-to-pdf' as ToolId,
      title: 'HTML to PDF',
      description: 'Convert text and HTML formatting into clean PDF documents.',
      icon: <Code className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
      iconBg: 'bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-900',
      badge: 'CONVERT',
      category: 'Convert to PDF',
      isReady: true,
    },
    {
      id: 'scan-to-pdf' as ToolId,
      title: 'Scan to PDF',
      description: 'Capture physical documents using webcam/camera and compile into PDF.',
      icon: <Camera className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-900',
      badge: 'NEW',
      category: 'Convert to PDF',
      isReady: true,
    },

    // --- 3. CONVERT FROM PDF ---
    {
      id: 'pdf-to-image' as ToolId,
      title: 'PDF to Images',
      description: 'Render and extract all PDF pages into high-DPI PNG or JPG files.',
      icon: <FileImage className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-900',
      badge: 'CONVERT',
      category: 'Convert from PDF',
      isReady: true,
    },
    {
      id: 'pdf-to-word' as ToolId,
      title: 'PDF to Word',
      description: 'Extract PDF text content into editable Word documents (.docx).',
      icon: <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-900',
      badge: 'CONVERT',
      category: 'Convert from PDF',
      isReady: true,
    },
    {
      id: 'ocr-pdf' as ToolId,
      title: 'OCR PDF',
      description: 'Extract selectable text from scanned PDF documents.',
      icon: <ScanText className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      iconBg: 'bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-900',
      badge: 'AI OCR',
      category: 'Convert from PDF',
      isReady: true,
    },
    {
      id: 'pdf-to-pdfa' as ToolId,
      title: 'PDF to PDF/A',
      description: 'Convert PDF to ISO 19005 compliant archival format.',
      icon: <Archive className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-900',
      badge: 'ARCHIVE',
      category: 'Convert from PDF',
      isReady: true,
    },

    // --- 4. EDIT & ANNOTATE ---
    {
      id: 'edit-pdf' as ToolId,
      title: 'Edit PDF',
      description: 'Add text, shapes, and lines overlay on top of PDF pages.',
      icon: <Edit3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      iconBg: 'bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-900',
      badge: 'NEW',
      category: 'Edit',
      isReady: true,
    },
    {
      id: 'crop' as ToolId,
      title: 'Crop PDF',
      description: 'Trim page margins and resize visible area non-destructively.',
      icon: <Crop className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      iconBg: 'bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900',
      badge: 'NEW',
      category: 'Edit',
      isReady: true,
    },
    {
      id: 'page-numbers' as ToolId,
      title: 'Add Page Numbers',
      description: 'Insert customizable page numbers with flexible alignment into PDF.',
      icon: <Hash className="w-6 h-6 text-sky-600 dark:text-sky-400" />,
      iconBg: 'bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-900',
      badge: null,
      category: 'Edit',
      isReady: true,
    },
    {
      id: 'watermark' as ToolId,
      title: 'Add Watermark',
      description: 'Overlay custom text watermarks across every page of your PDF.',
      icon: <Stamp className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
      iconBg: 'bg-violet-50 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-900',
      badge: null,
      category: 'Edit',
      isReady: true,
    },

    // --- 5. SECURITY & UTILITIES ---
    {
      id: 'protect' as ToolId,
      title: 'Protect PDF',
      description: 'Encrypt your PDF with password security to prevent unauthorized access.',
      icon: <Lock className="w-6 h-6 text-slate-700 dark:text-slate-300" />,
      iconBg: 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700',
      badge: 'SECURITY',
      category: 'Security',
      isReady: true,
    },
    {
      id: 'unlock' as ToolId,
      title: 'Unlock PDF',
      description: 'Remove password encryption and security restrictions from your PDF.',
      icon: <Unlock className="w-6 h-6 text-teal-600 dark:text-teal-400" />,
      iconBg: 'bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-900',
      badge: 'SECURITY',
      category: 'Security',
      isReady: true,
    },
    {
      id: 'sign' as ToolId,
      title: 'Sign PDF',
      description: 'Draw or type signature and place it securely on your PDF document.',
      icon: <PenTool className="w-6 h-6 text-blue-600 dark:text-sky-400" />,
      iconBg: 'bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900',
      badge: 'SECURITY',
      category: 'Security',
      isReady: true,
    },
    {
      id: 'redact' as ToolId,
      title: 'Redact PDF',
      description: 'Permanently cover sensitive text or regions with black redaction boxes.',
      icon: <EyeOff className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
      iconBg: 'bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900',
      badge: 'SECURITY',
      category: 'Security',
      isReady: true,
    },
    {
      id: 'compare' as ToolId,
      title: 'Compare PDF',
      description: 'Compare two PDF documents side-by-side to detect structural differences.',
      icon: <GitCompare className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      iconBg: 'bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-900',
      badge: null,
      category: 'Utilities',
      isReady: true,
    },
    {
      id: 'repair' as ToolId,
      title: 'Repair PDF',
      description: 'Fix corrupted PDF files and re-encode clean object streams.',
      icon: <Wrench className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      iconBg: 'bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-900',
      badge: null,
      category: 'Utilities',
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
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border shrink-0 ${
                    item.badge === 'POPULAR'
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-sky-400 border-blue-200 dark:border-blue-900'
                      : item.badge === 'SECURITY'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}>
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
