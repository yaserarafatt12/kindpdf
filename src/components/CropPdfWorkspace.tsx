'use client';

import React, { useState } from 'react';
import { ArrowLeft, Crop, AlertCircle, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { downloadBlob } from '@/lib/files/downloadBlob';
import FileDropzone from './FileDropzone';
import PrivacyNotice from './PrivacyNotice';
import { cropPdf, CropOptions } from '@/lib/pdf/cropPdf';
import { HumanError } from '@/lib/errors/messages';

interface CropPdfWorkspaceProps {
  onBack: () => void;
  t: TranslationDictionary;
  lang: Language;
}

export const CropPdfWorkspace: React.FC<CropPdfWorkspaceProps> = ({ onBack, t, lang }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorToast, setErrorToast] = useState<HumanError | null>(null);

  // Crop margins (percentage)
  const [top, setTop] = useState(10);
  const [right, setRight] = useState(10);
  const [bottom, setBottom] = useState(10);
  const [left, setLeft] = useState(10);
  const [pageSelection, setPageSelection] = useState<string>('all');
  const [customRange, setCustomRange] = useState('');

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
  };

  const handleCrop = async () => {
    if (!file) return;

    setIsProcessing(true);
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
        // Progress callback - could show status
      });

      const blob = new Blob([croppedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.pdf$/i, '');
      downloadBlob(blob, `Kindpdf_${baseName}_Cropped.pdf`);
    } catch (err: any) {
      setErrorToast({
        type: 'CORRUPTED',
        title: lang === 'en' ? 'Crop Failed' : 'Gagal Memotong',
        message: err?.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setTop(10);
    setRight(10);
    setBottom(10);
    setLeft(10);
    setPageSelection('all');
    setCustomRange('');
    setErrorToast(null);
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

      {/* Hero Section */}
      <div className="text-center space-y-2 py-2 max-w-lg mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Crop PDF
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'en'
            ? 'Trim margins and resize the visible area of your PDF pages. Non-destructive crop using CropBox.'
            : 'Potong margin dan ubah area tampak halaman PDF Anda. Crop non-destruktif menggunakan CropBox.'}
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

      {/* File Upload */}
      {!file && <FileDropzone onFilesSelected={handleFileSelected} disabled={isProcessing} t={t} colorTheme="blue" />}

      {/* Crop Controls */}
      {file && (
        <div className="space-y-5">
          {/* File Info Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">{file.name}</p>
              <p className="text-xs text-slate-500 font-medium">{pageCount} {lang === 'en' ? 'pages' : 'halaman'}</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-extrabold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 btn-press-effect"
            >
              {lang === 'en' ? 'Change File' : 'Ganti File'}
            </button>
          </div>

          {/* Visual Crop Preview + Controls */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Crop className="w-4 h-4 text-blue-600" />
              {lang === 'en' ? 'Crop Margins (%)' : 'Margin Potong (%)'}
            </h3>

            {/* Visual Preview */}
            <div className="flex justify-center">
              <div className="relative w-48 h-64 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-lg">
                {/* Crop area visualization */}
                <div
                  className="absolute bg-blue-500/20 border-2 border-blue-500 border-dashed rounded"
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    right: `${right}%`,
                    bottom: `${bottom}%`,
                  }}
                />
                {/* Labels */}
                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500">{top}%</span>
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500">{bottom}%</span>
                <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">{left}%</span>
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">{right}%</span>
              </div>
            </div>

            {/* Margin Inputs Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: lang === 'en' ? 'Top' : 'Atas', value: top, setter: setTop },
                { label: lang === 'en' ? 'Right' : 'Kanan', value: right, setter: setRight },
                { label: lang === 'en' ? 'Bottom' : 'Bawah', value: bottom, setter: setBottom },
                { label: lang === 'en' ? 'Left' : 'Kiri', value: left, setter: setLeft },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">{item.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={45}
                      value={item.value}
                      onChange={(e) => item.setter(Number(e.target.value))}
                      className="flex-1 accent-blue-600"
                    />
                    <span className="text-xs font-black text-blue-600 dark:text-sky-400 w-10 text-right">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Page Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                {lang === 'en' ? 'Apply To Pages' : 'Terapkan ke Halaman'}
              </label>
              <select
                value={pageSelection}
                onChange={(e) => setPageSelection(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
              >
                <option value="all">{lang === 'en' ? 'All Pages' : 'Semua Halaman'}</option>
                <option value="odd">{lang === 'en' ? 'Odd Pages (1, 3, 5...)' : 'Halaman Ganjil (1, 3, 5...)'}</option>
                <option value="even">{lang === 'en' ? 'Even Pages (2, 4, 6...)' : 'Halaman Genap (2, 4, 6...)'}</option>
                <option value="custom">{lang === 'en' ? 'Custom Range' : 'Rentang Kustom'}</option>
              </select>

              {pageSelection === 'custom' && (
                <input
                  type="text"
                  value={customRange}
                  onChange={(e) => setCustomRange(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g. 1-3, 5, 8-10' : 'cth. 1-3, 5, 8-10'}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
              )}
            </div>

            {/* Privacy Warning */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-medium text-amber-800 dark:text-amber-300">
              ⚠️ {lang === 'en'
                ? 'Crop is not redaction. Hidden content outside the crop area may still exist in the file.'
                : 'Crop bukan redaksi. Konten tersembunyi di luar area crop mungkin masih ada dalam file.'}
            </div>
          </div>

          {/* CTA Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{lang === 'en' ? '100% processed locally in your browser.' : '100% diproses secara lokal di browser Anda.'}</span>
            </div>

            <button
              type="button"
              onClick={handleCrop}
              disabled={isProcessing}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-xl transition-all duration-200 btn-press-effect ${
                !isProcessing
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-blue-500/30 scale-[1.02]'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <Crop className="w-4 h-4" />
              <span>{isProcessing ? (lang === 'en' ? 'Cropping...' : 'Memotong...') : (lang === 'en' ? 'Crop & Download' : 'Potong & Unduh')}</span>
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

export default CropPdfWorkspace;
