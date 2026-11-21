'use client';

import React, { useState } from 'react';
import { TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { renderPdfToImages, PdfToImagesOptions } from '@/lib/pdf/pdfToImages';
import { downloadBlob } from '@/lib/files/downloadBlob';
import { formatFileSize } from '@/lib/files/formatFileSize';
import ProcessingProgress from './ProcessingProgress';
import FileDropzone from './FileDropzone';
import LiquidGlassPillBar from './LiquidGlassPillBar';
import {
  FileImage,
  FileText,
  Trash2,
  AlertCircle,
  X,
  ShieldCheck,
  ArrowLeft,
  Settings2,
} from 'lucide-react';
import SuccessDownloadScreen from './SuccessDownloadScreen';
import { ViewMode } from '@/components/Header';

interface PdfToImagesWorkspaceProps {
  onBack: () => void;
  onSelectTool?: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: 'en' | 'id';
}

export const PdfToImagesWorkspace: React.FC<PdfToImagesWorkspaceProps> = ({
  onBack,
  onSelectTool,
  t,
  lang,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [options, setOptions] = useState<PdfToImagesOptions>({
    format: 'png',
    quality: 0.92,
    dpiScale: 1.5,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorToast, setErrorToast] = useState<{ title: string; message: string } | null>(null);
  const [completedResult, setCompletedResult] = useState<{
    blob: Blob;
    filename: string;
  } | null>(null);

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
  };

  const handleExecuteConvert = async () => {
    if (!file || pageCount === 0) return;
    setErrorToast(null);

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(pageCount);
    setProgressMsg(
      lang === 'en' ? 'Rendering PDF pages to images...' : 'Mengubah halaman PDF menjadi gambar...'
    );

    try {
      const result = await renderPdfToImages(file, options, (curr, tot, msg) => {
        setCurrentStep(curr);
        setTotalSteps(tot);
        setProgressMsg(msg);
      });

      setIsProcessing(false);
      setCompletedResult({
        blob: result.blob,
        filename: result.filename,
      });
    } catch (err: any) {
      setIsProcessing(false);
      setErrorToast({
        title: lang === 'en' ? 'Conversion Failed' : 'Konversi Gagal',
        message: err?.message || 'Unexpected error while extracting images from PDF.',
      });
    }
  };

  if (completedResult) {
    return (
      <SuccessDownloadScreen
        title={
          lang === 'en'
            ? 'Images Extracted Successfully!'
            : 'Gambar Berhasil Diekstrak dari PDF!'
        }
        downloadFileName={completedResult.filename}
        downloadButtonText={lang === 'en' ? 'Download Images' : 'Unduh Berkas Gambar'}
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
          {lang === 'en' ? 'PDF to Images Converter' : 'Konverter PDF ke Gambar'}
        </h2>
        <p className="text-xs sm:text-sm text-[#0A1128]/65 dark:text-white/60 font-normal leading-relaxed">
          {lang === 'en'
            ? 'Extract and render all PDF pages as high-resolution PNG or JPG images.'
            : 'Ekstrak dan ubah seluruh halaman PDF menjadi gambar PNG atau JPG resolusi tinggi.'}
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
          {/* Active File Summary Box */}
          <div className="glass-card p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3">
            <div className="relative z-10 flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.18] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#0A1128]/80 dark:text-white/85" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#0A1128] dark:text-white truncate">
                  {file.name}
                </h4>
                <p className="text-xs font-medium text-[#0A1128]/60 dark:text-white/55">
                  {pageCount} {lang === 'en' ? 'Pages' : 'Halaman'} • {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPageCount(0);
              }}
              className="relative z-10 p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 transition-colors btn-press-effect"
              title="Remove File"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Options Panel */}
          <div className="glass-card p-6 rounded-3xl space-y-5">
            <h3 className="relative z-10 text-xs font-bold text-[#0A1128] dark:text-white flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              <span>{lang === 'en' ? 'Image Output Settings' : 'Pengaturan Gambar Hasil'}</span>
            </h3>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Output Format */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A1128] dark:text-white">
                  {lang === 'en' ? 'Image Format' : 'Format Gambar'}
                </label>
                <LiquidGlassPillBar<'png' | 'jpeg'>
                  size="sm"
                  equalWidth
                  ariaLabel="PDF to image format"
                  value={options.format}
                  onChange={(fmt) => setOptions({ ...options, format: fmt })}
                  options={[
                    { id: 'png', label: 'PNG (Lossless)' },
                    { id: 'jpeg', label: 'JPG (Compact)' },
                  ]}
                />
              </div>

              {/* DPI Quality */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A1128] dark:text-white">
                  {lang === 'en' ? 'Resolution Quality' : 'Kualitas Resolusi'}
                </label>
                <LiquidGlassPillBar<'1' | '1.5' | '2'>
                  size="sm"
                  equalWidth
                  ariaLabel="PDF to image DPI resolution"
                  value={String(options.dpiScale) as '1' | '1.5' | '2'}
                  onChange={(dpi) => setOptions({ ...options, dpiScale: parseFloat(dpi) })}
                  options={[
                    { id: '1', label: '150 DPI' },
                    { id: '1.5', label: '225 DPI' },
                    { id: '2', label: '300 DPI' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-[#0A1128]/65 dark:text-white/60">
              <ShieldCheck className="w-4 h-4 text-[#0A1128] dark:text-white shrink-0" />
              <span>{t.ramProcessing}</span>
            </div>

            <button
              type="button"
              onClick={handleExecuteConvert}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glass-cta font-bold text-sm transition-all btn-press-effect flex items-center justify-center gap-2"
            >
              <FileImage className="w-4 h-4" />
              <span>
                {lang === 'en'
                  ? 'Convert PDF to Images Now'
                  : 'Konversi PDF ke Gambar Sekarang'}
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

export default PdfToImagesWorkspace;
