export type Language = 'en' | 'id';

export interface TranslationDictionary {
  brandName: string;
  tagline: string;
  privacyTitle: string;
  noServerUpload: string;
  localProcessing: string;
  adFree: string;
  allTools: string;
  mergePdf: string;
  splitPdf: string;
  organizePages: string;
  extractPages: string;
  imagesToPdf: string;
  heroTitle: string;
  heroSubtitle: string;
  mergeHeroTitle: string;
  mergeHeroSubtitle: string;
  backToAllTools: string;
  dropzoneTitle: string;
  dropzoneSubtitle: string;
  dropzoneClick: string;
  formatPdfOnly: string;
  maxFileSize: string;
  maxFilesCount: string;
  documentsCount: string;
  pagesTotal: string;
  totalSize: string;
  reorderHint: string;
  clearAll: string;
  mergeNow: string;
  mergingTitle: string;
  processingProgress: string;
  ramProcessing: string;
  cancelProcess: string;
  activeReady: string;
  openTool: string;
  soon: string;
  upcoming: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    brandName: 'Kindpdf',
    tagline: 'Your documents never leave your device',
    privacyTitle: '100% Privacy Protected',
    noServerUpload: 'Zero Server Uploads',
    localProcessing: 'In-Browser Local Processing',
    adFree: 'Free & Ad-Free',
    allTools: 'All Tools',
    mergePdf: 'Merge PDF',
    splitPdf: 'Split PDF',
    organizePages: 'Organize Pages',
    extractPages: 'Extract Pages',
    imagesToPdf: 'Images to PDF',
    heroTitle: 'Every PDF Tool You Need In One Place',
    heroSubtitle: 'Manage, merge, split, and organize PDF documents instantly inside your browser. 100% FREE, 100% Private, and zero server uploads.',
    mergeHeroTitle: 'Merge Multiple PDF Files Into One',
    mergeHeroSubtitle: 'Reorder documents in your preferred order and combine them instantly without uploading to any server.',
    backToAllTools: 'Back to All Tools',
    dropzoneTitle: 'Drag & Drop PDF Documents Here',
    dropzoneSubtitle: 'or',
    dropzoneClick: 'Choose Files from Computer/Phone',
    formatPdfOnly: 'Format .PDF',
    maxFileSize: 'Max 100 MB per file',
    maxFilesCount: 'Max 10 files per batch',
    documentsCount: 'Documents',
    pagesTotal: 'Total Pages',
    totalSize: 'Total Size',
    reorderHint: 'Use # controls to reorder',
    clearAll: 'Clear All',
    mergeNow: 'Merge PDF Now',
    mergingTitle: 'Merging PDF Documents...',
    processingProgress: 'Processing Progress',
    ramProcessing: 'Processing 100% locally in device RAM',
    cancelProcess: 'Cancel Process',
    activeReady: 'Active & Ready',
    openTool: 'Open Tool →',
    soon: 'Soon',
    upcoming: 'Upcoming',
  },
  id: {
    brandName: 'Kindpdf',
    tagline: 'Dokumen Anda tidak pernah meninggalkan perangkat',
    privacyTitle: 'Privasi 100% Terjaga',
    noServerUpload: 'Tanpa Unggahan Server',
    localProcessing: 'Pemrosesan Lokal di Perangkat',
    adFree: 'Bebas Iklan & Gratis',
    allTools: 'Semua Alat',
    mergePdf: 'Gabungkan PDF',
    splitPdf: 'Pisahkan PDF',
    organizePages: 'Atur Halaman',
    extractPages: 'Ekstrak Halaman',
    imagesToPdf: 'Gambar ke PDF',
    heroTitle: 'Setiap Peralatan PDF Yang Anda Butuhkan Dalam Satu Tempat',
    heroSubtitle: 'Kelola, gabungkan, pisahkan, dan atur dokumen PDF secara instan di peramban Anda. 100% GRATIS, 100% Privat, dan tanpa unggahan server.',
    mergeHeroTitle: 'Gabungkan Beberapa Berkas PDF Menjadi Satu',
    mergeHeroSubtitle: 'Urutkan dokumen sesuai keinginan Anda dan gabungkan secara instan tanpa perlu mengunggah berkas ke server mana pun.',
    backToAllTools: 'Kembali ke Semua Alat',
    dropzoneTitle: 'Tarik & Lepaskan Dokumen PDF ke Sini',
    dropzoneSubtitle: 'atau',
    dropzoneClick: 'Pilih Dokumen dari HP/Komputer',
    formatPdfOnly: 'Format .PDF',
    maxFileSize: 'Maksimal 100 MB per berkas',
    maxFilesCount: 'Maksimal 10 berkas sekaligus',
    documentsCount: 'Dokumen',
    pagesTotal: 'Halaman Total',
    totalSize: 'Total Ukuran',
    reorderHint: 'Gunakan kontrol # untuk mengubah urutan',
    clearAll: 'Hapus Semua',
    mergeNow: 'Gabungkan PDF Sekarang',
    mergingTitle: 'Menggabungkan Dokumen PDF...',
    processingProgress: 'Progres Pemrosesan',
    ramProcessing: 'Pemrosesan berlangsung 100% lokal di RAM perangkat',
    cancelProcess: 'Batalkan Proses',
    activeReady: 'Aktif & Siap',
    openTool: 'Buka Alat →',
    soon: 'Segera',
    upcoming: 'Mendatang',
  },
};

/**
 * Auto detect browser language (default to 'en' if not 'id')
 */
export function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined' || !navigator) return 'en';
  const lang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
  return lang.startsWith('id') ? 'id' : 'en';
}
