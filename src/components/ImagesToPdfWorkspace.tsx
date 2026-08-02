'use client';

import React, { useState } from 'react';
import { TranslationDictionary } from '@/lib/i18n/translations';
import { convertImagesToPdf, ImageToPdfOptions } from '@/lib/pdf/imagesToPdf';
import { downloadBlob } from '@/lib/files/downloadBlob';
import { formatFileSize } from '@/lib/files/formatFileSize';
import ProcessingProgress from './ProcessingProgress';
import {
  Image as ImageIcon,
  UploadCloud,
  FileText,
  Trash2,
  AlertCircle,
  X,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  MoveLeft,
  MoveRight,
  Settings2,
} from 'lucide-react';
import SuccessDownloadScreen from './SuccessDownloadScreen';
import { ViewMode } from '@/components/Header';

interface ImageCardItem {
  id: string;
  file: File;
  previewUrl: string;
  rotation: number;
}

interface ImagesToPdfWorkspaceProps {
  onBack: () => void;
  onSelectTool?: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: 'en' | 'id';
}

export const ImagesToPdfWorkspace: React.FC<ImagesToPdfWorkspaceProps> = ({
  onBack,
  onSelectTool,
  t,
  lang,
}) => {
  const [images, setImages] = useState<ImageCardItem[]>([]);
  const [options, setOptions] = useState<ImageToPdfOptions>({
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 'small',
  });
  const [convertResult, setConvertResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorToast, setErrorToast] = useState<{ title: string; message: string } | null>(null);

  const handleFilesChange = (selectedFiles: File[]) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setErrorToast(null);

    const newItems: ImageCardItem[] = [];
    selectedFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        file,
        previewUrl: url,
        rotation: 0,
      });
    });

    setImages((prev) => [...prev, ...newItems]);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleRotateImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === id) {
          return { ...img, rotation: (img.rotation + 90) % 360 };
        }
        return img;
      })
    );
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveRight = (index: number) => {
    if (index === images.length - 1) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleExecuteConvert = async () => {
    if (images.length === 0) return;
    setErrorToast(null);

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(images.length + 1);
    setProgressMsg(lang === 'en' ? 'Converting images to PDF...' : 'Mengonversi gambar ke PDF...');

    try {
      const result = await convertImagesToPdf(images.map(i => i.file), options, (curr, tot, msg) => {
        setCurrentStep(curr);
        setTotalSteps(tot);
        setProgressMsg(msg);
      });

      setIsProcessing(false);
      setConvertResult({
        blob: result.blob,
        filename: result.filename,
      });
    } catch (err: any) {
      setIsProcessing(false);
      setErrorToast({
        title: lang === 'en' ? 'Conversion Failed' : 'Konversi Gagal',
        message: err?.message || 'Unexpected error while converting images to PDF.',
      });
    }
  };

  if (convertResult) {
    return (
      <SuccessDownloadScreen
        title={lang === 'en' ? 'PDF Created Successfully!' : 'PDF Berhasil Dibuat dari Gambar!'}
        downloadFileName={convertResult.filename}
        downloadButtonText={lang === 'en' ? 'Download Converted PDF' : 'Unduh PDF Hasil Konversi'}
        onDownload={(customName?: string) =>
          downloadBlob(convertResult.blob, customName || convertResult.filename)
        }
        onStartOver={() => {
          setConvertResult(null);
          setImages([]);
        }}
        onSelectTool={(toolId: ViewMode) => {
          setConvertResult(null);
          setImages([]);
          if (onSelectTool) onSelectTool(toolId);
        }}
        t={t}
        lang={lang}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          {lang === 'en' ? 'Images to PDF Converter' : 'Konverter Gambar ke PDF'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'en'
            ? 'Convert JPG, PNG, and WEBP images into a clean PDF document instantly inside your browser.'
            : 'Konversi gambar JPG, PNG, dan WEBP menjadi dokumen PDF bersih secara instan di peramban Anda.'}
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
      {images.length === 0 ? (
        <div
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/jpeg,image/png,image/webp';
            input.multiple = true;
            input.onchange = (e: any) => {
              if (e.target.files) handleFilesChange(Array.from(e.target.files));
            };
            input.click();
          }}
          className="w-full max-w-xl mx-auto rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-5 hover:border-blue-600 transition-all cursor-pointer shadow-sm"
        >
          <button
            type="button"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-black text-base sm:text-lg shadow-lg shadow-rose-500/30 transition-all btn-press-effect flex items-center justify-center gap-2.5"
          >
            <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>{lang === 'en' ? 'Select Images' : 'Pilih Gambar'}</span>
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {lang === 'en' ? 'or drop JPG, PNG, WEBP files here' : 'atau tarik & lepaskan berkas JPG, PNG, WEBP ke sini'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Options Panel */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-rose-500" />
              <span>{lang === 'en' ? 'PDF Layout Settings' : 'Pengaturan Tata Letak PDF'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Page Size */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                  {lang === 'en' ? 'Page Size' : 'Ukuran Halaman'}
                </label>
                <select
                  value={options.pageSize}
                  onChange={(e: any) => setOptions({ ...options, pageSize: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="A4">A4 Standard</option>
                  <option value="fit">{lang === 'en' ? 'Fit Image Dimensions' : 'Sesuaikan Ukuran Gambar'}</option>
                </select>
              </div>

              {/* Orientation */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                  {lang === 'en' ? 'Orientation' : 'Orientasi'}
                </label>
                <select
                  value={options.orientation}
                  onChange={(e: any) => setOptions({ ...options, orientation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              {/* Margin */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                  {lang === 'en' ? 'Margin' : 'Margin'}
                </label>
                <select
                  value={options.margin}
                  onChange={(e: any) => setOptions({ ...options, margin: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="none">{lang === 'en' ? 'No Margin (0px)' : 'Tanpa Margin (0px)'}</option>
                  <option value="small">{lang === 'en' ? 'Small Margin (20px)' : 'Margin Kecil (20px)'}</option>
                  <option value="large">{lang === 'en' ? 'Large Margin (40px)' : 'Margin Besar (40px)'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Selected Images List */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
              {images.length} {lang === 'en' ? 'Images Selected' : 'Gambar Dipilih'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/jpeg,image/png,image/webp';
                  input.multiple = true;
                  input.onchange = (e: any) => {
                    if (e.target.files) handleFilesChange(Array.from(e.target.files));
                  };
                  input.click();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 transition-colors btn-press-effect"
              >
                + {lang === 'en' ? 'Add More' : 'Tambah Lagi'}
              </button>

              <button
                type="button"
                onClick={() => setImages([])}
                className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors btn-press-effect"
                title="Clear All"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {images.map((img, idx) => (
              <div
                key={img.id || `${img.file.name}-${idx}`}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm flex flex-col items-center justify-between gap-2.5 relative group hover:border-rose-500 transition-all"
              >
                <div className="w-full aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.previewUrl || URL.createObjectURL(img.file)}
                    alt={img.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="w-full flex items-center justify-between gap-1">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleMoveLeft(idx)}
                      disabled={idx === 0}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                    >
                      <MoveLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveRight(idx)}
                      disabled={idx === images.length - 1}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                    >
                      <MoveRight className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[9px] font-extrabold shadow-sm">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>

          {/* Action CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t.ramProcessing}</span>
            </div>

            <button
              type="button"
              onClick={handleExecuteConvert}
              disabled={isProcessing || images.length === 0}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-black text-sm shadow-xl shadow-rose-500/30 transition-all btn-press-effect flex items-center justify-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{lang === 'en' ? 'Convert to PDF Now' : 'Konversi ke PDF Sekarang'}</span>
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

export default ImagesToPdfWorkspace;
