'use client';

import React, { useState } from 'react';
import { ArrowLeft, Minimize2, ArrowRight, AlertCircle, X } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { downloadBlob } from '@/lib/files/downloadBlob';
import { formatFileSize } from '@/lib/files/formatFileSize';
import FileDropzone from './FileDropzone';
import { compressPdf, CompressionLevel, CompressResult } from '@/lib/pdf/compressPdf';
import { HumanError } from '@/lib/errors/messages';
import ProcessingProgress from './ProcessingProgress';
import SuccessDownloadScreen from './SuccessDownloadScreen';
import { ViewMode } from './Header';

interface CompressPdfWorkspaceProps {
  onBack: () => void;
  onSelectTool?: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: Language;
}

export const CompressPdfWorkspace: React.FC<CompressPdfWorkspaceProps> = ({ onBack, onSelectTool, t, lang }) => {
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

  // IF COMPRESSION FINISHED SUCCESSFULLY -> SHOW SUCCESS DOWNLOAD SCREEN (SAME AS MERGE PDF)
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
        className="inline-flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 transition-colors btn-press-effect"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.backToAllTools}</span>
      </button>

      {/* Hero Header */}
      <div className="text-center space-y-2 py-2 max-w-lg mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Compress PDF
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'en'
            ? 'Reduce your PDF file size while maintaining document quality.'
            : 'Kurangi ukuran file PDF Anda sambil menjaga kualitas dokumen.'}
        </p>
      </div>

      {/* Error Toast */}
      {errorToast && (
        <div className="w-full p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start justify-between gap-3 shadow-md animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold">{errorToast.title}</h4>
              <p className="text-xs font-medium text-rose-700 dark:text-rose-300 mt-0.5">{errorToast.message}</p>
            </div>
          </div>
          <button type="button" onClick={() => setErrorToast(null)} className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors">
            <X className="w-4 h-4 text-rose-500" />
          </button>
        </div>
      )}

      {/* Upload File */}
      {!file && <FileDropzone onFilesSelected={handleFileSelected} disabled={isProcessing} t={t} colorTheme="teal" />}

      {/* Compression Options */}
      {file && (
        <div className="space-y-5">
          {/* File Selected Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">{file.name}</p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {lang === 'en' ? 'Original Size:' : 'Ukuran Asli:'} <span className="font-extrabold text-slate-700 dark:text-slate-300">{formatFileSize(file.size)}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="text-xs font-extrabold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 btn-press-effect shrink-0"
            >
              {lang === 'en' ? 'Change File' : 'Ganti File'}
            </button>
          </div>

          {/* Clean Minimalist Level Selector */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm space-y-3">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'Compression Level' : 'Tingkat Kompresi'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'recommended', title: lang === 'en' ? 'Recommended' : 'Rekomendasi', desc: lang === 'en' ? 'Good quality & compression' : 'Kualitas bagus & kompresi' },
                { id: 'extreme', title: lang === 'en' ? 'Extreme' : 'Ekstrem', desc: lang === 'en' ? 'Max size reduction' : 'Kompresi maksimal' },
                { id: 'less', title: lang === 'en' ? 'Less Compression' : 'Kompresi Ringan', desc: lang === 'en' ? 'Highest document quality' : 'Kualitas dokumen tinggi' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setLevel(item.id as CompressionLevel)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    level === item.id
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main Action Button */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={handleCompress}
              disabled={isProcessing}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-xl transition-all duration-200 btn-press-effect ${
                !isProcessing
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-blue-500/30 scale-[1.02]'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <Minimize2 className="w-4 h-4" />
              <span>{lang === 'en' ? 'Compress PDF' : 'Kompres PDF'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Spinning Loader Processing Modal (Same as Merge PDF) */}
      <ProcessingProgress
        isOpen={isProcessing}
        progressMessage={lang === 'en' ? 'Compressing PDF Document...' : 'Mengompres Dokumen PDF...'}
        currentStep={1}
        totalSteps={1}
        t={t}
      />
    </div>
  );
};

export default CompressPdfWorkspace;
