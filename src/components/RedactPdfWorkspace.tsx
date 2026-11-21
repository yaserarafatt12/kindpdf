'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  EyeOff,
  Plus,
  Trash2,
  ShieldCheck,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { downloadBlob } from '@/lib/files/downloadBlob';
import FileDropzone from './FileDropzone';
import PrivacyNotice from './PrivacyNotice';
import { redactPdf, RedactRegion } from '@/lib/pdf/redactPdf';
import { renderPdfPagePreview } from '@/lib/pdf/pdfjsWorker';
import { HumanError } from '@/lib/errors/messages';
import ProcessingProgress from './ProcessingProgress';
import SuccessDownloadScreen from './SuccessDownloadScreen';
import { ViewMode } from '@/components/Header';

interface RedactPdfWorkspaceProps {
  onBack: () => void;
  onSelectTool?: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: Language;
}

export const RedactPdfWorkspace: React.FC<RedactPdfWorkspaceProps> = ({
  onBack,
  onSelectTool,
  t,
  lang,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorToast, setErrorToast] = useState<HumanError | null>(null);
  const [completedResult, setCompletedResult] = useState<{
    blob: Blob;
    filename: string;
  } | null>(null);

  const [regions, setRegions] = useState<RedactRegion[]>([]);
  const [targetPage, setTargetPage] = useState(1);
  const [pagePreviewUrl, setPagePreviewUrl] = useState<string | null>(null);

  const handleFileSelected = async (files: File[]) => {
    setErrorToast(null);
    if (files.length === 0) return;

    const selected = files[0];
    const result = await validatePdfFile(selected);

    if (!result.isValid && result.error) {
      setErrorToast(result.error);
      return;
    }

    setFile(selected);
    setPageCount(result.pageCount);
    setTargetPage(1);
  };

  useEffect(() => {
    if (!file || pageCount === 0) {
      setPagePreviewUrl(null);
      return;
    }
    let active = true;
    renderPdfPagePreview(file, targetPage, 1.0).then((res) => {
      if (active) setPagePreviewUrl(res?.dataUrl || null);
    });
    return () => {
      active = false;
    };
  }, [file, pageCount, targetPage]);

  const handleAddRegion = (customX = 15, customY = 15) => {
    const newRegion: RedactRegion = {
      pageIndex: targetPage - 1,
      x: customX,
      y: customY,
      width: 40,
      height: 12,
    };
    setRegions((prev) => [...prev, newRegion]);
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(80, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const clickY = Math.max(0, Math.min(88, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    handleAddRegion(clickX, clickY);
  };

  const handleRemoveRegion = (index: number) => {
    setRegions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRegion = (index: number, updates: Partial<RedactRegion>) => {
    setRegions((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...updates } : r))
    );
  };

  const handleRedact = async () => {
    if (!file) return;
    if (regions.length === 0) {
      setErrorToast({
        type: 'EMPTY_FILE_LIST',
        title: lang === 'en' ? 'No Areas Selected' : 'Belum Ada Area Pilihan',
        message:
          lang === 'en'
            ? 'Add at least one blackout box.'
            : 'Tambahkan minimal satu kotak blackout.',
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(2);
    setProgressMsg(
      lang === 'en'
        ? 'Applying visual blackout boxes to PDF...'
        : 'Menerapkan kotak blackout ke PDF...'
    );
    setErrorToast(null);

    try {
      const redactedBytes = await redactPdf(file, regions);
      const blob = new Blob([redactedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.pdf$/i, '');
      const filename = `Kindpdf_${baseName}_Redacted.pdf`;

      setCurrentStep(2);
      setTotalSteps(2);

      setIsProcessing(false);
      setCompletedResult({
        blob,
        filename,
      });
    } catch (err: any) {
      setIsProcessing(false);
      setErrorToast({
        type: 'CORRUPTED',
        title: lang === 'en' ? 'Blackout Failed' : 'Gagal Melakukan Blackout',
        message: err?.message || 'Unexpected error redacting file.',
      });
    }
  };

  if (completedResult) {
    return (
      <SuccessDownloadScreen
        title={lang === 'en' ? 'PDF Blackout Applied!' : 'Visual Blackout PDF Berhasil!'}
        downloadFileName={completedResult.filename}
        downloadButtonText={lang === 'en' ? 'Download Redacted PDF' : 'Unduh PDF Hasil Blackout'}
        onDownload={(customName?: string) =>
          downloadBlob(completedResult.blob, customName || completedResult.filename)
        }
        onStartOver={() => {
          setCompletedResult(null);
          setFile(null);
          setPageCount(0);
          setRegions([]);
        }}
        onSelectTool={(toolId: ViewMode) => {
          setCompletedResult(null);
          setFile(null);
          if (onSelectTool) onSelectTool(toolId);
        }}
        t={t}
        lang={lang}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
          Visual Blackout
        </h2>
        <p className="text-xs sm:text-sm text-[#0A1128]/65 dark:text-white/60 font-normal leading-relaxed">
          {lang === 'en'
            ? 'Cover sensitive regions visually with solid black boxes directly inside your browser.'
            : 'Tutupi area sensitif secara visual dengan kotak hitam solid langsung di peramban Anda.'}
        </p>
      </div>

      {/* Transparency Warning Callout */}
      <div className="glass-card p-3.5 rounded-2xl border border-amber-500/30 text-xs text-[#0A1128]/80 dark:text-white/80 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {lang === 'en'
            ? 'Visual overlay only: draws solid black rectangles over target page regions. Underlying vector text streams may still exist unless flattened to raster images.'
            : 'Visual overlay: menggambar kotak hitam solid di atas area halaman. Stream teks vektor di bawahnya mungkin masih ada kecuali diratakan menjadi gambar raster.'}
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

      {/* Upload File */}
      {!file && (
        <FileDropzone
          onFilesSelected={handleFileSelected}
          disabled={isProcessing}
          t={t}
          multiple={false}
        />
      )}

      {/* Redaction Controls */}
      {file && (
        <div className="space-y-5">
          {/* File Card */}
          <div className="glass-card p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3 min-w-0">
            <div className="relative z-10 min-w-0 flex-1">
              <p className="text-sm font-bold text-[#0A1128] dark:text-white truncate">
                {file.name}
              </p>
              <p className="text-xs text-[#0A1128]/60 dark:text-white/55 font-medium truncate">
                {pageCount} {lang === 'en' ? 'pages' : 'halaman'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setRegions([]);
              }}
              className="relative z-10 text-xs font-bold text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 btn-press-effect shrink-0"
            >
              {lang === 'en' ? 'Change File' : 'Ganti File'}
            </button>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-5">
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
              {/* Page Selector Pill */}
              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full glass-pill text-xs font-bold">
                <button
                  type="button"
                  disabled={targetPage <= 1}
                  onClick={() => setTargetPage((p) => Math.max(1, p - 1))}
                  className="p-0.5 disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-1">
                  {lang === 'en' ? 'Page' : 'Hal'} {targetPage} / {pageCount}
                </span>
                <button
                  type="button"
                  disabled={targetPage >= pageCount}
                  onClick={() => setTargetPage((p) => Math.min(pageCount, p + 1))}
                  className="p-0.5 disabled:opacity-30"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleAddRegion()}
                className="px-4 py-2 rounded-full glass-cta text-xs font-bold flex items-center gap-1.5 btn-press-effect"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Add Blackout Box' : 'Tambah Kotak Blackout'}</span>
              </button>
            </div>

            {/* Interactive Live Page Preview */}
            {pagePreviewUrl && (
              <div className="relative z-10 space-y-1.5">
                <p className="text-[11px] font-medium text-[#0A1128]/60 dark:text-white/55 text-center">
                  {lang === 'en'
                    ? 'Click anywhere on the page preview below to add a blackout box.'
                    : 'Klik di mana saja pada pratinjau halaman di bawah untuk menambah kotak blackout.'}
                </p>
                <div
                  onClick={handlePreviewClick}
                  className="relative max-w-sm mx-auto rounded-2xl overflow-hidden border border-black/15 dark:border-white/20 shadow-lg bg-white cursor-crosshair select-none"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pagePreviewUrl}
                    alt={`Page ${targetPage} preview`}
                    className="w-full h-auto block pointer-events-none"
                  />
                  {regions
                    .map((r, idx) => ({ r, idx }))
                    .filter(({ r }) => r.pageIndex === targetPage - 1)
                    .map(({ r, idx }) => (
                      <div
                        key={idx}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          left: `${r.x}%`,
                          top: `${r.y}%`,
                          width: `${r.width}%`,
                          height: `${r.height}%`,
                        }}
                        className="absolute bg-black/95 border border-white/50 text-white text-[9px] font-bold flex items-center justify-center shadow-md"
                      >
                        #{idx + 1}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Redaction Boxes List */}
            {regions.length > 0 ? (
              <div className="relative z-10 space-y-3 pt-3 border-t border-black/[0.08] dark:border-white/[0.12]">
                {regions.map((region, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.14] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0A1128] dark:text-white">
                        {lang === 'en' ? 'Blackout Box' : 'Kotak Blackout'} #{idx + 1} (
                        {lang === 'en' ? 'Page' : 'Hal'} {region.pageIndex + 1})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRegion(idx)}
                        className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/15 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#0A1128]/65 dark:text-white/65 mb-1">
                          X Position (%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={region.x}
                          onChange={(e) =>
                            handleUpdateRegion(idx, { x: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.07] border border-black/[0.10] dark:border-white/[0.16] text-xs font-bold text-[#0A1128] dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#0A1128]/65 dark:text-white/65 mb-1">
                          Y Position (%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={region.y}
                          onChange={(e) =>
                            handleUpdateRegion(idx, { y: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.07] border border-black/[0.10] dark:border-white/[0.16] text-xs font-bold text-[#0A1128] dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#0A1128]/65 dark:text-white/65 mb-1">
                          Width (%)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={region.width}
                          onChange={(e) =>
                            handleUpdateRegion(idx, { width: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.07] border border-black/[0.10] dark:border-white/[0.16] text-xs font-bold text-[#0A1128] dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#0A1128]/65 dark:text-white/65 mb-1">
                          Height (%)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={region.height}
                          onChange={(e) =>
                            handleUpdateRegion(idx, { height: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.07] border border-black/[0.10] dark:border-white/[0.16] text-xs font-bold text-[#0A1128] dark:text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="relative z-10 text-xs text-[#0A1128]/50 dark:text-white/45 font-medium text-center py-4">
                {lang === 'en'
                  ? 'No blackout boxes added yet. Click "+ Add Blackout Box" or click the page preview.'
                  : 'Belum ada kotak blackout. Klik "+ Tambah Kotak Blackout" atau klik pratinjau halaman.'}
              </p>
            )}
          </div>

          {/* CTA Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-[#0A1128]/65 dark:text-white/60">
              <ShieldCheck className="w-4 h-4 text-[#0A1128] dark:text-white shrink-0" />
              <span>
                {lang === 'en'
                  ? '100% processed locally inside browser.'
                  : '100% diproses secara lokal di browser.'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleRedact}
              disabled={isProcessing || regions.length === 0}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 btn-press-effect ${
                regions.length > 0 && !isProcessing
                  ? 'glass-cta'
                  : 'bg-black/[0.08] dark:bg-white/[0.08] text-[#0A1128]/35 dark:text-white/35 border border-black/[0.06] dark:border-white/[0.10] cursor-not-allowed shadow-none'
              }`}
            >
              <EyeOff className="w-4 h-4" />
              <span>
                {isProcessing
                  ? lang === 'en'
                    ? 'Applying...'
                    : 'Menerapkan...'
                  : lang === 'en'
                    ? 'Apply Blackout & Download PDF'
                    : 'Terapkan Blackout & Unduh PDF'}
              </span>
            </button>
          </div>
        </div>
      )}

      <PrivacyNotice t={t} />

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

export default RedactPdfWorkspace;
