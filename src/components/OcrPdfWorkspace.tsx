'use client';

import React, { useState } from 'react';
import { ArrowLeft, ScanText, Copy, Check, Download, ShieldCheck, AlertCircle, X } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { downloadBlob } from '@/lib/files/downloadBlob';
import FileDropzone from './FileDropzone';
import { ocrPdf, OcrResult } from '@/lib/pdf/ocrPdf';
import { HumanError } from '@/lib/errors/messages';
import ProcessingProgress from './ProcessingProgress';
import SuccessDownloadScreen from './SuccessDownloadScreen';
import { ViewMode } from '@/components/Header';

interface OcrPdfWorkspaceProps {
  onBack: () => void;
  onSelectTool?: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: Language;
}

export const OcrPdfWorkspace: React.FC<OcrPdfWorkspaceProps> = ({
  onBack,
  onSelectTool,
  t,
  lang,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [ocrLang, setOcrLang] = useState<'eng' | 'ind'>('eng');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorToast, setErrorToast] = useState<HumanError | null>(null);
  const [completedResult, setCompletedResult] = useState<{
    blob: Blob;
    filename: string;
  } | null>(null);

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

  const handleOcr = async () => {
    if (!file) return;

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(2);
    setProgressMsg(lang === 'en' ? 'Scanning text layer with OCR engine...' : 'Memindai lapisan teks dengan mesin OCR...');
    setErrorToast(null);

    try {
      const ocrRes = await ocrPdf(file, ocrLang);
      setResult(ocrRes);
      
      const blob = new Blob([ocrRes.extractedText], { type: 'text/plain;charset=utf-8' });
      const baseName = file.name.replace(/\.pdf$/i, '');
      const filename = `Kindpdf_${baseName}_OCR.txt`;

      setCurrentStep(2);
      setTotalSteps(2);

      setIsProcessing(false);
      setCompletedResult({
        blob,
        filename,
      });
    } catch (err: any) {
      setIsProcessing(false);
      setErrorToast({
        type: 'CORRUPTED',
        title: lang === 'en' ? 'OCR Failed' : 'OCR Gagal',
        message: err?.message || 'Unexpected error running OCR.',
      });
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (completedResult) {
    return (
      <SuccessDownloadScreen
        title={lang === 'en' ? 'OCR Text Extracted Successfully!' : 'Teks OCR Berhasil Diekstrak!'}
        downloadFileName={completedResult.filename}
        downloadButtonText={lang === 'en' ? 'Download Text (.TXT)' : 'Unduh Teks (.TXT)'}
        onDownload={(customName?: string) =>
          downloadBlob(completedResult.blob, customName || completedResult.filename)
        }
        onStartOver={() => {
          setCompletedResult(null);
          setResult(null);
          setFile(null);
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
        className="inline-flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 transition-colors btn-press-effect"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.backToAllTools}</span>
      </button>

      {/* Hero Header */}
      <div className="text-center space-y-2 py-2 max-w-lg mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          OCR PDF
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'en'
            ? 'Extract selectable text from scanned PDF documents and images directly in your browser.'
            : 'Ekstrak teks terbaca dari dokumen PDF scan dan gambar secara langsung di browser Anda.'}
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
      {!file && <FileDropzone onFilesSelected={handleFileSelected} disabled={isProcessing} t={t} colorTheme="purple" />}

      {/* OCR Controls */}
      {file && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 min-w-0">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">{file.name}</p>
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

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm space-y-3">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'OCR Language' : 'Bahasa OCR'}
            </label>
            <select
              value={ocrLang}
              onChange={(e) => setOcrLang(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="eng">English</option>
              <option value="ind">Indonesian (Bahasa Indonesia)</option>
            </select>
          </div>

          {/* Extracted Output Text Area */}
          {result && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-500/40 shadow-xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <span className="text-xs font-black text-blue-600 dark:text-sky-400 flex items-center gap-1.5">
                  <ScanText className="w-4 h-4" />
                  {lang === 'en' ? 'Extracted Text Result' : 'Hasil Teks Hasil OCR'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold flex items-center gap-1 btn-press-effect"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (lang === 'en' ? 'Copied' : 'Tersalin') : (lang === 'en' ? 'Copy Text' : 'Salin Teks')}</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={10}
                readOnly
                value={result.extractedText}
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>
          )}

          {/* CTA Bar */}
          {!result && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{lang === 'en' ? '100% processed locally in browser.' : '100% diproses secara lokal di browser.'}</span>
              </div>

              <button
                type="button"
                onClick={handleOcr}
                disabled={isProcessing}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-xl transition-all duration-200 btn-press-effect ${
                  !isProcessing
                    ? 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-blue-500/30 scale-[1.02]'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                <ScanText className="w-4 h-4" />
                <span>{isProcessing ? (lang === 'en' ? 'Running OCR...' : 'Menjalankan OCR...') : (lang === 'en' ? 'Run OCR & Extract Text' : 'Jalankan OCR & Ekstrak Teks')}</span>
              </button>
            </div>
          )}
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

export default OcrPdfWorkspace;
