export type Language = 'en' | 'id';

export interface CategoryMeta {
  shortLabel: string;
  title: string;
  helper: string;
}

export interface TranslationDictionary {
  brandName: string;
  tagline: string;
  privacyTitle: string;
  noServerUpload: string;
  localProcessing: string;
  adFree: string;
  allTools: string;
  popularTools: string;
  searchPlaceholder: string;
  noToolsFoundTitle: string;
  noToolsFoundHint: string;
  localBadge: string;
  categories: {
    all: CategoryMeta;
    popular: CategoryMeta;
    organize: CategoryMeta;
    'convert-to': CategoryMeta;
    'convert-from': CategoryMeta;
    edit: CategoryMeta;
    security: CategoryMeta;
    utilities: CategoryMeta;
  };
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
    brandName: 'KindPDF',
    tagline: 'Your documents never leave your device',
    privacyTitle: '100% Privacy Protected',
    noServerUpload: 'Zero Server Uploads',
    localProcessing: 'Local Processing',
    adFree: 'Free & Ad-Free',
    allTools: 'All Tools',
    popularTools: 'Popular Tools',
    searchPlaceholder: 'Search 23 PDF tools...',
    noToolsFoundTitle: 'No matching PDF tools found',
    noToolsFoundHint: 'Try searching for "merge", "compress", "split", or "sign".',
    localBadge: '100% Local',
    categories: {
      all: {
        shortLabel: 'All Tools',
        title: 'All Tools',
        helper: 'Every PDF tool in one place — private, fast, and 100% on your device',
      },
      popular: {
        shortLabel: 'Popular',
        title: 'Popular Tools',
        helper: 'Most-used everyday tools like merge, compress, split, and convert',
      },
      organize: {
        shortLabel: 'Organize',
        title: 'Organize Pages',
        helper: 'Merge, split, compress, crop, or reorder pages in your PDF',
      },
      'convert-to': {
        shortLabel: 'Make PDF',
        title: 'Make PDF',
        helper: 'Turn photos, Word, notes, or camera scans into a PDF file',
      },
      'convert-from': {
        shortLabel: 'PDF to File',
        title: 'PDF to File',
        helper: 'Convert a PDF into images (JPG/PNG), Word, or plain text',
      },
      edit: {
        shortLabel: 'Edit & Sign',
        title: 'Edit & Sign',
        helper: 'Add text, page numbers, watermarks, or your signature to a PDF',
      },
      security: {
        shortLabel: 'Protect',
        title: 'Protect & Privacy',
        helper: 'Lock with a password, remove a password, or black out sensitive info',
      },
      utilities: {
        shortLabel: 'More Tools',
        title: 'More Tools',
        helper: 'Compare two PDFs side-by-side or repair a damaged PDF file',
      },
    },
    mergePdf: 'Merge PDF',
    splitPdf: 'Split PDF',
    organizePages: 'Organize PDF',
    extractPages: 'Extract Pages',
    imagesToPdf: 'Images to PDF',
    heroTitle: 'Every PDF Tool You Need In One Place',
    heroSubtitle: 'Merge, split, compress, convert, and organize PDF documents in seconds.',
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
    ramProcessing: 'Please wait while your document is being prepared',
    cancelProcess: 'Cancel Process',
    activeReady: 'Active & Ready',
    openTool: 'Open Tool →',
    soon: 'Soon',
    upcoming: 'Upcoming',
  },
  id: {
    brandName: 'KindPDF',
    tagline: 'Dokumen Anda tidak pernah meninggalkan perangkat',
    privacyTitle: 'Privasi 100% Terjaga',
    noServerUpload: 'Tanpa Unggah ke Server',
    localProcessing: 'Diproses Lokal',
    adFree: 'Gratis & Bebas Iklan',
    allTools: 'Semua Alat',
    popularTools: 'Alat Populer',
    searchPlaceholder: 'Cari 23 alat PDF...',
    noToolsFoundTitle: 'Alat PDF tidak ditemukan',
    noToolsFoundHint: 'Coba cari "merge", "compress", "split", atau "sign".',
    localBadge: '100% Lokal',
    categories: {
      all: {
        shortLabel: 'Semua',
        title: 'Semua Alat',
        helper: 'Semua alat PDF dalam satu tempat — cepat, aman, dan 100% di perangkat Anda',
      },
      popular: {
        shortLabel: 'Populer',
        title: 'Alat Populer',
        helper: 'Alat yang paling sering dipakai seperti gabung, kompres, pisah, dan ubah format',
      },
      organize: {
        shortLabel: 'Atur Halaman',
        title: 'Atur Halaman',
        helper: 'Gabung, pisah, kompres, potong, atau urutkan halaman PDF',
      },
      'convert-to': {
        shortLabel: 'Buat PDF',
        title: 'Buat PDF',
        helper: 'Ubah foto, Word, catatan, atau hasil scan menjadi file PDF',
      },
      'convert-from': {
        shortLabel: 'PDF ke File',
        title: 'PDF ke File',
        helper: 'Ubah file PDF menjadi gambar (JPG/PNG), Word, atau teks',
      },
      edit: {
        shortLabel: 'Edit & TTD',
        title: 'Edit & Tanda Tangan',
        helper: 'Tambahkan teks, nomor halaman, watermark, atau tanda tangan ke PDF',
      },
      security: {
        shortLabel: 'Keamanan',
        title: 'Keamanan & Privasi',
        helper: 'Kunci dengan password, buka kunci, atau tutupi informasi sensitif',
      },
      utilities: {
        shortLabel: 'Alat Lain',
        title: 'Alat Tambahan',
        helper: 'Bandingkan dua file PDF atau perbaiki file PDF yang rusak',
      },
    },
    mergePdf: 'Gabungkan PDF',
    splitPdf: 'Pisahkan PDF',
    organizePages: 'Atur & Urutkan PDF',
    extractPages: 'Ekstrak Halaman',
    imagesToPdf: 'Gambar ke PDF',
    heroTitle: 'Semua Alat PDF yang Anda Butuhkan di Satu Tempat',
    heroSubtitle: 'Gabungkan, pisahkan, kompres, ubah format, dan atur dokumen PDF dalam hitungan detik.',
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
    ramProcessing: 'Mohon tunggu selagi dokumen Anda disiapkan',
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
