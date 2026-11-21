'use client';

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback, useId } from 'react';

export interface LiquidGlassPillOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

interface LiquidGlassPillBarProps<T extends string = string> {
  options: LiquidGlassPillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  size?: 'sm' | 'md';
  scrollable?: boolean;
  equalWidth?: boolean;
  isDarkMode?: boolean;
  className?: string;
}

interface TabMetric {
  left: number;
  width: number;
  center: number;
}

export function LiquidGlassPillBar<T extends string = string>({
  options,
  value,
  onChange,
  ariaLabel = 'Segmented options',
  size = 'md',
  scrollable = false,
  equalWidth = false,
  isDarkMode: isDarkModeProp,
  className = '',
}: LiquidGlassPillBarProps<T>) {
  const filterId = useId().replace(/:/g, '');
  const scrollWrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lensRef = useRef<HTMLDivElement>(null);

  const [detectedDark, setDetectedDark] = useState(true);
  const [isHolding, setIsHolding] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<TabMetric[]>([]);

  const activePointerIdRef = useRef<number | null>(null);
  const lastHapticIndexRef = useRef<number>(-1);
  const prevPointerXRef = useRef<number>(0);

  // Spring animation state (Quest-matched stiffness: 420, damping: 32, mass: 0.72)
  const springRef = useRef({
    cx: 0,
    vcx: 0,
    targetCx: 0,
    w: 0,
    vw: 0,
    targetW: 0,
    stretch: 1,
    vStretch: 0,
    targetStretch: 1,
    initialized: false,
    rafId: 0,
    lastTime: 0,
  });

  // Track dark mode reactively from <html class="dark"> when prop is not passed
  useEffect(() => {
    if (typeof isDarkModeProp === 'boolean') return;
    const sync = () => {
      setDetectedDark(document.documentElement.classList.contains('dark'));
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [isDarkModeProp]);

  const isDark = typeof isDarkModeProp === 'boolean' ? isDarkModeProp : detectedDark;
  const isLight = !isDark;

  const activeIndex = Math.max(
    0,
    options.findIndex((opt) => opt.id === value)
  );
  const displayActiveIndex = isHolding && hoverIndex !== null ? hoverIndex : activeIndex;

  // Measure every tab button inside trackRef
  const measureTabs = useCallback(() => {
    const measured: TabMetric[] = options.map((_, i) => {
      const btn = buttonRefs.current[i];
      if (!btn) return { left: 0, width: 0, center: 0 };
      const left = btn.offsetLeft;
      const width = btn.offsetWidth;
      return { left, width, center: left + width / 2 };
    });
    if (measured.some((m) => m.width > 0)) {
      setMetrics(measured);
    }
  }, [options]);

  useLayoutEffect(() => {
    measureTabs();
  }, [measureTabs, size]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measureTabs);
    ro.observe(el);
    window.addEventListener('resize', measureTabs);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measureTabs);
    };
  }, [measureTabs]);

  // Apply lens DOM transform directly for 60/120fps fluid scrubbing
  const applyLensTransform = useCallback((cx: number, w: number, stretch: number) => {
    const el = lensRef.current;
    if (!el || w <= 0) return;
    const left = cx - w / 2;
    el.style.width = `${w}px`;
    el.style.transform = `translate3d(${left}px, -50%, 0) scaleX(${stretch.toFixed(4)})`;
  }, []);

  // Kick off spring loop toward targetCx / targetW / targetStretch
  const startSpringLoop = useCallback(() => {
    const s = springRef.current;
    if (s.rafId) return;

    s.lastTime = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.032, Math.max(0.001, (now - s.lastTime) / 1000));
      s.lastTime = now;

      // Center X spring (stiffness 420, damping 32, mass 0.72)
      const kPos = 420;
      const cPos = 32;
      const mPos = 0.72;
      const aCx = (kPos * (s.targetCx - s.cx) - cPos * s.vcx) / mPos;
      s.vcx += aCx * dt;
      s.cx += s.vcx * dt;

      // Width spring
      const aW = (kPos * (s.targetW - s.w) - cPos * s.vw) / mPos;
      s.vw += aW * dt;
      s.w += s.vw * dt;

      // Elastic stretch spring (stiffness 360, damping 26)
      const kStr = 360;
      const cStr = 26;
      const aStr = kStr * (s.targetStretch - s.stretch) - cStr * s.vStretch;
      s.vStretch += aStr * dt;
      s.stretch += s.vStretch * dt;

      // Gently relax stretch back toward 1 when finger slows down
      s.targetStretch += (1 - s.targetStretch) * Math.min(1, dt * 14);

      applyLensTransform(s.cx, s.w, s.stretch);

      const settled =
        Math.abs(s.targetCx - s.cx) < 0.15 &&
        Math.abs(s.vcx) < 0.4 &&
        Math.abs(s.targetW - s.w) < 0.15 &&
        Math.abs(s.vw) < 0.4 &&
        Math.abs(1 - s.stretch) < 0.002 &&
        Math.abs(s.vStretch) < 0.01;

      if (settled) {
        s.cx = s.targetCx;
        s.vcx = 0;
        s.w = s.targetW;
        s.vw = 0;
        s.stretch = 1;
        s.vStretch = 0;
        s.targetStretch = 1;
        applyLensTransform(s.cx, s.w, 1);
        s.rafId = 0;
        return;
      }

      s.rafId = requestAnimationFrame(step);
    };

    s.rafId = requestAnimationFrame(step);
  }, [applyLensTransform]);

  useEffect(() => {
    const s = springRef.current;
    return () => {
      if (s.rafId) cancelAnimationFrame(s.rafId);
    };
  }, []);

  // Snap lens to active tab whenever selection or layout changes (when not holding)
  useEffect(() => {
    const activeMetric = metrics[activeIndex];
    if (!activeMetric || activeMetric.width <= 0 || isHolding) return;

    const s = springRef.current;
    const restingW = Math.max(36, activeMetric.width);
    if (!s.initialized) {
      s.cx = activeMetric.center;
      s.targetCx = activeMetric.center;
      s.w = restingW;
      s.targetW = restingW;
      s.stretch = 1;
      s.targetStretch = 1;
      s.initialized = true;
      applyLensTransform(s.cx, s.w, 1);
    } else {
      s.targetCx = activeMetric.center;
      s.targetW = restingW;
      s.targetStretch = 1;
      startSpringLoop();
    }
  }, [activeIndex, metrics, isHolding, applyLensTransform, startSpringLoop]);

  const getIndexAndClampedX = useCallback(
    (clientX: number) => {
      const trackEl = trackRef.current;
      if (!trackEl || metrics.length === 0) {
        return { idx: activeIndex, clampedX: 0, width: 48 };
      }
      const rect = trackEl.getBoundingClientRect();
      const relX = clientX - rect.left;

      const first = metrics[0];
      const last = metrics[metrics.length - 1];
      const minCenter = first.center;
      const maxCenter = last.center;
      const clampedX = Math.max(minCenter, Math.min(maxCenter, relX));

      // Find the tab whose horizontal bounds contain relX (or nearest center)
      let idx = activeIndex;
      let bestDist = Infinity;
      for (let i = 0; i < metrics.length; i++) {
        const m = metrics[i];
        if (relX >= m.left && relX <= m.left + m.width) {
          idx = i;
          break;
        }
        const dist = Math.abs(relX - m.center);
        if (dist < bestDist) {
          bestDist = dist;
          idx = i;
        }
      }

      return { idx, clampedX, width: metrics[idx]?.width || 48 };
    },
    [activeIndex, metrics]
  );

  const commitByIndex = useCallback(
    (idx: number) => {
      const item = options[idx];
      if (!item) return;
      if (item.id !== value) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(10);
        }
        onChange(item.id);
      }
      if (scrollable) {
        const btn = buttonRefs.current[idx];
        btn?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    },
    [options, value, onChange, scrollable]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (metrics.length === 0) return;

    activePointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);

    const { idx, clampedX, width } = getIndexAndClampedX(e.clientX);
    setIsHolding(true);
    setHoverIndex(idx);
    lastHapticIndexRef.current = idx;
    prevPointerXRef.current = clampedX;

    const s = springRef.current;
    s.targetCx = clampedX;
    s.targetW = width + 14; // Blooming refractive lens expands wider on hold
    s.targetStretch = 1;
    startSpringLoop();

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(8);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isHolding || activePointerIdRef.current !== e.pointerId) return;

    // Gentle edge auto-scroll for scrollable pill bars on narrow mobile screens
    if (scrollable && scrollWrapRef.current) {
      const wrap = scrollWrapRef.current;
      const wrapRect = wrap.getBoundingClientRect();
      const edgeZone = 34;
      if (e.clientX < wrapRect.left + edgeZone) {
        wrap.scrollLeft -= 8;
      } else if (e.clientX > wrapRect.right - edgeZone) {
        wrap.scrollLeft += 8;
      }
    }

    const { idx, clampedX, width } = getIndexAndClampedX(e.clientX);
    const velocity = Math.abs(clampedX - prevPointerXRef.current);
    prevPointerXRef.current = clampedX;

    const s = springRef.current;
    s.targetCx = clampedX;
    s.targetW = width + 14;
    // Elastic horizontal stretch proportional to swipe speed (matches Quest)
    s.targetStretch = 1 + Math.min(0.14, velocity * 0.006);
    startSpringLoop();

    if (idx !== lastHapticIndexRef.current) {
      lastHapticIndexRef.current = idx;
      setHoverIndex(idx);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(6);
      }
    }
  };

  const finishInteraction = (e: React.PointerEvent<HTMLDivElement>, shouldCommit: boolean) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore if already released
    }
    activePointerIdRef.current = null;

    const finalIdx = hoverIndex ?? activeIndex;
    setIsHolding(false);
    setHoverIndex(null);

    if (shouldCommit) {
      commitByIndex(finalIdx);
    }

    const snapIdx = shouldCommit ? finalIdx : activeIndex;
    const snapMetric = metrics[snapIdx];
    if (snapMetric && snapMetric.width > 0) {
      const s = springRef.current;
      s.targetCx = snapMetric.center;
      s.targetW = snapMetric.width;
      s.targetStretch = 1;
      startSpringLoop();
    }
  };

  const isSm = size === 'sm';
  const railHeightClass = isSm ? 'h-[36px]' : 'h-[44px]';
  const restingLensHeight = isSm ? 28 : 34;
  const holdingLensHeight = isSm ? 44 : 54;

  const pillBar = (
    <div
      className={`relative rounded-full overflow-visible transition-transform duration-300 ${railHeightClass} ${
        equalWidth ? 'w-full' : 'inline-flex'
      } ${isHolding ? 'scale-[1.015]' : 'scale-100'} ${className}`}
    >
      {/* Hidden SVG Filter for Base Liquid Glass Distortion (exact Quest filter) */}
      <svg
        style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <filter
            id={`glass-distortion-${filterId}`}
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            filterUnits="objectBoundingBox"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.002 0.008"
              numOctaves="1"
              seed="17"
              result="turbulence"
            />
            <feComponentTransfer in="turbulence" result="mapped">
              <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
              <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
              <feFuncB type="gamma" amplitude="1" exponent="10" offset="0.5" />
            </feComponentTransfer>
            <feGaussianBlur in="mapped" stdDeviation="3" result="softMap" />
            <feSpecularLighting
              in="softMap"
              surfaceScale="5"
              specularConstant="1"
              specularExponent="100"
              lightingColor="white"
              result="specLight"
            >
              <fePointLight x="-200" y="-200" z="300" />
            </feSpecularLighting>
            <feComposite
              in="specLight"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="1"
              k4="0"
              result="litImage"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="softMap"
              scale="8"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Clipped Frosted Base Pill Shell */}
      <div
        className={`absolute inset-0 rounded-full overflow-hidden border pointer-events-none ${
          isLight
            ? 'border-[#00A3FF]/25 shadow-[0_8px_24px_rgba(10,17,40,0.08)]'
            : 'border-white/[0.18] shadow-[0_12px_36px_rgba(0,0,0,0.4)]'
        }`}
      >
        <div
          className="absolute inset-0 z-0 rounded-full"
          style={{
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            filter: `url(#glass-distortion-${filterId})`,
            isolation: 'isolate',
          }}
        />
        <div
          className="absolute inset-0 z-10 rounded-full"
          style={{
            background: isLight
              ? 'rgba(255, 255, 255, 0.68)'
              : 'linear-gradient(180deg, rgba(255, 255, 255, 0.11) 0%, rgba(15, 29, 54, 0.44) 100%)',
          }}
        />
        <div
          className="absolute inset-0 z-20 rounded-full"
          style={{
            boxShadow: isLight
              ? 'inset 1px 1.5px 1px 0 rgba(255, 255, 255, 0.72), inset -1px -1px 1px 0 rgba(0, 0, 0, 0.05)'
              : 'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.24), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.06)',
          }}
        />
      </div>

      {/* Interactive Scrub Track */}
      <div
        ref={trackRef}
        role="tablist"
        aria-label={ariaLabel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => finishInteraction(e, true)}
        onPointerCancel={(e) => finishInteraction(e, false)}
        className={`relative z-30 flex items-center h-full px-1 touch-none select-none cursor-grab active:cursor-grabbing ${
          equalWidth ? 'w-full' : 'min-w-max'
        }`}
      >
        {/* iOS 26 Liquid Glass Blooming Refractive Lens Bubble */}
        <div
          ref={lensRef}
          aria-hidden="true"
          className="absolute top-1/2 left-0 rounded-full pointer-events-none z-10 overflow-hidden will-change-transform"
          style={{
            height: isHolding ? holdingLensHeight : restingLensHeight,
            opacity: metrics.length > 0 ? 1 : 0,
            transition: 'height 260ms cubic-bezier(0.22, 1.28, 0.36, 1), opacity 150ms ease',
          }}
        >
          {/* Main Refractive Glass Body */}
          <div
            className="w-full h-full rounded-full relative transition-all duration-200"
            style={{
              backdropFilter: isHolding
                ? 'blur(10px) saturate(220%) brightness(1.18)'
                : 'blur(12px) saturate(150%)',
              WebkitBackdropFilter: isHolding
                ? 'blur(10px) saturate(220%) brightness(1.18)'
                : 'blur(12px) saturate(150%)',
              background: isHolding
                ? isLight
                  ? 'radial-gradient(120% 100% at 50% 0%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.18) 55%, rgba(56,189,248,0.18) 100%)'
                  : 'radial-gradient(120% 100% at 50% 0%, rgba(255,255,255,0.24) 0%, rgba(56,189,248,0.10) 52%, rgba(255,255,255,0.06) 100%)'
                : isLight
                  ? 'rgba(0, 163, 255, 0.13)'
                  : 'rgba(255, 255, 255, 0.14)',
              boxShadow: isHolding
                ? isLight
                  ? 'inset 0 2px 3px rgba(255,255,255,0.95), inset 0 -2px 4px rgba(0,163,255,0.35), inset 2px 0 3px rgba(255,255,255,0.5), inset -2px 0 3px rgba(56,189,248,0.3), 0 8px 24px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.7)'
                  : 'inset 0 2px 3px rgba(255,255,255,0.72), inset 0 -2px 5px rgba(56,189,248,0.45), inset 2px 0 4px rgba(125,211,252,0.32), inset -2px 0 4px rgba(192,132,252,0.24), 0 10px 28px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.36)'
                : isLight
                  ? 'inset 0 1px 1px rgba(255,255,255,0.55)'
                  : 'inset 0 1px 1px rgba(255,255,255,0.22)',
            }}
          >
            {/* Top Liquid Specular Highlight Arc */}
            <div
              className="absolute top-[2px] left-[14%] right-[14%] h-[38%] rounded-full pointer-events-none transition-opacity duration-200"
              style={{
                opacity: isHolding ? 0.95 : 0.28,
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.08) 65%, transparent 100%)',
              }}
            />
            {/* Bottom Prismatic Chromatic Refraction Rim (iOS 26 Liquid Glass signature) */}
            <div
              className="absolute bottom-[1px] left-[12%] right-[12%] h-[6px] rounded-full blur-[2px] pointer-events-none transition-opacity duration-200"
              style={{
                opacity: isHolding ? 0.85 : 0,
                background:
                  'linear-gradient(90deg, rgba(56,189,248,0.85) 0%, rgba(255,255,255,0.9) 50%, rgba(167,139,250,0.75) 100%)',
              }}
            />
          </div>
        </div>

        {/* Option Buttons */}
        {options.map((opt, idx) => {
          const isActive = displayActiveIndex === idx;
          const isBeingHeld = isHolding && hoverIndex === idx;
          return (
            <button
              key={opt.id}
              ref={(el) => {
                buttonRefs.current[idx] = el;
              }}
              type="button"
              role="tab"
              aria-selected={value === opt.id}
              onClick={() => commitByIndex(idx)}
              className={`relative z-20 inline-flex items-center justify-center gap-1.5 rounded-full font-semibold whitespace-nowrap select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A3FF]/70 dark:focus-visible:ring-[#38BDF8]/70 transition-colors duration-200 ${
                equalWidth ? 'flex-1' : ''
              } ${
                isSm ? 'h-[28px] px-3 text-[11px]' : 'h-[34px] px-3.5 text-xs'
              } ${
                isActive
                  ? isLight
                    ? 'text-[#00A3FF]'
                    : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                  : isLight
                    ? 'text-[#0A1128]/60 hover:text-[#0A1128]/90'
                    : 'text-white/55 hover:text-white/85'
              }`}
            >
              <span
                className="inline-flex items-center gap-1.5 transition-transform duration-200"
                style={{
                  transform: isBeingHeld
                    ? 'scale(1.08) translateY(-0.5px)'
                    : isActive
                      ? 'scale(1.02)'
                      : 'scale(1)',
                }}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (scrollable) {
    // Vertical padding buffer (py-2.5 -my-2.5) allows the blooming refractive lens to overflow
    // cleanly above and below the frosted pill rail while keeping horizontal scroll on 375px-430px mobile!
    return (
      <div
        ref={scrollWrapRef}
        className="max-w-full overflow-x-auto no-scrollbar py-2.5 -my-2.5 px-1.5 -mx-1.5"
      >
        {pillBar}
      </div>
    );
  }

  return pillBar;
}

export default LiquidGlassPillBar;
