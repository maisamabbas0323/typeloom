import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TestResult, ThreadData } from '../types';
import { LivingThread } from './LivingThread';
import { generateThreadData, getThreadContextCopy } from '../engine/thread';
import { exportThreadAsImage } from '../engine/exportThreadImage';
import { RestartIcon, TrophyIcon, HistoryIcon, DownloadIcon, PinIcon } from './Icons';
import { useSettingsStore } from '../store/useSettingsStore';
import { useHistoryStore } from '../store/useHistoryStore';

interface ResultsCardProps {
  result: TestResult;
  onRestart: () => void;
  onOpenHistory: () => void;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({
  result,
  onRestart,
  onOpenHistory,
}) => {
  const { reducedMotion, threadStyle, threadThickness } = useSettingsStore();
  const { togglePinResult } = useHistoryStore();
  const [isExporting, setIsExporting] = useState(false);

  // Derive or use existing thread data
  const thread: ThreadData = result.thread || generateThreadData(result, {
    style: threadStyle,
    thickness: threadThickness,
  });

  const contextCopy = getThreadContextCopy(result);

  // Listen for Enter or Tab to quickly restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportThreadAsImage(result, thread);
    } catch (e) {
      console.error('Failed to export thread card:', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      id="results-card-container"
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 select-none"
    >
      {/* PB Celebration Banner */}
      {result.isPb && (
        <div
          id="pb-celebration-banner"
          className="mb-6 p-4 rounded-xl border flex items-center justify-between shadow-sm relative overflow-hidden"
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: 'var(--accent)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
            >
              <TrophyIcon size={18} />
            </div>
            <div>
              <h4 className="font-semibold text-sm" style={{ color: 'var(--accent)' }}>
                New Personal Best
              </h4>
              <p className="text-xs" style={{ color: 'var(--sub)' }}>
                You wove your highest rhythm yet for {result.mode} {result.length}
              </p>
            </div>
          </div>

          <span
            className="text-xs font-mono font-bold px-2.5 py-1 rounded-md"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
          >
            {result.wpm} WPM
          </span>
        </div>
      )}

      {/* Main Results Card */}
      <div
        className="rounded-2xl border p-6 sm:p-9 shadow-sm mb-6 flex flex-col gap-8"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Top Split: Hero Net WPM & Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b pb-8" style={{ borderColor: 'var(--border)' }}>
          {/* Dominant Hero WPM */}
          <div className="md:col-span-1 border-b md:border-b-0 md:border-r pb-6 md:pb-0 pr-0 md:pr-8" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs uppercase tracking-widest font-mono font-medium block mb-1" style={{ color: 'var(--sub)' }}>
              Net Speed
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className="text-6xl sm:text-7xl font-bold tracking-tight font-mono"
                style={{ color: 'var(--accent)' }}
              >
                {result.wpm}
              </span>
              <span className="text-lg font-mono font-medium" style={{ color: 'var(--sub)' }}>
                WPM
              </span>
            </div>
            <p className="text-xs mt-2 font-medium" style={{ color: 'var(--text)' }}>
              {contextCopy.headline}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--sub)' }}>
              {contextCopy.reflection}
            </p>
          </div>

          {/* Secondary Metric Grid */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-4 font-mono">
            <div>
              <span className="text-xs uppercase tracking-wider font-sans block mb-1" style={{ color: 'var(--sub)' }}>
                Accuracy
              </span>
              <span className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text)' }}>
                {result.accuracy}%
              </span>
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-sans block mb-1" style={{ color: 'var(--sub)' }}>
                Raw WPM
              </span>
              <span className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text)' }}>
                {result.rawWpm}
              </span>
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-sans block mb-1" style={{ color: 'var(--sub)' }}>
                Consistency
              </span>
              <span className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text)' }}>
                {result.consistency}%
              </span>
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-sans block mb-1" style={{ color: 'var(--sub)' }}>
                Little Knots
              </span>
              <span
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: result.errors > 0 ? 'var(--error)' : 'var(--text)' }}
              >
                {result.errors}
              </span>
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-sans block mb-1" style={{ color: 'var(--sub)' }}>
                Burst Peak
              </span>
              <span className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text)' }}>
                {result.burst} <span className="text-xs font-normal font-sans" style={{ color: 'var(--sub)' }}>WPM</span>
              </span>
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-sans block mb-1" style={{ color: 'var(--sub)' }}>
                Duration
              </span>
              <span className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text)' }}>
                {result.elapsedSeconds}s
              </span>
            </div>
          </div>
        </div>

        {/* Centerpiece: Living Thread Visualization */}
        <div
          id="results-living-thread-section"
          className="rounded-xl border p-5 sm:p-7 flex flex-col gap-4"
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-widest font-semibold" style={{ color: 'var(--text)' }}>
                Your Thread
              </span>
              <span className="text-[11px] font-mono" style={{ color: 'var(--sub)' }}>
                • style: {thread.style}
              </span>
            </div>

            <span className="text-xs italic" style={{ color: 'var(--sub)' }}>
              &ldquo;Every run leaves a thread.&rdquo;
            </span>
          </div>

          {/* Generated Progressive Thread */}
          <LivingThread
            thread={thread}
            sizeVariant="hero"
            animate={true}
            showHoverDetails={true}
          />

          <div className="flex flex-wrap items-center justify-between text-xs pt-1" style={{ color: 'var(--sub)' }}>
            <span>
              {result.accuracy}% accuracy · {result.consistency}% consistency
            </span>
            <span className="font-mono text-[11px]">
              {result.errors === 0
                ? 'Pristine flow · zero knots'
                : `${result.errors} ${result.errors === 1 ? 'knot' : 'knots'} woven`}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="result-restart-btn"
            type="button"
            onClick={onRestart}
            className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 shadow-sm"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg)',
            }}
          >
            <RestartIcon size={16} />
            <span>Take another run</span>
            <kbd className="ml-1 text-[11px] opacity-75 font-mono px-1 py-0.5 rounded bg-black/20">
              Tab / Enter
            </kbd>
          </button>

          <button
            id="result-view-history-btn"
            type="button"
            onClick={onOpenHistory}
            className="px-4 py-2.5 rounded-xl font-medium text-sm border transition-all flex items-center gap-2 hover:opacity-90"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            <HistoryIcon size={16} />
            <span>View in History</span>
          </button>

          <button
            id="result-pin-thread-btn"
            type="button"
            onClick={() => togglePinResult(result.id)}
            className="px-3.5 py-2.5 rounded-xl font-medium text-sm border transition-all flex items-center gap-1.5"
            style={{
              backgroundColor: result.pinned ? 'var(--accent)' : 'var(--surface)',
              borderColor: result.pinned ? 'var(--accent)' : 'var(--border)',
              color: result.pinned ? 'var(--bg)' : 'var(--text)',
            }}
            title={result.pinned ? 'Pinned in My Threads' : 'Pin this thread'}
          >
            <PinIcon size={15} />
            <span className="hidden sm:inline">{result.pinned ? 'Pinned' : 'Pin thread'}</span>
          </button>

          <button
            id="result-save-image-btn"
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="px-3.5 py-2.5 rounded-xl font-medium text-sm border transition-all flex items-center gap-1.5 hover:opacity-90"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
            title="Save physical card image locally"
          >
            <DownloadIcon size={15} />
            <span>{isExporting ? 'Saving...' : 'Save Thread'}</span>
          </button>
        </div>

        <div className="text-xs font-mono" style={{ color: 'var(--sub)' }}>
          Mode: <span style={{ color: 'var(--text)' }}>{result.mode} {result.length}</span>
        </div>
      </div>
    </motion.div>
  );
};

