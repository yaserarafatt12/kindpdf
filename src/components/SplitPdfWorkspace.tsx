'use client';

import React, { useState, useEffect } from 'react';
import { TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { splitPdfFile, parseRangeString, SplitMode, SplitPdfOptions } from '@/lib/pdf/splitPdf';
import { formatFileSize } from '@/lib/files/formatFileSize';
import ProcessingProgress from './ProcessingProgress';
import FileDropzone from './FileDropzone';
import {
  Scissors,
  FileText,
  Trash2,
  AlertCircle,
  X,
  ShieldCheck,
  ListFilter,
  CheckCircle2,
  LayoutGrid,
  Layers,
  Check,
  ArrowLeft,
} from 'lucide-react';

import { downloadBlob } from '@/lib/files/downloadBlob';
import { ViewMode } from '@/components/Header';
import SuccessDownloadScreen from './SuccessDownloadScreen';

interface SplitPdfWorkspaceProps {
  onBack: () => void;
  onSelectTool?: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: 'en' | 'id';
}

type ExtendedSplitMode = SplitMode | 'visual';

function formatPagesToRange(pages: number[]): string {
  if (pages.length === 0) return '';
  const sorted = [...pages].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = start;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = sorted[i];
      end = start;
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(', ');
}

export const SplitPdfWorkspace: React.FC<SplitPdfWorkspaceProps> = ({ onBack, onSelectTool, t, lang }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<ExtendedSplitMode>('visual');
  const [customRangeInput, setCustomRangeInput] = useState<string>('1-2');
  const [fixedChunkInput, setFixedChunkInput] = useState<number>(1);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [isRenderingThumbnails, setIsRenderingThumbnails] = useState(false);
  const [splitResult, setSplitResult] = useState<{ blob: Blob; filename: string } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorToast, setErrorToast] = useState<{ title: string; message: string } | null>(null);

  // Load file & generate thumbnails
  const handleFileChange = async (selectedFiles: File[]) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setErrorToast(null);

    const targetFile = selectedFiles[0];
    const validation = await validatePdfFile(targetFile);

    if (!validation.isValid && validation.error) {
      setErrorToast({
        title: validation.error.title,
        message: validation.error.message,
      });
      return;
    }

    setFile(targetFile);
    setPageCount(validation.pageCount);
    setThumbnails({});

    // Default select all pages for visual mode
    const allPages = Array.from({ length: validation.pageCount }, (_, i) => i + 1);
    setSelectedPages(allPages);

    if (validation.pageCount > 1) {
      setCustomRangeInput(`1-${Math.min(2, validation.pageCount)}`);
    } else {
      setCustomRangeInput('1');
    }
  };

  // Render page thumbnails via pdfjs-dist
  useEffect(() => {
    if (!file || pageCount === 0) return;
    let active = true;

    const renderThumbnails = async () => {
      setIsRenderingThumbnails(true);
      try {
        const pdfjsLib = await import('pdfjs-dist');
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfjsDoc = await loadingTask.promise;

        for (let i = 1; i <= Math.min(pageCount, 60); i++) {
          if (!active) break;
          try {
            const page = await pdfjsDoc.getPage(i);
            const viewport = page.getViewport({ scale: 0.25 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              await page.render({ canvasContext: ctx, viewport }).promise;
              const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
              if (active) {
                setThumbnails((prev) => ({ ...prev, [i]: dataUrl }));
              }
            }
          } catch (e) {
            console.warn(`Error rendering thumbnail for page ${i}:`, e);
          }
        }
      } catch (err) {
        console.warn('Thumbnail generation failed:', err);
      } finally {
        if (active) setIsRenderingThumbnails(false);
      }
    };

    renderThumbnails();
    return () => {
      active = false;
    };
  }, [file, pageCount]);

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages((prev) => {
      if (prev.includes(pageNum)) {
        return prev.filter((p) => p !== pageNum);
      } else {
        return [...prev, pageNum].sort((a, b) => a - b);
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedPages(Array.from({ length: pageCount }, (_, i) => i + 1));
  };

  const handleDeselectAll = () => {
    setSelectedPages([]);
  };

  const handleSelectOdd = () => {
    setSelectedPages(Array.from({ length: pageCount }, (_, i) => i + 1).filter((p) => p % 2 !== 0));
  };

  const handleSelectEven = () => {
    setSelectedPages(Array.from({ length: pageCount }, (_, i) => i + 1).filter((p) => p % 2 === 0));
  };

  const handleExecuteSplit = async () => {
    if (!file || pageCount === 0) return;
    setErrorToast(null);

    let effectiveMode: SplitMode = splitMode === 'visual' ? 'custom' : splitMode;

    if (splitMode === 'visual') {
      if (selectedPages.length === 0) {
        setErrorToast({
          title: lang === 'en' ? 'No Pages Selected' : 'Tidak Ada Halaman Dipilih',
          message: lang === 'en' ? 'Please select at least 1 page thumbnail.' : 'Pilih setidaknya 1 gambar halaman.',
        });
        return;
      }
      const rangeStr = formatPagesToRange(selectedPages);
      try {
        parseRangeString(rangeStr, pageCount);
      } catch (err: any) {
        setErrorToast({
          title: lang === 'en' ? 'Invalid Selection' : 'Pilihan Tidak Valid',
          message: err?.message || 'Page selection parse failed.',
        });
        return;
      }
    } else if (splitMode === 'custom') {
      try {
        const ranges = parseRangeString(customRangeInput, pageCount);
        if (ranges.length === 0) {
          setErrorToast({
            title: lang === 'en' ? 'Invalid Page Range' : 'Rentang Halaman Tidak Valid',
            message: lang === 'en' ? 'Please enter a valid page range (e.g. 1-3, 5).' : 'Masukkan rentang halaman yang valid (contoh: 1-3, 5).',
          });
          return;
        }
      } catch (err: any) {
        setErrorToast({
          title: lang === 'en' ? 'Invalid Range Syntax' : 'Sintaks Rentang Salah',
          message: err?.message || 'Check your range input format.',
        });
        return;
      }
    }

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(10);
    setProgressMsg(lang === 'en' ? 'Splitting PDF document locally...' : 'Memisahkan dokumen PDF secara lokal...');

    try {
      let options: SplitPdfOptions = {
        mode: effectiveMode,
      };

      if (splitMode === 'visual') {
        const rangeStr = formatPagesToRange(selectedPages);
        options.ranges = parseRangeString(rangeStr, pageCount);
      } else if (splitMode === 'custom') {
        options.ranges = parseRangeString(customRangeInput, pageCount);
      } else if (splitMode === 'fixed') {
        options.pagesPerFile = fixedChunkInput;
      }

      const result = await splitPdfFile(
        file,
        options,
        (current, total, msg) => {
          setCurrentStep(current);
          setTotalSteps(total);
          setProgressMsg(msg);
        }
      );

      setIsProcessing(false);
      setSplitResult({
        blob: result.blob,
        filename: result.filename,
      });
    } catch (error: any) {
      setIsProcessing(false);
      setErrorToast({
        title: lang === 'en' ? 'Split Failed' : 'Gagal Memisahkan PDF',
        message: error?.message || (lang === 'en' ? 'Failed to process PDF split operation.' : 'Gagal memproses pemisahan berkas PDF.'),
      });
    }
  };

  if (splitResult) {
    return (
      <SuccessDownloadScreen
        title={lang === 'en' ? 'PDF Split Successfully!' : 'PDF Berhasil Dipisahkan!'}
        downloadFileName={splitResult.filename}
        downloadButtonText={lang === 'en' ? 'Download Split PDF' : 'Unduh PDF Dipisahkan'}
        onDownload={(customName?: string) =>
          downloadBlob(splitResult.blob, customName || splitResult.filename)
        }
        onStartOver={() => {
          setSplitResult(null);
          setFile(null);
          setPageCount(0);
          setSelectedPages([]);
          setThumbnails({});
        }}
        onSelectTool={(toolId: ViewMode) => {
          setSplitResult(null);
          setFile(null);
          if (onSelectTool) onSelectTool(toolId);
        }}
        t={t}
        lang={lang}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          {lang === 'en' ? 'Split PDF Document' : 'Pisahkan Dokumen PDF'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'en'
            ? 'Split PDF into multiple files by pages, ranges, or visual selection.'
            : 'Pisahkan PDF menjadi beberapa berkas berdasarkan halaman, rentang, atau pilihan visual.'}
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
        <FileDropzone onFilesSelected={handleFileChange} disabled={isProcessing} t={t} colorTheme="amber" />
      ) : (
        <div className="space-y-6">
          {/* Active File Summary Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm min-w-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {file.name}
                </h4>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                  {pageCount} {lang === 'en' ? 'Pages' : 'Halaman'} • {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPageCount(0);
                setSelectedPages([]);
                setThumbnails({});
              }}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors btn-press-effect shrink-0"
              title="Remove File"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Split Mode Options Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 space-y-5 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-500" />
              <span>{lang === 'en' ? 'Select Split Mode' : 'Pilih Mode Pemisahan'}</span>
            </h3>

            {/* Split Mode Radio Grid (4 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setSplitMode('visual')}
                className={`p-3.5 rounded-2xl border-2 text-left space-y-1 transition-all btn-press-effect ${
                  splitMode === 'visual'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 shadow-sm'
                    : 'border-slate-300 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <LayoutGrid className="w-4 h-4 text-amber-500" />
                  {splitMode === 'visual' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  {lang === 'en' ? 'Select Pages (Visual Grid)' : 'Pilih Halaman (Visual)'}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {lang === 'en' ? 'Click thumbnail cards to select' : 'Klik kartu gambar halaman'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSplitMode('custom')}
                className={`p-3.5 rounded-2xl border-2 text-left space-y-1 transition-all btn-press-effect ${
                  splitMode === 'custom'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 shadow-sm'
                    : 'border-slate-300 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <ListFilter className="w-4 h-4 text-amber-500" />
                  {splitMode === 'custom' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  {lang === 'en' ? 'Custom Ranges' : 'Rentang Khusus'}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  e.g. 1-3, 5, 8-10
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSplitMode('fixed')}
                className={`p-3.5 rounded-2xl border-2 text-left space-y-1 transition-all btn-press-effect ${
                  splitMode === 'fixed'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 shadow-sm'
                    : 'border-slate-300 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Layers className="w-4 h-4 text-amber-500" />
                  {splitMode === 'fixed' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  {lang === 'en' ? 'Split Every N Pages' : 'Pisah Tiap N Halaman'}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  e.g. Every 2 pages
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSplitMode('all')}
                className={`p-3.5 rounded-2xl border-2 text-left space-y-1 transition-all btn-press-effect ${
                  splitMode === 'all'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 shadow-sm'
                    : 'border-slate-300 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Scissors className="w-4 h-4 text-amber-500" />
                  {splitMode === 'all' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  {lang === 'en' ? 'Extract All Pages' : 'Ekstrak Semua Halaman'}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  1 page per PDF (ZIP)
                </p>
              </button>
            </div>

            {/* Sub-inputs depending on mode */}
            {splitMode === 'custom' && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  {lang === 'en' ? 'Page Range Input' : 'Masukan Rentang Halaman'}
                </label>
                <input
                  type="text"
                  value={customRangeInput}
                  onChange={(e) => setCustomRangeInput(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {lang === 'en'
                    ? `Max pages available: ${pageCount}. Multi-range splits will download as ZIP.`
                    : `Halaman maksimum: ${pageCount}. Hasil banyak berkas akan diunduh sebagai ZIP.`}
                </p>
              </div>
            )}

            {splitMode === 'fixed' && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  {lang === 'en' ? 'Pages Per Split PDF' : 'Jumlah Halaman Per Berkas PDF'}
                </label>
                <input
                  type="number"
                  min="1"
                  max={pageCount}
                  value={fixedChunkInput}
                  onChange={(e) => setFixedChunkInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full max-w-xs px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {/* Visual Page Selection Grid Component */}
          {splitMode === 'visual' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{lang === 'en' ? 'Page Selection Preview' : 'Pratinjau Pilihan Halaman'}</span>
                    <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
                      {selectedPages.length} / {pageCount} {lang === 'en' ? 'Selected' : 'Dipilih'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {lang === 'en' ? 'Range:' : 'Rentang:'} <span className="font-extrabold text-slate-700 dark:text-slate-300">{formatPagesToRange(selectedPages) || (lang === 'en' ? 'None' : 'Tidak Ada')}</span>
                  </p>
                </div>

                {/* Batch Selection Tool Buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 btn-press-effect"
                  >
                    {lang === 'en' ? 'Select All' : 'Pilih Semua'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 btn-press-effect"
                  >
                    {lang === 'en' ? 'Deselect All' : 'Hapus Semua'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectOdd}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 btn-press-effect"
                  >
                    {lang === 'en' ? 'Odd Pages' : 'Halaman Ganjil'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectEven}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 btn-press-effect"
                  >
                    {lang === 'en' ? 'Even Pages' : 'Halaman Genap'}
                  </button>
                </div>
              </div>

              {/* Page Thumbnail Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 pt-2 max-h-[480px] overflow-y-auto pr-1">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => {
                  const isSelected = selectedPages.includes(pageNum);
                  const thumbData = thumbnails[pageNum];

                  return (
                    <div
                      key={pageNum}
                      onClick={() => togglePageSelection(pageNum)}
                      className={`relative group rounded-xl p-2 border-2 cursor-pointer transition-all duration-200 select-none flex flex-col items-center justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20 scale-[1.02]'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 opacity-60 hover:opacity-100 grayscale-[30%] hover:grayscale-0'
                      }`}
                    >
                      {/* Selection Checkmark Badge */}
                      <div className="absolute top-2 right-2 z-10">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-emerald-500 text-white shadow-sm scale-100'
                              : 'bg-slate-200 dark:bg-slate-700 text-transparent scale-90'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>

                      {/* Thumbnail Image Container */}
                      <div className="w-full aspect-[3/4] rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                        {thumbData ? (
                          <img
                            src={thumbData}
                            alt={`Page ${pageNum}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center p-2">
                            <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1 animate-pulse" />
                            <span className="text-[10px] text-slate-400 font-medium">Page {pageNum}</span>
                          </div>
                        )}
                      </div>

                      {/* Page Number Label */}
                      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 mt-2">
                        {pageNum}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t.ramProcessing}</span>
            </div>

            <button
              type="button"
              onClick={handleExecuteSplit}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-sm shadow-xl shadow-amber-500/30 transition-all btn-press-effect flex items-center justify-center gap-2"
            >
              <Scissors className="w-4 h-4" />
              <span>{lang === 'en' ? 'Split PDF Now' : 'Pisahkan PDF Sekarang'}</span>
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

export default SplitPdfWorkspace;
