import React, { useMemo } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

interface LiveThreadIndicatorProps {
  isTyping: boolean;
  liveWpm: number;
  accuracy: number;
  recentErrors: number;
  charProgress: number; // 0 to 1
  className?: string;
}

export const LiveThreadIndicator: React.FC<LiveThreadIndicatorProps> = ({
  isTyping,
  liveWpm,
  accuracy,
  recentErrors,
  charProgress,
  className = '',
}) => {
  const { liveThread, threadStyle } = useSettingsStore();

  if (!liveThread) return null;

  // Derive subtle wave parameters from speed & rhythm
  const width = 360;
  const height = 18;
  const progressClamped = Math.max(0.04, Math.min(1, charProgress));
  const activeWidth = width * progressClamped;

  // Wave amplitude increases gently with live WPM speed
  const amplitude = Math.max(2, Math.min(6, (liveWpm / 110) * 5.5));
  const frequency = Math.max(2, Math.min(5, Math.floor(liveWpm / 28) + 2));

  // Generate subtle wave path up to active progress
  const wavePath = useMemo(() => {
    const points: string[] = [];
    const steps = Math.max(10, Math.floor(activeWidth / 12));
    const stepX = activeWidth / steps;

    for (let i = 0; i <= steps; i++) {
      const x = i * stepX;
      const progress = i / steps;
      // Gentle sine modulation + error perturbation
      const wave = Math.sin(progress * Math.PI * frequency) * amplitude;
      const errorJitter = recentErrors > 0 && i === steps - 1 ? (Math.random() > 0.5 ? 4 : -4) : 0;
      const y = height / 2 + wave + errorJitter;
      points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }

    return points.join(' ');
  }, [activeWidth, amplitude, frequency, recentErrors, height]);

  return (
    <div
      className={`w-full max-w-sm mx-auto flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 ${
        isTyping ? 'opacity-85' : 'opacity-35'
      } ${className}`}
      aria-hidden="true"
    >
      <div className="relative w-full max-w-[360px] h-[18px]">
        {/* Subtle background guide line */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] opacity-15"
          style={{ backgroundColor: 'var(--sub)' }}
        />

        {/* Live SVG thread */}
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <path
            d={wavePath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={threadStyle === 'pencil' || threadStyle === 'typewriter' ? 1.5 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.85}
          />

          {/* Leading active tip */}
          {activeWidth > 4 && (
            <circle
              cx={activeWidth}
              cy={height / 2}
              r={recentErrors > 0 ? 3 : 2}
              fill={recentErrors > 0 ? 'var(--error)' : 'var(--accent)'}
              className="transition-all duration-150"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
