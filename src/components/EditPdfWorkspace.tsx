'use client';

import React, { useState } from 'react';
import { ArrowLeft, Edit3, Type, Square, Circle, Minus, Trash2, Plus, AlertCircle, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { downloadBlob } from '@/lib/files/downloadBlob';
import FileDropzone from './FileDropzone';
import PrivacyNotice from './PrivacyNotice';
import { applyOverlays, OverlayItem, OverlayType } from '@/lib/pdf/editPdfOverlay';
import { HumanError } from '@/lib/errors/messages';

import ProcessingProgress from './ProcessingProgress';
import SuccessDownloadScreen from './SuccessDownloadScreen';
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

  // Overlay state
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  // Default parameters for new overlay
  const [targetPage, setTargetPage] = useState<number>(1);

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

  const handleAddOverlay = (type: OverlayType) => {
    const newId = `overlay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem: OverlayItem = {
      id: newId,
      type,
      pageIndex: targetPage - 1,
      x: 20,
      y: 20,
      text: type === 'text' ? (lang === 'en' ? 'Sample Text' : 'Teks Sample') : undefined,
      fontSize: 18,
      color: { r: 239, g: 68, b: 68 }, // Red
      opacity: 1,
      width: type === 'text' ? undefined : 30,
      height: type === 'text' ? undefined : 15,
      strokeWidth: 2,
    };

    setOverlays((prev) => [...prev, newItem]);
    setSelectedOverlayId(newId);
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
        message: lang === 'en' ? 'Please add at least one text or shape overlay before saving.' : 'Tambahkan minimal satu teks atau bentuk sebelum menyimpan.',
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep(1);
    setTotalSteps(2);
    setProgressMsg(lang === 'en' ? 'Applying annotations and text overlays to PDF...' : 'Menerapkan anotasi dan hamparan teks ke PDF...');
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
          Edit PDF (Overlay)
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'en'
            ? 'Add text, rectangles, circles, and lines over your PDF pages. Fast client-side rendering.'
            : 'Tambahkan teks, persegi, lingkaran, dan garis di atas halaman PDF Anda. Cepat & 100% di browser.'}
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
      {!file && <FileDropzone onFilesSelected={handleFileSelected} disabled={isProcessing} t={t} colorTheme="purple" />}

      {/* Edit Workspace */}
      {file && (
        <div className="space-y-5">
          {/* Document Info */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">{file.name}</p>
              <p className="text-xs text-slate-500 font-medium">{pageCount} {lang === 'en' ? 'pages' : 'halaman'}</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-extrabold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 btn-press-effect"
            >
              {lang === 'en' ? 'Change File' : 'Ganti File'}
            </button>
          </div>

          {/* Toolbar for Adding Elements */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  {lang === 'en' ? 'Target Page:' : 'Halaman Target:'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={targetPage}
                  onChange={(e) => setTargetPage(Math.max(1, Math.min(pageCount, Number(e.target.value))))}
                  className="w-16 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-black text-center"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddOverlay('text')}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100 transition-colors btn-press-effect"
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>+ {lang === 'en' ? 'Text' : 'Teks'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddOverlay('rectangle')}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-100 transition-colors btn-press-effect"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>+ {lang === 'en' ? 'Rectangle' : 'Persegi'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddOverlay('circle')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors btn-press-effect"
                >
                  <Circle className="w-3.5 h-3.5" />
                  <span>+ {lang === 'en' ? 'Circle' : 'Lingkaran'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddOverlay('line')}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100 transition-colors btn-press-effect"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>+ {lang === 'en' ? 'Line' : 'Garis'}</span>
                </button>
              </div>
            </div>

            {/* Overlays List */}
            {overlays.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  {lang === 'en' ? 'Added Elements' : 'Elemen Ditambahkan'} ({overlays.length})
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {overlays.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedOverlayId(item.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        selectedOverlayId === item.id
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {item.type === 'text' && <Type className="w-4 h-4 text-blue-600" />}
                        {item.type === 'rectangle' && <Square className="w-4 h-4 text-purple-600" />}
                        {item.type === 'circle' && <Circle className="w-4 h-4 text-emerald-600" />}
                        {item.type === 'line' && <Minus className="w-4 h-4 text-amber-600" />}
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {item.type.toUpperCase()} (Page {item.pageIndex + 1}) - X:{item.x}%, Y:{item.y}%
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveOverlay(item.id);
                        }}
                        className="p-1 rounded-lg hover:bg-rose-100 text-rose-500 transition-colors"
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
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                  {lang === 'en' ? 'Edit Element Properties' : 'Edit Properti Elemen'}
                </p>

                {selectedItem.type === 'text' && (
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">{lang === 'en' ? 'Text Content' : 'Isi Teks'}</label>
                    <input
                      type="text"
                      value={selectedItem.text || ''}
                      onChange={(e) => handleUpdateOverlay(selectedItem.id, { text: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500">X Position (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={selectedItem.x}
                      onChange={(e) => handleUpdateOverlay(selectedItem.id, { x: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500">Y Position (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={selectedItem.y}
                      onChange={(e) => handleUpdateOverlay(selectedItem.id, { y: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs font-bold"
                    />
                  </div>

                  {selectedItem.type === 'text' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500">Font Size (pt)</label>
                      <input
                        type="number"
                        min={8}
                        max={72}
                        value={selectedItem.fontSize || 16}
                        onChange={(e) => handleUpdateOverlay(selectedItem.id, { fontSize: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs font-bold"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500">Width (%)</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={selectedItem.width || 20}
                        onChange={(e) => handleUpdateOverlay(selectedItem.id, { width: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs font-bold"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500">Opacity</label>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.1}
                      value={selectedItem.opacity ?? 1}
                      onChange={(e) => handleUpdateOverlay(selectedItem.id, { opacity: Number(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CTA Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{lang === 'en' ? '100% processed locally in browser.' : '100% diproses secara lokal di browser.'}</span>
            </div>

            <button
              type="button"
              onClick={handleSaveAndDownload}
              disabled={isProcessing || overlays.length === 0}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-xl transition-all duration-200 btn-press-effect ${
                overlays.length > 0 && !isProcessing
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-blue-500/30 scale-[1.02]'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>{isProcessing ? (lang === 'en' ? 'Applying...' : 'Menerapkan...') : (lang === 'en' ? 'Save & Download PDF' : 'Simpan & Unduh PDF')}</span>
              
            </button>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <PrivacyNotice t={t} />

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

export default EditPdfWorkspace;
