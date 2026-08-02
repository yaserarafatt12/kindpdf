'use client';

import React, { useState } from 'react';
import { ArrowLeft, Code, FileText, ShieldCheck, ArrowRight, AlertCircle, X } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { downloadBlob } from '@/lib/files/downloadBlob';
import PrivacyNotice from './PrivacyNotice';
import { htmlToPdf, HtmlToPdfOptions } from '@/lib/pdf/htmlToPdf';
import { HumanError } from '@/lib/errors/messages';

import ProcessingProgress from './ProcessingProgress';
import SuccessDownloadScreen from './SuccessDownloadScreen';
import { ViewMode } from '@/components/Header';

interface HtmlToPdfWorkspaceProps {
  onBack: () => void;
  onSelectTool?: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: Language;
}

export const HtmlToPdfWorkspace: React.FC<HtmlToPdfWorkspaceProps> = ({
  onBack,
  onSelectTool,
  t,
  lang,
}) => {
  const [docTitle, setDocTitle] = useState('My Document');
  const [content, setContent] = useState(
    '<h1>Welcome to Kindpdf</h1>\n<p>This is a sample document generated directly inside your web browser without uploading any data to external servers.</p>\n<p>Add your text or HTML formatted notes here and download a clean PDF immediately.</p>'
  );
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [fontSize, setFontSize] = useState<number>(12);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorToast, setErrorToast] = useState<HumanError | null>(null);
  const [completedResult, setCompletedResult] = useState<{
    blob: Blob;
    filename: string;
  } | null>(null);

  const handleConvert = async () => {
    if (!content.trim()) {
      setErrorToast({
        type: 'EMPTY_FILE_LIST',
        title: lang === 'en' ? 'Content Required' : 'Konten Diperlukan',
        message: lang === 'en' ? 'Please enter some text or HTML content to convert.' : 'Masukkan teks atau konten HTML.',
      });
      return;
    }

    setIsProcessing(true);
    setErrorToast(null);

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(2);
    setProgressMsg(lang === 'en' ? 'Rendering HTML/Text document into PDF...' : 'Mengonversi HTML/Teks ke berkas PDF...');
    setErrorToast(null);

    try {
      const options: HtmlToPdfOptions = {
        title: docTitle,
        content,
        pageSize,
        fontSize,
      };

      const pdfBytes = await htmlToPdf(options);
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const filename = `${docTitle.replace(/\s+/g, '_')}.pdf`;

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
        title: lang === 'en' ? 'Conversion Failed' : 'Gagal Mengonversi',
        message: err?.message || 'Unexpected error building PDF.',
      });
    }
  };

  if (completedResult) {
    return (
      <SuccessDownloadScreen
        title={lang === 'en' ? 'PDF Generated Successfully!' : 'PDF Berhasil Dibuat dari HTML!'}
        downloadFileName={completedResult.filename}
        downloadButtonText={lang === 'en' ? 'Download PDF' : 'Unduh PDF'}
        onDownload={(customName?: string) =>
          downloadBlob(completedResult.blob, customName || completedResult.filename)
        }
        onStartOver={() => {
          setCompletedResult(null);
          setContent('');
        }}
        onSelectTool={(toolId: ViewMode) => {
          setCompletedResult(null);
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
          HTML to PDF
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'en'
            ? 'Convert text and HTML formatting into clean PDF documents 100% in-browser.'
            : 'Ubah format teks & HTML menjadi dokumen PDF yang rapi 100% di browser.'}
        </p>
      </div>

      {/* Privacy Notice */}
      <PrivacyNotice t={t} />

      {/* Progress Modal */}
      <ProcessingProgress
        isOpen={isProcessing}
        progressMessage={progressMsg}
        currentStep={currentStep}
        totalSteps={totalSteps}
        t={t}
      />

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

      {/* Editor Box */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'en' ? 'Document Title' : 'Judul Dokumen'}
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'en' ? 'Page Size' : 'Ukuran Halaman'}
            </label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
            {lang === 'en' ? 'Content (Text / HTML)' : 'Konten (Teks / HTML)'}
          </label>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* CTA Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{lang === 'en' ? '100% processed locally in browser.' : '100% diproses secara lokal di browser.'}</span>
        </div>

        <button
          type="button"
          onClick={handleConvert}
          disabled={isProcessing}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-xl transition-all duration-200 btn-press-effect ${
            !isProcessing
              ? 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-blue-500/30 scale-[1.02]'
              : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>{isProcessing ? (lang === 'en' ? 'Generating...' : 'Membuat...') : (lang === 'en' ? 'Convert & Download PDF' : 'Konversi & Unduh PDF')}</span>
          
        </button>
      </div>
    </div>
  );
};

export default HtmlToPdfWorkspace;
