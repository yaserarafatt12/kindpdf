'use client';

import React from 'react';

interface KindpdfLogoProps {
  size?: 'sm' | 'md';
  showWordmark?: boolean;
  suffix?: string;
}

export const KindpdfLogo: React.FC<KindpdfLogoProps> = ({
  size = 'md',
  showWordmark = true,
  suffix,
}) => {
  const isSm = size === 'sm';

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      {/* Frosted Tempered-Glass Squircle Emblem */}
      <div
        className={`${
          isSm ? 'w-7 h-7 rounded-[10px]' : 'w-8 h-8 sm:w-9 sm:h-9 rounded-[12px]'
        } bg-white/80 dark:bg-white/[0.12] border border-[#0A1128]/[0.12] dark:border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_rgba(10,17,40,0.08)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_16px_rgba(0,0,0,0.28)] backdrop-blur-xl flex items-center justify-center shrink-0 text-[#0A1128] dark:text-white transition-transform duration-200 group-hover:scale-[1.04]`}
      >
        {/* Minimal Apple-grade geometric folded-page / prism mark */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={isSm ? 'w-4 h-4' : 'w-[18px] h-[18px] sm:w-5 sm:h-5'}
          aria-hidden="true"
        >
          {/* Main folded sheet silhouette */}
          <path
            d="M6.5 4.25C6.5 3.55964 7.05964 3 7.75 3H13.6C13.9315 3 14.2495 3.1317 14.4839 3.36612L18.1339 7.01612C18.3683 7.25054 18.5 7.56848 18.5 7.9V19.75C18.5 20.4404 17.9404 21 17.25 21H7.75C7.05964 21 6.5 20.4404 6.5 19.75V4.25Z"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinejoin="round"
          />
          {/* Geometric prism fold corner */}
          <path
            d="M13.75 3.25V7.25C13.75 7.66421 14.0858 8 14.5 8H18.25"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Subtle translucent facet fill inside fold */}
          <path
            d="M14 3.5L18 7.5H14.5C14.2239 7.5 14 7.27614 14 7V3.5Z"
            fill="currentColor"
            fillOpacity="0.18"
          />
          {/* Clean horizontal document rhythm lines */}
          <path
            d="M9.5 12.25H15.5M9.5 15.75H13.25"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showWordmark && (
        <span
          className={`${
            isSm ? 'text-[15px]' : 'text-[18px] sm:text-[20px]'
          } tracking-tight leading-none flex items-baseline`}
        >
          <span className="font-bold text-[#0A1128] dark:text-white">Kind</span>
          <span className="font-medium text-[#0A1128]/55 dark:text-white/65">PDF</span>
          {suffix && (
            <span className="ml-1.5 text-xs font-medium text-[#0A1128]/45 dark:text-white/50">
              {suffix}
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default KindpdfLogo;
