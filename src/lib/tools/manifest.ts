import { ViewMode } from '@/components/Header';

export type ToolStatus = 'stable' | 'beta' | 'experimental';
export type ProcessingMode = 'Client-side browser processing';
export type ToolCategory =
  | 'organize'
  | 'convert-to'
  | 'convert-from'
  | 'edit'
  | 'security'
  | 'utilities';

export interface ToolDefinition {
  id: string;
  route: ViewMode;
  title: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  processingMode: ProcessingMode;
  popular: boolean;
  inputFormats: string[];
  outputFormats: string[];
  note?: string;
}

/**
 * Kindpdf Single Source of Truth Tool Manifest (23 Active Tools)
 */
export const tools: ToolDefinition[] = [
  // --- 1. ORGANIZE & PAGES ---
  {
    id: 'merge',
    route: 'merge',
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into a single document in your desired order.',
    category: 'organize',
    status: 'stable',
    processingMode: 'Client-side browser processing',
    popular: true,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
  },
  {
    id: 'split',
    route: 'split',
    title: 'Split PDF',
    description: 'Separate one page or a whole set into independent PDF files or ZIP.',
    category: 'organize',
    status: 'stable',
    processingMode: 'Client-side browser processing',
    popular: true,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf', '.zip'],
  },
  {
    id: 'organize',
    route: 'organize',
    title: 'Rotate PDF',
    description: 'Rotate PDF pages (90°, 180°, 270°), reorder, or delete pages visually.',
    category: 'organize',
    status: 'stable',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
  },
  {
    id: 'extract',
    route: 'extract',
    title: 'Extract Pages',
    description: 'Extract specific pages from your PDF into a brand new document.',
    category: 'organize',
    status: 'stable',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf', '.zip'],
  },
  {
    id: 'crop',
    route: 'crop',
    title: 'Crop PDF',
    description: 'Trim page margins and resize visible area using CropBox controls.',
    category: 'organize',
    status: 'stable',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
    note: 'Crop changes the visible CropBox area. Hidden content outside crop box may persist.',
  },

  // --- 2. CONVERT TO PDF ---
  {
    id: 'image-to-pdf',
    route: 'image-to-pdf',
    title: 'Images to PDF',
    description: 'Convert JPG, PNG, and WEBP images to PDF with custom margins.',
    category: 'convert-to',
    status: 'stable',
    processingMode: 'Client-side browser processing',
    popular: true,
    inputFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    outputFormats: ['.pdf'],
  },
  {
    id: 'word-to-pdf',
    route: 'word-to-pdf',
    title: 'DOCX to PDF',
    description: 'Text-first conversion of Word documents (.docx) to PDF.',
    category: 'convert-to',
    status: 'beta',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.docx', '.doc'],
    outputFormats: ['.pdf'],
    note: 'Text-first parser. Complex layouts, tables, and custom fonts may vary.',
  },
  {
    id: 'html-to-pdf',
    route: 'html-to-pdf',
    title: 'HTML / Notes to PDF',
    description: 'Convert formatted text and HTML notes into clean PDF documents.',
    category: 'convert-to',
    status: 'beta',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.html', '.txt'],
    outputFormats: ['.pdf'],
  },
  {
    id: 'scan-to-pdf',
    route: 'scan-to-pdf',
    title: 'Scan to PDF',
    description: 'Capture physical documents using camera and compile into PDF.',
    category: 'convert-to',
    status: 'beta',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['camera stream'],
    outputFormats: ['.pdf'],
  },

  // --- 3. CONVERT FROM PDF ---
  {
    id: 'pdf-to-image',
    route: 'pdf-to-image',
    title: 'PDF to Images',
    description: 'Render and extract PDF pages into high-DPI PNG or JPG image files.',
    category: 'convert-from',
    status: 'stable',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.png', '.jpg', '.zip'],
  },
  {
    id: 'pdf-to-word',
    route: 'pdf-to-word',
    title: 'PDF to DOCX',
    description: 'Text extraction from PDF into editable Word documents (.docx).',
    category: 'convert-from',
    status: 'beta',
    processingMode: 'Client-side browser processing',
    popular: true,
    inputFormats: ['.pdf'],
    outputFormats: ['.docx'],
    note: 'Extracts document text streams. Exact visual styling is not preserved.',
  },
  {
    id: 'ocr-pdf',
    route: 'ocr-pdf',
    title: 'Extract Text from PDF',
    description: 'Extract selectable text layers from PDF documents directly in browser.',
    category: 'convert-from',
    status: 'beta',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.txt'],
    note: 'Extracts embedded text layers and pattern streams. Scanned images without text layers require WASM OCR.',
  },
  {
    id: 'pdf-to-pdfa',
    route: 'pdf-to-pdfa',
    title: 'PDF/A Preparation',
    description: 'Embed ISO 19005 metadata streams and producer tags for archival.',
    category: 'convert-from',
    status: 'experimental',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
    note: 'Embeds PDF/A metadata markers. Full ISO validation requires veraPDF audit.',
  },

  // --- 4. EDIT & ANNOTATE ---
  {
    id: 'edit-pdf',
    route: 'edit-pdf',
    title: 'Edit PDF',
    description: 'Add text, shapes, and lines overlay on top of PDF pages.',
    category: 'edit',
    status: 'beta',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
  },
  {
    id: 'page-numbers',
    route: 'page-numbers',
    title: 'Add Page Numbers',
    description: 'Insert customizable page numbers with flexible alignment into PDF.',
    category: 'edit',
    status: 'stable',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
  },
  {
    id: 'watermark',
    route: 'watermark',
    title: 'Add Watermark',
    description: 'Overlay custom text watermarks across every page of your PDF.',
    category: 'edit',
    status: 'stable',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
  },
  {
    id: 'sign',
    route: 'sign',
    title: 'Add Signature',
    description: 'Draw or type signature image overlay with optional date stamp.',
    category: 'edit',
    status: 'stable',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
    note: 'Electronic visual signature overlay. Not a cryptographic PAdES digital certificate signature.',
  },

  // --- 5. SECURITY & UTILITIES ---
  {
    id: 'protect',
    route: 'protect',
    title: 'Protect PDF',
    description: 'Encrypt your PDF with password security restrictions.',
    category: 'security',
    status: 'experimental',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
    note: 'Adds user password security dictionary.',
  },
  {
    id: 'unlock',
    route: 'unlock',
    title: 'Remove PDF Password',
    description: 'Remove password protection restrictions using valid user key.',
    category: 'security',
    status: 'experimental',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
  },
  {
    id: 'redact',
    route: 'redact',
    title: 'Visual Blackout',
    description: 'Apply solid black rectangles over sensitive areas on PDF pages.',
    category: 'security',
    status: 'experimental',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
    note: 'Visual Blackout overlays black shapes. Underlying text streams should be audited for sensitive data extraction.',
  },
  {
    id: 'compare',
    route: 'compare',
    title: 'Compare PDF',
    description: 'Compare two PDF documents side-by-side to detect structural differences.',
    category: 'utilities',
    status: 'beta',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['report'],
  },
  {
    id: 'repair',
    route: 'repair',
    title: 'Basic PDF Recovery',
    description: 'Attempt re-parsing and re-encoding of damaged PDF object streams.',
    category: 'utilities',
    status: 'experimental',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
    note: 'Basic recovery re-serializes clean xref tables. Severely corrupted binary files may fail.',
  },
  {
    id: 'compress',
    route: 'compress',
    title: 'Compress PDF',
    description: 'Reduce PDF file size while optimizing document structure 100% locally in browser.',
    category: 'utilities',
    status: 'stable',
    processingMode: 'Client-side browser processing',
    popular: true,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
    note: 'Re-encodes object streams. Pre-compressed or image-dense PDFs may show variable size reduction.',
  },
];

export const activeToolCount = tools.length;
