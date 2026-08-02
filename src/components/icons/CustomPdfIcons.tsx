import React from 'react';

interface IconProps {
  className?: string;
}

/**
 * Custom SVG Icon for Merge PDF (Two documents merging with inward arrows)
 */
export const MergePdfIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* PDF Document Base */}
    <rect x="4" y="3" width="12" height="15" rx="2" className="fill-blue-100 dark:fill-blue-950 stroke-blue-600 dark:stroke-sky-400" strokeWidth="1.8" />
    <path d="M11 3V7H16" className="stroke-blue-600 dark:stroke-sky-400" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Inward Merging Arrows */}
    <path d="M8 12L12 16L16 12" className="stroke-blue-600 dark:stroke-sky-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 8V16" className="stroke-blue-600 dark:stroke-sky-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Merged Base Page */}
    <rect x="8" y="7" width="12" height="15" rx="2" className="fill-blue-600 dark:fill-sky-400/20 stroke-blue-600 dark:stroke-sky-400" strokeWidth="1.8" />
    <path d="M12 15H16M12 18H15" className="stroke-white dark:stroke-sky-300" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/**
 * Custom SVG Icon for Split PDF (Document splitting apart with outward arrows)
 */
export const SplitPdfIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Document Left Half */}
    <path d="M4 4C4 2.89543 4.89543 2 6 2H10V22H6C4.89543 22 4 21.1046 4 20V4Z" className="fill-amber-100 dark:fill-amber-950 stroke-amber-600 dark:stroke-amber-400" strokeWidth="1.8" />
    
    {/* Document Right Half */}
    <path d="M14 2H18C19.1046 2 20 2.89543 20 4V20C20 21.1046 19.1046 22 18 22H14V2Z" className="fill-amber-100 dark:fill-amber-950 stroke-amber-600 dark:stroke-amber-400" strokeWidth="1.8" />
    
    {/* Dashed Split Line */}
    <path d="M12 3V21" className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="2" strokeDasharray="2 2" strokeLinecap="round" />
    
    {/* Outward Split Arrows */}
    <path d="M8 12H2M5 9L2 12L5 15" className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 12H22M19 9L22 12L19 15" className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Custom SVG Icon for Organize Pages (Grid of page thumbnails with rotation arrow)
 */
export const OrganizePagesIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 4 Page Grid Thumbnails */}
    <rect x="3" y="3" width="8" height="9" rx="1.5" className="fill-purple-100 dark:fill-purple-950 stroke-purple-600 dark:stroke-purple-400" strokeWidth="1.8" />
    <rect x="13" y="3" width="8" height="9" rx="1.5" className="fill-purple-100 dark:fill-purple-950 stroke-purple-600 dark:stroke-purple-400" strokeWidth="1.8" />
    <rect x="3" y="14" width="8" height="7" rx="1.5" className="fill-purple-100 dark:fill-purple-950 stroke-purple-600 dark:stroke-purple-400" strokeWidth="1.8" />
    
    {/* Active Page with Reorder Arrow */}
    <rect x="13" y="14" width="8" height="7" rx="1.5" className="fill-purple-600 dark:fill-purple-500/30 stroke-purple-600 dark:stroke-purple-400" strokeWidth="1.8" />
    <path d="M15 17.5C15 16.1193 16.1193 15 17.5 15C18.8807 15 20 16.1193 20 17.5" className="stroke-white dark:stroke-purple-300" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M19 16L20.5 17.5L19 19" className="stroke-white dark:stroke-purple-300" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Custom SVG Icon for Extract Pages (Single page pulled out from document stack)
 */
export const ExtractPagesIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Base Document Stack */}
    <rect x="3" y="7" width="13" height="14" rx="2" className="fill-emerald-100 dark:fill-emerald-950 stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="1.8" />
    
    {/* Extracted Page (Lifted Up Right) */}
    <rect x="8" y="3" width="13" height="14" rx="2" className="fill-emerald-600 dark:fill-emerald-500/20 stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="1.8" />
    
    {/* Upward Extract Arrow */}
    <path d="M14.5 13V7M14.5 7L12 9.5M14.5 7L17 9.5" className="stroke-emerald-600 dark:stroke-emerald-300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Custom SVG Icon for Images to PDF (Photo Mountain/Sun converting into PDF)
 */
export const ImageToPdfIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Image Container with Sun & Mountain */}
    <rect x="3" y="4" width="11" height="12" rx="2" className="fill-rose-100 dark:fill-rose-950 stroke-rose-600 dark:stroke-rose-400" strokeWidth="1.8" />
    <circle cx="6.5" cy="7.5" r="1" className="fill-rose-600 dark:fill-rose-400" />
    <path d="M5 14L7.5 11.5L10 14" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Conversion Arrow */}
    <path d="M12 10H16M16 10L14 8M16 10L14 12" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Target PDF Document */}
    <rect x="10" y="8" width="11" height="13" rx="2" className="fill-rose-600 dark:fill-rose-500/20 stroke-rose-600 dark:stroke-rose-400" strokeWidth="1.8" />
    <path d="M13 14H18M13 17H16" className="stroke-white dark:stroke-rose-300" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
