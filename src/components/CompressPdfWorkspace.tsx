'use client';

import React, { useState } from 'react';
import { ArrowLeft, Minimize2, ShieldCheck, ArrowRight, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { downloadBlob } from '@/lib/files/downloadBlob';
import { formatFileSize } from '@/lib/files/formatFileSize';
import FileDropzone from './FileDropzone';
import PrivacyNotice from './PrivacyNotice';
import { compressPdf, CompressionLevel, CompressResult } from '@/lib/pdf/compressPdf';
import { HumanError } from '@/lib/errors/messages';

interface CompressPdfWorkspaceProps {
  onBack: () => void;
  t: TranslationDictionary;
  lang: Language;
}

export const CompressPdfWorkspace: React.FC<CompressPdfWorkspaceProps> = ({ onBack, t, lang }) => {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>('recommended');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CompressResult | null>(null);
  const [errorToast, setErrorToast] = useState<HumanError | null>(null);

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
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorToast(null);

    try {
      const res = await compressPdf(file, level);
      setResult(res);

      const blob = new Blob([res.pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.pdf$/i, '');
      downloadBlob(blob, `Kindpdf_${baseName}_Compressed.pdf`);
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 flex-1 flex flex-col justify-between w-full">
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
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">{file.name}</p>
              <p className="text-xs text-slate-500 font-medium">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="text-xs font-extrabold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 btn-press-effect"
            >
              {lang === 'en' ? 'Change File' : 'Ganti File'}
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'Compression Level' : 'Tingkat Kompresi'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'recommended', title: lang === 'en' ? 'Recommended' : 'Rekomendasi', desc: lang === 'en' ? 'Good quality, high compression' : 'Kualitas bagus, kompresi tinggi' },
                { id: 'extreme', title: lang === 'en' ? 'Extreme' : 'Ekstrem', desc: lang === 'en' ? 'Less quality, max compression' : 'Kualitas standar, kompresi maksimal' },
                { id: 'less', title: lang === 'en' ? 'Less Compression' : 'Kompresi Ringan', desc: lang === 'en' ? 'High quality, less compression' : 'Kualitas tinggi, kompresi ringan' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setLevel(item.id as CompressionLevel)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    level === item.id
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Result Stats */}
          {result && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 font-extrabold animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {formatFileSize(result.originalSize)} → {formatFileSize(result.compressedSize)}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black">
                -{result.savedPercentage}% {lang === 'en' ? 'Smaller' : 'Lebih Kecil'}
              </span>
            </div>
          )}

          {/* CTA Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{lang === 'en' ? '100% compressed locally in your browser.' : '100% dikompres secara lokal di browser.'}</span>
            </div>

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
              <span>{isProcessing ? (lang === 'en' ? 'Compressing...' : 'Mengompres...') : (lang === 'en' ? 'Compress & Download' : 'Kompres & Unduh')}</span>
              {!isProcessing && <ArrowRight className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <PrivacyNotice t={t} />
    </div>
  );
};

export default CompressPdfWorkspace;
