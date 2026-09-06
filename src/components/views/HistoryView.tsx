import React, { useState, useMemo } from 'react';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import {
  Trash2,
  Trophy,
  Download,
  Upload,
  Pin,
  Sparkles,
  Search,
  Zap,
  TrendingUp,
  CheckCircle2,
  Layers,
  ChevronRight,
  Flame,
  Award,
  Target,
  Activity,
  BarChart3,
  ListFilter,
  History,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmDialog } from '../ConfirmDialog';
import { LivingThread } from '../LivingThread';
import { ThreadDetailModal } from '../ThreadDetailModal';
import { generateThreadData } from '../../engine/thread';
import { TestResult, ThreadData } from '../../types';

interface HistoryViewProps {
  onExport: () => void;
  onTriggerImport: () => void;
  onSwitchToTyping: () => void;
}

type TabMode = 'flow' | 'chart' | 'table';

function getHumanRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(seconds / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function getPracticeInsight(
  history: TestResult[],
  stats: { avgWpm: number; maxWpm: number; avgAccuracy: number }
): {
  headline: string;
  detail: string;
  badge: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
} {
  if (history.length === 0) {
    return {
      headline: 'Welcome to your practice history',
      detail: 'Complete your first practice session to generate continuous performance ribbons and benchmark trajectories.',
      badge: 'Getting Started',
      icon: Sparkles,
    };
  }

  const recent = history.slice(0, 5);
  const recentAvgWpm = Math.round(recent.reduce((sum, h) => sum + h.wpm, 0) / recent.length);
  const recentAvgAcc = Math.round((recent.reduce((sum, h) => sum + h.accuracy, 0) / recent.length) * 10) / 10;

  if (recentAvgAcc >= 98 && recentAvgWpm > stats.avgWpm) {
    return {
      headline: 'Exceptional flow and cadence',
      detail: `Your last ${recent.length} sessions averaged ${recentAvgWpm} WPM with ${recentAvgAcc}% keystroke accuracy. Muscle memory is locked in.`,
      badge: 'Peak Flow',
      icon: Flame,
    };
  }

  if (recentAvgAcc >= 98) {
    return {
      headline: 'Pristine keystroke precision',
      detail: `You maintained a steady ${recentAvgAcc}% accuracy across your recent runs. High accuracy creates the foundation for speed breakthroughs.`,
      badge: 'Precision Focus',
      icon: Target,
    };
  }

  if (stats.maxWpm >= 100) {
    return {
      headline: 'Triple-digit speed milestone',
      detail: `Your peak personal best stands at ${stats.maxWpm} WPM across ${history.length} completed sessions. Steady pacing maintains high consistency.`,
      badge: 'Speed Milestone',
      icon: Trophy,
    };
  }

  return {
    headline: 'Steady rhythmic momentum',
    detail: `You have completed ${history.length} typing sessions averaging ${stats.avgWpm} WPM. Keep your hands relaxed and let the keystrokes flow.`,
    badge: 'Consistent Habit',
    icon: TrendingUp,
  };
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onExport,
  onTriggerImport,
  onSwitchToTyping,
}) => {
  const { history, pbs, clearHistory, togglePinResult, getStats } = useHistoryStore();
  const { showThreadInHistory, threadStyle, threadThickness } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<TabMode>('flow');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<'all' | 'pbs' | 'pinned' | 'high-acc' | 'fast'>('all');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const stats = getStats();
  const practiceInsight = useMemo(() => getPracticeInsight(history, stats), [history, stats]);

  // Filtered dataset
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (filterMode !== 'all' && item.mode !== filterMode) return false;
      if (filterTag === 'pbs' && !item.isPb) return false;
      if (filterTag === 'pinned' && !item.pinned) return false;
      if (filterTag === 'high-acc' && item.accuracy < 98) return false;
      if (filterTag === 'fast' && item.wpm < 80) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const modeMatch = item.mode.toLowerCase().includes(q);
        const nameMatch = item.customName?.toLowerCase().includes(q);
        const lengthMatch = String(item.length || '').includes(q);
        if (!modeMatch && !nameMatch && !lengthMatch) return false;
      }

      return true;
    });
  }, [history, filterMode, filterTag, searchQuery]);

  // Chronological curve points
  const chartPoints = useMemo(() => {
    const list = [...history].reverse();
    return list.map((item, idx) => ({
      index: idx,
      wpm: item.wpm,
      accuracy: item.accuracy,
      consistency: item.consistency || 92,
      mode: item.mode,
      length: item.length,
      timestamp: item.createdAt,
      isPb: item.isPb,
      id: item.id,
      rawItem: item,
    }));
  }, [history]);

  const getThreadForItem = (item: TestResult): ThreadData => {
    return (
      item.thread ||
      generateThreadData(item, {
        style: threadStyle,
        thickness: threadThickness,
      })
    );
  };

  // Smooth SVG Bezier Trajectory
  const renderSmoothChart = () => {
    if (chartPoints.length < 2) {
      return (
        <div className="h-56 flex flex-col items-center justify-center text-center p-6" style={{ color: 'var(--sub)' }}>
          <Activity size={28} className="mb-2 opacity-50" />
          <p className="text-xs font-medium">Complete at least 2 sessions to render your continuous progression curve.</p>
        </div>
      );
    }

    const width = 800;
    const height = 230;
    const paddingX = 40;
    const paddingY = 28;

    const maxWpm = Math.max(...chartPoints.map((p) => p.wpm), 60);
    const minWpm = Math.max(0, Math.min(...chartPoints.map((p) => p.wpm)) - 10);
    const rangeWpm = maxWpm - minWpm || 1;

    const getX = (idx: number) => paddingX + (idx / (chartPoints.length - 1)) * (width - paddingX * 2);
    const getY = (wpm: number) => height - paddingY - ((wpm - minWpm) / rangeWpm) * (height - paddingY * 2);

    let pathD = `M ${getX(0)} ${getY(chartPoints[0].wpm)}`;
    for (let i = 0; i < chartPoints.length - 1; i++) {
      const x0 = getX(i);
      const y0 = getY(chartPoints[i].wpm);
      const x1 = getX(i + 1);
      const y1 = getY(chartPoints[i + 1].wpm);
      const cx = (x0 + x1) / 2;
      pathD += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }

    const areaD = `${pathD} L ${getX(chartPoints.length - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`;
    const activePoint = hoveredPointIndex !== null ? chartPoints[hoveredPointIndex] : null;

    return (
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-52 sm:h-60 overflow-visible"
          onMouseLeave={() => setHoveredPointIndex(null)}
        >
          <defs>
            <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>
            <filter id="historyGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="var(--accent)" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, i) => {
            const val = Math.round(minWpm + ratio * rangeWpm);
            const y = height - paddingY - ratio * (height - paddingY * 2);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                  strokeOpacity="0.6"
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  fill="var(--sub)"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          <path d={areaD} fill="url(#historyGradient)" />

          <path
            d={pathD}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#historyGlow)"
          />

          {chartPoints.map((point, idx) => {
            const cx = getX(idx);
            const cy = getY(point.wpm);
            const isHovered = hoveredPointIndex === idx;

            return (
              <g
                key={point.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPointIndex(idx)}
                onClick={() => setSelectedResult(point.rawItem)}
              >
                <circle cx={cx} cy={cy} r="14" fill="transparent" />
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6.5 : point.isPb ? 5 : 3.5}
                  fill={point.isPb ? 'var(--accent)' : 'var(--surface)'}
                  stroke={point.isPb ? '#ffffff' : 'var(--accent)'}
                  strokeWidth={isHovered ? 2.5 : 1.75}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {hoveredPointIndex !== null && (
            <line
              x1={getX(hoveredPointIndex)}
              y1={paddingY}
              x2={getX(hoveredPointIndex)}
              y2={height - paddingY}
              stroke="var(--accent)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}
        </svg>

        {activePoint && (
          <div
            className="absolute top-2 right-4 p-3 rounded-xl border shadow-lg backdrop-blur-xl flex flex-col gap-1 text-xs"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-sm text-[var(--accent)] font-mono">{activePoint.wpm} WPM</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--sub)]">
                {activePoint.mode} {activePoint.length || ''}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[var(--sub)] font-mono">
              <span>{activePoint.accuracy}% acc</span>
              <span>•</span>
              <span>{activePoint.consistency}% rhythm</span>
            </div>
            <span className="text-[10px] text-[var(--sub)] mt-0.5">{getHumanRelativeTime(activePoint.timestamp)}</span>
          </div>
        )}
      </div>
    );
  };

  const filterTabs = [
    { id: 'all', label: 'All Sessions', icon: Layers },
    { id: 'pbs', label: 'Personal Bests', icon: Trophy },
    { id: 'pinned', label: 'Pinned', icon: Pin },
    { id: 'high-acc', label: '98%+ Accuracy', icon: Target },
    { id: 'fast', label: '80+ WPM', icon: Zap },
  ] as const;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 animate-in fade-in duration-300 select-none">
      {/* 1. Top Header Card (Identical structure to Settings tab) */}
      <div
        className="p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-xs"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--accent)',
            }}
          >
            <History size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
                Session History & Analytics
              </h2>
              <span
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--accent)',
                }}
              >
                <Sparkles size={11} />
                {practiceInsight.badge}
              </span>
            </div>
            <p className="text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed" style={{ color: 'var(--sub)' }}>
              {practiceInsight.detail}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={onExport}
            className="px-3.5 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors hover:bg-[var(--surface-2)] cursor-pointer"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <Download size={14} />
            Export Backup
          </button>
          <button
            type="button"
            onClick={onTriggerImport}
            className="px-3.5 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors hover:bg-[var(--surface-2)] cursor-pointer"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <Upload size={14} />
            Import Backup
          </button>
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2 rounded-lg text-xs font-medium border text-red-400 hover:bg-red-500/10 border-red-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              Clear Records
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Metrics Card (Rounded-2xl container with rounded-xl children) */}
      <div
        className="p-6 rounded-2xl border flex flex-col gap-4 shadow-sm"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-2">
          <Activity size={18} style={{ color: 'var(--accent)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            Practice Performance Metrics
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            className="p-3.5 rounded-xl border flex flex-col justify-between"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--sub)' }}>Total Sessions</span>
              <Layers size={14} style={{ color: 'var(--sub)' }} />
            </div>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold" style={{ color: 'var(--text)' }}>
                {stats.totalTests}
              </span>
              <span className="text-xs" style={{ color: 'var(--sub)' }}>runs</span>
            </div>
          </div>

          <div
            className="p-3.5 rounded-xl border flex flex-col justify-between"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--sub)' }}>Average Pace</span>
              <Zap size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold" style={{ color: 'var(--accent)' }}>
                {stats.avgWpm}
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--sub)' }}>WPM</span>
            </div>
          </div>

          <div
            className="p-3.5 rounded-xl border flex flex-col justify-between"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--sub)' }}>Personal Peak</span>
              <Trophy size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold" style={{ color: 'var(--accent)' }}>
                {stats.maxWpm}
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--sub)' }}>WPM</span>
            </div>
          </div>

          <div
            className="p-3.5 rounded-xl border flex flex-col justify-between"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--sub)' }}>Keystroke Accuracy</span>
              <CheckCircle2 size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="mt-2.5 flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold" style={{ color: 'var(--text)' }}>
                {stats.avgAccuracy}
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--sub)' }}>%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Personal Bests Benchmarks Card */}
      <div
        className="p-6 rounded-2xl border flex flex-col gap-4 shadow-sm"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={18} style={{ color: 'var(--accent)' }} />
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
              Personal Bests & Sprint Benchmarks
            </h3>
          </div>
          <span className="text-xs font-mono" style={{ color: 'var(--sub)' }}>
            High-Score Records
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Words 25', mode: 'words-25', pb: pbs['words-25'] },
            { label: 'Words 50', mode: 'words-50', pb: pbs['words-50'] },
            { label: 'Time 15s', mode: 'time-15', pb: pbs['time-15'] },
            { label: 'Time 30s', mode: 'time-30', pb: pbs['time-30'] },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${
                item.pb ? 'border-[var(--accent)] bg-[var(--surface-2)] font-semibold' : 'opacity-60 border-[var(--border)]'
              }`}
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: item.pb ? 'var(--accent)' : 'var(--border)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: 'var(--sub)' }}>
                  {item.label}
                </span>
                {item.pb && <Trophy size={13} style={{ color: 'var(--accent)' }} />}
              </div>

              <div className="mt-2.5 flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-xl font-mono font-bold"
                    style={{ color: item.pb ? 'var(--accent)' : 'var(--sub)' }}
                  >
                    {item.pb ? item.pb.wpm : '-'}
                  </span>
                  {item.pb && <span className="text-[10px] font-mono text-[var(--sub)]">WPM</span>}
                </div>
                {item.pb && (
                  <span className="text-xs font-mono font-medium" style={{ color: 'var(--text)' }}>
                    {item.pb.accuracy}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Velocity Trajectory & Curve Card */}
      <div
        className="p-6 rounded-2xl border flex flex-col gap-4 shadow-sm"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
            <div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                Speed Trajectory & Continuous Curve
              </h3>
              <p className="text-xs text-[var(--sub)] mt-0.5">
                Inspect your live keystroke velocity progression and flow cadence.
              </p>
            </div>
          </div>

          {/* View Mode Switcher Pills (Matching Settings Pill Style) */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl border w-fit self-start sm:self-auto"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('flow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'flow'
                  ? 'bg-[var(--accent)] text-white font-semibold shadow-xs'
                  : 'text-[var(--sub)] hover:text-[var(--text)]'
              }`}
            >
              <Activity size={13} />
              Flow Cards
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'chart'
                  ? 'bg-[var(--accent)] text-white font-semibold shadow-xs'
                  : 'text-[var(--sub)] hover:text-[var(--text)]'
              }`}
            >
              <TrendingUp size={13} />
              Velocity Curve
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-[var(--accent)] text-white font-semibold shadow-xs'
                  : 'text-[var(--sub)] hover:text-[var(--text)]'
              }`}
            >
              <BarChart3 size={13} />
              Log Table
            </button>
          </div>
        </div>

        {/* Smooth Chart View */}
        {activeTab === 'chart' && (
          <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            {renderSmoothChart()}
          </div>
        )}
      </div>

      {/* 5. Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filterTabs.map((tag) => {
            const IconComponent = tag.icon;
            const isSelected = filterTag === tag.id;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => setFilterTag(tag.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)] font-semibold shadow-xs'
                    : 'bg-[var(--surface)] text-[var(--sub)] hover:text-[var(--text)] border-[var(--border)]'
                }`}
              >
                <IconComponent size={13} strokeWidth={isSelected ? 2.2 : 1.75} />
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Mode Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <Search size={14} style={{ color: 'var(--sub)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search runs..."
              className="bg-transparent outline-none w-28 sm:w-36 text-xs"
              style={{ color: 'var(--text)' }}
            />
          </div>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <ListFilter size={13} style={{ color: 'var(--sub)' }} />
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="bg-transparent outline-none text-xs font-medium cursor-pointer"
              style={{ color: 'var(--text)' }}
            >
              <option value="all" className="bg-[var(--surface)]">All Modes</option>
              <option value="words" className="bg-[var(--surface)]">Words</option>
              <option value="time" className="bg-[var(--surface)]">Time</option>
              <option value="quote" className="bg-[var(--surface)]">Quote</option>
              <option value="zen" className="bg-[var(--surface)]">Zen</option>
              <option value="custom" className="bg-[var(--surface)]">Custom</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. Main Session Content */}
      <AnimatePresence mode="wait">
        {filteredHistory.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-12 rounded-2xl border text-center flex flex-col items-center justify-center gap-3 shadow-sm"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center border mb-1 shadow-xs"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--accent)' }}
            >
              <Sparkles size={22} />
            </div>
            <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>
              No practice records match your filter.
            </p>
            <p className="text-xs text-[var(--sub)] max-w-sm leading-relaxed">
              {history.length === 0
                ? 'Begin your first typing session to craft living speed ribbons and build your personal records.'
                : 'Try adjusting your search query or switching filters to view other practice runs.'}
            </p>
            <button
              type="button"
              onClick={onSwitchToTyping}
              className="mt-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
            >
              Start Typing Now
            </button>
          </motion.div>
        ) : activeTab === 'table' ? (
          /* Table View */
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border overflow-hidden shadow-sm"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)', color: 'var(--sub)' }}>
                    <th className="py-3.5 px-4 font-semibold">Mode & Preset</th>
                    <th className="py-3.5 px-4 font-semibold">Speed (WPM)</th>
                    <th className="py-3.5 px-4 font-semibold">Accuracy</th>
                    <th className="py-3.5 px-4 font-semibold">Raw WPM</th>
                    <th className="py-3.5 px-4 font-semibold">Consistency</th>
                    <th className="py-3.5 px-4 font-semibold">Recorded</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {filteredHistory.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedResult(item)}
                      className="hover:bg-[var(--surface-2)] cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono capitalize flex items-center gap-2" style={{ color: 'var(--text)' }}>
                        {item.isPb && <Trophy size={14} style={{ color: 'var(--accent)' }} />}
                        <span>
                          {item.customName || `${item.mode} ${item.length ? `(${item.length})` : ''}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold" style={{ color: 'var(--accent)' }}>
                        {item.wpm}
                      </td>
                      <td className="py-3.5 px-4 font-mono" style={{ color: 'var(--text)' }}>
                        {item.accuracy}%
                      </td>
                      <td className="py-3.5 px-4 font-mono" style={{ color: 'var(--sub)' }}>
                        {item.rawWpm || item.wpm}
                      </td>
                      <td className="py-3.5 px-4 font-mono" style={{ color: 'var(--sub)' }}>
                        {item.consistency ? `${item.consistency}%` : '95%'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[var(--sub)]">
                        {getHumanRelativeTime(item.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePinResult(item.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            item.pinned ? 'text-[var(--accent)] bg-[var(--surface-2)]' : 'text-[var(--sub)] hover:text-[var(--text)]'
                          }`}
                        >
                          <Pin size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          /* Flow Cards Grid (with rounded-2xl and rounded-xl cards) */
          <motion.div
            key="flow-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {filteredHistory.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.2) }}
                onClick={() => setSelectedResult(item)}
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md group relative overflow-hidden ${
                  item.isPb ? 'border-[var(--accent)]' : ''
                }`}
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: item.isPb ? 'var(--accent)' : 'var(--border)',
                }}
              >
                {/* Top Row: Mode badge & relative time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--surface-2)',
                        borderColor: 'var(--border)',
                        color: 'var(--text)',
                      }}
                    >
                      {item.customName || `${item.mode} ${item.length || ''}`}
                    </span>
                    {item.isPb && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--accent)] text-white shadow-xs">
                        <Trophy size={11} />
                        PB
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--sub)] font-medium">
                      {getHumanRelativeTime(item.createdAt)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinResult(item.id);
                      }}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        item.pinned
                          ? 'text-[var(--accent)] bg-[var(--surface-2)]'
                          : 'text-[var(--sub)] hover:text-[var(--text)] opacity-0 group-hover:opacity-100'
                      }`}
                      title={item.pinned ? 'Unpin run' : 'Pin to favorites'}
                    >
                      <Pin size={13} />
                    </button>
                  </div>
                </div>

                {/* Living Rhythm Waveform Ribbon */}
                {showThreadInHistory && (
                  <div className="w-full h-10 overflow-hidden rounded-lg border px-2 flex items-center" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                    <LivingThread thread={getThreadForItem(item)} height={32} />
                  </div>
                )}

                {/* Bottom Stats Summary */}
                <div
                  className="flex items-baseline justify-between border-t pt-2.5"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-mono font-black tracking-tight" style={{ color: 'var(--accent)' }}>
                      {item.wpm}
                    </span>
                    <span className="text-xs font-mono font-bold text-[var(--sub)]">WPM</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono" style={{ color: 'var(--sub)' }}>
                    <span>{item.accuracy}% acc</span>
                    <span>•</span>
                    <span>{item.consistency || 95}% consistency</span>
                    <ChevronRight size={14} className="text-[var(--sub)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. Detailed Session Inspection Modal */}
      {selectedResult && (
        <ThreadDetailModal
          isOpen={Boolean(selectedResult)}
          onClose={() => setSelectedResult(null)}
          result={selectedResult}
        />
      )}

      {/* 8. Clear Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Practice Records"
        description="Are you sure you want to clear your historical practice sessions and benchmark records? This action cannot be undone."
        confirmLabel="Clear Records"
        isDestructive={true}
        onConfirm={() => {
          clearHistory();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};
