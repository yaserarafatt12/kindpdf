'use client';

import React, { useState } from 'react';
import Header, { ToolTab } from '@/components/Header';
import PrivacyNotice from '@/components/PrivacyNotice';
import FileDropzone from '@/components/FileDropzone';
import FileCard, { PdfFileItem } from '@/components/FileCard';
import ProcessingProgress from '@/components/ProcessingProgress';
import { validatePdfFile } from '@/lib/files/validateFile';
import { mergePdfFiles } from '@/lib/pdf/mergePdfs';
import { downloadBlob } from '@/lib/files/downloadBlob';
import { formatFileSize } from '@/lib/files/formatFileSize';
import { HumanError } from '@/lib/errors/messages';
import {
  FileStack,
  Trash2,
  AlertCircle,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ToolTab>('merge');
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorToast, setErrorToast] = useState<HumanError | null>(null);

  // Handle files selected via dropzone or picker
  const handleFilesSelected = async (selectedFiles: File[]) => {
    setErrorToast(null);

    for (const file of selectedFiles) {
      const result = await validatePdfFile(file);

      if (!result.isValid && result.error) {
        setErrorToast(result.error);
        return;
      }

      // Add to file queue
      const newItem: PdfFileItem = {
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        file,
        name: file.name,
        size: file.size,
        pageCount: result.pageCount,
      };

      setFiles((prev) => [...prev, newItem]);
    }
  };

  // Remove file from queue
  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Clear all files
  const handleClearAll = () => {
    setFiles([]);
    setErrorToast(null);
  };

  // Move file up in queue
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const newArr = [...prev];
      const temp = newArr[index - 1];
      newArr[index - 1] = newArr[index];
      newArr[index] = temp;
      return newArr;
    });
  };

  // Move file down in queue
  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const newArr = [...prev];
      const temp = newArr[index + 1];
      newArr[index + 1] = newArr[index];
      newArr[index] = temp;
      return newArr;
    });
  };

  // Calculate totals
  const totalPages = files.reduce((acc, curr) => acc + curr.pageCount, 0);
  const totalSizeBytes = files.reduce((acc, curr) => acc + curr.size, 0);

  // Execute Local PDF Merge
  const handleMergePdfs = async () => {
    if (files.length < 2) {
      setErrorToast({
        type: 'EMPTY_FILE_LIST',
        title: 'Kurang Dari 2 Dokumen',
        message: 'Pilih minimal 2 dokumen PDF untuk digabungkan.',
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep(0);
    setTotalSteps(files.length);
    setProgressMsg('Memulai penggabungan dokumen PDF secara lokal...');

    try {
      const fileObjects = files.map((f) => f.file);
      const mergedBytes = await mergePdfFiles(fileObjects, (curr, tot, msg) => {
        setCurrentStep(curr);
        setTotalSteps(tot);
        setProgressMsg(msg);
      });

      // Convert Uint8Array to Blob and download
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const firstFileName = files[0].name.replace(/\.pdf$/i, '');
      const downloadName = `LocalPDF_${firstFileName}_Merged.pdf`;

      downloadBlob(blob, downloadName);

      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorToast({
        type: 'CORRUPTED',
        title: 'Gagal Menggabungkan PDF',
        message: err?.message || 'Terjadi kesalahan tidak terduga saat memproses dokumen.',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header Bar */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Privacy Banner */}
        <PrivacyNotice />

        {/* Hero Section */}
        <div className="text-center space-y-2 py-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-sky-400 text-xs font-black">
            <FileStack className="w-3.5 h-3.5" />
            <span>Alat Gabungkan PDF (PDF Merge Tool)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Gabungkan Beberapa Berkas PDF Menjadi Satu
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
            Urutkan dokumen sesuai keinginan Anda dan gabungkan secara instan tanpa perlu mengunggah berkas ke server mana pun.
          </p>
        </div>

        {/* Error Toast Banner */}
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

        {/* Dropzone Upload Section */}
        <FileDropzone onFilesSelected={handleFilesSelected} disabled={isProcessing} />

        {/* Selected Documents Workspace */}
        {files.length > 0 && (
          <div className="space-y-4 pt-2">
            {/* Header Toolbar Summary */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-black">
                    {files.length} Dokumen
                  </span>
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    • {totalPages} Halaman Total
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Total Ukuran: {formatFileSize(totalSizeBytes)} (Tarik untuk mengubah urutan)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1.5 btn-press-effect"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua</span>
                </button>
              </div>
            </div>

            {/* Document Queue List */}
            <div className="space-y-2.5">
              {files.map((item, index) => (
                <FileCard
                  key={item.id}
                  item={item}
                  index={index}
                  totalItems={files.length}
                  onRemove={handleRemoveFile}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              ))}
            </div>

            {/* Merge Action CTA Bar */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Dokumen akan digabungkan secara instan di peramban Anda.</span>
              </div>

              <button
                type="button"
                onClick={handleMergePdfs}
                disabled={files.length < 2 || isProcessing}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-xl transition-all duration-200 btn-press-effect ${
                  files.length >= 2 && !isProcessing
                    ? 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-blue-500/30 scale-[1.02]'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                <FileStack className="w-4 h-4" />
                <span>Gabungkan PDF Sekarang</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6 mt-12 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 space-y-1">
        <p>
          Local<span className="text-blue-600 dark:text-sky-400 font-extrabold">PDF</span> by edsheero — Privacy-First PDF Tools
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-600">
          Process documents locally inside your web browser. 100% Zero-Server Upload.
        </p>
      </footer>

      {/* Progress Modal */}
      <ProcessingProgress
        isOpen={isProcessing}
        progressMessage={progressMsg}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />
    </div>
  );
}
