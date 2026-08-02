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
    description: 'Combine multiple PDF files into a single document in custom page order.',
    category: 'organize',
    status: 'stable',
    processingMode: 'Client-side browser processing',
    popular: true,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
  },
  {
    id: 'compress',
    route: 'compress',
    title: 'Compress PDF',
    description: 'Reduce file size by compressing embedded images and stream objects.',
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
    description: 'Divide a PDF into individual files by page range or single pages.',
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
    description: 'Pull out specific pages from a PDF to generate a new document file.',
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
    description: 'Adjust CropBox page margins to trim visible document borders.',
    category: 'organize',
    status: 'stable',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
  },

  // --- 2. CONVERT TO PDF ---
  {
    id: 'image-to-pdf',
    route: 'image-to-pdf',
    title: 'Images to PDF',
    description: 'Convert JPG, PNG, and WEBP images into structured PDF files.',
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
    description: 'Convert Word documents (.docx) into standard PDF page layout.',
    category: 'convert-to',
    status: 'beta',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.docx', '.doc'],
    outputFormats: ['.pdf'],
  },
  {
    id: 'html-to-pdf',
    route: 'html-to-pdf',
    title: 'HTML / Notes to PDF',
    description: 'Render formatted text notes or HTML content into PDF files.',
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
    description: 'Capture paper documents using camera stream to create PDF files.',
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
    description: 'Render PDF pages into high-DPI PNG or JPG image files.',
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
    description: 'Extract text and content from PDF into editable Word format.',
    category: 'convert-from',
    status: 'beta',
    processingMode: 'Client-side browser processing',
    popular: true,
    inputFormats: ['.pdf'],
    outputFormats: ['.docx'],
  },
  {
    id: 'ocr-pdf',
    route: 'ocr-pdf',
    title: 'Extract Text from PDF',
    description: 'Extract selectable text layers and characters from PDF.',
    category: 'convert-from',
    status: 'beta',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.txt'],
  },
  {
    id: 'pdf-to-pdfa',
    route: 'pdf-to-pdfa',
    title: 'PDF/A Preparation',
    description: 'Embed ISO 19005 metadata streams for long-term archiving.',
    category: 'convert-from',
    status: 'experimental',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
  },

  // --- 4. EDIT & ANNOTATE ---
  {
    id: 'edit-pdf',
    route: 'edit-pdf',
    title: 'Edit PDF',
    description: 'Add text overlays, shapes, and annotations directly onto PDF.',
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
    description: 'Insert header or footer page numbers with custom alignment.',
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
    description: 'Overlay custom text or logo watermarks across PDF pages.',
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
    description: 'Apply electronic visual signature overlay onto PDF documents.',
    category: 'edit',
    status: 'stable',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
  },

  // --- 5. SECURITY & UTILITIES ---
  {
    id: 'protect',
    route: 'protect',
    title: 'Protect PDF',
    description: 'Encrypt PDF document structure with password protection.',
    category: 'security',
    status: 'experimental',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
  },
  {
    id: 'unlock',
    route: 'unlock',
    title: 'Remove PDF Password',
    description: 'Decrypt and remove password restrictions from protected PDF.',
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
    description: 'Black out sensitive text or regions visually on PDF pages.',
    category: 'security',
    status: 'experimental',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
  },
  {
    id: 'compare',
    route: 'compare',
    title: 'Compare PDF',
    description: 'Compare two PDF files side-by-side to highlight structural changes.',
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
    description: 'Re-serialize xref tables to recover damaged PDF stream structures.',
    category: 'utilities',
    status: 'experimental',
    processingMode: 'Client-side browser processing',
    popular: false,
    inputFormats: ['.pdf'],
    outputFormats: ['.pdf'],
  },
];

export const activeToolCount = tools.length;
