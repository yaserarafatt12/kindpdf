'use client';

import React, { useState, useEffect } from 'react';
import { TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { organizePdfDocument } from '@/lib/pdf/organizePages';
import { loadPdfJs } from '@/lib/pdf/pdfjsWorker';
import { downloadBlob } from '@/lib/files/downloadBlob';
import { formatFileSize } from '@/lib/files/formatFileSize';
import ProcessingProgress from './ProcessingProgress';
import FileDropzone from './FileDropzone';
import {
  LayoutGrid,
  FileText,
  Trash2,
  AlertCircle,
  X,
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
  const [organizeResult, setOrganizeResult] = useState<{ blob: Blob; filename: string } | null>(
    null
  );
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
    setThumbnails({});

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

  // Render page thumbnails via local pdfjs-dist worker
  useEffect(() => {
    if (!file || pageCount === 0) return;
    let active = true;

    const renderThumbnails = async () => {
      try {
        const pdfjsLib = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfjsDoc = await loadingTask.promise;

        for (let i = 1; i <= Math.min(pageCount, 60); i++) {
          if (!active) break;
          try {
            const page = await pdfjsDoc.getPage(i);
            const viewport = page.getViewport({ scale: 0.25 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              await page.render({ canvasContext: ctx, viewport }).promise;
              const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
              if (active) {
                setThumbnails((prev) => ({ ...prev, [i]: dataUrl }));
              }
            }
          } catch (e) {
            console.warn(`Error rendering thumbnail for page ${i}:`, e);
          }
        }
      } catch (err) {
        console.warn('Thumbnail generation fallback:', err);
      }
    };

    renderThumbnails();
    return () => {
      active = false;
    };
  }, [file, pageCount]);

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
        title:
          lang === 'en' ? 'Cannot Delete Last Page' : 'Tidak Bisa Menghapus Halaman Terakhir',
        message:
          lang === 'en'
            ? 'A PDF document must have at least one page.'
            : 'Dokumen PDF harus memiliki minimal satu halaman.',
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

      const result = await organizePdfDocument(file, { pageOrder, rotations }, (curr, tot, msg) => {
        setCurrentStep(curr);
        setTotalSteps(tot);
        setProgressMsg(msg);
      });

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
          setThumbnails({});
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
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-extrabold btn-press-effect"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.backToAllTools}</span>
      </button>

      {/* Hero Header */}
      <div className="text-center space-y-2 py-2 max-w-lg mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1128] dark:text-white">
          {mode === 'remove'
            ? lang === 'en'
              ? 'Remove PDF Pages'
              : 'Hapus Halaman PDF'
            : lang === 'en'
              ? 'Organize PDF Pages'
              : 'Atur & Urutkan Halaman PDF'}
        </h2>
        <p className="text-xs sm:text-sm text-[#0A1128]/65 dark:text-white/60 font-normal leading-relaxed">
          {lang === 'en'
            ? 'Rotate, reorder, or delete pages visually inside your PDF document.'
            : 'Putar, atur ulang urutan, atau hapus halaman secara visual pada dokumen PDF Anda.'}
        </p>
      </div>

      {/* Error Toast */}
      {errorToast && (
        <div className="w-full p-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/70 backdrop-blur-xl border border-rose-200 dark:border-rose-500/35 text-rose-900 dark:text-rose-200 flex items-start justify-between gap-3 shadow-lg animate-fade-in">
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
        <FileDropzone
          onFilesSelected={handleFileChange}
          disabled={isProcessing}
          t={t}
          multiple={false}
        />
      ) : (
        <div className="space-y-6">
          {/* File Toolbar Header */}
          <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="relative z-10 flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.18] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#0A1128]/80 dark:text-white/85" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-[#0A1128] dark:text-white truncate">
                  {file.name}
                </h4>
                <p className="text-[11px] font-medium text-[#0A1128]/60 dark:text-white/55">
                  {pages.length} / {pageCount} {lang === 'en' ? 'Pages Kept' : 'Halaman Disimpan'} •{' '}
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetPages}
                className="px-3.5 py-1.5 rounded-full glass-pill text-xs font-bold flex items-center gap-1.5 btn-press-effect"
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
                  setThumbnails({});
                }}
                className="p-2 rounded-full text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 transition-colors btn-press-effect"
                title="Remove File"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Page Thumbnails Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {pages.map((item, idx) => {
              const thumbData = thumbnails[item.originalPageNumber];
              return (
                <div
                  key={item.id}
                  className="glass-card p-3 rounded-2xl flex flex-col items-center justify-between gap-3 group relative"
                >
                  {/* Visual Thumbnail Frame */}
                  <div className="relative z-10 w-full aspect-[3/4] rounded-xl bg-white dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.14] flex flex-col items-center justify-center overflow-hidden p-1.5">
                    {thumbData ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbData}
                        alt={`Page ${item.originalPageNumber}`}
                        className="w-full h-full object-contain transition-transform duration-200"
                        style={{ transform: `rotate(${item.rotation}deg)` }}
                      />
                    ) : (
                      <div
                        className="flex flex-col items-center justify-center transition-transform duration-200"
                        style={{ transform: `rotate(${item.rotation}deg)` }}
                      >
                        <FileText className="w-8 h-8 text-[#0A1128]/40 dark:text-white/45" />
                        <span className="text-[10px] font-bold text-[#0A1128]/60 dark:text-white/60 mt-2">
                          {lang === 'en' ? 'Page' : 'Hal'} {item.originalPageNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Page Action Controls */}
                  <div className="relative z-10 w-full flex items-center justify-between gap-1 pt-1 border-t border-black/[0.06] dark:border-white/[0.10]">
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveLeft(idx)}
                        disabled={idx === 0}
                        className="p-1 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/10 disabled:opacity-25 transition-colors"
                        title="Move Left"
                      >
                        <MoveLeft className="w-3.5 h-3.5 text-[#0A1128]/70 dark:text-white/75" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveRight(idx)}
                        disabled={idx === pages.length - 1}
                        className="p-1 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/10 disabled:opacity-25 transition-colors"
                        title="Move Right"
                      >
                        <MoveRight className="w-3.5 h-3.5 text-[#0A1128]/70 dark:text-white/75" />
                      </button>
                    </div>

                    <span className="text-[10px] font-bold text-[#0A1128]/65 dark:text-white/65">
                      P.{item.originalPageNumber}
                    </span>

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleRotatePage(idx)}
                        className="p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/10 text-[#0A1128] dark:text-white transition-colors"
                        title="Rotate 90°"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemovePage(idx)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/15 text-rose-500 transition-colors"
                        title="Delete Page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Position Index Badge */}
                  <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-md bg-[#0A1128]/85 text-white text-[9px] font-bold shadow-sm">
                    #{idx + 1}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Action CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-[#0A1128]/65 dark:text-white/60">
              <ShieldCheck className="w-4 h-4 text-[#0A1128] dark:text-white shrink-0" />
              <span>{t.ramProcessing}</span>
            </div>

            <button
              type="button"
              onClick={handleExecuteOrganize}
              disabled={isProcessing || pages.length === 0}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glass-cta font-bold text-sm transition-all btn-press-effect flex items-center justify-center gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>
                {lang === 'en'
                  ? 'Save & Download Organized PDF'
                  : 'Simpan & Unduh PDF Organisasi'}
              </span>
            </button>
          </div>
        </div>
      )}

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
