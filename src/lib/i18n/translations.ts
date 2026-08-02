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
    organizePages: 'Organize PDF',
    extractPages: 'Extract Pages',
    imagesToPdf: 'Images to PDF',
    heroTitle: 'Every PDF Tool You Need In One Place',
    heroSubtitle: 'Manage, merge, split, and organize PDF documents instantly inside your browser. 100% FREE, 100% Private, and zero server uploads.',
    mergeHeroTitle: 'Merge PDF files',
    mergeHeroSubtitle: 'Combine PDFs in the order you want with the easiest PDF merger available.',
    backToAllTools: 'Back to All Tools',
    dropzoneTitle: 'or drop PDFs here',
    dropzoneSubtitle: 'or',
    dropzoneClick: 'Select PDF files',
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
    organizePages: 'Atur & Urutkan PDF',
    extractPages: 'Ekstrak Halaman',
    imagesToPdf: 'Gambar ke PDF',
    heroTitle: 'Setiap Peralatan PDF Yang Anda Butuhkan Dalam Satu Tempat',
    heroSubtitle: 'Kelola, gabungkan, pisahkan, dan atur dokumen PDF secara instan di peramban Anda. 100% GRATIS, 100% Privat, dan tanpa unggahan server.',
    mergeHeroTitle: 'Gabungkan Berkas PDF',
    mergeHeroSubtitle: 'Urutkan dan gabungkan beberapa berkas PDF secara instan di peramban Anda.',
    backToAllTools: 'Kembali ke Semua Alat',
    dropzoneTitle: 'atau tarik & lepaskan berkas PDF ke sini',
    dropzoneSubtitle: 'atau',
    dropzoneClick: 'Pilih Berkas PDF',
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
 * Default language is English ('en'). User can manually switch to 'id' via language dropdown.
 */
export function detectBrowserLanguage(): Language {
  return 'en';
}
