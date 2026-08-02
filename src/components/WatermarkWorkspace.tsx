'use client';

import React, { useState } from 'react';
import { TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { addWatermarkToPdf } from '@/lib/pdf/pdfAnnotations';
import { downloadBlob } from '@/lib/files/downloadBlob';
import { formatFileSize } from '@/lib/files/formatFileSize';
import ProcessingProgress from './ProcessingProgress';
import {
  Stamp,
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

interface WatermarkWorkspaceProps {
  onBack: () => void;
  t: TranslationDictionary;
  lang: 'en' | 'id';
}

export const WatermarkWorkspace: React.FC<WatermarkWorkspaceProps> = ({ onBack, t, lang }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [text, setText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState<number>(45);
  const [opacity, setOpacity] = useState<number>(0.2);
  const [rotation, setRotation] = useState<number>(45);
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

  const handleExecuteWatermark = async () => {
    if (!file || pageCount === 0) return;
    setErrorToast(null);

    if (!text || !text.trim()) {
      setErrorToast({
        title: lang === 'en' ? 'Empty Watermark Text' : 'Teks Watermark Kosong',
        message: lang === 'en' ? 'Please enter watermark text.' : 'Masukkan teks watermark.',
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(pageCount);
    setProgressMsg(lang === 'en' ? 'Applying watermark to PDF...' : 'Menambahkan watermark ke PDF...');

    try {
      const result = await addWatermarkToPdf(
        file,
        { text, fontSize, opacity, rotation },
        (curr, tot, msg) => {
          setCurrentStep(curr);
          setTotalSteps(tot);
          setProgressMsg(msg);
        }
      );

      downloadBlob(result.blob, result.filename);

      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorToast({
        title: lang === 'en' ? 'Watermark Failed' : 'Gagal Menambahkan Watermark',
        message: err?.message || 'Unexpected error while watermarking document.',
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
          {lang === 'en' ? 'Add PDF Watermark' : 'Beri Watermark PDF'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'en'
            ? 'Overlay a custom text watermark across every page of your PDF.'
            : 'Tambahkan teks watermark kustom ke setiap halaman dokumen PDF Anda.'}
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
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 text-white font-black text-base sm:text-lg shadow-lg shadow-violet-500/30 transition-all btn-press-effect flex items-center justify-center gap-2.5"
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
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-900 shrink-0">
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

          {/* Settings Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 space-y-5 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-violet-500" />
              <span>{lang === 'en' ? 'Watermark Styling' : 'Pengaturan Watermark'}</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  {lang === 'en' ? 'Watermark Text' : 'Teks Watermark'}
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. CONFIDENTIAL, DRAFT"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Font Size */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    {lang === 'en' ? 'Font Size' : 'Ukuran Font'}
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="100"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value, 10) || 40)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    {lang === 'en' ? 'Transparence (Opacity)' : 'Transparansi (Opacity)'}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full accent-violet-600"
                  />
                  <p className="text-[10px] font-bold text-slate-500 text-right">{Math.round(opacity * 100)}%</p>
                </div>

                {/* Rotation */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    {lang === 'en' ? 'Rotation Angle' : 'Sudut Rotasi'}
                  </label>
                  <select
                    value={rotation}
                    onChange={(e: any) => setRotation(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value={45}>45° Diagonal</option>
                    <option value={0}>0° Horizontal</option>
                    <option value={90}>90° Vertical</option>
                  </select>
                </div>
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
              onClick={handleExecuteWatermark}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 text-white font-black text-sm shadow-xl shadow-violet-500/30 transition-all btn-press-effect flex items-center justify-center gap-2"
            >
              <Stamp className="w-4 h-4" />
              <span>{lang === 'en' ? 'Add Watermark Now' : 'Beri Watermark Sekarang'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
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

export default WatermarkWorkspace;
