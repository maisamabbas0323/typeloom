import React, { useState } from 'react';
import { useHistoryStore } from '../store/useHistoryStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { CloseIcon, TrashIcon, TrophyIcon, DownloadIcon, UploadIcon, PinIcon, ThreadIcon } from './Icons';
import { formatTime } from '../engine/metrics';
import { ConfirmDialog } from './ConfirmDialog';
import { LivingThread } from './LivingThread';
import { ThreadDetailModal } from './ThreadDetailModal';
import { generateThreadData } from '../engine/thread';
import { TestResult, ThreadData } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onTriggerImport: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onTriggerImport,
}) => {
  const { history, pbs, clearHistory, getStats } = useHistoryStore();
  const { showThreadInHistory, threadStyle, threadThickness } = useSettingsStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [filterMode, setFilterMode] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'list' | 'rhythm' | 'pinned'>('list');
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  if (!isOpen) return null;

  const stats = getStats();

  const filteredHistory = history.filter((item) => {
    if (activeTab === 'pinned') {
      if (!item.pinned) return false;
    }
    if (filterMode === 'all') return true;
    return item.mode === filterMode;
  });

  // Group runs chronologically for "Your Rhythm"
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const todayRuns = history.filter((h) => now - h.createdAt < oneDayMs);
  const yesterdayRuns = history.filter(
    (h) => now - h.createdAt >= oneDayMs && now - h.createdAt < 2 * oneDayMs
  );
  const earlierRuns = history.filter((h) => now - h.createdAt >= 2 * oneDayMs);

  const getThreadForItem = (item: TestResult): ThreadData => {
    return (
      item.thread ||
      generateThreadData(item, {
        style: threadStyle,
        thickness: threadThickness,
      })
    );
  };

  return (
    <>
      <div
        id="history-modal-backdrop"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 select-none"
        onClick={onClose}
      >
        <div
          id="history-dialog"
          className="w-full max-w-4xl max-h-[88vh] rounded-2xl border p-5 sm:p-8 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-heading"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 id="history-heading" className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
                Practice History & Living Threads
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--sub)' }}>
                {history.length === 0
                  ? 'Your first thread is waiting.'
                  : 'Every run leaves a thread. Preserved locally on this device.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExport}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 hover:opacity-80"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--sub)',
                }}
                title="Export backup (Ctrl/Cmd + E)"
              >
                <DownloadIcon size={14} />
                <span className="hidden sm:inline">Export</span>
              </button>

              <button
                type="button"
                onClick={onTriggerImport}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 hover:opacity-80"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--sub)',
                }}
                title="Import backup (Ctrl/Cmd + I)"
              >
                <UploadIcon size={14} />
                <span className="hidden sm:inline">Import</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity ml-1"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--sub)',
                }}
                aria-label="Close history modal"
              >
                <CloseIcon size={16} />
              </button>
            </div>
          </div>

          {/* Overview Stats Strip */}
          <div
            className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl border text-center font-mono"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
            }}
          >
            <div>
              <span className="text-[10px] uppercase font-sans tracking-wider block" style={{ color: 'var(--sub)' }}>
                Threads Woven
              </span>
              <span className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                {stats.totalTests}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-sans tracking-wider block" style={{ color: 'var(--sub)' }}>
                Average Speed
              </span>
              <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                {stats.avgWpm} <span className="text-xs font-normal font-sans">WPM</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-sans tracking-wider block" style={{ color: 'var(--sub)' }}>
                Peak Speed
              </span>
              <span className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                {stats.maxWpm} <span className="text-xs font-normal font-sans">WPM</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-sans tracking-wider block" style={{ color: 'var(--sub)' }}>
                Avg Accuracy
              </span>
              <span className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                {stats.avgAccuracy}%
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-sans tracking-wider block" style={{ color: 'var(--sub)' }}>
                Time Woven
              </span>
              <span className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                {formatTime(stats.totalTimeSeconds)}
              </span>
            </div>
          </div>

          {/* View Mode Selector: All Runs vs. Your Rhythm vs. Pinned */}
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                style={{
                  backgroundColor: activeTab === 'list' ? 'var(--accent)' : 'transparent',
                  color: activeTab === 'list' ? 'var(--bg)' : 'var(--sub)',
                }}
              >
                <span>All Runs ({history.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('rhythm')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                style={{
                  backgroundColor: activeTab === 'rhythm' ? 'var(--accent)' : 'transparent',
                  color: activeTab === 'rhythm' ? 'var(--bg)' : 'var(--sub)',
                }}
              >
                <ThreadIcon size={14} />
                <span>Your Rhythm</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pinned')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                style={{
                  backgroundColor: activeTab === 'pinned' ? 'var(--accent)' : 'transparent',
                  color: activeTab === 'pinned' ? 'var(--bg)' : 'var(--sub)',
                }}
              >
                <PinIcon size={13} />
                <span>My Threads ({history.filter((h) => h.pinned).length})</span>
              </button>
            </div>

            {/* Mode Filter */}
            <div className="flex items-center gap-1 text-xs">
              {['all', 'words', 'time', 'quote', 'custom'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilterMode(f)}
                  className="px-2 py-0.5 rounded capitalize transition-colors"
                  style={{
                    backgroundColor: filterMode === f ? 'var(--surface-2)' : 'transparent',
                    color: filterMode === f ? 'var(--accent)' : 'var(--sub)',
                    fontWeight: filterMode === f ? '600' : '400',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content: All Runs / Pinned Table View */}
          {activeTab !== 'rhythm' ? (
            <div className="flex-1 flex flex-col min-h-0">
              {filteredHistory.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {activeTab === 'pinned' ? 'No pinned threads yet.' : 'No runs recorded yet.'}
                  </p>
                  <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--sub)' }}>
                    {activeTab === 'pinned'
                      ? 'Click the pin icon on any result or thread to preserve it in your favorites.'
                      : 'Your first thread is waiting. Keystrokes are recorded in quiet rhythm.'}
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead>
                        <tr className="border-b text-[10px] uppercase font-sans tracking-wider" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--sub)' }}>
                          <th className="py-2.5 px-3">Date</th>
                          {showThreadInHistory && <th className="py-2.5 px-3 w-28">Thread</th>}
                          <th className="py-2.5 px-3">Mode</th>
                          <th className="py-2.5 px-3 text-right">Net WPM</th>
                          <th className="py-2.5 px-3 text-right">Acc</th>
                          <th className="py-2.5 px-3 text-right">Consistency</th>
                          <th className="py-2.5 px-3 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                        {filteredHistory.map((item) => {
                          const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          });
                          const timeStr = new Date(item.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          });
                          const threadData = getThreadForItem(item);

                          return (
                            <tr
                              key={item.id}
                              onClick={() => setSelectedResult(item)}
                              className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                              title="Click to inspect Living Thread artifact"
                            >
                              <td className="py-2.5 px-3" style={{ color: 'var(--sub)' }}>
                                <div className="flex items-center gap-1.5">
                                  {item.pinned && <PinIcon size={12} className="text-[var(--accent)] shrink-0" />}
                                  <span>{dateStr} {timeStr}</span>
                                </div>
                              </td>

                              {showThreadInHistory && (
                                <td className="py-1 px-3 w-28">
                                  <div className="w-24 h-6 opacity-75 group-hover:opacity-100 transition-opacity">
                                    <LivingThread
                                      thread={threadData}
                                      sizeVariant="mini"
                                      animate={false}
                                    />
                                  </div>
                                </td>
                              )}

                              <td className="py-2.5 px-3 capitalize">
                                <span style={{ color: 'var(--text)' }}>{item.mode}</span>{' '}
                                <span style={{ color: 'var(--sub)' }}>{item.length}</span>
                                {item.isPb && (
                                  <span
                                    className="ml-1.5 px-1 py-0.2 rounded text-[9px] font-sans font-bold"
                                    style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
                                  >
                                    PB
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold" style={{ color: 'var(--accent)' }}>
                                {item.wpm}
                              </td>
                              <td className="py-2.5 px-3 text-right" style={{ color: 'var(--text)' }}>
                                {item.accuracy}%
                              </td>
                              <td className="py-2.5 px-3 text-right" style={{ color: 'var(--sub)' }}>
                                {item.consistency}%
                              </td>
                              <td className="py-2.5 px-3 text-right" style={{ color: 'var(--sub)' }}>
                                {item.elapsedSeconds}s
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Your Rhythm: Visual Chronological Thread Collection */
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-6">
              {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Your first thread is waiting.
                  </p>
                  <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--sub)' }}>
                    Take your first run to begin weaving your personal rhythm collection.
                  </p>
                </div>
              ) : (
                <>
                  {todayRuns.length > 0 && (
                    <div className="flex flex-col gap-2.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sub)' }}>
                        Today ({todayRuns.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {todayRuns.map((run) => (
                          <div
                            key={run.id}
                            onClick={() => setSelectedResult(run)}
                            className="p-3.5 rounded-xl border flex flex-col gap-2.5 cursor-pointer hover:border-[var(--accent)] transition-all"
                            style={{
                              backgroundColor: 'var(--surface-2)',
                              borderColor: 'var(--border)',
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold font-mono" style={{ color: 'var(--accent)' }}>
                                {run.wpm} <span className="text-xs font-normal font-sans" style={{ color: 'var(--sub)' }}>WPM</span>
                              </span>
                              <span className="text-xs font-mono" style={{ color: 'var(--sub)' }}>
                                {run.accuracy}% acc · {run.mode}
                              </span>
                            </div>
                            <div className="h-10 w-full">
                              <LivingThread
                                thread={getThreadForItem(run)}
                                sizeVariant="mini"
                                animate={false}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {yesterdayRuns.length > 0 && (
                    <div className="flex flex-col gap-2.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sub)' }}>
                        Yesterday ({yesterdayRuns.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {yesterdayRuns.map((run) => (
                          <div
                            key={run.id}
                            onClick={() => setSelectedResult(run)}
                            className="p-3.5 rounded-xl border flex flex-col gap-2.5 cursor-pointer hover:border-[var(--accent)] transition-all"
                            style={{
                              backgroundColor: 'var(--surface-2)',
                              borderColor: 'var(--border)',
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold font-mono" style={{ color: 'var(--accent)' }}>
                                {run.wpm} <span className="text-xs font-normal font-sans" style={{ color: 'var(--sub)' }}>WPM</span>
                              </span>
                              <span className="text-xs font-mono" style={{ color: 'var(--sub)' }}>
                                {run.accuracy}% acc · {run.mode}
                              </span>
                            </div>
                            <div className="h-10 w-full">
                              <LivingThread
                                thread={getThreadForItem(run)}
                                sizeVariant="mini"
                                animate={false}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {earlierRuns.length > 0 && (
                    <div className="flex flex-col gap-2.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sub)' }}>
                        Earlier ({earlierRuns.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {earlierRuns.map((run) => (
                          <div
                            key={run.id}
                            onClick={() => setSelectedResult(run)}
                            className="p-3.5 rounded-xl border flex flex-col gap-2.5 cursor-pointer hover:border-[var(--accent)] transition-all"
                            style={{
                              backgroundColor: 'var(--surface-2)',
                              borderColor: 'var(--border)',
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold font-mono" style={{ color: 'var(--accent)' }}>
                                {run.wpm} <span className="text-xs font-normal font-sans" style={{ color: 'var(--sub)' }}>WPM</span>
                              </span>
                              <span className="text-xs font-mono" style={{ color: 'var(--sub)' }}>
                                {run.accuracy}% acc · {run.mode}
                              </span>
                            </div>
                            <div className="h-10 w-full">
                              <LivingThread
                                thread={getThreadForItem(run)}
                                sizeVariant="mini"
                                animate={false}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Footer with Clear History Button */}
          {history.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t text-xs" style={{ borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--sub)' }}>
                Click any thread row to view its preserved Living Thread artifact.
              </span>
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: 'var(--border)',
                  color: 'var(--error)',
                }}
              >
                <TrashIcon size={14} />
                <span>Delete all history</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Full Thread Detail Artifact Inspector Modal */}
      <ThreadDetailModal
        result={selectedResult}
        isOpen={Boolean(selectedResult)}
        onClose={() => setSelectedResult(null)}
      />

      {/* Confirmation Dialog for Clearing History */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Delete all history?"
        description="This will permanently delete all your recorded tests and personal bests from this browser. This action cannot be undone unless you have an exported backup."
        confirmLabel="Delete all history"
        isDestructive={true}
        onConfirm={clearHistory}
        onCancel={() => setShowClearConfirm(false)}
      />
    </>
  );
};

