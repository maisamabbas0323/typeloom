import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ThreadData, ThreadStyle, ThreadThickness } from '../types';
import { buildThreadSvgPath } from '../engine/thread';
import { useSettingsStore } from '../store/useSettingsStore';

interface LivingThreadProps {
  thread: ThreadData;
  width?: number | string;
  height?: number;
  sizeVariant?: 'mini' | 'normal' | 'hero';
  animate?: boolean;
  className?: string;
  showHoverDetails?: boolean;
}

export const LivingThread: React.FC<LivingThreadProps> = ({
  thread,
  width = '100%',
  height,
  sizeVariant = 'normal',
  animate = true,
  className = '',
  showHoverDetails = false,
}) => {
  const { reducedMotion, threadResultsAnimation } = useSettingsStore();
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const effectiveAnimate = animate && threadResultsAnimation && !reducedMotion && sizeVariant !== 'mini';

  // Responsive viewBox dimensions based on size variant
  const svgWidth = 800;
  const svgHeight = sizeVariant === 'mini' ? 44 : sizeVariant === 'hero' ? 180 : 130;
  const containerHeight = height ?? (sizeVariant === 'mini' ? 36 : sizeVariant === 'hero' ? 160 : 110);

  const style: ThreadStyle = thread.style || 'silk';
  const thickness: ThreadThickness = thread.thickness || 'regular';

  // Stroke width in pixels
  const baseStrokeWidth = useMemo(() => {
    if (sizeVariant === 'mini') {
      return thickness === 'fine' ? 1.2 : thickness === 'bold' ? 2.4 : 1.8;
    }
    return thickness === 'fine' ? 1.6 : thickness === 'bold' ? 4.2 : 2.6;
  }, [thickness, sizeVariant]);

  // Primary Bezier Path
  const mainPath = useMemo(() => {
    return buildThreadSvgPath(thread.points, svgWidth, svgHeight);
  }, [thread.points, svgWidth, svgHeight]);

  // Secondary Twin Path for Fiber / Pencil / Ribbon styles
  const secondaryPath = useMemo(() => {
    if (style !== 'fiber' && style !== 'pencil' && style !== 'ribbon') return null;
    const offsetPoints = thread.points.map((p) => ({
      ...p,
      y: Math.max(0.08, Math.min(0.92, p.y + (style === 'ribbon' ? 0.08 : 0.025))),
    }));
    return buildThreadSvgPath(offsetPoints, svgWidth, svgHeight);
  }, [thread.points, style, svgWidth, svgHeight]);

  // Closed polygon for Ribbon gradient fill
  const ribbonFillPath = useMemo(() => {
    if (style !== 'ribbon' || !secondaryPath) return null;
    const topPoints = thread.points.map((p) => ({ x: p.x * svgWidth, y: p.y * svgHeight }));
    const bottomPoints = thread.points
      .map((p) => ({ x: p.x * svgWidth, y: Math.min(svgHeight - 4, (p.y + 0.08) * svgHeight) }))
      .reverse();

    let d = `M ${topPoints[0].x},${topPoints[0].y}`;
    for (let i = 1; i < topPoints.length; i++) {
      d += ` L ${topPoints[i].x.toFixed(1)},${topPoints[i].y.toFixed(1)}`;
    }
    for (let j = 0; j < bottomPoints.length; j++) {
      d += ` L ${bottomPoints[j].x.toFixed(1)},${bottomPoints[j].y.toFixed(1)}`;
    }
    d += ' Z';
    return d;
  }, [style, thread.points, secondaryPath, svgWidth, svgHeight]);

  // Error Knots: locations along the thread
  const knots = useMemo(() => {
    return thread.points
      .map((p, idx) => ({ p, idx }))
      .filter(({ p }) => p.knot);
  }, [thread.points]);

  // Unique SVG IDs for filters and gradients
  const gradientId = useMemo(() => `thread-grad-${thread.seed}-${sizeVariant}`, [thread.seed, sizeVariant]);
  const pbGlowId = useMemo(() => `thread-pbglow-${thread.seed}`, [thread.seed]);

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ width, height: containerHeight }}
      role="img"
      aria-label={thread.summary || 'Living Thread visualization showing typing rhythm'}
    >
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Main Flow Gradient */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={style === 'paper' ? '0.65' : '0.8'} />
            <stop offset="50%" stopColor="var(--accent)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={thread.isPb ? '1' : '0.85'} />
          </linearGradient>

          {/* PB Radiant Glow Filter */}
          {thread.isPb && (
            <filter id={pbGlowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          )}

          {/* Paper Texture Noise */}
          {style === 'paper' && (
            <pattern id="paper-grain" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.8" fill="var(--accent)" opacity="0.3" />
              <circle cx="7" cy="6" r="0.6" fill="var(--sub)" opacity="0.25" />
            </pattern>
          )}
        </defs>

        {/* Ribbon translucent body */}
        {style === 'ribbon' && ribbonFillPath && (
          <path
            d={ribbonFillPath}
            fill="var(--accent)"
            fillOpacity="0.12"
            className="transition-opacity duration-300"
          />
        )}

        {/* Secondary filament for Fiber or Pencil style */}
        {secondaryPath && (
          <path
            d={secondaryPath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={baseStrokeWidth * 0.7}
            strokeDasharray={style === 'fiber' ? '3 2' : style === 'pencil' ? '1 2' : undefined}
            strokeOpacity={style === 'ribbon' ? 0.4 : 0.55}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Background Ghost Rail (for context) */}
        {sizeVariant !== 'mini' && (
          <path
            d={mainPath}
            fill="none"
            stroke="var(--sub)"
            strokeWidth={baseStrokeWidth * 1.8}
            strokeOpacity="0.08"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Primary Living Thread Path */}
        <motion.path
          d={mainPath}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={baseStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={thread.isPb ? `url(#${pbGlowId})` : undefined}
          strokeDasharray={
            style === 'typewriter'
              ? '6 2 12 2'
              : style === 'paper'
              ? '16 2'
              : style === 'wire'
              ? 'none'
              : undefined
          }
          initial={effectiveAnimate ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={
            effectiveAnimate
              ? {
                  pathLength: { duration: 1.25, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.25 },
                }
              : { duration: 0 }
          }
        />

        {/* PB Traveling Highlight Pulse */}
        {thread.isPb && effectiveAnimate && (
          <motion.circle
            r={baseStrokeWidth * 1.5 + 2}
            fill="var(--accent)"
            initial={{ offsetDistance: '0%', opacity: 1 }}
            animate={{ offsetDistance: '100%', opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.3 }}
            style={{
              offsetPath: `path("${mainPath}")`,
              filter: 'drop-shadow(0 0 6px var(--accent))',
            }}
          />
        )}

        {/* Subtle Error Knots */}
        {sizeVariant !== 'mini' &&
          knots.map(({ p, idx }) => {
            const cx = p.x * svgWidth;
            const cy = p.y * svgHeight;
            const isHovered = hoveredPointIndex === idx;

            return (
              <g key={`knot-${idx}`} className="transition-transform duration-200">
                {/* Organic loop ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={baseStrokeWidth * 1.6 + 2}
                  fill="var(--surface)"
                  stroke="var(--error)"
                  strokeWidth={1.8}
                  strokeOpacity="0.85"
                  className="transition-all"
                />
                {/* Center knot core */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={baseStrokeWidth * 0.75}
                  fill="var(--error)"
                  opacity="0.9"
                />
                {/* Hover hotspot */}
                {showHoverDetails && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={14}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  />
                )}
              </g>
            );
          })}

        {/* Interactive Data Nodes on Hover */}
        {showHoverDetails &&
          thread.points.map((p, idx) => {
            const cx = p.x * svgWidth;
            const cy = p.y * svgHeight;
            const isHovered = hoveredPointIndex === idx;

            return (
              <circle
                key={`point-${idx}`}
                cx={cx}
                cy={cy}
                r={isHovered ? 5 : 2.5}
                fill={isHovered ? 'var(--accent)' : 'var(--text)'}
                opacity={isHovered ? 1 : 0}
                className="transition-all duration-150 cursor-pointer"
                onMouseEnter={() => setHoveredPointIndex(idx)}
                onMouseLeave={() => setHoveredPointIndex(null)}
              />
            );
          })}
      </svg>

      {/* Hover Tooltip for Point Speed & Knots */}
      {showHoverDetails && hoveredPointIndex !== null && thread.points[hoveredPointIndex] && (
        <div
          className="absolute z-20 pointer-events-none px-2.5 py-1 rounded-md text-[11px] font-mono border shadow-md flex items-center gap-1.5 transition-all -translate-x-1/2 -translate-y-full"
          style={{
            left: `${thread.points[hoveredPointIndex].x * 100}%`,
            top: `${(thread.points[hoveredPointIndex].y * containerHeight) - 8}px`,
            backgroundColor: 'var(--surface-2)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
          }}
        >
          <span className="font-bold" style={{ color: 'var(--accent)' }}>
            {thread.points[hoveredPointIndex].wpm} WPM
          </span>
          {thread.points[hoveredPointIndex].knot && (
            <span className="text-[10px] text-[var(--error)] flex items-center gap-0.5">
              • knot
            </span>
          )}
        </div>
      )}
    </div>
  );
};
