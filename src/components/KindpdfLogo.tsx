'use client';

import React from 'react';

interface KindpdfLogoProps {
  size?: 'sm' | 'md';
  showWordmark?: boolean;
  suffix?: string;
  isDarkMode?: boolean;
}

export const KindpdfLogo: React.FC<KindpdfLogoProps> = ({
  size = 'md',
  showWordmark = true,
  suffix,
  isDarkMode,
}) => {
  const isSm = size === 'sm';

  const badgeClass =
    isDarkMode === true
      ? 'bg-white/[0.10] border border-white/[0.22] shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_6px_16px_rgba(0,0,0,0.32)] text-white'
      : isDarkMode === false
        ? 'bg-white/85 border border-[#0A1128]/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_rgba(10,17,40,0.08)] text-[#0A1128]'
        : 'bg-white/85 dark:bg-white/[0.10] border border-[#0A1128]/[0.12] dark:border-white/[0.22] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_12px_rgba(10,17,40,0.08)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_6px_16px_rgba(0,0,0,0.32)] text-[#0A1128] dark:text-white';

  const primaryTextClass =
    isDarkMode === true
      ? 'text-white'
      : isDarkMode === false
        ? 'text-[#0A1128]'
        : 'text-[#0A1128] dark:text-white';

  const secondaryTextClass =
    isDarkMode === true
      ? 'text-white/60'
      : isDarkMode === false
        ? 'text-[#0A1128]/55'
        : 'text-[#0A1128]/55 dark:text-white/60';

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      {/* Precision Tempered-Glass Squircle Emblem */}
      <div
        className={`relative overflow-hidden ${
          isSm ? 'w-7 h-7 rounded-[9px]' : 'w-8 h-8 sm:w-9 sm:h-9 rounded-[11px]'
        } ${badgeClass} backdrop-blur-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-[1.04]`}
      >
        {/* Subtle top specular glass sheen */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-1 top-0 h-[42%] rounded-b-full bg-gradient-to-b from-white/25 to-transparent"
        />

        {/* Custom Geometric K-Fold / Layered Sheet Mark */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`relative z-10 ${isSm ? 'w-4 h-4' : 'w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]'}`}
          aria-hidden="true"
        >
          {/* Back layered sheet corner (depth facet) */}
          <path
            d="M11.2 4.5H17.6C18.37 4.5 19 5.13 19 5.9V9.6L11.2 13.8V4.5Z"
            fill="currentColor"
            fillOpacity="0.22"
          />
          {/* Left precision vertical spine (forms the stem of K & bound page spine) */}
          <rect
            x="5.2"
            y="4.2"
            width="3.2"
            height="15.6"
            rx="1.2"
            fill="currentColor"
          />
          {/* Upper origami K-fold wing */}
          <path
            d="M9.6 11.4L15.4 4.7C15.72 4.33 16.2 4.2 16.68 4.2H18.45C18.92 4.2 19.16 4.77 18.84 5.12L12.7 11.95L9.6 11.4Z"
            fill="currentColor"
            fillOpacity="0.92"
          />
          {/* Lower crisp folded sheet wing */}
          <path
            d="M9.6 11.95L12.75 11.95L18.9 18.88C19.22 19.24 18.97 19.8 18.49 19.8H16.25C15.75 19.8 15.27 19.58 14.95 19.2L9.6 12.85V11.95Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {showWordmark && (
        <span
          className={`${
            isSm ? 'text-[15px]' : 'text-[18px] sm:text-[19px]'
          } tracking-[-0.03em] leading-none flex items-baseline`}
        >
          <span className={`font-extrabold ${primaryTextClass}`}>Kind</span>
          <span className={`font-medium ${secondaryTextClass}`}>PDF</span>
          {suffix && (
            <span className={`ml-1.5 text-[11px] font-semibold tracking-normal ${secondaryTextClass}`}>
              {suffix}
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default KindpdfLogo;
