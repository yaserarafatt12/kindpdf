'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Trash2, ArrowUp, ArrowDown, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, X, FileText } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { downloadBlob } from '@/lib/files/downloadBlob';
import PrivacyNotice from './PrivacyNotice';
import { captureFrameFromVideo, buildPdfFromScans, ScanOptions } from '@/lib/pdf/scanToPdf';
import { HumanError } from '@/lib/errors/messages';

interface ScanToPdfWorkspaceProps {
  onBack: () => void;
  t: TranslationDictionary;
  lang: Language;
}

export const ScanToPdfWorkspace: React.FC<ScanToPdfWorkspaceProps> = ({ onBack, t, lang }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorToast, setErrorToast] = useState<HumanError | null>(null);

  // Scan options
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [colorMode, setColorMode] = useState<'color' | 'grayscale' | 'bw'>('color');
  const [brightness, setBrightness] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
    } catch (err: any) {
      setErrorToast({
        type: 'CORRUPTED',
        title: lang === 'en' ? 'Camera Access Denied' : 'Akses Kamera Ditolak',
        message: lang === 'en' ? 'Please grant camera permission to use Scan to PDF.' : 'Beri izin kamera untuk menggunakan Scan to PDF.',
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
    setErrorToast(null);

    try {
      const options: ScanOptions = {
        pageSize,
        orientation,
        colorMode,
        brightness,
      };

      const pdfBytes = await buildPdfFromScans(scannedImages, options);
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      downloadBlob(blob, `Kindpdf_Scanned_Document.pdf`);
    } catch (err: any) {
      setErrorToast({
        type: 'CORRUPTED',
        title: lang === 'en' ? 'Scan to PDF Failed' : 'Gagal Membuat PDF',
        message: err?.message || 'Unexpected error building scanned PDF.',
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
        onClick={() => {
          stopCamera();
          onBack();
        }}
        className="inline-flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 transition-colors btn-press-effect"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.backToAllTools}</span>
      </button>

      {/* Hero Header */}
      <div className="text-center space-y-2 py-2 max-w-lg mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Scan to PDF
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'en'
            ? 'Scan physical documents using your device camera and convert them into a multi-page PDF.'
            : 'Pindai dokumen fisik menggunakan kamera perangkat Anda dan ubah menjadi PDF multi-halaman.'}
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

      {/* Camera Preview Area */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
        {!cameraActive ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8 text-blue-600 dark:text-sky-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
                {lang === 'en' ? 'Camera Permission Required' : 'Izin Kamera Diperlukan'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                {lang === 'en' ? 'Click below to turn on your webcam/camera for document scanning.' : 'Klik di bawah untuk mengaktifkan kamera/webcam Anda.'}
              </p>
            </div>
            <button
              type="button"
              onClick={startCamera}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-xs shadow-lg shadow-blue-500/30 btn-press-effect"
            >
              {lang === 'en' ? 'Enable Camera' : 'Aktifkan Kamera'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-slate-300 dark:border-slate-700 aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleCapture}
                className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 border-4 border-white shadow-xl flex items-center justify-center text-white transition-all btn-press-effect"
                title={lang === 'en' ? 'Capture Page' : 'Tangkap Halaman'}
              >
                <Camera className="w-7 h-7" />
              </button>

              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              >
                {lang === 'en' ? 'Turn Off Camera' : 'Matikan Kamera'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Captured Pages Gallery */}
      {scannedImages.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              {lang === 'en' ? 'Scanned Pages' : 'Halaman Pindaian'} ({scannedImages.length})
            </h3>
            <button
              type="button"
              onClick={() => setScannedImages([])}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              {lang === 'en' ? 'Clear All' : 'Hapus Semua'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {scannedImages.map((url, idx) => (
              <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group">
                <img src={url} alt={`Scan ${idx + 1}`} className="w-full h-32 object-cover" />
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-black">
                  #{idx + 1}
                </span>

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
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

          {/* Document Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'en' ? 'Page Size' : 'Ukuran Halaman'}
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="fit">{lang === 'en' ? 'Fit Image' : 'Sesuaikan Gambar'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'en' ? 'Color Mode' : 'Mode Warna'}
              </label>
              <select
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
              >
                <option value="color">{lang === 'en' ? 'Full Color' : 'Warna Asli'}</option>
                <option value="grayscale">{lang === 'en' ? 'Grayscale' : 'Skala Abu-abu'}</option>
                <option value="bw">{lang === 'en' ? 'Black & White' : 'Hitam-Putih'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'en' ? 'Brightness' : 'Kecerahan'} ({brightness})
              </label>
              <input
                type="range"
                min={-50}
                max={50}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          {/* CTA Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{lang === 'en' ? '100% zero-server upload.' : '100% tanpa unggah ke server.'}</span>
            </div>

            <button
              type="button"
              onClick={handleBuildPdf}
              disabled={isProcessing}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-xl transition-all duration-200 btn-press-effect ${
                !isProcessing
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-blue-500/30 scale-[1.02]'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{isProcessing ? (lang === 'en' ? 'Generating PDF...' : 'Membuat PDF...') : (lang === 'en' ? 'Generate & Download PDF' : 'Buat & Unduh PDF')}</span>
              
            </button>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <PrivacyNotice t={t} />
    </div>
  );
};

export default ScanToPdfWorkspace;
