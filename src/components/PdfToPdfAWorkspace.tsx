'use client';

import React, { useState } from 'react';
import { ArrowLeft, Archive, ShieldCheck, ArrowRight, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';
import { validatePdfFile } from '@/lib/files/validateFile';
import { downloadBlob } from '@/lib/files/downloadBlob';
import FileDropzone from './FileDropzone';
import PrivacyNotice from './PrivacyNotice';
import { convertToPdfA, PdfAConformance } from '@/lib/pdf/pdfToPdfA';
import { HumanError } from '@/lib/errors/messages';

interface PdfToPdfAWorkspaceProps {
  onBack: () => void;
  t: TranslationDictionary;
  lang: Language;
}

export const PdfToPdfAWorkspace: React.FC<PdfToPdfAWorkspaceProps> = ({ onBack, t, lang }) => {
  const [file, setFile] = useState<File | null>(null);
  const [conformance, setConformance] = useState<PdfAConformance>('2b');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<HumanError | null>(null);

  const handleFileSelected = async (files: File[]) => {
    setErrorToast(null);
    setSuccessMsg(null);
    if (files.length === 0) return;

    const selected = files[0];
    const res = await validatePdfFile(selected);
    if (!res.isValid && res.error) {
      setErrorToast(res.error);
      return;
    }

    setFile(selected);
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorToast(null);
    setSuccessMsg(null);

    try {
      const bytes = await convertToPdfA(file, conformance);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.pdf$/i, '');
      downloadBlob(blob, `Kindpdf_${baseName}_PDFA.pdf`);

      setSuccessMsg(
        lang === 'en'
          ? 'PDF/A document successfully generated and downloaded!'
          : 'Dokumen PDF/A berhasil dibuat dan diunduh!'
      );
    } catch (err: any) {
      setErrorToast({
        type: 'CORRUPTED',
        title: lang === 'en' ? 'Conversion Failed' : 'Konversi Gagal',
        message: err?.message || 'Unexpected error converting to PDF/A.',
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
          PDF to PDF/A
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          {lang === 'en'
            ? 'Convert your PDF to ISO 19005 compliant PDF/A format for long-term archival preservation.'
            : 'Ubah PDF Anda ke format standar arsip ISO 19005 (PDF/A) untuk penyimpanan jangka panjang.'}
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

      {/* Success Toast */}
      {successMsg && (
        <div className="w-full p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-3 shadow-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-xs font-extrabold">{successMsg}</p>
        </div>
      )}

      {/* Upload File */}
      {!file && <FileDropzone onFilesSelected={handleFileSelected} disabled={isProcessing} t={t} colorTheme="indigo" />}

      {/* Conversion Options */}
      {file && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">{file.name}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setSuccessMsg(null);
              }}
              className="text-xs font-extrabold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 btn-press-effect"
            >
              {lang === 'en' ? 'Change File' : 'Ganti File'}
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              {lang === 'en' ? 'PDF/A Conformance Standard' : 'Standar PDF/A'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: '2b', title: 'PDF/A-2b', desc: lang === 'en' ? 'ISO 19005-2 basic archival (Recommended)' : 'Standar dasar ISO 19005-2 (Rekomendasi)' },
                { id: '1b', title: 'PDF/A-1b', desc: lang === 'en' ? 'ISO 19005-1 legacy archival' : 'Standar lama ISO 19005-1' },
                { id: '3b', title: 'PDF/A-3b', desc: lang === 'en' ? 'ISO 19005-3 with file attachment support' : 'Standar ISO 19005-3 dengan dukungan lampiran' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setConformance(item.id as PdfAConformance)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    conformance === item.id
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{lang === 'en' ? '100% processed locally in browser.' : '100% diproses secara lokal di browser.'}</span>
            </div>

            <button
              type="button"
              onClick={handleConvert}
              disabled={isProcessing}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-xl transition-all duration-200 btn-press-effect ${
                !isProcessing
                  ? 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-blue-500/30 scale-[1.02]'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <Archive className="w-4 h-4" />
              <span>{isProcessing ? (lang === 'en' ? 'Converting...' : 'Mengonversi...') : (lang === 'en' ? 'Convert & Download PDF/A' : 'Konversi & Unduh PDF/A')}</span>
              
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfToPdfAWorkspace;
