'use client';

import React, { useState } from 'react';
import { TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { renderPdfToImages, PdfToImagesOptions } from '@/lib/pdf/pdfToImages';
import { downloadBlob } from '@/lib/files/downloadBlob';
import { formatFileSize } from '@/lib/files/formatFileSize';
import ProcessingProgress from './ProcessingProgress';
import {
  FileImage,
  UploadCloud,
  FileText,
  Trash2,
  AlertCircle,
  X,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  Settings2,
} from 'lucide-react';

interface PdfToImagesWorkspaceProps {
  onBack: () => void;
  t: TranslationDictionary;
  lang: 'en' | 'id';
}

export const PdfToImagesWorkspace: React.FC<PdfToImagesWorkspaceProps> = ({ onBack, t, lang }) => {
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
    setProgressMsg(lang === 'en' ? 'Rendering PDF pages to images...' : 'Mengubah halaman PDF menjadi gambar...');

    try {
      const result = await renderPdfToImages(file, options, (curr, tot, msg) => {
        setCurrentStep(curr);
        setTotalSteps(tot);
        setProgressMsg(msg);
      });

      downloadBlob(result.blob, result.filename);

      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorToast({
        title: lang === 'en' ? 'Conversion Failed' : 'Konversi Gagal',
        message: err?.message || 'Unexpected error while extracting images from PDF.',
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
          {lang === 'en' ? 'PDF to Images Converter' : 'Konverter PDF ke Gambar'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'en'
            ? 'Extract and render all PDF pages as high-resolution PNG or JPG images.'
            : 'Ekstrak dan ubah seluruh halaman PDF menjadi gambar PNG atau JPG resolusi tinggi.'}
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
        <div
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pdf';
            input.onchange = (e: any) => {
              if (e.target.files) handleFileChange(Array.from(e.target.files));
            };
            input.click();
          }}
          className="w-full max-w-xl mx-auto rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-5 hover:border-blue-600 transition-all cursor-pointer shadow-sm"
        >
          <button
            type="button"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-black text-base sm:text-lg shadow-lg shadow-blue-500/30 transition-all btn-press-effect flex items-center justify-center gap-2.5"
          >
            <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>{t.dropzoneClick}</span>
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t.dropzoneTitle}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active File Summary Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-blue-900 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {file.name}
                </h4>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
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
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors btn-press-effect"
              title="Remove File"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Options Panel */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 space-y-5 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <span>{lang === 'en' ? 'Image Output Settings' : 'Pengaturan Gambar Hasil'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Output Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  {lang === 'en' ? 'Image Format' : 'Format Gambar'}
                </label>
                <select
                  value={options.format}
                  onChange={(e: any) => setOptions({ ...options, format: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                >
                  <option value="png">PNG (Lossless & High Quality)</option>
                  <option value="jpeg">JPG / JPEG (Compressed)</option>
                </select>
              </div>

              {/* DPI Quality */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  {lang === 'en' ? 'Resolution Quality' : 'Kualitas Resolusi'}
                </label>
                <select
                  value={options.dpiScale}
                  onChange={(e: any) => setOptions({ ...options, dpiScale: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                >
                  <option value={1.0}>Standard (150 DPI)</option>
                  <option value={1.5}>High Quality (225 DPI)</option>
                  <option value={2.0}>Ultra High Quality (300 DPI)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t.ramProcessing}</span>
            </div>

            <button
              type="button"
              onClick={handleExecuteConvert}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-black text-sm shadow-xl shadow-blue-500/30 transition-all btn-press-effect flex items-center justify-center gap-2"
            >
              <FileImage className="w-4 h-4" />
              <span>{lang === 'en' ? 'Convert PDF to Images Now' : 'Konversi PDF ke Gambar Sekarang'}</span>
              
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

export default PdfToImagesWorkspace;
