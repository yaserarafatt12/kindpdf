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
    const subject = encodeURIComponent(`KindPDF Bug Report & Feedback (${lang.toUpperCase()})`);
    const body = encodeURIComponent(
      `KindPDF User Feedback:\n\n${feedbackText.trim()}\n\n---\nLanguage: ${lang}\nDevice: Browser RAM Client`
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
          ? '1. Core Purpose & Benefits of KindPDF'
          : '1. Kegunaan & Manfaat Utama KindPDF',
      content:
        lang === 'en'
          ? 'KindPDF is a 100% privacy-first PDF toolkit. Unlike traditional online PDF tools that upload confidential paperwork to cloud servers, KindPDF executes binary PDF operations (merge, split, encrypt, OCR, images) directly in your browser memory.'
          : 'KindPDF adalah toolkit PDF privat 100%. Berbeda dengan layanan PDF online umum yang mengunggah dokumen rahasia ke server cloud, KindPDF menjalankan semua operasi biner (gabung, pisah, enkripsi, OCR, gambar) langsung di memori RAM peramban Anda.',
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
          ? 'KindPDF can be saved or used offline. Since zero backend APIs are required, all conversion engines remain fully operational even without active internet connection.'
          : 'KindPDF dapat disimpan atau digunakan tanpa koneksi internet. Karena tidak ada API backend yang diperlukan, seluruh mesin konversi tetap berfungsi penuh meskipun offline.',
    },
    {
      id: 5,
      title:
        lang === 'en'
          ? '5. File Format Details & Limits (100 MB max)'
          : '5. Rincian Format & Batas Ukuran (Maks 100 MB)',
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
          d ? 'bg-[#040914]/75' : 'bg-[#0A1128]/30'
        }`}
      />

      {/* Midnight Navy Tempered Glass Modal Box */}
      <div className="glass-modal relative w-full max-w-lg rounded-3xl z-50 animate-scale-up flex flex-col max-h-[90vh] text-[#0A1128] dark:text-white">
        {/* Modal Header */}
        <div className="relative z-10 p-4 sm:p-5 border-b border-black/[0.08] dark:border-white/[0.12] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] text-[#0A1128]/80 dark:text-white/85 border border-black/[0.08] dark:border-white/[0.18] flex items-center justify-center">
              <Settings className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#0A1128] dark:text-white">
                {lang === 'en' ? 'Settings & User Manual' : 'Pengaturan & Buku Panduan'}
              </h3>
              <p className="text-xs font-normal text-[#0A1128]/55 dark:text-white/55">
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
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#0A1128]/55 dark:text-white/55 hover:text-[#0A1128] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/10 transition-colors btn-press-effect"
          >
            <X className="w-4 h-4" strokeWidth={1.9} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* PWA / App Installation Banner */}
          <div className="p-4 rounded-2xl bg-black/[0.04] dark:bg-white/[0.07] border border-black/[0.08] dark:border-white/[0.16] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/75 dark:bg-white/[0.10] border border-black/[0.06] dark:border-white/[0.16] shrink-0 text-[#0A1128] dark:text-white">
                <Smartphone className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold tracking-tight text-[#0A1128] dark:text-white">
                  {lang === 'en'
                    ? 'Install KindPDF Web App (iOS & Android)'
                    : 'Pasang Aplikasi di HP (iOS & Android)'}
                </h4>
                <p className="text-[11px] text-[#0A1128]/60 dark:text-white/60 font-normal mt-0.5">
                  {lang === 'en'
                    ? 'Run as a standalone offline app without server uploads'
                    : 'Jalankan sebagai aplikasi mandiri offline tanpa unggah ke server'}
                </p>
              </div>
            </div>
          </div>

          {/* Guest User Session Badge */}
          <div className="p-3.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.12] bg-white/55 dark:bg-white/[0.04] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] text-[#0A1128]/80 dark:text-white/85">
                <UserCheck className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <span className="text-xs font-bold text-[#0A1128] dark:text-white">
                {lang === 'en' ? 'Guest User Session' : 'Profil Pengguna Tamu'}
              </span>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#0A1128]/75 dark:text-white/75 border border-black/[0.08] dark:border-white/[0.16]">
              {lang === 'en' ? '100% Private RAM' : '100% Privat RAM'}
            </span>
          </div>

          {/* APPLICATION SETTINGS */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold tracking-[0.12em] uppercase px-1 text-[#0A1128]/45 dark:text-white/45">
              {lang === 'en' ? 'APPLICATION SETTINGS' : 'PENGATURAN APLIKASI'}
            </h4>

            {/* Theme Toggle Option */}
            <div className="p-3.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.12] bg-white/55 dark:bg-white/[0.04] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="w-4 h-4 text-[#0A1128]/80 dark:text-white/80" strokeWidth={1.85} />
                ) : (
                  <Sun className="w-4 h-4 text-[#0A1128]/80 dark:text-white/80" strokeWidth={1.85} />
                )}
                <span className="text-xs font-semibold text-[#0A1128] dark:text-white">
                  {lang === 'en' ? 'Appearance & Theme' : 'Tampilan & Tema'}
                </span>
              </div>
              <button
                type="button"
                onClick={onThemeToggle}
                className="px-3.5 py-1.5 rounded-full glass-pill text-xs font-semibold btn-press-effect"
              >
                {isDarkMode
                  ? lang === 'en'
                    ? 'Dark Mode'
                    : 'Mode Gelap'
                  : lang === 'en'
                  ? 'Light Mode'
                  : 'Mode Terang'}
              </button>
            </div>

            {/* Language Switch Option */}
            <div className="p-3.5 rounded-2xl border border-black/[0.08] dark:border-white/[0.12] bg-white/55 dark:bg-white/[0.04] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-[#0A1128]/80 dark:text-white/80" strokeWidth={1.85} />
                <span className="text-xs font-semibold text-[#0A1128] dark:text-white">
                  {lang === 'en' ? 'App Language' : 'Bahasa Aplikasi'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onLangChange(lang === 'en' ? 'id' : 'en')}
                className="px-3.5 py-1.5 rounded-full glass-pill text-xs font-semibold btn-press-effect"
              >
                {lang === 'en' ? 'English' : 'Indonesia'}
              </button>
            </div>
          </div>

          {/* BUG REPORT & FEEDBACK FORM */}
          <div className="p-4 rounded-2xl border border-black/[0.08] dark:border-white/[0.12] bg-white/55 dark:bg-white/[0.04] space-y-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#0A1128]/75 dark:text-white/75" strokeWidth={1.85} />
              <h4 className="text-xs font-bold text-[#0A1128] dark:text-white">
                {lang === 'en' ? 'Bug Report & Feedback' : 'Laporan Bug & Masukan Pengembang'}
              </h4>
            </div>

            {feedbackSent && (
              <div className="p-3 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] border border-black/[0.10] dark:border-white/[0.18] text-[#0A1128] dark:text-white text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={1.9} />
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.10] dark:border-white/[0.14] bg-white/85 dark:bg-white/[0.05] text-[#0A1128] dark:text-white text-xs font-normal outline-none resize-none focus:border-[#00A3FF] dark:focus:border-[#38BDF8] placeholder:text-[#0A1128]/40 dark:placeholder:text-white/40 transition-colors"
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl glass-cta font-bold text-xs flex items-center justify-center gap-2 btn-press-effect"
              >
                <Send className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{lang === 'en' ? 'Send Report to Developer' : 'Kirim Laporan ke Pengembang'}</span>
              </button>
            </form>
          </div>

          {/* USER HELP MANUAL ACCORDION */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold tracking-[0.12em] uppercase px-1 flex items-center gap-1.5 text-[#0A1128]/45 dark:text-white/45">
              <BookOpen className="w-3.5 h-3.5" strokeWidth={1.85} />
              <span>{lang === 'en' ? 'FULL USER MANUAL' : 'BUKU PANDUAN PENGGUNAAN LENGKAP'}</span>
            </h4>

            <div className="space-y-2">
              {guideItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-black/[0.08] dark:border-white/[0.12] bg-white/55 dark:bg-white/[0.04] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenGuideIndex(openGuideIndex === idx ? null : idx)}
                    className="w-full p-3.5 text-left text-xs font-semibold flex items-center justify-between text-[#0A1128] dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
                  >
                    <span>{item.title}</span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        openGuideIndex === idx
                          ? 'rotate-90 text-[#0A1128] dark:text-white'
                          : 'text-[#0A1128]/40 dark:text-white/40'
                      }`}
                      strokeWidth={2}
                    />
                  </button>
                  {openGuideIndex === idx && (
                    <div className="px-3.5 pb-3.5 text-[11px] font-normal leading-relaxed border-t border-black/[0.07] dark:border-white/[0.10] pt-2.5 text-[#0A1128]/65 dark:text-white/65 animate-fade-in">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER AUTHOR CREDIT */}
          <div className="pt-4 border-t border-black/[0.07] dark:border-white/[0.10] text-center space-y-1.5 shrink-0">
            <p className="text-xs font-bold text-[#0A1128] dark:text-white">KindPDF Suite v1.0.0</p>
            <p className="text-[11px] font-medium text-[#0A1128]/60 dark:text-white/55">
              Built with Next.js 14, TypeScript &amp; Tailwind CSS by{' '}
              <span className="font-semibold text-[#0A1128] dark:text-white">Yaser Arafat</span>.
            </p>
            <p className="text-[10px] text-[#0A1128]/45 dark:text-white/40">
              Licensed under MIT © 2026. Zero &apos;eval()&apos;, 100% Local-First.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
