'use client';

import React, { useState } from 'react';
import { ArrowLeft, Minimize2, ArrowRight, AlertCircle, X, CheckCircle2, Download, Edit2, RefreshCw } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { downloadBlob } from '@/lib/files/downloadBlob';
import { formatFileSize } from '@/lib/files/formatFileSize';
import FileDropzone from './FileDropzone';
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
  const [customName, setCustomName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);

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

      const downloadName = customName.trim() ? customName.trim() : `${file.name.replace(/\.pdf$/i, '')}_Compressed.pdf`;
      const blob = new Blob([res.pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      downloadBlob(blob, downloadName.endsWith('.pdf') ? downloadName : `${downloadName}.pdf`);
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

  const getEstimatedPercent = (lvl: CompressionLevel) => {
    switch (lvl) {
      case 'extreme':
        return 70;
      case 'less':
        return 20;
      case 'recommended':
      default:
        return 50;
    }
  };

  const getEstimatedSize = (originalSize: number, lvl: CompressionLevel) => {
    const pct = getEstimatedPercent(lvl);
    const est = originalSize * (1 - pct / 100);
    return formatFileSize(Math.max(500, est));
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

          {/* Level Selector */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                {lang === 'en' ? 'Compression Level' : 'Tingkat Kompresi'}
              </label>
              <span className="text-[11px] font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-900">
                Est. ~{getEstimatedPercent(level)}% Saved
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'recommended', title: lang === 'en' ? 'Recommended' : 'Rekomendasi', desc: lang === 'en' ? 'Good quality, high compression' : 'Kualitas bagus, kompresi tinggi', badge: '~50%' },
                { id: 'extreme', title: lang === 'en' ? 'Extreme' : 'Ekstrem', desc: lang === 'en' ? 'Less quality, max compression' : 'Kualitas standar, kompresi maksimal', badge: '~70%' },
                { id: 'less', title: lang === 'en' ? 'Less Compression' : 'Kompresi Ringan', desc: lang === 'en' ? 'High quality, less compression' : 'Kualitas tinggi, kompresi ringan', badge: '~20%' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setLevel(item.id as CompressionLevel)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
                    level === item.id
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{item.title}</h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${level === item.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1.5">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Estimated Target Size Banner */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>{lang === 'en' ? 'Estimated Target Size:' : 'Perkiraan Ukuran Hasil:'}</span>
              <span className="font-extrabold text-blue-600 dark:text-sky-400">
                {formatFileSize(file.size)} → <span className="underline decoration-blue-500 font-black">{getEstimatedSize(file.size, level)}</span> (-{getEstimatedPercent(level)}%)
              </span>
            </div>
          </div>

          {/* Actual Result Stats Banner after Compression */}
          {result && (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-800 space-y-3 animate-fade-in shadow-md">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-black text-sm sm:text-base">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{lang === 'en' ? 'Compression Successful!' : 'Kompresi Berhasil!'}</span>
                </div>

                <div className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs sm:text-sm shadow-sm">
                  -{result.savedPercentage}% {lang === 'en' ? 'Smaller' : 'Lebih Kecil'}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-extrabold pt-1 border-t border-emerald-200 dark:border-emerald-900">
                <span>{lang === 'en' ? 'Size Comparison:' : 'Perbandingan Ukuran:'}</span>
                <span className="text-sm font-black">
                  {formatFileSize(result.originalSize)} ➔ <span className="text-emerald-700 dark:text-emerald-300 underline">{formatFileSize(result.compressedSize)}</span>
                </span>
              </div>
            </div>
          )}

          {/* Rename Output File Section */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 shrink-0">
              {lang === 'en' ? 'Save as:' : 'Simpan sebagai:'}
            </span>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              {isEditingName ? (
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                  autoFocus
                  className="w-full text-xs font-black px-3 py-1.5 rounded-xl border-2 border-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              ) : (
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xs font-black text-slate-900 dark:text-white truncate">{customName}</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="text-[11px] font-extrabold text-blue-600 dark:text-sky-400 hover:underline shrink-0"
                  >
                    (Edit name)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
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
              {result ? <Download className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              <span>
                {isProcessing
                  ? (lang === 'en' ? 'Compressing...' : 'Mengompres...')
                  : result
                  ? (lang === 'en' ? 'Download Compressed PDF' : 'Unduh PDF Terkompresi')
                  : (lang === 'en' ? 'Compress & Download' : 'Kompres & Unduh')}
              </span>
              {!isProcessing && <ArrowRight className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompressPdfWorkspace;
