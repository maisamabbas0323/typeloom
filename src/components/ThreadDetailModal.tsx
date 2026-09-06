import React, { useState } from 'react';
import { TestResult, ThreadData } from '../types';
import { LivingThread } from './LivingThread';
import { generateThreadData, getThreadContextCopy } from '../engine/thread';
import { useHistoryStore } from '../store/useHistoryStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { exportThreadAsImage } from '../engine/exportThreadImage';
import { CloseIcon, PinIcon, DownloadIcon, TrophyIcon, EditIcon } from './Icons';

interface ThreadDetailModalProps {
  result: TestResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ThreadDetailModal: React.FC<ThreadDetailModalProps> = ({
  result,
  isOpen,
  onClose,
}) => {
  const { history, togglePinResult, renameResult } = useHistoryStore();
  const { threadStyle, threadThickness } = useSettingsStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !result) return null;

  const currentResult = history.find((item) => item.id === result.id) || result;

  // Resolve or generate thread data
  const thread: ThreadData = currentResult.thread || generateThreadData(currentResult, {
    style: threadStyle,
    thickness: threadThickness,
  });

  const contextCopy = getThreadContextCopy(currentResult);

  const handleStartRename = () => {
    setCustomNameInput(currentResult.customName || '');
    setIsEditingName(true);
  };

  const handleSaveRename = () => {
    renameResult(currentResult.id, customNameInput);
    setIsEditingName(false);
  };

  const handleExportImage = async () => {
    try {
      setIsExporting(true);
      await exportThreadAsImage(currentResult, thread);
    } catch (e) {
      console.error('Failed to export thread image:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const dateStr = new Date(currentResult.createdAt).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = new Date(currentResult.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id="thread-detail-backdrop"
      className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="thread-detail-dialog"
        className="w-full max-w-3xl rounded-2xl border p-6 sm:p-8 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 my-auto"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="thread-detail-title"
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex-1 pr-4">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  placeholder="e.g. Morning practice, First 80 WPM"
                  className="px-3 py-1.5 rounded-lg border text-sm font-medium w-full max-w-sm outline-none"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--accent)',
                    color: 'var(--text)',
                  }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveRename}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2
                  id="thread-detail-title"
                  className="text-lg font-semibold tracking-tight"
                  style={{ color: 'var(--text)' }}
                >
                  {currentResult.customName || `${dateStr} · ${currentResult.wpm} WPM`}
                </h2>
                <button
                  type="button"
                  onClick={handleStartRename}
                  className="p-1 rounded opacity-60 hover:opacity-100 transition-opacity"
                  title="Rename this thread"
                  style={{ color: 'var(--sub)' }}
                >
                  <EditIcon size={14} />
                </button>
              </div>
            )}
            <p className="text-xs mt-0.5" style={{ color: 'var(--sub)' }}>
              Recorded {dateStr} at {timeStr} · Mode: {currentResult.mode} {currentResult.length}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => togglePinResult(currentResult.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all"
              style={{
                backgroundColor: currentResult.pinned ? 'var(--accent)' : 'var(--surface-2)',
                borderColor: currentResult.pinned ? 'var(--accent)' : 'var(--border)',
                color: currentResult.pinned ? 'var(--bg)' : 'var(--sub)',
              }}
              title={currentResult.pinned ? 'Unpin from My Threads' : 'Pin to My Threads'}
            >
              <PinIcon size={13} />
              <span>{currentResult.pinned ? 'Pinned' : 'Pin thread'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportImage}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
              title="Save beautiful local image card"
            >
              <DownloadIcon size={13} />
              <span>{isExporting ? 'Saving...' : 'Save Thread'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--sub)',
              }}
              aria-label="Close dialog"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* Centerpiece Living Thread Card */}
        <div
          className="rounded-xl border p-5 sm:p-7 flex flex-col gap-4"
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-widest" style={{ color: 'var(--sub)' }}>
                Your Thread
              </span>
              {currentResult.isPb && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
                >
                  <TrophyIcon size={11} />
                  Personal Best
                </span>
              )}
            </div>

            <span className="text-xs font-mono capitalize" style={{ color: 'var(--sub)' }}>
              Style: {thread.style} · {thread.thickness}
            </span>
          </div>

          <LivingThread
            thread={thread}
            sizeVariant="hero"
            animate={true}
            showHoverDetails={true}
          />

          <div className="border-t pt-3 flex flex-wrap items-center justify-between gap-2" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs italic" style={{ color: 'var(--sub)' }}>
              &ldquo;{contextCopy.reflection}&rdquo;
            </p>
            <p className="text-[11px] font-mono" style={{ color: 'var(--sub)' }}>
              {thread.points.length} nodes · {thread.errors} {thread.errors === 1 ? 'knot' : 'knots'}
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
            <span className="text-[10px] uppercase font-sans tracking-wider block" style={{ color: 'var(--sub)' }}>
              Net Speed
            </span>
            <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
              {currentResult.wpm} <span className="text-xs font-normal font-sans">WPM</span>
            </span>
          </div>

          <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
            <span className="text-[10px] uppercase font-sans tracking-wider block" style={{ color: 'var(--sub)' }}>
              Accuracy
            </span>
            <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {currentResult.accuracy}%
            </span>
          </div>

          <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
            <span className="text-[10px] uppercase font-sans tracking-wider block" style={{ color: 'var(--sub)' }}>
              Consistency
            </span>
            <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {currentResult.consistency}%
            </span>
          </div>

          <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
            <span className="text-[10px] uppercase font-sans tracking-wider block" style={{ color: 'var(--sub)' }}>
              Burst Peak
            </span>
            <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              {currentResult.burst} <span className="text-xs font-normal font-sans">WPM</span>
            </span>
          </div>
        </div>

        {/* Accessible Textual Summary */}
        <div className="text-xs p-3 rounded-lg border font-sans" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--sub)' }}>
          {thread.summary}
        </div>
      </div>
    </div>
  );
};
