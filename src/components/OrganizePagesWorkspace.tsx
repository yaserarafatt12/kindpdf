'use client';

import React, { useState } from 'react';
import { TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { organizePdfDocument } from '@/lib/pdf/organizePages';
import { downloadBlob } from '@/lib/files/downloadBlob';
import { formatFileSize } from '@/lib/files/formatFileSize';
import ProcessingProgress from './ProcessingProgress';
import FileDropzone from './FileDropzone';
import {
  LayoutGrid,
  UploadCloud,
  FileText,
  Trash2,
  AlertCircle,
  X,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  RotateCw,
  MoveLeft,
  MoveRight,
  RefreshCw,
} from 'lucide-react';

import SuccessDownloadScreen from './SuccessDownloadScreen';
import { ViewMode } from '@/components/Header';

interface PageCardItem {
  id: string;
  originalPageNumber: number; // 1-indexed
  rotation: number;           // 0, 90, 180, 270
}

interface OrganizePagesWorkspaceProps {
  onBack: () => void;
  onSelectTool?: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: 'en' | 'id';
  mode?: 'organize' | 'remove';
}

export const OrganizePagesWorkspace: React.FC<OrganizePagesWorkspaceProps> = ({
  onBack,
  onSelectTool,
  t,
  lang,
  mode = 'organize',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [pages, setPages] = useState<PageCardItem[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [organizeResult, setOrganizeResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorToast, setErrorToast] = useState<{ title: string; message: string } | null>(null);

  const handleFileChange = async (selectedFiles: File[]) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setErrorToast(null);

    const targetFile = selectedFiles[0];
    const validation = await validatePdfFile(targetFile);

    if (!validation.isValid && validation.error) {
      setErrorToast({
        title: validation.error.title,
        message: validation.error.message,
      });
      return;
    }

    setFile(targetFile);
    setPageCount(validation.pageCount);

    // Populate initial page card items
    const initialPages: PageCardItem[] = [];
    for (let i = 1; i <= validation.pageCount; i++) {
      initialPages.push({
        id: `page-${i}`,
        originalPageNumber: i,
        rotation: 0,
      });
    }
    setPages(initialPages);
  };

  const handleRotatePage = (index: number) => {
    setPages((prev) => {
      const next = [...prev];
      const currentRot = next[index].rotation;
      next[index] = {
        ...next[index],
        rotation: (currentRot + 90) % 360,
      };
      return next;
    });
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    setPages((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveRight = (index: number) => {
    if (index === pages.length - 1) return;
    setPages((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleRemovePage = (index: number) => {
    if (pages.length <= 1) {
      setErrorToast({
        title: lang === 'en' ? 'Cannot Delete Last Page' : 'Tidak Bisa Menghapus Halaman Terakhir',
        message: lang === 'en' ? 'A PDF document must have at least one page.' : 'Dokumen PDF harus memiliki minimal satu halaman.',
      });
      return;
    }
    setPages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetPages = () => {
    if (!file || pageCount === 0) return;
    const resetList: PageCardItem[] = [];
    for (let i = 1; i <= pageCount; i++) {
      resetList.push({
        id: `page-${i}`,
        originalPageNumber: i,
        rotation: 0,
      });
    }
    setPages(resetList);
  };

  const handleExecuteOrganize = async () => {
    if (!file || pages.length === 0) return;
    setErrorToast(null);

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(3);
    setProgressMsg(lang === 'en' ? 'Organizing PDF pages...' : 'Mengatur halaman PDF...');

    try {
      const pageOrder = pages.map((p) => p.originalPageNumber);
      const rotations: Record<number, number> = {};
      pages.forEach((p) => {
        if (p.rotation !== 0) rotations[p.originalPageNumber] = p.rotation;
      });

      const result = await organizePdfDocument(
        file,
        { pageOrder, rotations },
        (curr, tot, msg) => {
          setCurrentStep(curr);
          setTotalSteps(tot);
          setProgressMsg(msg);
        }
      );

      setIsProcessing(false);
      setOrganizeResult({
        blob: result.blob,
        filename: result.filename,
      });
    } catch (err: any) {
      setIsProcessing(false);
      setErrorToast({
        title: lang === 'en' ? 'Organize Failed' : 'Gagal Mengatur PDF',
        message: err?.message || 'Unexpected error while organizing document.',
      });
    }
  };

  if (organizeResult) {
    return (
      <SuccessDownloadScreen
        title={lang === 'en' ? 'PDF Organized Successfully!' : 'PDF Berhasil Diatur!'}
        downloadFileName={organizeResult.filename}
        downloadButtonText={lang === 'en' ? 'Download Organized PDF' : 'Unduh PDF Terorganisasi'}
        onDownload={(customName?: string) =>
          downloadBlob(organizeResult.blob, customName || organizeResult.filename)
        }
        onStartOver={() => {
          setOrganizeResult(null);
          setFile(null);
          setPageCount(0);
          setPages([]);
        }}
        onSelectTool={(toolId: ViewMode) => {
          setOrganizeResult(null);
          setFile(null);
          if (onSelectTool) onSelectTool(toolId);
        }}
        t={t}
        lang={lang}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 transition-colors btn-press-effect"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.backToAllTools}</span>
      </button>

      {/* Hero Header */}
      <div className="text-center space-y-2 py-2 max-w-lg mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {mode === 'remove'
            ? lang === 'en' ? 'Remove PDF Pages' : 'Hapus Halaman PDF'
            : lang === 'en' ? 'Organize & Rotate Pages' : 'Atur & Putar Halaman'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'en'
            ? 'Rotate, reorder, or delete pages visually inside your PDF document.'
            : 'Putar, atur ulang urutan, atau hapus halaman secara visual pada dokumen PDF Anda.'}
        </p>
      </div>

      {/* Error Toast */}
      {errorToast && (
        <div className="w-full p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start justify-between gap-3 shadow-md animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold">{errorToast.title}</h4>
              <p className="text-xs font-medium text-rose-700 dark:text-rose-300 mt-0.5">
                {errorToast.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setErrorToast(null)}
            className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
          >
            <X className="w-4 h-4 text-rose-500" />
          </button>
        </div>
      )}

      {/* Upload CTA or Workspace */}
      {!file ? (
        <FileDropzone onFilesSelected={handleFileChange} disabled={isProcessing} t={t} colorTheme="purple" />
      ) : (
        <div className="space-y-6">
          {/* File Toolbar Header */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {file.name}
                </h4>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {pages.length} / {pageCount} {lang === 'en' ? 'Pages Kept' : 'Halaman Disimpan'} • {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetPages}
                className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1.5 btn-press-effect"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Reset' : 'Reset'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPageCount(0);
                  setPages([]);
                }}
                className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors btn-press-effect"
                title="Remove File"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Page Thumbnails Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {pages.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm flex flex-col items-center justify-between gap-3 group hover:border-purple-500 transition-all relative"
              >
                {/* Visual Thumbnail Frame */}
                <div
                  className="w-full aspect-[3/4] rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-2 transition-transform duration-200"
                  style={{ transform: `rotate(${item.rotation}deg)` }}
                >
                  <FileText className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 mt-2">
                    {lang === 'en' ? 'Page' : 'Hal'} {item.originalPageNumber}
                  </span>
                </div>

                {/* Page Action Controls */}
                <div className="w-full flex items-center justify-between gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleMoveLeft(idx)}
                      disabled={idx === 0}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                      title="Move Left"
                    >
                      <MoveLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveRight(idx)}
                      disabled={idx === pages.length - 1}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                      title="Move Right"
                    >
                      <MoveRight className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleRotatePage(idx)}
                      className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/50 text-purple-600 dark:text-purple-400 transition-colors"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemovePage(idx)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 transition-colors"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Position Index Badge */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[9px] font-extrabold shadow-sm">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>

          {/* Action CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t.ramProcessing}</span>
            </div>

            <button
              type="button"
              onClick={handleExecuteOrganize}
              disabled={isProcessing || pages.length === 0}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-black text-sm shadow-xl shadow-purple-500/30 transition-all btn-press-effect flex items-center justify-center gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>{lang === 'en' ? 'Save & Download Organized PDF' : 'Simpan & Unduh PDF Organisasi'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      <ProcessingProgress
        isOpen={isProcessing}
        progressMessage={progressMsg}
        currentStep={currentStep}
        totalSteps={totalSteps}
        t={t}
      />
    </div>
  );
};

export default OrganizePagesWorkspace;
