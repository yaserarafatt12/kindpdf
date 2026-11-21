'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit3,
  Type,
  Square,
  Circle,
  Minus,
  Trash2,
  Plus,
  AlertCircle,
  X,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { downloadBlob } from '@/lib/files/downloadBlob';
import FileDropzone from './FileDropzone';
import PrivacyNotice from './PrivacyNotice';
import { applyOverlays, OverlayItem, OverlayType } from '@/lib/pdf/editPdfOverlay';
import { renderPdfPagePreview } from '@/lib/pdf/pdfjsWorker';
import { HumanError } from '@/lib/errors/messages';
import ProcessingProgress from './ProcessingProgress';
import SuccessDownloadScreen from './SuccessDownloadScreen';
import LiquidGlassPillBar from './LiquidGlassPillBar';
import { ViewMode } from '@/components/Header';

interface EditPdfWorkspaceProps {
  onBack: () => void;
  onSelectTool?: (toolId: ViewMode) => void;
  t: TranslationDictionary;
  lang: Language;
}

export const EditPdfWorkspace: React.FC<EditPdfWorkspaceProps> = ({
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

  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [activeToolType, setActiveToolType] = useState<OverlayType>('text');
  const [targetPage, setTargetPage] = useState<number>(1);
  const [pagePreviewUrl, setPagePreviewUrl] = useState<string | null>(null);

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
    renderPdfPagePreview(file, targetPage, 1.1).then((res) => {
      if (active) setPagePreviewUrl(res?.dataUrl || null);
    });
    return () => {
      active = false;
    };
  }, [file, pageCount, targetPage]);

  const handleAddOverlay = (type: OverlayType, customX = 20, customY = 20) => {
    const newId = `overlay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem: OverlayItem = {
      id: newId,
      type,
      pageIndex: targetPage - 1,
      x: Math.round(customX),
      y: Math.round(customY),
      text: type === 'text' ? (lang === 'en' ? 'Sample Text' : 'Teks Sample') : undefined,
      fontSize: 18,
      color: { r: 10, g: 17, b: 40 },
      opacity: 1,
      width: type === 'text' ? undefined : 30,
      height: type === 'text' ? undefined : 15,
      strokeWidth: 2,
    };

    setOverlays((prev) => [...prev, newItem]);
    setSelectedOverlayId(newId);
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(95, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const clickY = Math.max(0, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    if (selectedOverlayId) {
      handleUpdateOverlay(selectedOverlayId, { x: clickX, y: clickY, pageIndex: targetPage - 1 });
    } else {
      handleAddOverlay(activeToolType, clickX, clickY);
    }
  };

  const handleRemoveOverlay = (id: string) => {
    setOverlays((prev) => prev.filter((item) => item.id !== id));
    if (selectedOverlayId === id) setSelectedOverlayId(null);
  };

  const handleUpdateOverlay = (id: string, updates: Partial<OverlayItem>) => {
    setOverlays((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleSaveAndDownload = async () => {
    if (!file) return;
    if (overlays.length === 0) {
      setErrorToast({
        type: 'EMPTY_FILE_LIST',
        title: lang === 'en' ? 'No Edits Added' : 'Belum Ada Editan',
        message:
          lang === 'en'
            ? 'Please add at least one text or shape overlay before saving.'
            : 'Tambahkan minimal satu teks atau bentuk sebelum menyimpan.',
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(2);
    setProgressMsg(
      lang === 'en'
        ? 'Applying annotations and text overlays to PDF...'
        : 'Menerapkan anotasi dan hamparan teks ke PDF...'
    );
    setErrorToast(null);

    try {
      const editedBytes = await applyOverlays(file, overlays);
      const blob = new Blob([editedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.pdf$/i, '');
      const filename = `Kindpdf_${baseName}_Edited.pdf`;

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
        title: lang === 'en' ? 'Edit Failed' : 'Gagal Mengedit',
        message: err?.message || 'Unexpected error while modifying PDF.',
      });
    }
  };

  if (completedResult) {
    return (
      <SuccessDownloadScreen
        title={lang === 'en' ? 'PDF Edited Successfully!' : 'Dokumen PDF Berhasil Diedit!'}
        downloadFileName={completedResult.filename}
        downloadButtonText={lang === 'en' ? 'Download Edited PDF' : 'Unduh PDF Hasil Edit'}
        onDownload={(customName?: string) =>
          downloadBlob(completedResult.blob, customName || completedResult.filename)
        }
        onStartOver={() => {
          setCompletedResult(null);
          setFile(null);
          setPageCount(0);
          setOverlays([]);
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

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setOverlays([]);
    setSelectedOverlayId(null);
    setErrorToast(null);
  };

  const selectedItem = overlays.find((o) => o.id === selectedOverlayId);
  const currentPageOverlays = overlays.filter((o) => o.pageIndex === targetPage - 1);

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
          Edit PDF (Overlay)
        </h2>
        <p className="text-xs sm:text-sm text-[#0A1128]/65 dark:text-white/60 font-normal leading-relaxed">
          {lang === 'en'
            ? 'Add text, rectangles, circles, and lines directly over your PDF pages.'
            : 'Tambahkan teks, persegi, lingkaran, dan garis langsung di atas halaman PDF Anda.'}
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

      {/* Edit Workspace */}
      {file && (
        <div className="space-y-5">
          {/* Document Info */}
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
              onClick={handleReset}
              className="relative z-10 text-xs font-bold text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 btn-press-effect shrink-0"
            >
              {lang === 'en' ? 'Change File' : 'Ganti File'}
            </button>
          </div>

          {/* Interactive Tool & Canvas Card */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-5">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Liquid Glass Tool Selector */}
              <LiquidGlassPillBar<OverlayType>
                size="sm"
                scrollable
                ariaLabel="Choose overlay tool"
                value={activeToolType}
                onChange={(tType) => {
                  setActiveToolType(tType);
                  handleAddOverlay(tType);
                }}
                options={[
                  {
                    id: 'text',
                    label: lang === 'en' ? 'Text' : 'Teks',
                    icon: <Type className="w-3.5 h-3.5" />,
                  },
                  {
                    id: 'rectangle',
                    label: lang === 'en' ? 'Rectangle' : 'Persegi',
                    icon: <Square className="w-3.5 h-3.5" />,
                  },
                  {
                    id: 'circle',
                    label: lang === 'en' ? 'Circle' : 'Lingkaran',
                    icon: <Circle className="w-3.5 h-3.5" />,
                  },
                  {
                    id: 'line',
                    label: lang === 'en' ? 'Line' : 'Garis',
                    icon: <Minus className="w-3.5 h-3.5" />,
                  },
                ]}
              />

              {/* Page Navigator + Add Active Element Button */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full glass-pill text-xs font-bold">
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

                <button
                  type="button"
                  onClick={() => handleAddOverlay(activeToolType)}
                  className="px-3.5 py-1.5 rounded-full glass-cta text-xs font-bold inline-flex items-center gap-1.5 btn-press-effect"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Add' : 'Tambah'}</span>
                </button>
              </div>
            </div>

            {/* Interactive Live PDF Page Canvas Preview */}
            {pagePreviewUrl && (
              <div className="relative z-10 space-y-1.5">
                <p className="text-[11px] font-medium text-[#0A1128]/60 dark:text-white/55 text-center">
                  {lang === 'en'
                    ? 'Tip: Click anywhere on the page preview below to position the selected element.'
                    : 'Tips: Klik di mana saja pada pratinjau halaman di bawah untuk memposisikan elemen.'}
                </p>
                <div
                  onClick={handlePreviewClick}
                  className="relative max-w-md mx-auto rounded-2xl overflow-hidden border border-black/15 dark:border-white/20 shadow-xl bg-white cursor-crosshair select-none"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pagePreviewUrl}
                    alt={`Page ${targetPage} preview`}
                    className="w-full h-auto block pointer-events-none"
                  />

                  {/* Render Overlays for current page */}
                  {currentPageOverlays.map((item) => {
                    const isSelected = item.id === selectedOverlayId;
                    return (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOverlayId(item.id);
                        }}
                        style={{
                          left: `${item.x}%`,
                          top: `${item.y}%`,
                          width: item.type !== 'text' ? `${item.width || 25}%` : undefined,
                          height:
                            item.type === 'rectangle'
                              ? `${item.height || 12}%`
                              : item.type === 'circle'
                                ? `${item.width || 12}%`
                                : undefined,
                          opacity: item.opacity ?? 1,
                        }}
                        className={`absolute transition-shadow cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-[#00A3FF] shadow-md z-20'
                            : 'hover:ring-1 hover:ring-[#00A3FF]/60 z-10'
                        }`}
                      >
                        {item.type === 'text' && (
                          <span
                            className="px-1.5 py-0.5 rounded bg-white/80 text-[#0A1128] font-bold whitespace-nowrap shadow-sm border border-[#0A1128]/20 block"
                            style={{ fontSize: `${Math.max(10, (item.fontSize || 16) * 0.75)}px` }}
                          >
                            {item.text || 'Text'}
                          </span>
                        )}
                        {item.type === 'rectangle' && (
                          <div className="w-full h-full border-2 border-[#0A1128] bg-[#00A3FF]/10 rounded-xs" />
                        )}
                        {item.type === 'circle' && (
                          <div className="w-full aspect-square rounded-full border-2 border-[#0A1128] bg-[#00A3FF]/10" />
                        )}
                        {item.type === 'line' && (
                          <div className="w-full h-0.5 bg-[#0A1128] my-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Overlays List */}
            {overlays.length > 0 && (
              <div className="relative z-10 space-y-2 pt-3 border-t border-black/[0.08] dark:border-white/[0.12]">
                <p className="text-[11px] font-bold text-[#0A1128]/55 dark:text-white/50 uppercase tracking-wider">
                  {lang === 'en' ? 'Added Elements' : 'Elemen Ditambahkan'} ({overlays.length})
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {overlays.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedOverlayId(item.id);
                        setTargetPage(item.pageIndex + 1);
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedOverlayId === item.id
                          ? 'border-[#00A3FF] dark:border-[#38BDF8] bg-[#00A3FF]/[0.08] dark:bg-white/[0.12]'
                          : 'border-black/[0.08] dark:border-white/[0.12] bg-white/50 dark:bg-white/[0.04] hover:bg-white/80 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.type === 'text' && <Type className="w-4 h-4 text-[#0A1128] dark:text-white" />}
                        {item.type === 'rectangle' && <Square className="w-4 h-4 text-[#0A1128] dark:text-white" />}
                        {item.type === 'circle' && <Circle className="w-4 h-4 text-[#0A1128] dark:text-white" />}
                        {item.type === 'line' && <Minus className="w-4 h-4 text-[#0A1128] dark:text-white" />}
                        <span className="text-xs font-bold text-[#0A1128] dark:text-white">
                          {item.type.toUpperCase()} ({lang === 'en' ? 'Page' : 'Hal'} {item.pageIndex + 1}) — X:{item.x}%, Y:{item.y}%
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveOverlay(item.id);
                        }}
                        className="p-1.5 rounded-xl hover:bg-rose-500/15 text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Element Property Inspector */}
            {selectedItem && (
              <div className="relative z-10 p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.14] space-y-3 animate-fade-in">
                <p className="text-xs font-bold text-[#0A1128] dark:text-white">
                  {lang === 'en' ? 'Edit Element Properties' : 'Edit Properti Elemen'}
                </p>

                {selectedItem.type === 'text' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#0A1128]/70 dark:text-white/70">
                      {lang === 'en' ? 'Text Content' : 'Isi Teks'}
                    </label>
                    <input
                      type="text"
                      value={selectedItem.text || ''}
                      onChange={(e) =>
                        handleUpdateOverlay(selectedItem.id, { text: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-white/80 dark:bg-white/[0.07] border border-black/[0.10] dark:border-white/[0.16] text-xs font-bold text-[#0A1128] dark:text-white outline-none focus:border-[#00A3FF] dark:focus:border-[#38BDF8]"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#0A1128]/65 dark:text-white/65 mb-1">
                      X Position (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={selectedItem.x}
                      onChange={(e) =>
                        handleUpdateOverlay(selectedItem.id, { x: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.07] border border-black/[0.10] dark:border-white/[0.16] text-xs font-bold text-[#0A1128] dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#0A1128]/65 dark:text-white/65 mb-1">
                      Y Position (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={selectedItem.y}
                      onChange={(e) =>
                        handleUpdateOverlay(selectedItem.id, { y: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.07] border border-black/[0.10] dark:border-white/[0.16] text-xs font-bold text-[#0A1128] dark:text-white outline-none"
                    />
                  </div>

                  {selectedItem.type === 'text' ? (
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0A1128]/65 dark:text-white/65 mb-1">
                        Font Size (pt)
                      </label>
                      <input
                        type="number"
                        min={8}
                        max={72}
                        value={selectedItem.fontSize || 16}
                        onChange={(e) =>
                          handleUpdateOverlay(selectedItem.id, {
                            fontSize: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.07] border border-black/[0.10] dark:border-white/[0.16] text-xs font-bold text-[#0A1128] dark:text-white outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0A1128]/65 dark:text-white/65 mb-1">
                        Width (%)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={selectedItem.width || 20}
                        onChange={(e) =>
                          handleUpdateOverlay(selectedItem.id, { width: Number(e.target.value) })
                        }
                        className="w-full px-3 py-1.5 rounded-xl bg-white/80 dark:bg-white/[0.07] border border-black/[0.10] dark:border-white/[0.16] text-xs font-bold text-[#0A1128] dark:text-white outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-[#0A1128]/65 dark:text-white/65 mb-1">
                      Opacity ({Math.round((selectedItem.opacity ?? 1) * 100)}%)
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.1}
                      value={selectedItem.opacity ?? 1}
                      onChange={(e) =>
                        handleUpdateOverlay(selectedItem.id, { opacity: Number(e.target.value) })
                      }
                      className="w-full accent-[#00A3FF] dark:accent-[#38BDF8] mt-1.5"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CTA Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-[#0A1128]/65 dark:text-white/60">
              <ShieldCheck className="w-4 h-4 text-[#0A1128] dark:text-white shrink-0" />
              <span>
                {lang === 'en'
                  ? '100% processed locally in browser.'
                  : '100% diproses secara lokal di browser.'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSaveAndDownload}
              disabled={isProcessing || overlays.length === 0}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 btn-press-effect ${
                overlays.length > 0 && !isProcessing
                  ? 'glass-cta'
                  : 'bg-black/[0.08] dark:bg-white/[0.08] text-[#0A1128]/35 dark:text-white/35 border border-black/[0.06] dark:border-white/[0.10] cursor-not-allowed shadow-none'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>
                {isProcessing
                  ? lang === 'en'
                    ? 'Applying...'
                    : 'Menerapkan...'
                  : lang === 'en'
                    ? 'Save & Download PDF'
                    : 'Simpan & Unduh PDF'}
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

export default EditPdfWorkspace;
