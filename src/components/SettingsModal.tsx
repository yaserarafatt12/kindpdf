'use client';

import React, { useState } from 'react';
import {
  Settings,
  X,
  Smartphone,
  UserCheck,
  Moon,
  Sun,
  Globe,
  BookOpen,
  ChevronRight,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { Language, TranslationDictionary } from '@/lib/i18n/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  t: TranslationDictionary;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  onLangChange,
  isDarkMode,
  onThemeToggle,
}) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [openGuideIndex, setOpenGuideIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    const targetEmail = 'yaserarafatt03@gmail.com';
    const subject = encodeURIComponent(`Kindpdf Bug Report & Feedback (${lang.toUpperCase()})`);
    const body = encodeURIComponent(
      `Kindpdf User Feedback:\n\n${feedbackText.trim()}\n\n---\nLanguage: ${lang}\nDevice: Browser RAM Client`
    );
    const mailtoUrl = `mailto:${targetEmail}?subject=${subject}&body=${body}`;

    window.location.href = mailtoUrl;

    setFeedbackSent(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSent(false), 4000);
  };

  const d = isDarkMode;

  const guideItems = [
    {
      id: 1,
      title:
        lang === 'en'
          ? '1. Core Purpose & Benefits of Kindpdf'
          : '1. Kegunaan & Manfaat Utama Aplikasi Kita',
      content:
        lang === 'en'
          ? 'Kindpdf is a 100% privacy-first PDF toolkit. Unlike traditional online PDF tools that upload confidential paperwork to cloud servers, Kindpdf executes binary PDF operations (merge, split, encrypt, OCR, images) directly in your browser memory.'
          : 'Kindpdf adalah toolkit PDF privat 100%. Berbeda dengan layanan PDF online umum yang mengunggah dokumen rahasia ke server cloud, Kindpdf menjalankan semua operasi biner (gabung, pisah, enkripsi, OCR, gambar) langsung di memori RAM peramban Anda.',
    },
    {
      id: 2,
      title:
        lang === 'en'
          ? '2. Password Protection & RC4 128-Bit Encryption'
          : '2. Proteksi Kata Sandi & Enkripsi RC4 128-Bit',
      content:
        lang === 'en'
          ? 'Protect PDF implements standard PDF Security Handler (RC4 128-bit). Protected files require correct password validation across Adobe Acrobat Reader, Chrome, Edge, and mobile viewers. Unlock PDF decrypts content streams locally.'
          : 'Fitur Protect PDF menggunakan standar PDF Security Handler (RC4 128-bit). Berkas hasil kuncian memerlukan masukan kata sandi yang valid di Adobe Acrobat, Chrome, dan peramban lainnya. Unlock PDF membuka dekripsi stream secara lokal.',
    },
    {
      id: 3,
      title:
        lang === 'en'
          ? '3. How 23 PDF Tools Process Files Locally'
          : '3. Cara Kerja 23 Alat PDF Secara Lokal',
      content:
        lang === 'en'
          ? 'All 23 tools operate using client-side JavaScript, WebAssembly, HTML5 Canvas, and TypedArrays. Files are converted into ArrayBuffer streams in RAM, eliminating network transfer latency.'
          : 'Seluruh 23 alat beroperasi menggunakan JavaScript client-side, WebAssembly, HTML5 Canvas, dan TypedArrays. Berkas diubah menjadi stream ArrayBuffer di RAM tanpa latensi transfer jaringan.',
    },
    {
      id: 4,
      title:
        lang === 'en'
          ? '4. Offline Support & PWA Installation'
          : '4. Dukungan Penggunaan Offline & PWA',
      content:
        lang === 'en'
          ? 'Kindpdf can be saved or used offline. Since zero backend APIs are required, all conversion engines remain fully operational even without active internet connection.'
          : 'Kindpdf dapat disimpan atau digunakan tanpa koneksi internet. Karena tidak ada API backend yang diperlukan, seluruh mesin konversi tetap berfungsi penuh meskipun offline.',
    },
    {
      id: 5,
      title:
        lang === 'en'
          ? '5. File Format Details & Limits (100 MB max)'
          : '5. Rincian & Kegunaan 14+ Kategori Satuan & Format',
      content:
        lang === 'en'
          ? 'Supports .PDF, .DOCX, .JPG, .PNG, .WEBP, .HTML, and .TXT. Maximum recommended file size per batch is 100 MB for optimal browser memory efficiency.'
          : 'Mendukung format .PDF, .DOCX, .JPG, .PNG, .WEBP, .HTML, dan .TXT. Ukuran berkas maksimal yang disarankan adalah 100 MB per batch untuk efisiensi RAM peramban.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 backdrop-blur-md animate-fade-in ${
          d ? 'bg-[#040914]/75' : 'bg-slate-900/35'
        }`}
      />

      {/* Midnight Navy Tempered Glass Modal Box */}
      <div className="glass-modal relative w-full max-w-lg rounded-3xl z-50 animate-scale-up flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100">
        {/* Top Tempered Glass Sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/40 dark:from-white/[0.08] to-transparent" />

        {/* Modal Header */}
        <div className="relative z-10 p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/[0.12] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/15 dark:bg-sky-400/15 text-sky-600 dark:text-sky-300 border border-sky-500/25">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {lang === 'en' ? 'Settings & User Manual' : 'Pengaturan & Buku Panduan'}
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {lang === 'en'
                  ? 'Manage session, appearance, and feature guides'
                  : 'Kelola sesi, tampilan, dan panduan fitur'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors btn-press-effect"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* PWA / App Installation Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white shadow-[0_12px_32px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.45)] space-y-3 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md shrink-0">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black tracking-wide">
                    {lang === 'en'
                      ? 'Install Kindpdf Web App (iOS & Android)'
                      : 'Pasang Aplikasi di HP (iOS & Android)'}
                  </h4>
                  <p className="text-[11px] text-sky-100 font-medium mt-0.5">
                    {lang === 'en'
                      ? 'Run as standalone app offline without server uploads'
                      : 'Jadikan aplikasi mandiri tanpa peramban (Offline Ready)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guest User Session Badge */}
          <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.12] bg-slate-50/80 dark:bg-white/[0.04] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/15 dark:bg-sky-400/15 text-sky-600 dark:text-sky-300">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                {lang === 'en' ? 'Guest User Session' : 'Profil Pengguna Tamu'}
              </span>
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25">
              {lang === 'en' ? '100% Private RAM' : '100% Privat RAM'}
            </span>
          </div>

          {/* APPLICATION SETTINGS */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black tracking-[0.12em] uppercase px-1 text-slate-400 dark:text-sky-300/60">
              {lang === 'en' ? 'APPLICATION SETTINGS' : 'PENGATURAN APLIKASI'}
            </h4>

            {/* Theme Toggle Option */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.12] bg-slate-50/80 dark:bg-white/[0.04] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="w-4 h-4 text-sky-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                  {lang === 'en' ? 'Appearance & Theme' : 'Tampilan & Tema'}
                </span>
              </div>
              <button
                type="button"
                onClick={onThemeToggle}
                className="px-4 py-1.5 rounded-full glass-pill-active text-xs font-black btn-press-effect"
              >
                {isDarkMode ? (lang === 'en' ? 'Dark Mode' : 'Mode Gelap') : (lang === 'en' ? 'Light Mode' : 'Mode Terang')}
              </button>
            </div>

            {/* Language Switch Option */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.12] bg-slate-50/80 dark:bg-white/[0.04] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                  {lang === 'en' ? 'App Language' : 'Bahasa Aplikasi'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onLangChange(lang === 'en' ? 'id' : 'en')}
                className="px-4 py-1.5 rounded-full glass-pill-active text-xs font-black btn-press-effect"
              >
                {lang === 'en' ? 'English' : 'Indonesia'}
              </button>
            </div>
          </div>

          {/* BUG REPORT & FEEDBACK FORM */}
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.12] bg-slate-50/80 dark:bg-white/[0.04] space-y-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                {lang === 'en' ? 'Bug Report & Feedback' : 'Laporan Bug & Masukan Pengembang'}
              </h4>
            </div>

            {feedbackSent && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {lang === 'en'
                    ? 'Feedback email triggered to yaserarafatt03@gmail.com!'
                    : 'Laporan berhasil diarahkan ke email yaserarafatt03@gmail.com!'}
                </span>
              </div>
            )}

            <form onSubmit={handleSendFeedback} className="space-y-2.5">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={2}
                placeholder={
                  lang === 'en'
                    ? 'Type any bug report or feature request here...'
                    : 'Tuliskan laporan kendala atau masukan Anda di sini...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 dark:border-white/[0.14] bg-white/90 dark:bg-[#081226]/70 text-slate-900 dark:text-slate-100 text-xs font-medium outline-none resize-none focus:border-sky-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl glass-cta bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 btn-press-effect"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Send Report to Developer' : 'Kirim Laporan ke Pengembang'}</span>
              </button>
            </form>
          </div>

          {/* USER HELP MANUAL ACCORDION */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black tracking-[0.12em] uppercase px-1 flex items-center gap-1.5 text-slate-400 dark:text-sky-300/60">
              <BookOpen className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span>{lang === 'en' ? 'FULL USER MANUAL' : 'BUKU PANDUAN PENGGUNAAN LENGKAP'}</span>
            </h4>

            <div className="space-y-2">
              {guideItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/80 dark:border-white/[0.12] bg-slate-50/80 dark:bg-white/[0.04] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenGuideIndex(openGuideIndex === idx ? null : idx)}
                    className="w-full p-3.5 text-left text-xs font-extrabold flex items-center justify-between text-slate-800 dark:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <span>{item.title}</span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        openGuideIndex === idx
                          ? 'rotate-90 text-sky-500 dark:text-sky-400'
                          : 'text-slate-400'
                      }`}
                    />
                  </button>
                  {openGuideIndex === idx && (
                    <div className="px-3.5 pb-3.5 text-[11px] font-medium leading-relaxed border-t border-slate-200/80 dark:border-white/[0.1] pt-2.5 text-slate-600 dark:text-slate-300/85 animate-fade-in">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER AUTHOR CREDIT */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.1] text-center space-y-1.5 shrink-0">
            <p className="text-xs font-black text-slate-800 dark:text-slate-100">Kindpdf Suite v1.0.0</p>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Built with Next.js 14, TypeScript &amp; Tailwind CSS by{' '}
              <span className="font-black text-sky-600 dark:text-sky-400">Yaser Arafat</span>.
            </p>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              Licensed under MIT © 2026. Zero &apos;eval()&apos;, 100% Local-First.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
