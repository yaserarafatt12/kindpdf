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
 * Custom SVG Icon for Split PDF (Sleek document splitting in two with split divider line)
 */
export const SplitPdfIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Left Page Half */}
    <rect x="3" y="3" width="7.5" height="18" rx="2" className="fill-amber-100 dark:fill-amber-950/80 stroke-amber-600 dark:stroke-amber-400" strokeWidth="1.8" />
    <path d="M5.5 7H8M5.5 11H8M5.5 15H7" className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="1.5" strokeLinecap="round" />

    {/* Right Page Half */}
    <rect x="13.5" y="3" width="7.5" height="18" rx="2" className="fill-amber-100 dark:fill-amber-950/80 stroke-amber-600 dark:stroke-amber-400" strokeWidth="1.8" />
    <path d="M16 7H18.5M16 11H18.5M16 15H17.5" className="stroke-amber-600 dark:stroke-amber-400" strokeWidth="1.5" strokeLinecap="round" />

    {/* Split Cut Path in Center */}
    <path d="M12 4V20" className="stroke-amber-500 dark:stroke-amber-400" strokeWidth="1.8" strokeDasharray="2 2" strokeLinecap="round" />
  </svg>
);

/**
 * Custom SVG Icon for Organize Pages (4-Page Thumbnail Grid with Rotate & Reorder Arrows)
 */
export const OrganizePagesIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Page Grid 2x2 */}
    <rect x="3" y="3" width="8" height="8" rx="2" className="fill-purple-100 dark:fill-purple-950/80 stroke-purple-600 dark:stroke-purple-400" strokeWidth="1.8" />
    <rect x="13" y="3" width="8" height="8" rx="2" className="fill-purple-100 dark:fill-purple-950/80 stroke-purple-600 dark:stroke-purple-400" strokeWidth="1.8" />
    <rect x="3" y="13" width="8" height="8" rx="2" className="fill-purple-100 dark:fill-purple-950/80 stroke-purple-600 dark:stroke-purple-400" strokeWidth="1.8" />
    
    {/* Active Rotate & Reorder Page */}
    <rect x="13" y="13" width="8" height="8" rx="2" className="fill-purple-600 dark:fill-purple-500/30 stroke-purple-600 dark:stroke-purple-400" strokeWidth="1.8" />
    <path d="M15.5 17C15.5 15.6193 16.6193 14.5 18 14.5C19.3807 14.5 20.5 15.6193 20.5 17" className="stroke-white dark:stroke-purple-300" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19 15.5L20.5 17L19 18.5" className="stroke-white dark:stroke-purple-300" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
