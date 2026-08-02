export type ErrorType =
  | 'INVALID_FORMAT'
  | 'CORRUPTED'
  | 'ENCRYPTED'
  | 'TOO_LARGE'
  | 'OUT_OF_MEMORY'
  | 'NO_PAGES_SELECTED'
  | 'EMPTY_FILE_LIST';

export interface HumanError {
  type: ErrorType;
  title: string;
  message: string;
}

export const ERROR_MESSAGES: Record<ErrorType, HumanError> = {
  INVALID_FORMAT: {
    type: 'INVALID_FORMAT',
    title: 'Format Berkas Salah',
    message: 'Berkas ini bukan dokumen PDF yang valid. Harap pilih berkas dengan ekstensi .pdf.',
  },
  CORRUPTED: {
    type: 'CORRUPTED',
    title: 'Dokumen Rusak',
    message: 'Dokumen tidak dapat dibaca atau mungkin terdistorsi/rusak.',
  },
  ENCRYPTED: {
    type: 'ENCRYPTED',
    title: 'Dokumen Dilindungi Kata Sandi',
    message: 'Dokumen PDF yang dilindungi kata sandi belum didukung. Harap hapus kata sandi terlebih dahulu.',
  },
  TOO_LARGE: {
    type: 'TOO_LARGE',
    title: 'Ukuran Melebihi Batas',
    message: 'Ukuran berkas melebihi batas 100 MB per berkas. Harap pilih dokumen yang lebih kecil.',
  },
  OUT_OF_MEMORY: {
    type: 'OUT_OF_MEMORY',
    title: 'Memori Perangkat Terbatas',
    message: 'Perangkat tidak memiliki cukup memori untuk memproses dokumen ini secara bersamaan.',
  },
  NO_PAGES_SELECTED: {
    type: 'NO_PAGES_SELECTED',
    title: 'Tidak Ada Halaman Dipilih',
    message: 'Pilih minimal satu halaman untuk melanjutkan.',
  },
  EMPTY_FILE_LIST: {
    type: 'EMPTY_FILE_LIST',
    title: 'Belum Ada Dokumen Selected',
    message: 'Pilih minimal dua dokumen PDF untuk digabungkan.',
  },
};
