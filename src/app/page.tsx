'use client';

import React, { useState, useEffect } from 'react';
import Header, { ViewMode } from '@/components/Header';
import ToolGrid, { ToolId } from '@/components/ToolGrid';
import FileDropzone from '@/components/FileDropzone';
import FileCard, { PdfFileItem } from '@/components/FileCard';
import ProcessingProgress from '@/components/ProcessingProgress';
import SplitPdfWorkspace from '@/components/SplitPdfWorkspace';
import ExtractPagesWorkspace from '@/components/ExtractPagesWorkspace';
import OrganizePagesWorkspace from '@/components/OrganizePagesWorkspace';
import ImagesToPdfWorkspace from '@/components/ImagesToPdfWorkspace';
import PdfToImagesWorkspace from '@/components/PdfToImagesWorkspace';
import ProtectPdfWorkspace from '@/components/ProtectPdfWorkspace';
import UnlockPdfWorkspace from '@/components/UnlockPdfWorkspace';
import PageNumbersWorkspace from '@/components/PageNumbersWorkspace';
import WatermarkWorkspace from '@/components/WatermarkWorkspace';
import CropPdfWorkspace from '@/components/CropPdfWorkspace';
import EditPdfWorkspace from '@/components/EditPdfWorkspace';
import ScanToPdfWorkspace from '@/components/ScanToPdfWorkspace';
import SignPdfWorkspace from '@/components/SignPdfWorkspace';
import RedactPdfWorkspace from '@/components/RedactPdfWorkspace';
import ComparePdfWorkspace from '@/components/ComparePdfWorkspace';
import RepairPdfWorkspace from '@/components/RepairPdfWorkspace';
import CompressPdfWorkspace from '@/components/CompressPdfWorkspace';
import HtmlToPdfWorkspace from '@/components/HtmlToPdfWorkspace';
import PdfToPdfAWorkspace from '@/components/PdfToPdfAWorkspace';
import WordToPdfWorkspace from '@/components/WordToPdfWorkspace';
import PdfToWordWorkspace from '@/components/PdfToWordWorkspace';
import OcrPdfWorkspace from '@/components/OcrPdfWorkspace';
import SuccessDownloadScreen from '@/components/SuccessDownloadScreen';

