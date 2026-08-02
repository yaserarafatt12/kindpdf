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
  UploadCloud,
  FileText,
  Trash2,
  AlertCircle,
  X,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';

interface UnlockPdfWorkspaceProps {
  onBack: () => void;
  t: TranslationDictionary;
  lang: 'en' | 'id';
}

export const UnlockPdfWorkspace: React.FC<UnlockPdfWorkspaceProps> = ({ onBack, t, lang }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorToast, setErrorToast] = useState<{ title: string; message: string } | null>(null);

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

    setFile(targetFile);
    setPageCount(validation.pageCount || 1);
  };

  const handleExecuteUnlock = async () => {
    if (!file) return;
    setErrorToast(null);

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(2);
    setProgressMsg(lang === 'en' ? 'Decrypting PDF file...' : 'Membuka enkripsi berkas PDF...');

    try {
      const result = await unlockPdfDocument(file, password, (curr, tot, msg) => {
        setCurrentStep(curr);
        setTotalSteps(tot);
        setProgressMsg(msg);
      });

      downloadBlob(result.blob, result.filename);

      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorToast({
        title: lang === 'en' ? 'Unlock Failed' : 'Gagal Membuka Enkripsi',
        message: err?.message || 'Incorrect password or corrupted PDF file.',
      });
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
          {lang === 'en' ? 'Unlock PDF File' : 'Buka Enkripsi PDF'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'en'
            ? 'Remove password security and restrictions from your PDF document.'
            : 'Hapus keamanan kata sandi dan pembatasan dari dokumen PDF Anda.'}
        </p>
      </div>

      {/* Error Toast */}
      {errorToast && (
        <div className="w-full p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start justify-between gap-3 shadow-md animate-fade-in">
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
        <FileDropzone onFilesSelected={handleFileChange} disabled={isProcessing} t={t} colorTheme="teal" />
      ) : (
        <div className="space-y-6">
          {/* Active File Summary Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-900 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {file.name}
                </h4>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPageCount(0);
              }}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors btn-press-effect"
              title="Remove File"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Password Input Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{lang === 'en' ? 'PDF Security Credentials' : 'Kredensial Keamanan PDF'}</span>
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                {lang === 'en' ? 'Enter PDF Password' : 'Masukkan Kata Sandi PDF'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t.ramProcessing}</span>
            </div>

            <button
              type="button"
              onClick={handleExecuteUnlock}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-black text-sm shadow-xl shadow-teal-500/30 transition-all btn-press-effect flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>{lang === 'en' ? 'Unlock PDF Now' : 'Buka Enkripsi Sekarang'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
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

export default UnlockPdfWorkspace;
