import React, { useState } from 'react';

interface ResultsSparklineProps {
  data: number[];
  avgWpm: number;
}

export const ResultsSparkline: React.FC<ResultsSparklineProps> = ({ data, avgWpm }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // If we don't have enough data points (e.g. very fast short test < 2s)
  const safeData = data.length < 2 ? [avgWpm, avgWpm] : data;
  const maxWpm = Math.max(...safeData, 1);
  const minWpm = Math.min(...safeData, 0);

  const width = 640;
  const height = 140;
  const paddingX = 20;
  const paddingY = 20;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Generate SVG path points
  const points = safeData.map((val, idx) => {
    const x = paddingX + (idx / (safeData.length - 1)) * chartWidth;
    const normalizedY = (val - minWpm) / (maxWpm - minWpm || 1);
    const y = height - paddingY - normalizedY * chartHeight;
    return { x, y, val, sec: idx + 1 };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  // Fill area under the line
  const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

  // Average WPM horizontal line Y
  const avgY =
    height -
    paddingY -
    ((avgWpm - minWpm) / (maxWpm - minWpm || 1)) * chartHeight;

  // Accessible summary text
  const accessibleSummary = `Speed chart: Peaked at ${maxWpm} WPM, averaged ${avgWpm} WPM over ${safeData.length} seconds.`;

  return (
    <div
      id="results-sparkline"
      className="w-full rounded-xl border p-4 sm:p-5 select-none"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
      aria-label={accessibleSummary}
      role="region"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
            Speed Flow
          </span>
          <span className="text-xs" style={{ color: 'var(--sub)' }}>
            (words per minute over time)
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono" style={{ color: 'var(--sub)' }}>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 inline-block" style={{ backgroundColor: 'var(--accent)' }} />
            Peak: <strong style={{ color: 'var(--text)' }}>{maxWpm}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 border-b border-dashed inline-block" style={{ borderColor: 'var(--sub)' }} />
            Avg: <strong style={{ color: 'var(--text)' }}>{avgWpm}</strong>
          </span>
        </div>
      </div>

      <div className="relative w-full h-[140px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Average horizontal dashed line */}
          {avgY >= paddingY && avgY <= height - paddingY && (
            <line
              x1={paddingX}
              y1={avgY}
              x2={width - paddingX}
              y2={avgY}
              stroke="var(--sub)"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.5"
            />
          )}

          {/* Area fill */}
          <path d={areaD} fill="url(#flowGradient)" />

          {/* Line stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive scrubbing / dots */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === idx ? 4 : 2}
              fill={hoveredIdx === idx ? 'var(--text)' : 'var(--accent)'}
              stroke="var(--surface)"
              strokeWidth="1.5"
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
        </svg>

        {/* Scrub Tooltip */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className="absolute -top-3 px-2 py-1 rounded text-xs font-mono shadow-md border pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(points[hoveredIdx].x / width) * 100}%`,
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            {points[hoveredIdx].val} WPM @ {points[hoveredIdx].sec}s
          </div>
        )}
      </div>

      <p className="sr-only">{accessibleSummary}</p>
    </div>
  );
};