import { validatePdfFile } from '@/lib/files/validateFile';
import { mergePdfFiles } from '@/lib/pdf/mergePdfs';
import { downloadBlob } from '@/lib/files/downloadBlob';
import { formatFileSize } from '@/lib/files/formatFileSize';
import { HumanError } from '@/lib/errors/messages';
import {
  Language,
  translations,
  detectBrowserLanguage,
} from '@/lib/i18n/translations';
import {
  FileStack,
  Trash2,
  AlertCircle,
  X,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

export default function Home() {
  const [activeView, setActiveView] = useState<ViewMode>('grid');
  const [lang, setLang] = useState<Language>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Toggle A-Z / Z-A Sorting
  const handleToggleSort = () => {
    setFiles((prev) =>
      [...prev].sort((a, b) => (sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)))
    );
    setSortAsc(!sortAsc);
  };
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorToast, setErrorToast] = useState<HumanError | null>(null);
  const [completedResult, setCompletedResult] = useState<{
    blob: Blob;
    downloadName: string;
    title: string;
  } | null>(null);

  // Client-side initialization for browser language & theme
  useEffect(() => {
    const detected = detectBrowserLanguage();
    setLang(detected);
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const t = translations[lang];

  // Handle files selected via dropzone or picker
  const handleFilesSelected = async (selectedFiles: File[]) => {
    setErrorToast(null);

    for (const file of selectedFiles) {
      const result = await validatePdfFile(file);

      if (!result.isValid && result.error) {
        setErrorToast(result.error);
        return;
      }

      // Add to file queue
      const newItem: PdfFileItem = {
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        file,
        name: file.name,
        size: file.size,
        pageCount: result.pageCount,
      };

      setFiles((prev) => [...prev, newItem]);
    }
  };

  // Remove file from queue
  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Clear all files
  const handleClearAll = () => {
    setFiles([]);
    setErrorToast(null);
    setCompletedResult(null);
  };

  // Move file up in queue
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const newArr = [...prev];
      const temp = newArr[index - 1];
      newArr[index - 1] = newArr[index];
      newArr[index] = temp;
      return newArr;
    });
  };

  // Move file down in queue
  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const newArr = [...prev];
      const temp = newArr[index + 1];
      newArr[index + 1] = newArr[index];
      newArr[index] = temp;
      return newArr;
    });
  };

  // Calculate totals
  const totalPages = files.reduce((acc, curr) => acc + curr.pageCount, 0);
  const totalSizeBytes = files.reduce((acc, curr) => acc + curr.size, 0);

  // Execute Local PDF Merge
  const handleMergePdfs = async () => {
    if (files.length < 2) {
      setErrorToast({
        type: 'EMPTY_FILE_LIST',
        title: lang === 'en' ? 'Fewer Than 2 Documents' : 'Kurang Dari 2 Dokumen',
        message: lang === 'en' ? 'Please select at least 2 PDF documents to merge.' : 'Pilih minimal 2 dokumen PDF untuk digabungkan.',
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep(0);
    setTotalSteps(files.length);
    setProgressMsg(lang === 'en' ? 'Starting local PDF document merge...' : 'Memulai penggabungan dokumen PDF secara lokal...');

    try {
      const fileObjects = files.map((f) => f.file);
      const mergedBytes = await mergePdfFiles(
        fileObjects,
        (curr, tot, msg) => {
          setCurrentStep(curr);
          setTotalSteps(tot);
          setProgressMsg(msg);
        },
        lang
      );

      // Convert Uint8Array to Blob
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const firstFileName = files[0].name.replace(/\.pdf$/i, '');
      const downloadName = `Kindpdf_${firstFileName}_Merged.pdf`;

      setTimeout(() => {
        setIsProcessing(false);
        setCompletedResult({
          blob,
          downloadName,
          title: lang === 'en' ? 'PDFs have been merged!' : 'PDF Anda telah berhasil digabungkan!',
        });
      }, 400);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorToast({
        type: 'CORRUPTED',
        title: lang === 'en' ? 'Failed to Merge PDF' : 'Gagal Menggabungkan PDF',
        message: err?.message || 'Unexpected error occurred while processing documents.',
      });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col text-[#0A1128] dark:text-white overflow-x-hidden">
      {/* Quest Ambient Cyan / Energy Overlay */}
      <div className="quest-ambient-energy" aria-hidden="true" />

      {/* Header Bar */}
      <Header
        onViewChange={setActiveView}
        lang={lang}
        onLangChange={setLang}
        t={t}
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
      />

      {/* Main Workspace */}
      <main className="relative z-10 workspace-stage flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* VIEW MODE 1: GRID LANDING PAGE */}
        {activeView === 'grid' && (
          <div className="space-y-6">
            {/* Main Landing Hero */}
            <div className="text-center space-y-3 py-3 sm:py-5 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.60] dark:bg-white/[0.07] border border-black/[0.08] dark:border-white/[0.16] backdrop-blur-xl text-[11px] font-semibold text-[#0A1128]/75 dark:text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.20)]">
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.85} />
                <span>{t.noServerUpload} • {t.localProcessing}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0A1128] dark:text-white leading-tight">
                {t.heroTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#0A1128]/65 dark:text-white/60 font-normal leading-relaxed max-w-xl mx-auto">
                {t.heroSubtitle}
              </p>
            </div>

            {/* Tool Grid Cards */}
            <ToolGrid onSelectTool={(toolId: ToolId) => setActiveView(toolId)} t={t} />
          </div>
        )}

        {/* VIEW MODE 2: MERGE PDF WORKSPACE */}
        {activeView === 'merge' &&
          (completedResult ? (
            <SuccessDownloadScreen
              title={completedResult.title}
              downloadFileName={completedResult.downloadName}
              onDownload={(customName?: string) =>
                downloadBlob(completedResult.blob, customName || completedResult.downloadName)
              }
              onStartOver={() => {
                setCompletedResult(null);
                setFiles([]);
              }}
              onSelectTool={(toolId: ViewMode) => {
                setCompletedResult(null);
                setActiveView(toolId);
              }}
              t={t}
              lang={lang}
            />
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
            {/* Top Toolbar Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveView('grid')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-extrabold btn-press-effect"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.backToAllTools}</span>
              </button>

              {/* Top Action Buttons when files selected */}
              {files.length > 0 && (
                <div className="flex items-center gap-2">
                  {/* Floating Add More Files Button */}
                  <label className="relative cursor-pointer px-3.5 py-1.5 rounded-full glass-cta text-xs font-bold flex items-center gap-1.5 btn-press-effect">
                    <span className="text-sm font-bold">+</span>
                    <span className="hidden sm:inline">{lang === 'en' ? 'Add PDF' : 'Tambah PDF'}</span>
                    <span className="w-5 h-5 rounded-full bg-white/20 dark:bg-black/15 text-[10px] font-bold flex items-center justify-center">
                      {files.length}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFilesSelected(Array.from(e.target.files));
                        }
                      }}
                    />
                  </label>

                  {/* Sort A-Z / Z-A Toggle Button */}
                  <button
                    type="button"
                    title={sortAsc ? (lang === 'en' ? 'Sort A to Z' : 'Urutkan A ke Z') : (lang === 'en' ? 'Sort Z to A' : 'Urutkan Z ke A')}
                    onClick={handleToggleSort}
                    className="px-3 py-1.5 rounded-full glass-pill text-xs font-black btn-press-effect flex items-center gap-1"
                  >
                    <span>{sortAsc ? 'A-Z' : 'Z-A'}</span>
                  </button>

                  {/* Clear All */}
                  <button
                    type="button"
                    onClick={handleClearAll}
                    title={t.clearAll}
                    className="p-2 rounded-full text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-colors btn-press-effect"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Error Toast Banner */}
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

            {/* Initial Hero & Big Dropzone (Only shown when NO files selected) */}
            {files.length === 0 && (
              <>
                <div className="text-center space-y-2 py-2 max-w-lg mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1128] dark:text-white">
                    {t.mergeHeroTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#0A1128]/65 dark:text-white/60 font-normal leading-relaxed">
                    {t.mergeHeroSubtitle}
                  </p>
                </div>
                <FileDropzone onFilesSelected={handleFilesSelected} disabled={isProcessing} t={t} colorTheme="blue" />
              </>
            )}

            {/* Minimalist Selected Documents View (When files selected) */}
            {files.length > 0 && (
              <div className="space-y-4">
                {/* File Count Summary Sub-bar */}
                <div className="flex items-center justify-between text-xs font-semibold text-[#0A1128]/70 dark:text-white/70 px-1">
                  <span>
                    {files.length} {t.documentsCount} • {totalPages} {t.pagesTotal} ({formatFileSize(totalSizeBytes)})
                  </span>
                </div>

                {/* Document Cards List */}
                <div className="space-y-3.5 sm:space-y-4">
                  {files.map((item, index) => (
                    <FileCard
                      key={item.id}
                      item={item}
                      index={index}
                      totalItems={files.length}
                      onRemove={handleRemoveFile}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                    />
                  ))}
                </div>

                {/* Clean Sticky/Bottom Action Bar */}
                <div className="pt-4 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleMergePdfs}
                    disabled={files.length < 2 || isProcessing}
                    className={`w-full sm:w-auto min-w-[240px] px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 btn-press-effect ${
                      files.length >= 2 && !isProcessing
                        ? 'glass-cta'
                        : 'bg-black/[0.08] dark:bg-white/[0.08] text-[#0A1128]/35 dark:text-white/35 border border-black/[0.06] dark:border-white/[0.10] cursor-not-allowed shadow-none'
                    }`}
                  >
                    <span>{t.mergeNow}</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* VIEW MODE 3: SPLIT PDF WORKSPACE */}
        {activeView === 'split' && (
          <SplitPdfWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 4: EXTRACT PAGES WORKSPACE */}
        {activeView === 'extract' && (
          <ExtractPagesWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 5: ORGANIZE PAGES WORKSPACE */}
        {activeView === 'organize' && (
          <OrganizePagesWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 6: IMAGES TO PDF WORKSPACE */}
        {activeView === 'image-to-pdf' && (
          <ImagesToPdfWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 7: PDF TO IMAGES WORKSPACE */}
        {activeView === 'pdf-to-image' && (
          <PdfToImagesWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 8: PROTECT PDF WORKSPACE */}
        {activeView === 'protect' && (
          <ProtectPdfWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 9: UNLOCK PDF WORKSPACE */}
        {activeView === 'unlock' && (
          <UnlockPdfWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 10: PAGE NUMBERS WORKSPACE */}
        {activeView === 'page-numbers' && (
          <PageNumbersWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 11: WATERMARK WORKSPACE */}
        {activeView === 'watermark' && (
          <WatermarkWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 12: CROP PDF WORKSPACE */}
        {activeView === 'crop' && (
          <CropPdfWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 13: EDIT PDF WORKSPACE */}
        {activeView === 'edit-pdf' && (
          <EditPdfWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 14: SCAN TO PDF WORKSPACE */}
        {activeView === 'scan-to-pdf' && (
          <ScanToPdfWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 15: SIGN PDF WORKSPACE */}
        {activeView === 'sign' && (
          <SignPdfWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 16: REDACT PDF WORKSPACE */}
        {activeView === 'redact' && (
          <RedactPdfWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 17: COMPARE PDF WORKSPACE */}
        {activeView === 'compare' && (
          <ComparePdfWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 18: REPAIR PDF WORKSPACE */}
        {activeView === 'repair' && (
          <RepairPdfWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 19: COMPRESS PDF WORKSPACE */}
        {activeView === 'compress' && (
          <CompressPdfWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 20: HTML TO PDF WORKSPACE */}
        {activeView === 'html-to-pdf' && (
          <HtmlToPdfWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 21: PDF TO PDF/A WORKSPACE */}
        {activeView === 'pdf-to-pdfa' && (
          <PdfToPdfAWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 22: WORD TO PDF WORKSPACE */}
        {activeView === 'word-to-pdf' && (
          <WordToPdfWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 23: PDF TO WORD WORKSPACE */}
        {activeView === 'pdf-to-word' && (
          <PdfToWordWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}

        {/* VIEW MODE 24: OCR PDF WORKSPACE */}
        {activeView === 'ocr-pdf' && (
          <OcrPdfWorkspace
            onBack={() => setActiveView('grid')}
            onSelectTool={(toolId) => setActiveView(toolId)}
            t={t}
            lang={lang}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-black/[0.07] dark:border-white/[0.10] bg-white/[0.35] dark:bg-[#071124]/55 backdrop-blur-xl py-6 mt-12 text-center text-xs font-medium text-[#0A1128]/60 dark:text-white/55 space-y-1.5">
        <p className="font-bold text-[#0A1128] dark:text-white tracking-tight">
          Kind<span className="font-medium text-[#0A1128]/55 dark:text-white/60">PDF</span> — Privacy-First PDF Tools v1.0.0
        </p>
        <p className="text-[11px] text-[#0A1128]/60 dark:text-white/55">
          Built with Next.js 14, TypeScript &amp; Tailwind CSS by{' '}
          <span className="font-semibold text-[#0A1128] dark:text-white/90">Yaser Arafat</span>.
        </p>
        <p className="text-[10px] text-[#0A1128]/45 dark:text-white/40">
          Process documents 100% locally inside your web browser. Zero &apos;eval()&apos;, 100% Local-First.
        </p>
      </footer>

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
}
