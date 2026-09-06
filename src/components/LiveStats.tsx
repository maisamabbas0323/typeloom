import React from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { RestartIcon } from './Icons';

interface LiveStatsProps {
  mode: string;
  timeRemaining: number;
  wordProgress: { current: number; total: number };
  liveWpm: number;
  liveAccuracy: number;
  liveBurst: number;
  isTyping: boolean;
  onRestart: () => void;
}

export const LiveStats: React.FC<LiveStatsProps> = ({
  mode,
  timeRemaining,
  wordProgress,
  liveWpm,
  liveAccuracy,
  liveBurst,
  isTyping,
  onRestart,
}) => {
  const { showLiveWpm, showLiveAcc, showLiveBurst } = useSettingsStore();

  return (
    <div
      id="live-stats-bar"
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 mb-4 flex items-center justify-between font-mono text-sm select-none"
    >
      {/* Primary Counter (Time remaining or word counter) */}
      <div className="flex items-center gap-4">
        {mode === 'time' ? (
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-2xl sm:text-3xl font-semibold tracking-tight transition-colors"
              style={{ color: isTyping ? 'var(--accent)' : 'var(--text)' }}
            >
              {timeRemaining}
            </span>
            <span className="text-xs" style={{ color: 'var(--sub)' }}>
              seconds
            </span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span
              className="text-2xl sm:text-3xl font-semibold tracking-tight transition-colors"
              style={{ color: isTyping ? 'var(--accent)' : 'var(--text)' }}
            >
              {wordProgress.current}
            </span>
            <span className="text-base" style={{ color: 'var(--sub)' }}>
              / {wordProgress.total}
            </span>
            <span className="text-xs ml-1" style={{ color: 'var(--sub)' }}>
              words
            </span>
          </div>
        )}
      </div>

      {/* Secondary Live Stats */}
      <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
        {showLiveWpm && (
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--sub)' }}>
              wpm
            </span>
            <span className="font-semibold text-base" style={{ color: 'var(--text)' }}>
              {liveWpm}
            </span>
          </div>
        )}

        {showLiveAcc && (
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--sub)' }}>
              acc
            </span>
            <span className="font-semibold text-base" style={{ color: 'var(--text)' }}>
              {liveAccuracy}%
            </span>
          </div>
        )}

        {showLiveBurst && (
          <div className="flex items-baseline gap-1.5 hidden md:flex">
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--sub)' }}>
              burst
            </span>
            <span className="font-semibold text-base" style={{ color: 'var(--text)' }}>
              {liveBurst}
            </span>
          </div>
        )}

        {/* Restart Button with Responsive Tooltip */}
        <div className="relative group">
          <button
            id="live-restart-btn"
            type="button"
            onClick={onRestart}
            className="p-2 rounded-xl border transition-all hover:rotate-180 duration-300 cursor-pointer shadow-xs"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--sub)',
            }}
            aria-label="Restart test"
          >
            <RestartIcon size={16} />
          </button>

          <div
            role="tooltip"
            className="absolute pointer-events-none opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-150 ease-out z-50
              right-0 top-full mt-2
              px-2.5 py-1 rounded-md text-[11px] font-medium border shadow-lg whitespace-nowrap hidden sm:flex items-center"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <span>Restart Test (Tab / Enter)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
