'use client';

import React, { useState } from 'react';
import { TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { unlockPdfDocument } from '@/lib/pdf/pdfSecurity';
import { downloadBlob } from '@/lib/files/downloadBlob';
import { formatFileSize } from '@/lib/files/formatFileSize';
import ProcessingProgress from './ProcessingProgress';
import FileDropzone from './FileDropzone';
import {
  Unlock,
  FileText,
  Trash2,
  AlertCircle,
  X,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import SuccessDownloadScreen from './SuccessDownloadScreen';
import { ViewMode } from '@/components/Header';
import { isEncrypted } from '@pdfsmaller/pdf-decrypt';

interface UnlockPdfWorkspaceProps {
  onBack: () => void;
  onSelectTool?: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: 'en' | 'id';
}

export const UnlockPdfWorkspace: React.FC<UnlockPdfWorkspaceProps> = ({
  onBack,
  onSelectTool,
  t,
  lang,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorToast, setErrorToast] = useState<{ title: string; message: string } | null>(null);
  const [completedResult, setCompletedResult] = useState<{
    blob: Blob;
    filename: string;
  } | null>(null);

  const handleFileChange = async (selectedFiles: File[]) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setErrorToast(null);

    const targetFile = selectedFiles[0];
    const validation = await validatePdfFile(targetFile);

    if (!validation.isValid && validation.error && validation.error.type !== 'ENCRYPTED') {
      setErrorToast({
        title: validation.error.title,
        message: validation.error.message,
      });
      return;
    }

    try {
      const buffer = await targetFile.arrayBuffer();
      const check = await isEncrypted(new Uint8Array(buffer));
      if (!check.encrypted) {
        setErrorToast({
          title: lang === 'en' ? 'PDF Not Encrypted' : 'PDF Tidak Terenkripsi',
          message:
            lang === 'en'
              ? 'This PDF file is not password-protected. No unlock required.'
              : 'Dokumen PDF ini tidak memiliki kata sandi / proteksi enkripsi. Tidak perlu dibuka.',
        });
        return;
      }
    } catch {
      // If error checking encryption, let standard handler catch it
    }

    setFile(targetFile);
    setPageCount(validation.pageCount || 1);
  };

  const handleExecuteUnlock = async () => {
    if (!file) return;
    setErrorToast(null);

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(2);
    setProgressMsg(
      lang === 'en' ? 'Decrypting PDF file...' : 'Membuka enkripsi berkas PDF...'
    );

    try {
      const result = await unlockPdfDocument(file, password, (curr, tot, msg) => {
        setCurrentStep(curr);
        setTotalSteps(tot);
        setProgressMsg(msg);
      });

      setIsProcessing(false);
      setCompletedResult({
        blob: result.blob,
        filename: result.filename,
      });
    } catch (err: any) {
      setIsProcessing(false);
      setErrorToast({
        title: lang === 'en' ? 'Unlock Failed' : 'Gagal Membuka Enkripsi',
        message: err?.message || 'Incorrect password or corrupted PDF file.',
      });
    }
  };

  if (completedResult) {
    return (
      <SuccessDownloadScreen
        title={
          lang === 'en' ? 'PDF Unlocked Successfully!' : 'Enkripsi PDF Berhasil Dibuka!'
        }
        downloadFileName={completedResult.filename}
        downloadButtonText={lang === 'en' ? 'Download Unlocked PDF' : 'Unduh PDF Bebas Sandi'}
        onDownload={(customName?: string) =>
          downloadBlob(completedResult.blob, customName || completedResult.filename)
        }
        onStartOver={() => {
          setCompletedResult(null);
          setFile(null);
          setPassword('');
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
          {lang === 'en' ? 'Remove PDF Password' : 'Buka Enkripsi PDF'}
        </h2>
        <p className="text-xs sm:text-sm text-[#0A1128]/65 dark:text-white/60 font-normal leading-relaxed">
          {lang === 'en'
            ? 'Remove password security and restrictions from your PDF document.'
            : 'Hapus keamanan kata sandi dan pembatasan dari dokumen PDF Anda.'}
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

          {/* Password Input Box */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="relative z-10 text-xs font-bold text-[#0A1128] dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              <span>
                {lang === 'en' ? 'PDF Security Credentials' : 'Kredensial Keamanan PDF'}
              </span>
            </h3>

            <div className="relative z-10 space-y-1">
              <label className="text-xs font-bold text-[#0A1128] dark:text-white">
                {lang === 'en' ? 'Enter PDF Password' : 'Masukkan Kata Sandi PDF'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/80 dark:bg-white/[0.07] border border-black/[0.10] dark:border-white/[0.16] text-xs font-bold text-[#0A1128] dark:text-white outline-none focus:border-[#00A3FF] dark:focus:border-[#38BDF8]"
              />
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
              onClick={handleExecuteUnlock}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glass-cta font-bold text-sm transition-all btn-press-effect flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>{lang === 'en' ? 'Unlock PDF Now' : 'Buka Enkripsi Sekarang'}</span>
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

export default UnlockPdfWorkspace;
