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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorToast, setErrorToast] = useState<HumanError | null>(null);

  // Client-side initialization for browser language & theme
  useEffect(() => {
    const detected = detectBrowserLanguage();
    setLang(detected);
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
      const mergedBytes = await mergePdfFiles(fileObjects, (curr, tot, msg) => {
        setCurrentStep(curr);
        setTotalSteps(tot);
        setProgressMsg(msg);
      });

      // Convert Uint8Array to Blob and download
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const firstFileName = files[0].name.replace(/\.pdf$/i, '');
      const downloadName = `Kindpdf_${firstFileName}_Merged.pdf`;

      downloadBlob(blob, downloadName);

      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
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
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
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
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:py-6 space-y-4">
        {/* VIEW MODE 1: GRID LANDING PAGE */}
        {activeView === 'grid' && (
          <div className="space-y-4">
            {/* Main Landing Hero - Compact */}
            <div className="text-center space-y-1.5 py-2 sm:py-4 max-w-2xl mx-auto">
              <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-200 leading-snug">
                {t.heroTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {t.heroSubtitle}
              </p>
            </div>

            {/* Tool Grid Cards */}
            <ToolGrid onSelectTool={(toolId: ToolId) => setActiveView(toolId)} t={t} />
          </div>
        )}

        {/* VIEW MODE 2: MERGE PDF WORKSPACE */}
        {activeView === 'merge' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setActiveView('grid')}
              className="inline-flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 transition-colors btn-press-effect"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.backToAllTools}</span>
            </button>

            {/* Merge Hero Section */}
            <div className="text-center space-y-2 py-2 max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {t.mergeHeroTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                {t.mergeHeroSubtitle}
              </p>
            </div>

            {/* Error Toast Banner */}
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

            {/* Dropzone Upload Section */}
            <FileDropzone onFilesSelected={handleFilesSelected} disabled={isProcessing} t={t} />

            {/* Selected Documents Workspace */}
            {files.length > 0 && (
              <div className="space-y-4 pt-2">
                {/* Header Toolbar Summary */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-black">
                        {files.length} {t.documentsCount}
                      </span>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        • {totalPages} {t.pagesTotal}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      {t.totalSize}: {formatFileSize(totalSizeBytes)} ({t.reorderHint})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center gap-1.5 btn-press-effect"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.clearAll}</span>
                    </button>
                  </div>
                </div>

                {/* Document Queue List */}
                <div className="space-y-2.5">
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

                {/* Merge Action CTA Bar */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{t.ramProcessing}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleMergePdfs}
                    disabled={files.length < 2 || isProcessing}
                    className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-xl transition-all duration-200 btn-press-effect ${
                      files.length >= 2 && !isProcessing
                        ? 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-blue-500/30 scale-[1.02]'
                        : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <FileStack className="w-4 h-4" />
                    <span>{t.mergeNow}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW MODE 3: SPLIT PDF WORKSPACE */}
        {activeView === 'split' && (
          <SplitPdfWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 4: EXTRACT PAGES WORKSPACE */}
        {activeView === 'extract' && (
          <ExtractPagesWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 5: ORGANIZE PAGES WORKSPACE */}
        {activeView === 'organize' && (
          <OrganizePagesWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 6: IMAGES TO PDF WORKSPACE */}
        {activeView === 'image-to-pdf' && (
          <ImagesToPdfWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 7: PDF TO IMAGES WORKSPACE */}
        {activeView === 'pdf-to-image' && (
          <PdfToImagesWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 8: PROTECT PDF WORKSPACE */}
        {activeView === 'protect' && (
          <ProtectPdfWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 9: UNLOCK PDF WORKSPACE */}
        {activeView === 'unlock' && (
          <UnlockPdfWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 10: PAGE NUMBERS WORKSPACE */}
        {activeView === 'page-numbers' && (
          <PageNumbersWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 11: WATERMARK WORKSPACE */}
        {activeView === 'watermark' && (
          <WatermarkWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 12: CROP PDF WORKSPACE */}
        {activeView === 'crop' && (
          <CropPdfWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 13: EDIT PDF WORKSPACE */}
        {activeView === 'edit-pdf' && (
          <EditPdfWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 14: SCAN TO PDF WORKSPACE */}
        {activeView === 'scan-to-pdf' && (
          <ScanToPdfWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 15: SIGN PDF WORKSPACE */}
        {activeView === 'sign' && (
          <SignPdfWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 16: REDACT PDF WORKSPACE */}
        {activeView === 'redact' && (
          <RedactPdfWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 17: COMPARE PDF WORKSPACE */}
        {activeView === 'compare' && (
          <ComparePdfWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 18: REPAIR PDF WORKSPACE */}
        {activeView === 'repair' && (
          <RepairPdfWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 19: COMPRESS PDF WORKSPACE */}
        {activeView === 'compress' && (
          <CompressPdfWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 20: HTML TO PDF WORKSPACE */}
        {activeView === 'html-to-pdf' && (
          <HtmlToPdfWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}

        {/* VIEW MODE 21: PDF TO PDF/A WORKSPACE */}
        {activeView === 'pdf-to-pdfa' && (
          <PdfToPdfAWorkspace onBack={() => setActiveView('grid')} t={t} lang={lang} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-300 dark:border-slate-800 py-6 mt-12 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 space-y-1">
        <p className="font-black text-slate-900 dark:text-white">
          Kind<span className="text-blue-600 dark:text-sky-400">pdf</span> — Privacy-First PDF Tools
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-500">
          Process documents locally inside your web browser. 100% Zero-Server Upload.
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
