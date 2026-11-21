'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  GitCompare,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { formatFileSize } from '@/lib/files/formatFileSize';
import { downloadBlob } from '@/lib/files/downloadBlob';
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

  const handleDownloadReport = () => {
    if (!report) return;
    const lines: string[] = [
      '=== KindPDF Structural & Text Comparison Report ===',
      `Document 1 (Original): ${report.doc1Name} (${report.doc1Pages} pages, ${formatFileSize(report.doc1Size)})`,
      `Document 2 (Modified): ${report.doc2Name} (${report.doc2Pages} pages, ${formatFileSize(report.doc2Size)})`,
      `Page Count Match: ${report.pageCountMatch ? 'YES' : 'NO'}`,
      `File Size Delta: ${formatFileSize(report.sizeDiffBytes)}`,
      `Text Layer Identical: ${report.textMatch ? 'YES' : 'NO'}`,
      '',
    ];

    if (report.pageDiffs && report.pageDiffs.length > 0) {
      lines.push('--- Per-Page Text Comparison ---');
      for (const diff of report.pageDiffs) {
        lines.push(
          `Page ${diff.pageNumber}: ${diff.matches ? 'MATCH' : 'DIFFERENCE DETECTED'}`
        );
        if (!diff.matches) {
          lines.push(`  Doc 1: ${diff.doc1Snippet}`);
          lines.push(`  Doc 2: ${diff.doc2Snippet}`);
        }
      }
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, 'Kindpdf_Comparison_Report.txt');
  };

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
          Compare PDF
        </h2>
        <p className="text-xs sm:text-sm text-[#0A1128]/65 dark:text-white/60 font-normal leading-relaxed">
          {lang === 'en'
            ? 'Compare two PDF documents side-by-side to detect structural and text layer differences.'
            : 'Bandingkan dua dokumen PDF berdampingan untuk mendeteksi perbedaan struktur & lapisan teks.'}
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

      {/* Upload 2 Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Document 1 */}
        <div className="glass-card p-5 rounded-3xl space-y-3">
          <h3 className="relative z-10 text-xs font-bold uppercase tracking-wider text-[#0A1128]/70 dark:text-white/70 flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>{lang === 'en' ? 'First Document (Original)' : 'Dokumen Pertama (Asli)'}</span>
          </h3>

          {file1 ? (
            <div className="relative z-10 p-3.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.14] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold truncate text-[#0A1128] dark:text-white">
                  {file1.name}
                </p>
                <p className="text-[11px] text-[#0A1128]/55 dark:text-white/55 font-medium">
                  {formatFileSize(file1.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile1(null);
                  setReport(null);
                }}
                className="text-xs text-rose-500 font-bold hover:underline shrink-0"
              >
                {lang === 'en' ? 'Change' : 'Ubah'}
              </button>
            </div>
          ) : (
            <FileDropzone
              onFilesSelected={handleSelectFile1}
              disabled={isProcessing}
              t={t}
              multiple={false}
            />
          )}
        </div>

        {/* Document 2 */}
        <div className="glass-card p-5 rounded-3xl space-y-3">
          <h3 className="relative z-10 text-xs font-bold uppercase tracking-wider text-[#0A1128]/70 dark:text-white/70 flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>{lang === 'en' ? 'Second Document (Modified)' : 'Dokumen Kedua (Modifikasi)'}</span>
          </h3>

          {file2 ? (
            <div className="relative z-10 p-3.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.14] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold truncate text-[#0A1128] dark:text-white">
                  {file2.name}
                </p>
                <p className="text-[11px] text-[#0A1128]/55 dark:text-white/55 font-medium">
                  {formatFileSize(file2.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile2(null);
                  setReport(null);
                }}
                className="text-xs text-rose-500 font-bold hover:underline shrink-0"
              >
                {lang === 'en' ? 'Change' : 'Ubah'}
              </button>
            </div>
          ) : (
            <FileDropzone
              onFilesSelected={handleSelectFile2}
              disabled={isProcessing}
              t={t}
              multiple={false}
            />
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
            className="px-8 py-3.5 rounded-2xl glass-cta font-bold text-sm flex items-center gap-2 btn-press-effect"
          >
            <GitCompare className="w-4 h-4" />
            <span>
              {isProcessing
                ? lang === 'en'
                  ? 'Comparing...'
                  : 'Membandingkan...'
                : lang === 'en'
                  ? 'Compare Documents'
                  : 'Bandingkan Dokumen'}
            </span>
          </button>
        </div>
      )}

      {/* Comparison Report Display */}
      {report && (
        <div className="glass-card p-6 rounded-3xl space-y-5 animate-fade-in">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-black/[0.08] dark:border-white/[0.12]">
            <div className="flex items-center gap-2 text-[#0A1128] dark:text-white font-bold text-base">
              <GitCompare className="w-5 h-5" />
              <h3>{lang === 'en' ? 'Comparison Results' : 'Hasil Perbandingan'}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadReport}
                className="px-3.5 py-1.5 rounded-full glass-cta text-xs font-bold inline-flex items-center gap-1.5 btn-press-effect"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Download Report (.TXT)' : 'Unduh Laporan (.TXT)'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile1(null);
                  setFile2(null);
                  setReport(null);
                }}
                className="px-3 py-1.5 rounded-full glass-pill text-xs font-bold inline-flex items-center gap-1 btn-press-effect"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Reset' : 'Ulangi'}</span>
              </button>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] space-y-2">
              <h4 className="text-xs font-bold text-[#0A1128]/55 dark:text-white/55">
                {lang === 'en' ? 'Page Count Analysis' : 'Analisis Halaman'}
              </h4>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#0A1128]/80 dark:text-white/80 truncate">
                  {report.doc1Name}
                </span>
                <span className="text-xs font-bold text-[#0A1128] dark:text-white shrink-0">
                  {report.doc1Pages} {lang === 'en' ? 'pages' : 'hal'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#0A1128]/80 dark:text-white/80 truncate">
                  {report.doc2Name}
                </span>
                <span className="text-xs font-bold text-[#0A1128] dark:text-white shrink-0">
                  {report.doc2Pages} {lang === 'en' ? 'pages' : 'hal'}
                </span>
              </div>
              <div className="pt-2 border-t border-black/[0.08] dark:border-white/[0.12] text-xs font-bold flex items-center gap-1.5">
                {report.pageCountMatch ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {lang === 'en' ? 'Identical Page Count' : 'Jumlah Halaman Sama'}
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {lang === 'en' ? 'Page Count Difference Detected' : 'Perbedaan Jumlah Halaman'}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] space-y-2">
              <h4 className="text-xs font-bold text-[#0A1128]/55 dark:text-white/55">
                {lang === 'en' ? 'File Size Analysis' : 'Analisis Ukuran File'}
              </h4>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#0A1128]/80 dark:text-white/80 truncate">
                  {report.doc1Name}
                </span>
                <span className="text-xs font-bold shrink-0">{formatFileSize(report.doc1Size)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#0A1128]/80 dark:text-white/80 truncate">
                  {report.doc2Name}
                </span>
                <span className="text-xs font-bold shrink-0">{formatFileSize(report.doc2Size)}</span>
              </div>
              <div className="pt-2 border-t border-black/[0.08] dark:border-white/[0.12] text-xs font-bold text-[#0A1128] dark:text-white">
                {lang === 'en' ? 'Delta:' : 'Selisih:'} {formatFileSize(report.sizeDiffBytes)}
              </div>
            </div>
          </div>

          {report.pageDiffs && report.pageDiffs.length > 0 && (
            <div className="relative z-10 space-y-2.5 pt-2 border-t border-black/[0.08] dark:border-white/[0.12]">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#0A1128] dark:text-white">
                  {lang === 'en' ? 'Page-by-Page Text Stream Analysis' : 'Analisis Lapisan Teks per Halaman'}
                </h4>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08]">
                  {report.textMatch
                    ? lang === 'en'
                      ? '100% Text Match'
                      : 'Teks 100% Sama'
                    : lang === 'en'
                      ? 'Text Differences Found'
                      : 'Perbedaan Teks Ditemukan'}
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {report.pageDiffs.map((diff) => (
                  <div
                    key={diff.pageNumber}
                    className="p-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>
                        {lang === 'en' ? 'Page' : 'Halaman'} {diff.pageNumber}
                      </span>
                      <span
                        className={
                          diff.matches
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }
                      >
                        {diff.matches
                          ? lang === 'en'
                            ? 'Identical'
                            : 'Sama'
                          : lang === 'en'
                            ? 'Modified'
                            : 'Berbeda'}
                      </span>
                    </div>
                    {!diff.matches && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-[#0A1128]/70 dark:text-white/70 font-mono">
                        <div className="p-2 rounded-xl bg-white/60 dark:bg-white/[0.04] truncate">
                          1: {diff.doc1Snippet}
                        </div>
                        <div className="p-2 rounded-xl bg-white/60 dark:bg-white/[0.04] truncate">
                          2: {diff.doc2Snippet}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <PrivacyNotice t={t} />
    </div>
  );
};

export default ComparePdfWorkspace;
