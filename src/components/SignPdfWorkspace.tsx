'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  PenTool,
  Trash2,
  AlertCircle,
  X,
  ShieldCheck,
  Type,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { downloadBlob } from '@/lib/files/downloadBlob';
import FileDropzone from './FileDropzone';
import PrivacyNotice from './PrivacyNotice';
import { signPdf, SignatureOptions } from '@/lib/pdf/signPdf';
import { renderPdfPagePreview } from '@/lib/pdf/pdfjsWorker';
import { HumanError } from '@/lib/errors/messages';
import ProcessingProgress from './ProcessingProgress';
import SuccessDownloadScreen from './SuccessDownloadScreen';
import LiquidGlassPillBar from './LiquidGlassPillBar';
import { ViewMode } from '@/components/Header';

interface SignPdfWorkspaceProps {
  onBack: () => void;
  onSelectTool?: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: Language;
}

export const SignPdfWorkspace: React.FC<SignPdfWorkspaceProps> = ({
  onBack,
  onSelectTool,
  t,
  lang,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorToast, setErrorToast] = useState<HumanError | null>(null);
  const [completedResult, setCompletedResult] = useState<{
    blob: Blob;
    filename: string;
  } | null>(null);

  const [signMode, setSignMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const [includeDate, setIncludeDate] = useState(true);
  const [targetPage, setTargetPage] = useState(1);
  const [posX, setPosX] = useState(60);
  const [posY, setPosY] = useState(80);
  const [sigWidth, setSigWidth] = useState(25);
  const [pagePreviewUrl, setPagePreviewUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

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
    setTargetPage(1);
  };

  useEffect(() => {
    if (!file || pageCount === 0) {
      setPagePreviewUrl(null);
      return;
    }
    let active = true;
    renderPdfPagePreview(file, targetPage, 1.0).then((res) => {
      if (active) setPagePreviewUrl(res?.dataUrl || null);
    });
    return () => {
      active = false;
    };
  }, [file, pageCount, targetPage]);

  // Properly scale pointer coordinates to canvas internal 500x150 dimensions
  const getCanvasCoords = (
    canvas: HTMLCanvasElement,
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / Math.max(1, rect.width);
    const scaleY = canvas.height / Math.max(1, rect.height);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(canvas, e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(canvas, e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0A1128';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSignature(false);
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(90, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const clickY = Math.max(0, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    setPosX(clickX);
    setPosY(clickY);
  };

  const handleSign = async () => {
    if (!file) return;

    let signatureDataUrl: string | undefined = undefined;

    if (signMode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasSignature) {
        setErrorToast({
          type: 'EMPTY_FILE_LIST',
          title: lang === 'en' ? 'Signature Required' : 'Tanda Tangan Diperlukan',
          message:
            lang === 'en'
              ? 'Please draw your signature first.'
              : 'Gambar tanda tangan Anda terlebih dahulu.',
        });
        return;
      }
      signatureDataUrl = canvas.toDataURL('image/png');
    } else if (!typedName.trim()) {
      setErrorToast({
        type: 'EMPTY_FILE_LIST',
        title: lang === 'en' ? 'Name Required' : 'Nama Diperlukan',
        message: lang === 'en' ? 'Please type your name.' : 'Ketik nama Anda.',
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(2);
    setProgressMsg(
      lang === 'en'
        ? 'Embedding signature into PDF...'
        : 'Menempelkan tanda tangan ke PDF...'
    );
    setErrorToast(null);

    try {
      const options: SignatureOptions = {
        pageIndex: targetPage - 1,
        x: posX,
        y: posY,
        signatureDataUrl,
        signatureText: signMode === 'type' ? typedName : undefined,
        dateText: includeDate ? new Date().toISOString().slice(0, 10) : undefined,
        width: sigWidth,
      };

      const signedBytes = await signPdf(file, options);
      const blob = new Blob([signedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.pdf$/i, '');
      const filename = `Kindpdf_${baseName}_Signed.pdf`;

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
        title: lang === 'en' ? 'Signing Failed' : 'Gagal Menandatangani',
        message: err?.message || 'Unexpected error signing document.',
      });
    }
  };

  if (completedResult) {
    return (
      <SuccessDownloadScreen
        title={lang === 'en' ? 'PDF Signed Successfully!' : 'Dokumen PDF Berhasil Ditandatangani!'}
        downloadFileName={completedResult.filename}
        downloadButtonText={lang === 'en' ? 'Download Signed PDF' : 'Unduh PDF Hasil Tanda Tangan'}
        onDownload={(customName?: string) =>
          downloadBlob(completedResult.blob, customName || completedResult.filename)
        }
        onStartOver={() => {
          setCompletedResult(null);
          setFile(null);
          setPageCount(0);
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
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-extrabold btn-press-effect"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.backToAllTools}</span>
      </button>

      {/* Hero Header */}
      <div className="text-center space-y-2 py-2 max-w-lg mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1128] dark:text-white">
          Sign PDF
        </h2>
        <p className="text-xs sm:text-sm text-[#0A1128]/65 dark:text-white/60 font-normal leading-relaxed">
          {lang === 'en'
            ? 'Draw or type your signature and place it accurately on your PDF document.'
            : 'Gambar atau ketik tanda tangan Anda dan tempatkan dengan presisi di dokumen PDF.'}
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

      {/* File Upload */}
      {!file && (
        <FileDropzone
          onFilesSelected={handleFileSelected}
          disabled={isProcessing}
          t={t}
          multiple={false}
        />
      )}

      {/* Signature Controls */}
      {file && (
        <div className="space-y-5">
          {/* File Card */}
          <div className="glass-card p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3 min-w-0">
            <div className="relative z-10 min-w-0 flex-1">
              <p className="text-sm font-bold text-[#0A1128] dark:text-white truncate">
                {file.name}
              </p>
              <p className="text-xs text-[#0A1128]/60 dark:text-white/55 font-medium truncate">
                {pageCount} {lang === 'en' ? 'pages' : 'halaman'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="relative z-10 text-xs font-bold text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 btn-press-effect shrink-0"
            >
              {lang === 'en' ? 'Change File' : 'Ganti File'}
            </button>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-5">
            {/* iOS 26 Liquid Glass Mode Switcher: Draw vs Type */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <LiquidGlassPillBar<'draw' | 'type'>
                size="md"
                ariaLabel="Signature input mode"
                value={signMode}
                onChange={setSignMode}
                options={[
                  {
                    id: 'draw',
                    label: lang === 'en' ? 'Draw Signature' : 'Gambar Tanda Tangan',
                    icon: <PenTool className="w-3.5 h-3.5" />,
                  },
                  {
                    id: 'type',
                    label: lang === 'en' ? 'Type Signature' : 'Ketik Nama',
                    icon: <Type className="w-3.5 h-3.5" />,
                  },
                ]}
              />

              {/* Page Selector Pill */}
              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full glass-pill text-xs font-bold self-end sm:self-auto">
                <button
                  type="button"
                  disabled={targetPage <= 1}
                  onClick={() => setTargetPage((p) => Math.max(1, p - 1))}
                  className="p-0.5 disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-1">
                  {lang === 'en' ? 'Page' : 'Hal'} {targetPage} / {pageCount}
                </span>
                <button
                  type="button"
                  disabled={targetPage >= pageCount}
                  onClick={() => setTargetPage((p) => Math.min(pageCount, p + 1))}
                  className="p-0.5 disabled:opacity-30"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Signature Pad or Type Input */}
            {signMode === 'draw' ? (
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0A1128]/75 dark:text-white/75">
                    {lang === 'en' ? 'Sign on the pad below' : 'Tanda tangan pada pad di bawah'}
                  </label>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Clear Pad' : 'Hapus Pad'}</span>
                  </button>
                </div>
                <div className="border-2 border-dashed border-black/15 dark:border-white/25 rounded-2xl overflow-hidden bg-white/95 shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-36 cursor-crosshair touch-none block"
                  />
                </div>
              </div>
            ) : (
              <div className="relative z-10 space-y-2">
                <label className="text-xs font-bold text-[#0A1128]/75 dark:text-white/75">
                  {lang === 'en' ? 'Full Name' : 'Nama Lengkap'}
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g. John Doe' : 'cth. Ahmad Yani'}
                  className="w-full px-4 py-3 rounded-2xl bg-white/80 dark:bg-white/[0.07] border border-black/[0.10] dark:border-white/[0.16] text-sm font-bold text-[#0A1128] dark:text-white outline-none focus:border-[#00A3FF] dark:focus:border-[#38BDF8]"
                />
              </div>
            )}

            {/* Live Page Placement Preview */}
            {pagePreviewUrl && (
              <div className="relative z-10 space-y-1.5 pt-2">
                <p className="text-[11px] font-medium text-[#0A1128]/60 dark:text-white/55 text-center">
                  {lang === 'en'
                    ? 'Click anywhere on the page preview to place your signature.'
                    : 'Klik di mana saja pada pratinjau halaman untuk menempatkan tanda tangan.'}
                </p>
                <div
                  onClick={handlePreviewClick}
                  className="relative max-w-xs mx-auto rounded-2xl overflow-hidden border border-black/15 dark:border-white/20 shadow-lg bg-white cursor-crosshair select-none"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pagePreviewUrl}
                    alt={`Page ${targetPage} preview`}
                    className="w-full h-auto block pointer-events-none"
                  />
                  <div
                    style={{
                      left: `${posX}%`,
                      top: `${posY}%`,
                      width: `${sigWidth}%`,
                    }}
                    className="absolute px-2 py-1 rounded-md border-2 border-[#00A3FF] bg-[#00A3FF]/15 text-[#0A1128] text-[10px] font-bold text-center shadow-sm pointer-events-none"
                  >
                    {signMode === 'type' && typedName ? typedName : lang === 'en' ? 'Signature' : 'Tanda Tangan'}
                  </div>
                </div>
              </div>
            )}

            {/* Position & Page Options */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-black/[0.08] dark:border-white/[0.12]">
              <div>
                <label className="block text-xs font-semibold text-[#0A1128]/75 dark:text-white/75 mb-1">
                  X Position ({posX}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={90}
                  value={posX}
                  onChange={(e) => setPosX(Number(e.target.value))}
                  className="w-full accent-[#00A3FF] dark:accent-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A1128]/75 dark:text-white/75 mb-1">
                  Y Position ({posY}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={95}
                  value={posY}
                  onChange={(e) => setPosY(Number(e.target.value))}
                  className="w-full accent-[#00A3FF] dark:accent-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A1128]/75 dark:text-white/75 mb-1">
                  {lang === 'en' ? 'Signature Size' : 'Ukuran'} ({sigWidth}%)
                </label>
                <input
                  type="range"
                  min={10}
                  max={60}
                  value={sigWidth}
                  onChange={(e) => setSigWidth(Number(e.target.value))}
                  className="w-full accent-[#00A3FF] dark:accent-[#38BDF8]"
                />
              </div>
            </div>

            {/* Include Date Toggle */}
            <div className="relative z-10 flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="inc-date"
                checked={includeDate}
                onChange={(e) => setIncludeDate(e.target.checked)}
                className="w-4 h-4 rounded accent-[#00A3FF] dark:accent-[#38BDF8]"
              />
              <label
                htmlFor="inc-date"
                className="text-xs font-semibold text-[#0A1128]/80 dark:text-white/80 cursor-pointer"
              >
                {lang === 'en'
                  ? 'Include current date stamp below signature'
                  : 'Sertakan stempel tanggal di bawah tanda tangan'}
              </label>
            </div>
          </div>

          {/* CTA Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-[#0A1128]/65 dark:text-white/60">
              <ShieldCheck className="w-4 h-4 text-[#0A1128] dark:text-white shrink-0" />
              <span>
                {lang === 'en'
                  ? 'Signature stays 100% in your browser.'
                  : 'Tanda tangan 100% tersimpan di browser.'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSign}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glass-cta font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 btn-press-effect"
            >
              <PenTool className="w-4 h-4" />
              <span>
                {isProcessing
                  ? lang === 'en'
                    ? 'Signing...'
                    : 'Menandatangani...'
                  : lang === 'en'
                    ? 'Sign & Download PDF'
                    : 'Tanda Tangan & Unduh PDF'}
              </span>
            </button>
          </div>
        </div>
      )}

      <PrivacyNotice t={t} />

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

export default SignPdfWorkspace;
