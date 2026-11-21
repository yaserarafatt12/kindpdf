'use client';

import React, { useState, useRef } from 'react';
import { ArrowLeft, Code, ShieldCheck, AlertCircle, X, UploadCloud } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { downloadBlob } from '@/lib/files/downloadBlob';
import PrivacyNotice from './PrivacyNotice';
import { htmlToPdf, HtmlToPdfOptions } from '@/lib/pdf/htmlToPdf';
import { HumanError } from '@/lib/errors/messages';
import ProcessingProgress from './ProcessingProgress';
import SuccessDownloadScreen from './SuccessDownloadScreen';
import LiquidGlassPillBar from './LiquidGlassPillBar';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setErrorToast(null);
    try {
      const text = await selected.text();
      setContent(text);
      const base = selected.name.replace(/\.(html|htm|txt|md)$/i, '');
      if (base) setDocTitle(base);
    } catch {
      setErrorToast({
        type: 'CORRUPTED',
        title: lang === 'en' ? 'Read Error' : 'Gagal Membaca Berkas',
        message: lang === 'en' ? 'Could not read text from selected file.' : 'Tidak dapat membaca teks dari berkas.',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConvert = async () => {
    if (!content.trim()) {
      setErrorToast({
        type: 'EMPTY_FILE_LIST',
        title: lang === 'en' ? 'Content Required' : 'Konten Diperlukan',
        message:
          lang === 'en'
            ? 'Please enter some text or HTML content to convert.'
            : 'Masukkan teks atau konten HTML.',
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(2);
    setProgressMsg(
      lang === 'en'
        ? 'Rendering HTML/Text document into PDF...'
        : 'Mengonversi HTML/Teks ke berkas PDF...'
    );
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
      const cleanName = (docTitle || 'Document').trim().replace(/\s+/g, '_');
      const filename = `${cleanName}.pdf`;

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
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-extrabold btn-press-effect"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToAllTools}</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm,.txt,.md,text/html,text/plain"
          onChange={handleImportFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-pill text-xs font-bold btn-press-effect"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Import .HTML / .TXT' : 'Impor .HTML / .TXT'}</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-2 py-2 max-w-lg mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1128] dark:text-white">
          HTML / Notes to PDF
        </h2>
        <p className="text-xs sm:text-sm text-[#0A1128]/65 dark:text-white/60 font-normal leading-relaxed">
          {lang === 'en'
            ? 'Convert text notes and HTML formatting into clean PDF documents 100% in-browser.'
            : 'Ubah catatan teks & format HTML menjadi dokumen PDF rapi 100% di browser.'}
        </p>
      </div>

      <PrivacyNotice t={t} />

      <ProcessingProgress
        isOpen={isProcessing}
        progressMessage={progressMsg}
        currentStep={currentStep}
        totalSteps={totalSteps}
        t={t}
      />

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

      {/* Editor Box */}
      <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#0A1128] dark:text-white mb-1.5">
              {lang === 'en' ? 'Document Title' : 'Judul Dokumen'}
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-white/[0.07] border border-black/[0.10] dark:border-white/[0.16] text-xs font-bold text-[#0A1128] dark:text-white outline-none focus:border-[#00A3FF] dark:focus:border-[#38BDF8]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0A1128] dark:text-white mb-1.5">
              {lang === 'en' ? 'Page Size' : 'Ukuran Halaman'}
            </label>
            <LiquidGlassPillBar<'a4' | 'letter'>
              size="sm"
              equalWidth
              ariaLabel="HTML to PDF page size"
              value={pageSize}
              onChange={setPageSize}
              options={[
                { id: 'a4', label: 'A4' },
                { id: 'letter', label: 'Letter' },
              ]}
            />
          </div>
        </div>

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#0A1128] dark:text-white">
              {lang === 'en' ? 'Content (Text / HTML)' : 'Konten (Teks / HTML)'}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#0A1128]/60 dark:text-white/55">
                {lang === 'en' ? 'Font Size:' : 'Ukuran Font:'}
              </span>
              <input
                type="number"
                min={8}
                max={24}
                value={fontSize}
                onChange={(e) => setFontSize(Math.max(8, Math.min(24, Number(e.target.value) || 12)))}
                className="w-14 px-2 py-1 rounded-lg bg-white/80 dark:bg-white/[0.07] border border-black/[0.10] dark:border-white/[0.16] text-xs font-bold text-center text-[#0A1128] dark:text-white outline-none"
              />
            </div>
          </div>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 rounded-2xl bg-white/80 dark:bg-white/[0.06] border border-black/[0.10] dark:border-white/[0.16] font-mono text-xs text-[#0A1128] dark:text-white outline-none focus:border-[#00A3FF] dark:focus:border-[#38BDF8]"
          />
        </div>
      </div>

      {/* CTA Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-[#0A1128]/65 dark:text-white/60">
          <ShieldCheck className="w-4 h-4 text-[#0A1128] dark:text-white shrink-0" />
          <span>
            {lang === 'en'
              ? '100% processed locally in browser.'
              : '100% diproses secara lokal di browser.'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleConvert}
          disabled={isProcessing}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glass-cta font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 btn-press-effect"
        >
          <Code className="w-4 h-4" />
          <span>
            {isProcessing
              ? lang === 'en'
                ? 'Generating...'
                : 'Membuat...'
              : lang === 'en'
                ? 'Convert & Download PDF'
                : 'Konversi & Unduh PDF'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default HtmlToPdfWorkspace;
