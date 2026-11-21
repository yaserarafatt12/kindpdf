'use client';

import React, { useState } from 'react';
import { ArrowLeft, Archive, ShieldCheck, AlertCircle, X } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { downloadBlob } from '@/lib/files/downloadBlob';
import FileDropzone from './FileDropzone';
import { convertToPdfA, PdfAConformance } from '@/lib/pdf/pdfToPdfA';
import { HumanError } from '@/lib/errors/messages';
import ProcessingProgress from './ProcessingProgress';
import SuccessDownloadScreen from './SuccessDownloadScreen';
import LiquidGlassPillBar from './LiquidGlassPillBar';
import { ViewMode } from '@/components/Header';

interface PdfToPdfAWorkspaceProps {
  onBack: () => void;
  onSelectTool?: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: Language;
}

export const PdfToPdfAWorkspace: React.FC<PdfToPdfAWorkspaceProps> = ({
  onBack,
  onSelectTool,
  t,
  lang,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [conformance, setConformance] = useState<PdfAConformance>('2b');
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
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(2);
    setProgressMsg(
      lang === 'en'
        ? 'Converting PDF to PDF/A compliant format...'
        : 'Mengonversi PDF ke standar PDF/A...'
    );
    setErrorToast(null);

    try {
      const bytes = await convertToPdfA(file, conformance);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.pdf$/i, '');
      const filename = `Kindpdf_${baseName}_PDFA.pdf`;

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
        title: lang === 'en' ? 'Conversion Failed' : 'Konversi Gagal',
        message: err?.message || 'Unexpected error converting to PDF/A.',
      });
    }
  };

  if (completedResult) {
    return (
      <SuccessDownloadScreen
        title={lang === 'en' ? 'PDF/A Converted Successfully!' : 'PDF/A Berhasil Dibuat!'}
        downloadFileName={completedResult.filename}
        downloadButtonText={lang === 'en' ? 'Download PDF/A' : 'Unduh PDF/A'}
        onDownload={(customName?: string) =>
          downloadBlob(completedResult.blob, customName || completedResult.filename)
        }
        onStartOver={() => {
          setCompletedResult(null);
          setFile(null);
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
          PDF/A Preparation
        </h2>
        <p className="text-xs sm:text-sm text-[#0A1128]/65 dark:text-white/60 font-normal leading-relaxed">
          {lang === 'en'
            ? 'Embed ISO 19005 PDF/A metadata streams for long-term archival preservation.'
            : 'Sematkan metadata arsip standar ISO 19005 (PDF/A) untuk penyimpanan jangka panjang.'}
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

      {/* Conversion Options */}
      {file && (
        <div className="space-y-5">
          <div className="glass-card p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3 min-w-0">
            <div className="relative z-10 min-w-0 flex-1">
              <p className="text-sm font-bold text-[#0A1128] dark:text-white truncate">
                {file.name}
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

          <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-bold text-[#0A1128] dark:text-white">
                {lang === 'en' ? 'PDF/A Conformance Standard' : 'Standar PDF/A'}
              </label>

              <LiquidGlassPillBar<PdfAConformance>
                size="sm"
                ariaLabel="PDF/A Conformance Standard"
                value={conformance}
                onChange={setConformance}
                options={[
                  { id: '2b', label: 'PDF/A-2b (Recommended)' },
                  { id: '1b', label: 'PDF/A-1b' },
                  { id: '3b', label: 'PDF/A-3b' },
                ]}
              />
            </div>

            <p className="relative z-10 text-xs text-[#0A1128]/65 dark:text-white/60">
              {conformance === '2b'
                ? lang === 'en'
                  ? 'ISO 19005-2 standard archival conformance with modern compression and transparency support.'
                  : 'Standar arsip ISO 19005-2 dengan dukungan kompresi modern dan transparansi.'
                : conformance === '1b'
                  ? lang === 'en'
                    ? 'ISO 19005-1 legacy archival conformance based on PDF 1.4.'
                    : 'Standar arsip klasik ISO 19005-1 berbasis PDF 1.4.'
                  : lang === 'en'
                    ? 'ISO 19005-3 archival conformance allowing embedded file attachments.'
                    : 'Standar arsip ISO 19005-3 dengan dukungan lampiran berkas.'}
            </p>
          </div>

          {/* CTA Bar */}
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
              onClick={handleConvert}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glass-cta font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 btn-press-effect"
            >
              <Archive className="w-4 h-4" />
              <span>
                {isProcessing
                  ? lang === 'en'
                    ? 'Converting...'
                    : 'Mengonversi...'
                  : lang === 'en'
                    ? 'Convert to PDF/A'
                    : 'Konversi ke PDF/A'}
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

export default PdfToPdfAWorkspace;
