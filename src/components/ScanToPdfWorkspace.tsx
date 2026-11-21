'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Camera,
  Trash2,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  AlertCircle,
  X,
  FileText,
  UploadCloud,
} from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { downloadBlob } from '@/lib/files/downloadBlob';
import PrivacyNotice from './PrivacyNotice';
import { captureFrameFromVideo, buildPdfFromScans, ScanOptions } from '@/lib/pdf/scanToPdf';
import { HumanError } from '@/lib/errors/messages';
import ProcessingProgress from './ProcessingProgress';
import SuccessDownloadScreen from './SuccessDownloadScreen';
import LiquidGlassPillBar from './LiquidGlassPillBar';
import { ViewMode } from '@/components/Header';

interface ScanToPdfWorkspaceProps {
  onBack: () => void;
  onSelectTool?: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: Language;
}

export const ScanToPdfWorkspace: React.FC<ScanToPdfWorkspaceProps> = ({
  onBack,
  onSelectTool,
  t,
  lang,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorToast, setErrorToast] = useState<HumanError | null>(null);
  const [completedResult, setCompletedResult] = useState<{
    blob: Blob;
    filename: string;
  } | null>(null);

  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [colorMode, setColorMode] = useState<'color' | 'grayscale' | 'bw'>('color');
  const [brightness, setBrightness] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setErrorToast(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setErrorToast({
        type: 'CORRUPTED',
        title: lang === 'en' ? 'Camera Unavailable' : 'Kamera Tidak Tersedia',
        message:
          lang === 'en'
            ? 'Camera permission denied or no camera found. You can also upload scanned photos directly.'
            : 'Izin kamera ditolak atau kamera tidak ditemukan. Anda juga dapat mengunggah foto dokumen secara langsung.',
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) return;
    try {
      const frameUrl = captureFrameFromVideo(videoRef.current);
      setScannedImages((prev) => [...prev, frameUrl]);
    } catch (err: any) {
      setErrorToast({
        type: 'CORRUPTED',
        title: lang === 'en' ? 'Capture Error' : 'Gagal Tangkap Halaman',
        message: err?.message || 'Could not capture image from camera stream.',
      });
    }
  };

  const handleImportImageFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorToast(null);

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width || 1280;
            canvas.height = img.naturalHeight || img.height || 720;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
              setScannedImages((prev) => [...prev, jpegDataUrl]);
            }
          };
          img.src = reader.result;
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setScannedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setScannedImages((prev) => {
      const arr = [...prev];
      const temp = arr[index - 1];
      arr[index - 1] = arr[index];
      arr[index] = temp;
      return arr;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === scannedImages.length - 1) return;
    setScannedImages((prev) => {
      const arr = [...prev];
      const temp = arr[index + 1];
      arr[index + 1] = arr[index];
      arr[index] = temp;
      return arr;
    });
  };

  const handleBuildPdf = async () => {
    if (scannedImages.length === 0) return;

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(scannedImages.length + 1);
    setProgressMsg(
      lang === 'en' ? 'Building scanned PDF document...' : 'Membuat dokumen PDF hasil scan...'
    );
    setErrorToast(null);

    try {
      const options: ScanOptions = {
        pageSize,
        orientation,
        colorMode,
        brightness,
      };

      const pdfBytes = await buildPdfFromScans(scannedImages, options, (msg) => {
        if (msg) setProgressMsg(msg);
      });
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const filename = `Kindpdf_Scanned_Document.pdf`;

      setCurrentStep(scannedImages.length + 1);
      setTotalSteps(scannedImages.length + 1);

      setIsProcessing(false);
      setCompletedResult({
        blob,
        filename,
      });
    } catch (err: any) {
      setIsProcessing(false);
      setErrorToast({
        type: 'CORRUPTED',
        title: lang === 'en' ? 'Scan to PDF Failed' : 'Gagal Membuat PDF',
        message: err?.message || 'Unexpected error building scanned PDF.',
      });
    }
  };

  if (completedResult) {
    return (
      <SuccessDownloadScreen
        title={lang === 'en' ? 'Scanned PDF Ready!' : 'Dokumen PDF Hasil Scan Siap!'}
        downloadFileName={completedResult.filename}
        downloadButtonText={lang === 'en' ? 'Download Scanned PDF' : 'Unduh PDF Hasil Scan'}
        onDownload={(customName?: string) =>
          downloadBlob(completedResult.blob, customName || completedResult.filename)
        }
        onStartOver={() => {
          stopCamera();
          setCompletedResult(null);
          setScannedImages([]);
        }}
        onSelectTool={(toolId: ViewMode) => {
          stopCamera();
          setCompletedResult(null);
          setScannedImages([]);
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
        onClick={() => {
          stopCamera();
          onBack();
        }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-xs font-extrabold btn-press-effect"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.backToAllTools}</span>
      </button>

      {/* Hero Header */}
      <div className="text-center space-y-2 py-2 max-w-lg mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1128] dark:text-white">
          Scan to PDF
        </h2>
        <p className="text-xs sm:text-sm text-[#0A1128]/65 dark:text-white/60 font-normal leading-relaxed">
          {lang === 'en'
            ? 'Capture documents using your device camera or import scanned photos to apply high-contrast filters.'
            : 'Pindai dokumen menggunakan kamera perangkat atau unggah foto dokumen untuk diberi filter kontras.'}
        </p>
      </div>

      {/* Hidden File Input for Camera/Photo Upload Fallback */}
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        capture="environment"
        onChange={(e) => {
          handleImportImageFiles(e.target.files);
          if (uploadInputRef.current) uploadInputRef.current.value = '';
        }}
        className="hidden"
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

      {/* Camera Preview Area */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
        {!cameraActive ? (
          <div className="relative z-10 py-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.18] flex items-center justify-center mx-auto shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
              <Camera className="w-8 h-8 text-[#0A1128]/80 dark:text-white/85" strokeWidth={1.75} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#0A1128] dark:text-white">
                {lang === 'en' ? 'Capture or Import Document Scans' : 'Tangkap atau Unggah Foto Dokumen'}
              </h3>
              <p className="text-xs text-[#0A1128]/60 dark:text-white/55 max-w-sm mx-auto font-normal">
                {lang === 'en'
                  ? 'Use your live camera stream or import photos from your device.'
                  : 'Gunakan kamera langsung atau pilih foto dokumen dari perangkat Anda.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={startCamera}
                className="px-6 py-3 rounded-2xl glass-cta font-bold text-xs inline-flex items-center gap-2 btn-press-effect"
              >
                <Camera className="w-4 h-4" />
                <span>{lang === 'en' ? 'Enable Camera' : 'Aktifkan Kamera'}</span>
              </button>

              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="px-5 py-3 rounded-2xl glass-pill font-bold text-xs inline-flex items-center gap-2 btn-press-effect"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{lang === 'en' ? 'Upload Scanned Photo' : 'Unggah Foto Scan'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black border border-white/20 aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCapture}
                className="px-6 py-3 rounded-full glass-cta font-bold text-xs inline-flex items-center gap-2 btn-press-effect"
              >
                <Camera className="w-4 h-4" />
                <span>{lang === 'en' ? 'Capture Page' : 'Tangkap Halaman'}</span>
              </button>

              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="px-4 py-2.5 rounded-full glass-pill text-xs font-bold inline-flex items-center gap-1.5 btn-press-effect"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Add Photo' : 'Tambah Foto'}</span>
              </button>

              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2.5 rounded-full glass-pill text-xs font-bold btn-press-effect"
              >
                {lang === 'en' ? 'Turn Off Camera' : 'Matikan Kamera'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Captured Pages Gallery */}
      {scannedImages.length > 0 && (
        <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-5">
          <div className="relative z-10 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0A1128] dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>
                {lang === 'en' ? 'Scanned Pages' : 'Halaman Pindaian'} ({scannedImages.length})
              </span>
            </h3>
            <button
              type="button"
              onClick={() => setScannedImages([])}
              className="text-xs font-bold text-rose-500 hover:underline"
            >
              {lang === 'en' ? 'Clear All' : 'Hapus Semua'}
            </button>
          </div>

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {scannedImages.map((url, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl overflow-hidden border border-black/[0.10] dark:border-white/[0.16] bg-black/[0.04] dark:bg-white/[0.05] group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Scan ${idx + 1}`} className="w-full h-32 object-cover" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-white text-[10px] font-bold">
                  #{idx + 1}
                </span>

                <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === scannedImages.length - 1}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Document Settings with LiquidGlassPillBar */}
          <div className="relative z-10 space-y-4 pt-3 border-t border-black/[0.08] dark:border-white/[0.12]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A1128] dark:text-white">
                  {lang === 'en' ? 'Page Size' : 'Ukuran Halaman'}
                </label>
                <LiquidGlassPillBar<'a4' | 'letter' | 'fit'>
                  size="sm"
                  equalWidth
                  ariaLabel="Scan page size"
                  value={pageSize}
                  onChange={setPageSize}
                  options={[
                    { id: 'a4', label: 'A4' },
                    { id: 'letter', label: 'Letter' },
                    { id: 'fit', label: lang === 'en' ? 'Fit' : 'Sesuai' },
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A1128] dark:text-white">
                  {lang === 'en' ? 'Color Filter' : 'Filter Warna'}
                </label>
                <LiquidGlassPillBar<'color' | 'grayscale' | 'bw'>
                  size="sm"
                  equalWidth
                  ariaLabel="Scan color filter"
                  value={colorMode}
                  onChange={setColorMode}
                  options={[
                    { id: 'color', label: lang === 'en' ? 'Color' : 'Warna' },
                    { id: 'grayscale', label: lang === 'en' ? 'Gray' : 'Abu' },
                    { id: 'bw', label: 'B&W' },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A1128] dark:text-white">
                  {lang === 'en' ? 'Orientation' : 'Orientasi'}
                </label>
                <LiquidGlassPillBar<'portrait' | 'landscape'>
                  size="sm"
                  equalWidth
                  ariaLabel="Scan orientation"
                  value={orientation}
                  onChange={setOrientation}
                  options={[
                    { id: 'portrait', label: 'Portrait' },
                    { id: 'landscape', label: 'Landscape' },
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0A1128] dark:text-white">
                  {lang === 'en' ? 'Brightness Adjustment' : 'Penyesuaian Kecerahan'} ({brightness})
                </label>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-[#00A3FF] dark:accent-[#38BDF8]"
                />
              </div>
            </div>
          </div>

          {/* CTA Bar */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[#0A1128]/65 dark:text-white/60">
              <ShieldCheck className="w-4 h-4 text-[#0A1128] dark:text-white shrink-0" />
              <span>{lang === 'en' ? '100% zero-server upload.' : '100% tanpa unggah ke server.'}</span>
            </div>

            <button
              type="button"
              onClick={handleBuildPdf}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glass-cta font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 btn-press-effect"
            >
              <FileText className="w-4 h-4" />
              <span>
                {isProcessing
                  ? lang === 'en'
                    ? 'Generating PDF...'
                    : 'Membuat PDF...'
                  : lang === 'en'
                    ? 'Generate & Download PDF'
                    : 'Buat & Unduh PDF'}
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

export default ScanToPdfWorkspace;
