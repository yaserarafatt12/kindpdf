'use client';

import React, { useState, useRef } from 'react';
import { ArrowLeft, PenTool, Trash2, Check, AlertCircle, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { downloadBlob } from '@/lib/files/downloadBlob';
import FileDropzone from './FileDropzone';
import PrivacyNotice from './PrivacyNotice';
import { signPdf, SignatureOptions } from '@/lib/pdf/signPdf';
import { HumanError } from '@/lib/errors/messages';

interface SignPdfWorkspaceProps {
  onBack: () => void;
  t: TranslationDictionary;
  lang: Language;
}

export const SignPdfWorkspace: React.FC<SignPdfWorkspaceProps> = ({ onBack, t, lang }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorToast, setErrorToast] = useState<HumanError | null>(null);

  // Sign mode: 'draw' | 'type'
  const [signMode, setSignMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const [includeDate, setIncludeDate] = useState(true);
  const [targetPage, setTargetPage] = useState(1);
  const [posX, setPosX] = useState(60);
  const [posY, setPosY] = useState(80);
  const [sigWidth, setSigWidth] = useState(25);

  // Drawing canvas
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
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
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

  const handleSign = async () => {
    if (!file) return;

    let signatureDataUrl: string | undefined = undefined;

    if (signMode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasSignature) {
        setErrorToast({
          type: 'EMPTY_FILE_LIST',
          title: lang === 'en' ? 'Signature Required' : 'Tanda Tangan Diperlukan',
          message: lang === 'en' ? 'Please draw your signature first.' : 'Gambar tanda tangan Anda terlebih dahulu.',
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
    setErrorToast(null);

    try {
      const options: SignatureOptions = {
        pageIndex: targetPage - 1,
        x: posX,
        y: posY,
        signatureDataUrl,
        signatureText: signMode === 'type' ? typedName : undefined,
        dateText: includeDate ? new Date().toLocaleDateString() : undefined,
        width: sigWidth,
      };

      const signedBytes = await signPdf(file, options);
      const blob = new Blob([signedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.pdf$/i, '');
      downloadBlob(blob, `Kindpdf_${baseName}_Signed.pdf`);
    } catch (err: any) {
      setErrorToast({
        type: 'CORRUPTED',
        title: lang === 'en' ? 'Signing Failed' : 'Gagal Menandatangani',
        message: err?.message || 'Unexpected error signing document.',
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
          Sign PDF
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'en'
            ? 'Draw or type your signature and place it securely on your PDF document.'
            : 'Gambar atau ketik tanda tangan Anda dan tempatkan dengan aman di dokumen PDF.'}
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
      {!file && <FileDropzone onFilesSelected={handleFileSelected} disabled={isProcessing} t={t} />}

      {/* Signature Controls */}
      {file && (
        <div className="space-y-5">
          {/* File Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">{file.name}</p>
              <p className="text-xs text-slate-500 font-medium">{pageCount} {lang === 'en' ? 'pages' : 'halaman'}</p>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-xs font-extrabold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 btn-press-effect"
            >
              {lang === 'en' ? 'Change File' : 'Ganti File'}
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
            {/* Mode Switcher: Draw vs Type */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSignMode('draw')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${
                  signMode === 'draw' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-sky-400 shadow-sm' : 'text-slate-500'
                }`}
              >
                {lang === 'en' ? 'Draw Signature' : 'Gambar Tanda Tangan'}
              </button>
              <button
                type="button"
                onClick={() => setSignMode('type')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${
                  signMode === 'type' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-sky-400 shadow-sm' : 'text-slate-500'
                }`}
              >
                {lang === 'en' ? 'Type Signature' : 'Ketik Nama'}
              </button>
            </div>

            {/* Signature Pad */}
            {signMode === 'draw' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {lang === 'en' ? 'Sign Below' : 'Tanda Tangan di Bawah'}
                  </label>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    {lang === 'en' ? 'Clear Pad' : 'Hapus Pad'}
                  </button>
                </div>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/50">
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
                    className="w-full h-36 cursor-crosshair touch-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  {lang === 'en' ? 'Full Name' : 'Nama Lengkap'}
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g. John Doe' : 'cth. Ahmad Yani'}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Position & Page Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'en' ? 'Target Page' : 'Halaman Target'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={targetPage}
                  onChange={(e) => setTargetPage(Math.max(1, Math.min(pageCount, Number(e.target.value))))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">X Position ({posX}%)</label>
                <input
                  type="range"
                  min={0}
                  max={90}
                  value={posX}
                  onChange={(e) => setPosX(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Y Position ({posY}%)</label>
                <input
                  type="range"
                  min={0}
                  max={95}
                  value={posY}
                  onChange={(e) => setPosY(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>

            {/* Include Date Toggle */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="inc-date"
                checked={includeDate}
                onChange={(e) => setIncludeDate(e.target.checked)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <label htmlFor="inc-date" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                {lang === 'en' ? 'Include current date stamp below signature' : 'Sertakan stempel tanggal di bawah tanda tangan'}
              </label>
            </div>
          </div>

          {/* CTA Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{lang === 'en' ? 'Signature stays 100% in your browser.' : 'Tanda tangan 100% tersimpan di browser.'}</span>
            </div>

            <button
              type="button"
              onClick={handleSign}
              disabled={isProcessing}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-xl transition-all duration-200 btn-press-effect ${
                !isProcessing
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-blue-500/30 scale-[1.02]'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>{isProcessing ? (lang === 'en' ? 'Signing...' : 'Menandatangani...') : (lang === 'en' ? 'Sign & Download PDF' : 'Tanda Tangan & Unduh PDF')}</span>
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

export default SignPdfWorkspace;
