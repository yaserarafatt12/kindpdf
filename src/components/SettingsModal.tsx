'use client';

import React, { useState } from 'react';
import {
  Settings,
  X,
  Smartphone,
  Download,
  UserCheck,
  Moon,
  Sun,
  Globe,
  BookOpen,
  ChevronRight,
  Send,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Cpu,
  FileCode,
  Sparkles,
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
  t,
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

    // Trigger direct mail client
    window.location.href = mailtoUrl;

    setFeedbackSent(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSent(false), 4000);
  };

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
      {/* Dark Blurred Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      />

      {/* Main Settings Modal Box */}
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-50 animate-scale-up my-auto text-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 text-sky-400 border border-blue-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                {lang === 'en' ? 'Settings & User Manual' : 'Pengaturan & Buku Panduan'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {lang === 'en'
                  ? 'Manage session, appearance, and feature guides'
                  : 'Kelola sesi, tampilan, dan panduan fitur'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors btn-press-effect"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* PWA / App Installation Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg space-y-3 relative overflow-hidden">
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
                  <p className="text-[11px] text-blue-100 font-medium mt-0.5">
                    {lang === 'en'
                      ? 'Run as standalone app offline without server uploads'
                      : 'Jadikan aplikasi mandiri tanpa peramban (Offline Ready)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guest User Session Badge */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-700 text-sky-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-slate-200">
                {lang === 'en' ? 'Guest User Session' : 'Profil Pengguna Tamu'}
              </span>
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {lang === 'en' ? '100% Private RAM' : '100% Privat RAM'}
            </span>
          </div>

          {/* APPLICATION SETTINGS */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black tracking-wider text-slate-400 uppercase px-1">
              {lang === 'en' ? 'APPLICATION SETTINGS' : 'PENGATURAN APLIKASI'}
            </h4>

            {/* Theme Toggle Option */}
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="w-4 h-4 text-sky-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
                <span className="text-xs font-extrabold text-slate-200">
                  {lang === 'en' ? 'Appearance & Theme' : 'Tampilan & Tema'}
                </span>
              </div>
              <button
                type="button"
                onClick={onThemeToggle}
                className="px-4 py-1.5 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-500 transition-colors btn-press-effect"
              >
                {isDarkMode ? (lang === 'en' ? 'Dark Mode' : 'Mode Gelap') : (lang === 'en' ? 'Light Mode' : 'Mode Terang')}
              </button>
            </div>

            {/* Language Switch Option */}
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-extrabold text-slate-200">
                  {lang === 'en' ? 'App Language' : 'Bahasa Aplikasi'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onLangChange(lang === 'en' ? 'id' : 'en')}
                className="px-4 py-1.5 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-500 transition-colors btn-press-effect"
              >
                {lang === 'en' ? 'English' : 'Indonesia'}
              </button>
            </div>
          </div>

          {/* BUG REPORT & FEEDBACK FORM (Direct to Email yaserarafatt03@gmail.com) */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-black text-slate-200">
                {lang === 'en' ? 'Bug Report & Feedback' : 'Laporan Bug & Masukan Pengembang'}
              </h4>
            </div>

            {feedbackSent && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
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
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-slate-100 outline-none focus:border-sky-400 resize-none placeholder:text-slate-500"
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all btn-press-effect shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Send Report to Developer' : 'Kirim Laporan ke Pengembang'}</span>
              </button>
            </form>
          </div>

          {/* USER HELP MANUAL ACCORDION */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-black tracking-wider text-slate-400 uppercase px-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>{lang === 'en' ? 'FULL USER MANUAL' : 'BUKU PANDUAN PENGGUNAAN LENGKAP'}</span>
            </h4>

            <div className="space-y-2">
              {guideItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-800/40 border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenGuideIndex(openGuideIndex === idx ? null : idx)}
                    className="w-full p-3.5 text-left text-xs font-extrabold text-slate-200 flex items-center justify-between hover:bg-slate-800/70 transition-colors"
                  >
                    <span>{item.title}</span>
                    <ChevronRight
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        openGuideIndex === idx ? 'rotate-90 text-sky-400' : ''
                      }`}
                    />
                  </button>
                  {openGuideIndex === idx && (
                    <div className="px-3.5 pb-3.5 text-[11px] font-medium text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2.5 animate-fade-in">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER AUTHOR CREDIT (Matching Project 1 specification) */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-1.5 shrink-0">
            <p className="text-xs font-black text-slate-200">Kindpdf Suite v1.0.0</p>
            <p className="text-[11px] font-bold text-slate-400">
              Built with Next.js 14, TypeScript & Tailwind CSS by{' '}
              <span className="font-black text-sky-400">Yaser Arafat</span>.
            </p>
            <p className="text-[10px] font-semibold text-slate-500">
              Licensed under MIT © 2026. Zero 'eval()', 100% Local-First.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
