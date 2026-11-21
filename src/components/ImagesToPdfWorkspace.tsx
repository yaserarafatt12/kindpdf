'use client';

import React, { useState } from 'react';
import { TranslationDictionary } from '@/lib/i18n/translations';
import { convertImagesToPdf, ImageToPdfOptions } from '@/lib/pdf/imagesToPdf';
import { downloadBlob } from '@/lib/files/downloadBlob';
import ProcessingProgress from './ProcessingProgress';
import FileDropzone from './FileDropzone';
import LiquidGlassPillBar from './LiquidGlassPillBar';
import {
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  X,
  ShieldCheck,
  ArrowLeft,
  MoveLeft,
  MoveRight,
  RotateCw,
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
    for (const file of selectedFiles) {
      const lower = file.name.toLowerCase();
      const validImage =
        file.type.startsWith('image/') ||
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.webp');
      if (!validImage) {
        setErrorToast({
          title: lang === 'en' ? 'Unsupported Image Format' : 'Format Gambar Tidak Didukung',
          message:
            lang === 'en'
              ? 'Please select JPG, PNG, or WEBP image files.'
              : 'Pilih berkas gambar JPG, PNG, atau WEBP.',
        });
        continue;
      }

      const url = URL.createObjectURL(file);
      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        file,
        previewUrl: url,
        rotation: 0,
      });
    }

    if (newItems.length > 0) {
      setImages((prev) => [...prev, ...newItems]);
    }
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
    setProgressMsg(
      lang === 'en' ? 'Converting images to PDF...' : 'Mengonversi gambar ke PDF...'
    );

    try {
      const result = await convertImagesToPdf(
        images.map((i) => i.file),
        {
          ...options,
          rotations: images.map((i) => i.rotation),
        },
        (curr, tot, msg) => {
          setCurrentStep(curr);
          setTotalSteps(tot);
          setProgressMsg(msg);
        }
      );

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
        title={
          lang === 'en' ? 'PDF Created Successfully!' : 'PDF Berhasil Dibuat dari Gambar!'
        }
        downloadFileName={convertResult.filename}
        downloadButtonText={
          lang === 'en' ? 'Download Converted PDF' : 'Unduh PDF Hasil Konversi'
        }
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
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-extrabold btn-press-effect"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.backToAllTools}</span>
      </button>

      {/* Hero Header */}
      <div className="text-center space-y-2 py-2 max-w-lg mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1128] dark:text-white">
          {lang === 'en' ? 'Images to PDF Converter' : 'Konverter Gambar ke PDF'}
        </h2>
        <p className="text-xs sm:text-sm text-[#0A1128]/65 dark:text-white/60 font-normal leading-relaxed">
          {lang === 'en'
            ? 'Convert JPG, PNG, and WEBP images into a clean PDF document instantly inside your browser.'
            : 'Konversi gambar JPG, PNG, dan WEBP menjadi dokumen PDF bersih secara instan di peramban Anda.'}
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
      {images.length === 0 ? (
        <FileDropzone
          onFilesSelected={handleFilesChange}
          disabled={isProcessing}
          t={t}
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple={true}
          buttonLabel={lang === 'en' ? 'Select Images' : 'Pilih Gambar'}
          helperText={
            lang === 'en'
              ? 'or drag & drop JPG, PNG, WEBP files here'
              : 'atau tarik & lepaskan berkas JPG, PNG, WEBP ke sini'
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Options Panel */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4">
            <h3 className="relative z-10 text-xs font-bold text-[#0A1128] dark:text-white flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              <span>{lang === 'en' ? 'PDF Layout Settings' : 'Pengaturan Tata Letak PDF'}</span>
            </h3>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Page Size */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#0A1128]/75 dark:text-white/75">
                  {lang === 'en' ? 'Page Size' : 'Ukuran Halaman'}
                </label>
                <LiquidGlassPillBar<'A4' | 'fit'>
                  size="sm"
                  equalWidth
                  ariaLabel="Image to PDF page size"
                  value={options.pageSize}
                  onChange={(val) => setOptions({ ...options, pageSize: val })}
                  options={[
                    { id: 'A4', label: 'A4' },
                    { id: 'fit', label: lang === 'en' ? 'Fit Image' : 'Sesuai' },
                  ]}
                />
              </div>

              {/* Orientation */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#0A1128]/75 dark:text-white/75">
                  {lang === 'en' ? 'Orientation' : 'Orientasi'}
                </label>
                <LiquidGlassPillBar<'portrait' | 'landscape'>
                  size="sm"
                  equalWidth
                  ariaLabel="Image to PDF orientation"
                  value={options.orientation}
                  onChange={(val) => setOptions({ ...options, orientation: val })}
                  options={[
                    { id: 'portrait', label: 'Portrait' },
                    { id: 'landscape', label: 'Landscape' },
                  ]}
                />
              </div>

              {/* Margin */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#0A1128]/75 dark:text-white/75">
                  {lang === 'en' ? 'Margin' : 'Margin'}
                </label>
                <LiquidGlassPillBar<'none' | 'small' | 'large'>
                  size="sm"
                  equalWidth
                  ariaLabel="Image to PDF margin"
                  value={options.margin}
                  onChange={(val) => setOptions({ ...options, margin: val })}
                  options={[
                    { id: 'none', label: '0px' },
                    { id: 'small', label: '20px' },
                    { id: 'large', label: '40px' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Selected Images List Header */}
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between gap-3">
            <span className="relative z-10 text-xs font-bold text-[#0A1128] dark:text-white">
              {images.length} {lang === 'en' ? 'Images Selected' : 'Gambar Dipilih'}
            </span>

            <div className="relative z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';
                  input.multiple = true;
                  input.onchange = (e: any) => {
                    if (e.target.files) handleFilesChange(Array.from(e.target.files));
                  };
                  input.click();
                }}
                className="px-3.5 py-1.5 rounded-full glass-pill text-xs font-bold btn-press-effect"
              >
                + {lang === 'en' ? 'Add More' : 'Tambah Lagi'}
              </button>

              <button
                type="button"
                onClick={() => setImages([])}
                className="p-2 rounded-full text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 transition-colors btn-press-effect"
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
                className="glass-card p-3 rounded-2xl flex flex-col items-center justify-between gap-2.5 relative group"
              >
                <div className="relative z-10 w-full aspect-square rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.previewUrl}
                    alt={img.file.name}
                    style={{ transform: `rotate(${img.rotation}deg)` }}
                    className="w-full h-full object-cover transition-transform duration-200"
                  />
                </div>

                <div className="relative z-10 w-full flex items-center justify-between gap-1">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleMoveLeft(idx)}
                      disabled={idx === 0}
                      className="p-1 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/10 disabled:opacity-25"
                    >
                      <MoveLeft className="w-3.5 h-3.5 text-[#0A1128]/70 dark:text-white/75" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveRight(idx)}
                      disabled={idx === images.length - 1}
                      className="p-1 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/10 disabled:opacity-25"
                    >
                      <MoveRight className="w-3.5 h-3.5 text-[#0A1128]/70 dark:text-white/75" />
                    </button>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleRotateImage(img.id)}
                      className="p-1 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/10 text-[#0A1128] dark:text-white"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="p-1 rounded-lg hover:bg-rose-500/15 text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-md bg-[#0A1128]/85 text-white text-[9px] font-bold shadow-sm">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>

          {/* Action CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-[#0A1128]/65 dark:text-white/60">
              <ShieldCheck className="w-4 h-4 text-[#0A1128] dark:text-white shrink-0" />
              <span>{t.ramProcessing}</span>
            </div>

            <button
              type="button"
              onClick={handleExecuteConvert}
              disabled={isProcessing || images.length === 0}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glass-cta font-bold text-sm transition-all btn-press-effect flex items-center justify-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{lang === 'en' ? 'Convert to PDF Now' : 'Konversi ke PDF Sekarang'}</span>
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

export default ImagesToPdfWorkspace;
