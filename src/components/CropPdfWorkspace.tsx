'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Crop, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { downloadBlob } from '@/lib/files/downloadBlob';
import FileDropzone from './FileDropzone';
import { cropPdf, CropOptions } from '@/lib/pdf/cropPdf';
import { renderPdfPagePreview } from '@/lib/pdf/pdfjsWorker';
import { HumanError } from '@/lib/errors/messages';
import ProcessingProgress from './ProcessingProgress';
import SuccessDownloadScreen from './SuccessDownloadScreen';
import LiquidGlassPillBar from './LiquidGlassPillBar';
import { ViewMode } from '@/components/Header';

interface CropPdfWorkspaceProps {
  onBack: () => void;
  onSelectTool?: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: Language;
}

type CropPageScope = 'all' | 'odd' | 'even' | 'custom';

export const CropPdfWorkspace: React.FC<CropPdfWorkspaceProps> = ({
  onBack,
  onSelectTool,
  t,
  lang,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [top, setTop] = useState(10);
  const [right, setRight] = useState(10);
  const [bottom, setBottom] = useState(10);
  const [left, setLeft] = useState(10);
  const [pageSelection, setPageSelection] = useState<CropPageScope>('all');
  const [customRange, setCustomRange] = useState('1');
  const [pagePreviewUrl, setPagePreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorToast, setErrorToast] = useState<HumanError | null>(null);
  const [completedResult, setCompletedResult] = useState<{
    blob: Blob;
    filename: string;
  } | null>(null);

  const handleFileSelected = async (files: File[]) => {
    setErrorToast(null);
    if (files.length === 0) return;

    const selected = files[0];
    const res = await validatePdfFile(selected);
    if (!res.isValid && res.error) {
      setErrorToast(res.error);
      return;
    }

    setFile(selected);
    setPageCount(res.pageCount);
    setCustomRange(res.pageCount > 1 ? `1-${res.pageCount}` : '1');
  };

  useEffect(() => {
    if (!file || pageCount === 0) {
      setPagePreviewUrl(null);
      return;
    }
    let active = true;
    renderPdfPagePreview(file, 1, 1.0).then((res) => {
      if (active) setPagePreviewUrl(res?.dataUrl || null);
    });
    return () => {
      active = false;
    };
  }, [file, pageCount]);

  const handleCrop = async () => {
    if (!file) return;

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(2);
    setProgressMsg(
      lang === 'en' ? 'Cropping PDF margins and pages...' : 'Memotong margin dan halaman PDF...'
    );
    setErrorToast(null);

    try {
      const options: CropOptions = {
        top,
        right,
        bottom,
        left,
        pageSelection: pageSelection === 'custom' ? customRange : pageSelection,
      };

      const croppedBytes = await cropPdf(file, options, (msg) => {
        if (msg) setProgressMsg(msg);
      });

      const blob = new Blob([croppedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.pdf$/i, '');
      const filename = `Kindpdf_${baseName}_Cropped.pdf`;

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
        title: lang === 'en' ? 'Crop Failed' : 'Gagal Memotong',
        message: err?.message || 'An unexpected error occurred.',
      });
    }
  };

  if (completedResult) {
    return (
      <SuccessDownloadScreen
        title={lang === 'en' ? 'PDF Cropped Successfully!' : 'Dokumen PDF Berhasil Dipotong!'}
        downloadFileName={completedResult.filename}
        downloadButtonText={lang === 'en' ? 'Download Cropped PDF' : 'Unduh PDF Hasil Potong'}
        onDownload={(customName?: string) =>
          downloadBlob(completedResult.blob, customName || completedResult.filename)
        }
        onStartOver={() => {
          setCompletedResult(null);
          setFile(null);
          setPageCount(0);
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
          Crop PDF
        </h2>
        <p className="text-xs sm:text-sm text-[#0A1128]/65 dark:text-white/60 font-normal leading-relaxed">
          {lang === 'en'
            ? 'Trim margins, crop page borders, and adjust visible page dimensions.'
            : 'Potong margin, sesuaikan garis tepi, dan atur dimensi halaman PDF.'}
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

      {/* Controls */}
      {file && (
        <div className="space-y-5">
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
              onClick={() => setFile(null)}
              className="relative z-10 text-xs font-bold text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 btn-press-effect shrink-0"
            >
              {lang === 'en' ? 'Change File' : 'Ganti File'}
            </button>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-5">
            {/* Live Visual Crop Box Preview */}
            {pagePreviewUrl && (
              <div className="relative z-10 space-y-1.5">
                <p className="text-[11px] font-medium text-[#0A1128]/60 dark:text-white/55 text-center">
                  {lang === 'en' ? 'Live CropBox Margin Preview' : 'Pratinjau Margin CropBox'}
                </p>
                <div className="relative max-w-xs mx-auto rounded-2xl overflow-hidden border border-black/15 dark:border-white/20 shadow-lg bg-white select-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pagePreviewUrl}
                    alt="Page 1 crop preview"
                    className="w-full h-auto block opacity-40"
                  />
                  <div
                    style={{
                      top: `${top}%`,
                      right: `${right}%`,
                      bottom: `${bottom}%`,
                      left: `${left}%`,
                    }}
                    className="absolute border-2 border-dashed border-[#00A3FF] bg-[#00A3FF]/10 shadow-[0_0_0_9999px_rgba(10,17,40,0.35)] transition-all duration-150"
                  />
                </div>
              </div>
            )}

            <div className="relative z-10 space-y-3">
              <label className="text-xs font-bold text-[#0A1128] dark:text-white">
                {lang === 'en' ? 'Crop Margins (%)' : 'Potong Margin (%)'}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: lang === 'en' ? 'Top' : 'Atas', val: top, setter: setTop },
                  { label: lang === 'en' ? 'Right' : 'Kanan', val: right, setter: setRight },
                  { label: lang === 'en' ? 'Bottom' : 'Bawah', val: bottom, setter: setBottom },
                  { label: lang === 'en' ? 'Left' : 'Kiri', val: left, setter: setLeft },
                ].map((m, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#0A1128]/65 dark:text-white/65">
                      {m.label} ({m.val}%)
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={45}
                      value={m.val}
                      onChange={(e) =>
                        m.setter(Math.max(0, Math.min(45, Number(e.target.value) || 0)))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-white/[0.07] border border-black/[0.10] dark:border-white/[0.16] text-xs font-bold text-[#0A1128] dark:text-white outline-none focus:border-[#00A3FF] dark:focus:border-[#38BDF8]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-3 border-t border-black/[0.08] dark:border-white/[0.12] space-y-3">
              <label className="block text-xs font-bold text-[#0A1128] dark:text-white">
                {lang === 'en' ? 'Apply to Pages' : 'Terapkan Ke Halaman'}
              </label>

              <LiquidGlassPillBar<CropPageScope>
                size="sm"
                scrollable
                ariaLabel="Apply crop to pages"
                value={pageSelection}
                onChange={setPageSelection}
                options={[
                  { id: 'all', label: lang === 'en' ? 'All Pages' : 'Semua Halaman' },
                  { id: 'odd', label: lang === 'en' ? 'Odd Pages' : 'Halaman Ganjil' },
                  { id: 'even', label: lang === 'en' ? 'Even Pages' : 'Halaman Genap' },
                  { id: 'custom', label: lang === 'en' ? 'Custom Range' : 'Rentang Khusus' },
                ]}
              />

              {pageSelection === 'custom' && (
                <input
                  type="text"
                  placeholder="e.g. 1-3, 5"
                  value={customRange}
                  onChange={(e) => setCustomRange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-white/[0.07] border border-black/[0.10] dark:border-white/[0.16] text-xs font-bold text-[#0A1128] dark:text-white outline-none focus:border-[#00A3FF] dark:focus:border-[#38BDF8]"
                />
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-[#0A1128]/65 dark:text-white/60">
              <ShieldCheck className="w-4 h-4 text-[#0A1128] dark:text-white shrink-0" />
              <span>
                {lang === 'en'
                  ? '100% processed locally in browser.'
                  : '100% diproses secara lokal di browser.'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCrop}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glass-cta font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 btn-press-effect"
            >
              <Crop className="w-4 h-4" />
              <span>
                {isProcessing
                  ? lang === 'en'
                    ? 'Cropping...'
                    : 'Memotong...'
                  : lang === 'en'
                    ? 'Crop PDF'
                    : 'Potong PDF'}
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

export default CropPdfWorkspace;
