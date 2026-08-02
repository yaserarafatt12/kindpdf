'use client';

import React, { useState } from 'react';
import { ArrowLeft, GitCompare, CheckCircle2, AlertCircle, X, ShieldCheck, FileText } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { formatFileSize } from '@/lib/files/formatFileSize';
import FileDropzone from './FileDropzone';
import PrivacyNotice from './PrivacyNotice';
import { comparePdfs, ComparisonReport } from '@/lib/pdf/comparePdf';
import { HumanError } from '@/lib/errors/messages';

interface ComparePdfWorkspaceProps {
  onBack: () => void;
  t: TranslationDictionary;
  lang: Language;
}

export const ComparePdfWorkspace: React.FC<ComparePdfWorkspaceProps> = ({ onBack, t, lang }) => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [report, setReport] = useState<ComparisonReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorToast, setErrorToast] = useState<HumanError | null>(null);

  const handleSelectFile1 = async (files: File[]) => {
    if (files.length === 0) return;
    const res = await validatePdfFile(files[0]);
    if (!res.isValid && res.error) {
      setErrorToast(res.error);
      return;
    }
    setFile1(files[0]);
    setReport(null);
  };

  const handleSelectFile2 = async (files: File[]) => {
    if (files.length === 0) return;
    const res = await validatePdfFile(files[0]);
    if (!res.isValid && res.error) {
      setErrorToast(res.error);
      return;
    }
    setFile2(files[0]);
    setReport(null);
  };

  const handleCompare = async () => {
    if (!file1 || !file2) return;

    setIsProcessing(true);
    setErrorToast(null);

    try {
      const resultReport = await comparePdfs(file1, file2);
      setReport(resultReport);
    } catch (err: any) {
      setErrorToast({
        type: 'CORRUPTED',
        title: lang === 'en' ? 'Comparison Failed' : 'Gagal Membandingkan',
        message: err?.message || 'Unexpected error comparing PDFs.',
      });
    } finally {
      setIsProcessing(false);
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
          Compare PDF
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'en'
            ? 'Compare two PDF documents side-by-side to detect structural differences and page counts.'
            : 'Bandingkan dua dokumen PDF berdampingan untuk mendeteksi perbedaan struktur & jumlah halaman.'}
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

      {/* Upload 2 Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Document 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-sky-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            {lang === 'en' ? 'First Document (Original)' : 'Dokumen Pertama (Asli)'}
          </h3>

          {file1 ? (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black truncate text-slate-900 dark:text-white">{file1.name}</p>
                <p className="text-[11px] text-slate-500 font-medium">{formatFileSize(file1.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile1(null);
                  setReport(null);
                }}
                className="text-xs text-rose-500 font-bold hover:underline"
              >
                {lang === 'en' ? 'Change' : 'Ubah'}
              </button>
            </div>
          ) : (
            <FileDropzone onFilesSelected={handleSelectFile1} disabled={isProcessing} t={t} colorTheme="purple" />
          )}
        </div>

        {/* Document 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            {lang === 'en' ? 'Second Document (Modified)' : 'Dokumen Kedua (Modifikasi)'}
          </h3>

          {file2 ? (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black truncate text-slate-900 dark:text-white">{file2.name}</p>
                <p className="text-[11px] text-slate-500 font-medium">{formatFileSize(file2.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile2(null);
                  setReport(null);
                }}
                className="text-xs text-rose-500 font-bold hover:underline"
              >
                {lang === 'en' ? 'Change' : 'Ubah'}
              </button>
            </div>
          ) : (
            <FileDropzone onFilesSelected={handleSelectFile2} disabled={isProcessing} t={t} />
          )}
        </div>
      </div>

      {/* Compare Button */}
      {file1 && file2 && !report && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleCompare}
            disabled={isProcessing}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-sm shadow-xl shadow-blue-500/30 flex items-center gap-2 btn-press-effect"
          >
            <GitCompare className="w-4 h-4" />
            <span>{isProcessing ? (lang === 'en' ? 'Comparing...' : 'Membandingkan...') : (lang === 'en' ? 'Compare Documents' : 'Bandingkan Dokumen')}</span>
          </button>
        </div>
      )}

      {/* Comparison Report Display */}
      {report && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-500/40 shadow-xl space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 text-blue-600 dark:text-sky-400 font-black text-base border-b pb-3 border-slate-200 dark:border-slate-800">
            <GitCompare className="w-5 h-5" />
            <h3>{lang === 'en' ? 'Comparison Results' : 'Hasil Perbandingan'}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border space-y-2">
              <h4 className="text-xs font-extrabold text-slate-500">{lang === 'en' ? 'Page Count Analysis' : 'Analisis Halaman'}</h4>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{report.doc1Name}</span>
                <span className="text-xs font-black text-blue-600">{report.doc1Pages} {lang === 'en' ? 'pages' : 'hal'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{report.doc2Name}</span>
                <span className="text-xs font-black text-purple-600">{report.doc2Pages} {lang === 'en' ? 'pages' : 'hal'}</span>
              </div>
              <div className="pt-2 border-t text-xs font-extrabold flex items-center gap-1.5">
                {report.pageCountMatch ? (
                  <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> {lang === 'en' ? 'Identical Page Count' : 'Jumlah Halaman Sama'}</span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {lang === 'en' ? 'Page Count Difference Detected' : 'Perbedaan Jumlah Halaman'}</span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border space-y-2">
              <h4 className="text-xs font-extrabold text-slate-500">{lang === 'en' ? 'File Size Analysis' : 'Analisis Ukuran File'}</h4>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{report.doc1Name}</span>
                <span className="text-xs font-black">{formatFileSize(report.doc1Size)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{report.doc2Name}</span>
                <span className="text-xs font-black">{formatFileSize(report.doc2Size)}</span>
              </div>
              <div className="pt-2 border-t text-xs font-extrabold text-slate-700 dark:text-slate-300">
                {lang === 'en' ? 'Delta:' : 'Selisih:'} {formatFileSize(report.sizeDiffBytes)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <PrivacyNotice t={t} />
    </div>
  );
};

export default ComparePdfWorkspace;
