'use client';

import React, { useState } from 'react';
import { ArrowLeft, EyeOff, Plus, Trash2, ShieldCheck, ArrowRight, AlertCircle, X } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { downloadBlob } from '@/lib/files/downloadBlob';
import FileDropzone from './FileDropzone';
import PrivacyNotice from './PrivacyNotice';
import { redactPdf, RedactRegion } from '@/lib/pdf/redactPdf';
import { HumanError } from '@/lib/errors/messages';

interface RedactPdfWorkspaceProps {
  onBack: () => void;
  t: TranslationDictionary;
  lang: Language;
}

export const RedactPdfWorkspace: React.FC<RedactPdfWorkspaceProps> = ({ onBack, t, lang }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorToast, setErrorToast] = useState<HumanError | null>(null);

  const [regions, setRegions] = useState<RedactRegion[]>([]);
  const [targetPage, setTargetPage] = useState(1);

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

  const handleAddRegion = () => {
    const newRegion: RedactRegion = {
      pageIndex: targetPage - 1,
      x: 10,
      y: 10,
      width: 40,
      height: 15,
    };
    setRegions((prev) => [...prev, newRegion]);
  };

  const handleRemoveRegion = (index: number) => {
    setRegions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRegion = (index: number, updates: Partial<RedactRegion>) => {
    setRegions((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...updates } : r))
    );
  };

  const handleRedact = async () => {
    if (!file) return;
    if (regions.length === 0) {
      setErrorToast({
        type: 'EMPTY_FILE_LIST',
        title: lang === 'en' ? 'No Areas Selected' : 'Belum Ada Area Pilihan',
        message: lang === 'en' ? 'Add at least one redaction box.' : 'Tambahkan minimal satu kotak redaksi.',
      });
      return;
    }

    setIsProcessing(true);
    setErrorToast(null);

    try {
      const redactedBytes = await redactPdf(file, regions);
      const blob = new Blob([redactedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.pdf$/i, '');
      downloadBlob(blob, `Kindpdf_${baseName}_Redacted.pdf`);
    } catch (err: any) {
      setErrorToast({
        type: 'CORRUPTED',
        title: lang === 'en' ? 'Redaction Failed' : 'Gagal Melakukan Redaksi',
        message: err?.message || 'Unexpected error redacting file.',
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
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 transition-colors btn-press-effect"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.backToAllTools}</span>
      </button>

      {/* Hero Header */}
      <div className="text-center space-y-2 py-2 max-w-lg mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Redact PDF
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'en'
            ? 'Permanently cover sensitive information or private text with black redaction boxes.'
            : 'Tutupi informasi sensitif atau teks rahasia secara permanen dengan kotak redaksi hitam.'}
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

      {/* Upload File */}
      {!file && <FileDropzone onFilesSelected={handleFileSelected} disabled={isProcessing} t={t} colorTheme="rose" />}

      {/* Redaction Controls */}
      {file && (
        <div className="space-y-5">
          {/* File Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">{file.name}</p>
              <p className="text-xs text-slate-500 font-medium">{pageCount} {lang === 'en' ? 'pages' : 'halaman'}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setRegions([]);
              }}
              className="text-xs font-extrabold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 btn-press-effect"
            >
              {lang === 'en' ? 'Change File' : 'Ganti File'}
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
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
                  className="w-16 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border text-xs font-black text-center"
                />
              </div>

              <button
                type="button"
                onClick={handleAddRegion}
                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black flex items-center gap-1.5 shadow-sm btn-press-effect"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Add Redaction Box' : 'Tambah Kotak Redaksi'}</span>
              </button>
            </div>

            {/* Redaction Boxes List */}
            {regions.length > 0 ? (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                {regions.map((region, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {lang === 'en' ? 'Redaction Box' : 'Kotak Redaksi'} #{idx + 1} (Page {region.pageIndex + 1})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRegion(idx)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">X Position (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={region.x}
                          onChange={(e) => handleUpdateRegion(idx, { x: Number(e.target.value) })}
                          className="w-full px-2 py-1 rounded-md bg-white dark:bg-slate-900 border text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">Y Position (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={region.y}
                          onChange={(e) => handleUpdateRegion(idx, { y: Number(e.target.value) })}
                          className="w-full px-2 py-1 rounded-md bg-white dark:bg-slate-900 border text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">Width (%)</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={region.width}
                          onChange={(e) => handleUpdateRegion(idx, { width: Number(e.target.value) })}
                          className="w-full px-2 py-1 rounded-md bg-white dark:bg-slate-900 border text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">Height (%)</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={region.height}
                          onChange={(e) => handleUpdateRegion(idx, { height: Number(e.target.value) })}
                          className="w-full px-2 py-1 rounded-md bg-white dark:bg-slate-900 border text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium text-center py-4">
                {lang === 'en' ? 'No redaction boxes added yet. Click "+ Add Redaction Box".' : 'Belum ada kotak redaksi. Klik "+ Tambah Kotak Redaksi".'}
              </p>
            )}
          </div>

          {/* CTA Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{lang === 'en' ? '100% processed locally inside browser.' : '100% diproses secara lokal di browser.'}</span>
            </div>

            <button
              type="button"
              onClick={handleRedact}
              disabled={isProcessing || regions.length === 0}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-xl transition-all duration-200 btn-press-effect ${
                regions.length > 0 && !isProcessing
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-blue-500/30 scale-[1.02]'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <EyeOff className="w-4 h-4" />
              <span>{isProcessing ? (lang === 'en' ? 'Redacting...' : 'Meredaksi...') : (lang === 'en' ? 'Redact & Download PDF' : 'Redaksi & Unduh PDF')}</span>
              
            </button>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <PrivacyNotice t={t} />
    </div>
  );
};

export default RedactPdfWorkspace;
