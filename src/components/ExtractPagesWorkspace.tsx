'use client';

import React, { useState } from 'react';
import { TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { extractPagesFromPdf } from '@/lib/pdf/pageOperations';
import { parseRangeString } from '@/lib/pdf/splitPdf';
import { downloadBlob } from '@/lib/files/downloadBlob';
import { formatFileSize } from '@/lib/files/formatFileSize';
import ProcessingProgress from './ProcessingProgress';
import FileDropzone from './FileDropzone';
import SuccessDownloadScreen from './SuccessDownloadScreen';
import { ViewMode } from '@/components/Header';
import {
  Copy,
  FileText,
  Trash2,
  AlertCircle,
  X,
  ShieldCheck,
  ArrowLeft,
  CheckSquare,
} from 'lucide-react';

interface ExtractPagesWorkspaceProps {
  onBack: () => void;
  onSelectTool?: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: 'en' | 'id';
}

export const ExtractPagesWorkspace: React.FC<ExtractPagesWorkspaceProps> = ({
  onBack,
  onSelectTool,
  t,
  lang,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [rangeInput, setRangeInput] = useState<string>('1');
  const [separateFiles, setSeparateFiles] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorToast, setErrorToast] = useState<{ title: string; message: string } | null>(null);
  const [extractResult, setExtractResult] = useState<{ blob: Blob; filename: string } | null>(null);

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
    setRangeInput(`1-${Math.min(2, validation.pageCount)}`);
  };

  const handleExecuteExtract = async () => {
    if (!file || pageCount === 0) return;
    setErrorToast(null);

    let pagesToExtract: number[] = [];
    try {
      const ranges = parseRangeString(rangeInput, pageCount);
      for (const r of ranges) {
        for (let p = r.start; p <= r.end; p++) {
          pagesToExtract.push(p);
        }
      }
      pagesToExtract = Array.from(new Set(pagesToExtract)).sort((a, b) => a - b);

      if (pagesToExtract.length === 0) {
        setErrorToast({
          title: lang === 'en' ? 'No Pages Selected' : 'Tidak Ada Halaman Dipilih',
          message:
            lang === 'en'
              ? 'Please enter valid page numbers (e.g. 1-3, 5).'
              : 'Masukkan nomor halaman yang valid (contoh: 1-3, 5).',
        });
        return;
      }
    } catch (err: any) {
      setErrorToast({
        title: lang === 'en' ? 'Invalid Syntax' : 'Sintaks Salah',
        message: err?.message || 'Check your page input format.',
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(2);
    setProgressMsg(
      lang === 'en'
        ? 'Extracting selected PDF pages...'
        : 'Mengekstrak halaman PDF yang dipilih...'
    );

    try {
      const result = await extractPagesFromPdf(
        file,
        pagesToExtract,
        separateFiles,
        (curr, tot, msg) => {
          setCurrentStep(curr);
          setTotalSteps(tot);
          setProgressMsg(msg);
        }
      );

      setIsProcessing(false);
      setExtractResult({
        blob: result.blob,
        filename: result.filename,
      });
    } catch (err: any) {
      setIsProcessing(false);
      setErrorToast({
        title: lang === 'en' ? 'Extraction Failed' : 'Gagal Mengekstrak PDF',
        message: err?.message || 'Unexpected error while extracting pages.',
      });
    }
  };

  if (extractResult) {
    return (
      <SuccessDownloadScreen
        title={
          lang === 'en' ? 'Pages Extracted Successfully!' : 'Halaman PDF Berhasil Diekstrak!'
        }
        downloadFileName={extractResult.filename}
        downloadButtonText={lang === 'en' ? 'Download Extracted PDF' : 'Unduh PDF Hasil Ekstrak'}
        onDownload={(customName?: string) =>
          downloadBlob(extractResult.blob, customName || extractResult.filename)
        }
        onStartOver={() => {
          setExtractResult(null);
          setFile(null);
          setPageCount(0);
        }}
        onSelectTool={(toolId: ViewMode) => {
          setExtractResult(null);
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
          {lang === 'en' ? 'Extract PDF Pages' : 'Ekstrak Halaman PDF'}
        </h2>
        <p className="text-xs sm:text-sm text-[#0A1128]/65 dark:text-white/60 font-normal leading-relaxed">
          {lang === 'en'
            ? 'Extract specific pages from your PDF document into a brand new file.'
            : 'Ekstrak halaman tertentu dari dokumen PDF Anda menjadi berkas baru.'}
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
          <div className="glass-card p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3 min-w-0">
            <div className="relative z-10 flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.18] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#0A1128]/80 dark:text-white/85" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-[#0A1128] dark:text-white truncate">
                  {file.name}
                </h4>
                <p className="text-xs font-medium text-[#0A1128]/60 dark:text-white/55 truncate">
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
              className="relative z-10 p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 transition-colors btn-press-effect shrink-0"
              title="Remove File"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Configuration Card */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="relative z-10 space-y-1.5">
              <label className="text-xs font-bold text-[#0A1128] dark:text-white">
                {lang === 'en' ? 'Pages to Extract' : 'Halaman yang Diekstrak'}
              </label>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder="e.g. 1-3, 5, 8-10"
                className="w-full px-4 py-2.5 rounded-xl bg-white/80 dark:bg-white/[0.07] border border-black/[0.10] dark:border-white/[0.16] text-xs font-bold text-[#0A1128] dark:text-white outline-none focus:border-[#00A3FF] dark:focus:border-[#38BDF8]"
              />
              <p className="text-[10px] text-[#0A1128]/55 dark:text-white/55 font-medium">
                {lang === 'en'
                  ? `Enter single pages or ranges. Total available pages: ${pageCount}.`
                  : `Masukkan nomor halaman atau rentang. Total halaman: ${pageCount}.`}
              </p>
            </div>

            {/* Separate Files Checkbox Option */}
            <div className="relative z-10 pt-2 border-t border-black/[0.08] dark:border-white/[0.12]">
              <label
                onClick={() => setSeparateFiles(!separateFiles)}
                className="inline-flex items-center gap-2.5 cursor-pointer select-none"
              >
                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                    separateFiles
                      ? 'bg-[#0A1128] dark:bg-white border-[#0A1128] dark:border-white text-white dark:text-[#071124]'
                      : 'border-black/20 dark:border-white/25 bg-white/50 dark:bg-white/[0.06]'
                  }`}
                >
                  {separateFiles && <CheckSquare className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-xs font-bold text-[#0A1128] dark:text-white">
                  {lang === 'en'
                    ? 'Extract into separate individual PDF files (ZIP)'
                    : 'Ekstrak menjadi berkas PDF terpisah masing-masing (ZIP)'}
                </span>
              </label>
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
              onClick={handleExecuteExtract}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glass-cta font-bold text-sm transition-all btn-press-effect flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>{lang === 'en' ? 'Extract Pages Now' : 'Ekstrak Halaman Sekarang'}</span>
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

export default ExtractPagesWorkspace;
