'use client';

import React, { useState } from 'react';
import { ArrowLeft, Minimize2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { downloadBlob } from '@/lib/files/downloadBlob';
import { formatFileSize } from '@/lib/files/formatFileSize';
import FileDropzone from './FileDropzone';
import { compressPdf, CompressionLevel, CompressResult } from '@/lib/pdf/compressPdf';
import { HumanError } from '@/lib/errors/messages';
import ProcessingProgress from './ProcessingProgress';
import SuccessDownloadScreen from './SuccessDownloadScreen';
import LiquidGlassPillBar from './LiquidGlassPillBar';
import { ViewMode } from './Header';

interface CompressPdfWorkspaceProps {
  onBack: () => void;
  onSelectTool?: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: Language;
}

export const CompressPdfWorkspace: React.FC<CompressPdfWorkspaceProps> = ({
  onBack,
  onSelectTool,
  t,
  lang,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>('recommended');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CompressResult | null>(null);
  const [errorToast, setErrorToast] = useState<HumanError | null>(null);
  const [customName, setCustomName] = useState<string>('');

  const handleFileSelected = async (files: File[]) => {
    setErrorToast(null);
    setResult(null);
    if (files.length === 0) return;

    const selected = files[0];
    const res = await validatePdfFile(selected);
    if (!res.isValid && res.error) {
      setErrorToast(res.error);
      return;
    }

    setFile(selected);
    const baseName = selected.name.replace(/\.pdf$/i, '');
    setCustomName(`${baseName}_Compressed.pdf`);
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorToast(null);

    try {
      const res = await compressPdf(file, level);
      setResult(res);
    } catch (err: any) {
      setErrorToast({
        type: 'CORRUPTED',
        title: lang === 'en' ? 'Compression Failed' : 'Kompresi Gagal',
        message: err?.message || 'Unexpected error optimizing PDF.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (nameOverride?: string) => {
    if (!result || !file) return;
    const finalName = nameOverride && nameOverride.trim() ? nameOverride.trim() : customName;
    const blob = new Blob([result.pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    downloadBlob(blob, finalName.endsWith('.pdf') ? finalName : `${finalName}.pdf`);
  };

  if (result && file) {
    return (
      <SuccessDownloadScreen
        title={lang === 'en' ? 'PDF Compressed Successfully!' : 'PDF Berhasil Dikompres!'}
        downloadFileName={customName}
        downloadButtonText={lang === 'en' ? 'Download Compressed PDF' : 'Unduh PDF Terkompresi'}
        statBadge={{
          label: `-${result.savedPercentage}% ${lang === 'en' ? 'Smaller' : 'Lebih Kecil'}`,
          detail: `${formatFileSize(result.originalSize)} ➔ ${formatFileSize(result.compressedSize)}`,
        }}
        onDownload={handleDownload}
        onStartOver={() => {
          setResult(null);
          setFile(null);
        }}
        onSelectTool={(toolId: ViewMode) => {
          setResult(null);
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
          Compress PDF
        </h2>
        <p className="text-xs sm:text-sm text-[#0A1128]/65 dark:text-white/60 font-normal leading-relaxed">
          {lang === 'en'
            ? 'Reduce your PDF file size while maintaining document quality.'
            : 'Kurangi ukuran file PDF Anda sambil menjaga kualitas dokumen.'}
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

      {/* Compression Options */}
      {file && (
        <div className="space-y-5">
          {/* File Selected Card */}
          <div className="glass-card p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3 min-w-0">
            <div className="relative z-10 flex-1 min-w-0">
              <p className="text-sm font-bold text-[#0A1128] dark:text-white truncate">
                {file.name}
              </p>
              <p className="text-xs text-[#0A1128]/60 dark:text-white/55 font-medium mt-0.5 truncate">
                {lang === 'en' ? 'Original Size:' : 'Ukuran Asli:'}{' '}
                <span className="font-bold text-[#0A1128] dark:text-white">
                  {formatFileSize(file.size)}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="relative z-10 text-xs font-bold text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 btn-press-effect shrink-0"
            >
              {lang === 'en' ? 'Change File' : 'Ganti File'}
            </button>
          </div>

          {file.size < 20 * 1024 && (
            <p className="glass-card text-[11px] text-[#0A1128]/80 dark:text-white/80 font-medium p-3.5 rounded-2xl leading-relaxed">
              💡{' '}
              {lang === 'en'
                ? 'Note: Small text PDFs (< 20 KB) are already near the minimum PDF structure size limit (~3-5 KB). Compression has the highest impact on documents (> 50 KB) containing photos, images, or scanned pages.'
                : 'Catatan: Berkas PDF teks kecil (< 20 KB) sudah mendekati batas minimum struktur spesifikasi PDF (~3-5 KB). Kompresi berdampak paling besar pada dokumen (> 50 KB) yang berisi foto, gambar, atau hasil scan.'}
            </p>
          )}

          {/* Compression Level Selector with LiquidGlassPillBar */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-bold text-[#0A1128] dark:text-white">
                {lang === 'en' ? 'Compression Level' : 'Tingkat Kompresi'}
              </label>

              <LiquidGlassPillBar<CompressionLevel>
                size="sm"
                scrollable
                ariaLabel="Compression Level"
                value={level}
                onChange={setLevel}
                options={[
                  {
                    id: 'recommended',
                    label: `${lang === 'en' ? 'Recommended' : 'Rekomendasi'} (~50%)`,
                  },
                  {
                    id: 'extreme',
                    label: `${lang === 'en' ? 'Extreme' : 'Ekstrem'} (~70%)`,
                  },
                  {
                    id: 'less',
                    label: `${lang === 'en' ? 'Light' : 'Ringan'} (~20%)`,
                  },
                ]}
              />
            </div>

            {/* Target Size Estimate Banner */}
            <div className="relative z-10 p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] flex items-center justify-between text-xs font-semibold text-[#0A1128]/80 dark:text-white/80">
              <span>
                {lang === 'en' ? 'Estimated Target Size:' : 'Perkiraan Ukuran Hasil:'}
              </span>
              <span className="font-bold text-[#0A1128] dark:text-white">
                {formatFileSize(file.size)} ➔{' '}
                <span className="underline">
                  {formatFileSize(
                    Math.max(
                      500,
                      file.size *
                        (1 - (level === 'recommended' ? 0.5 : level === 'extreme' ? 0.7 : 0.2))
                    )
                  )}
                </span>{' '}
                ({level === 'recommended' ? '-50%' : level === 'extreme' ? '-70%' : '-20%'})
              </span>
            </div>
          </div>

          {/* Main Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[#0A1128]/65 dark:text-white/60">
              <ShieldCheck className="w-4 h-4 text-[#0A1128] dark:text-white shrink-0" />
              <span>{t.ramProcessing}</span>
            </div>

            <button
              type="button"
              onClick={handleCompress}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glass-cta font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 btn-press-effect"
            >
              <Minimize2 className="w-4 h-4" />
              <span>{lang === 'en' ? 'Compress PDF' : 'Kompres PDF'}</span>
            </button>
          </div>
        </div>
      )}

      <ProcessingProgress
        isOpen={isProcessing}
        progressMessage={
          lang === 'en' ? 'Compressing PDF Document...' : 'Mengompres Dokumen PDF...'
        }
        currentStep={1}
        totalSteps={1}
        t={t}
      />
    </div>
  );
};

export default CompressPdfWorkspace;
