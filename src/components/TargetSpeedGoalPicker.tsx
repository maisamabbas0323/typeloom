import React from 'react';
import {
  Minus,
  Plus,
  Target,
  Feather,
  Coffee,
  Zap,
  Flame,
  Rocket,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { sound } from '../engine/sound';

interface TargetSpeedGoalPickerProps {
  value: number;
  onChange: (value: number) => void;
  compact?: boolean;
}

interface SpeedTier {
  min: number;
  max: number;
  title: string;
  badge: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  tagline: string;
  comparison: string;
}

const SPEED_TIERS: SpeedTier[] = [
  {
    min: 30,
    max: 45,
    title: 'Mindful Foundation',
    badge: 'Beginner Flow',
    icon: Feather,
    tagline: 'Focus on zero-error posture and relaxed fingers. Pure rhythm precedes speed.',
    comparison: '~175 words per 5 min • Ideal for calm, zero-backspace touch typing',
  },
  {
    min: 46,
    max: 65,
    title: 'Fluent Conversationalist',
    badge: 'Casual Typist',
    icon: Coffee,
    tagline: 'Matches the pace of everyday spoken thoughts. Great for drafting and notes.',
    comparison: '~275 words per 5 min • Faster than 50% of everyday keyboard users',
  },
  {
    min: 66,
    max: 85,
    title: 'Swift Velocity',
    badge: 'Fluent Touch Typist',
    icon: Zap,
    tagline: 'Direct brain-to-screen bandwidth with minimal cognitive friction.',
    comparison: '~380 words per 5 min • Faster than 75% of writers and programmers',
  },
  {
    min: 86,
    max: 105,
    title: 'Power Artisan',
    badge: 'High-Efficiency Pro',
    icon: Flame,
    tagline: 'Effortless burst speed and high-throughput muscle memory.',
    comparison: '~480 words per 5 min • Top 10% typing velocity worldwide',
  },
  {
    min: 106,
    max: 125,
    title: 'Triple-Digit Virtuoso',
    badge: 'Elite Master',
    icon: Target,
    tagline: 'Millisecond reflex arcs. Words materialize in fluid bursts of cadence.',
    comparison: '~580 words per 5 min • Top 2% global benchmark echelon',
  },
  {
    min: 126,
    max: 240,
    title: 'Supersonic Prodigy',
    badge: 'Legendary Maestro',
    icon: Rocket,
    tagline: 'Peak mechanical mastery. Turning keystrokes into effortless music.',
    comparison: '~700+ words per 5 min • Rarified competitive keyboard echelon',
  },
];

const PRESETS = [
  { wpm: 45, label: 'Casual', icon: Feather },
  { wpm: 60, label: 'Fluent', icon: Coffee },
  { wpm: 80, label: 'Speed', icon: Zap },
  { wpm: 100, label: 'Pro', icon: Flame },
  { wpm: 120, label: 'Master', icon: Target },
];

export const TargetSpeedGoalPicker: React.FC<TargetSpeedGoalPickerProps> = ({
  value,
  onChange,
  compact = false,
}) => {
  const currentWpm = Math.max(30, Math.min(220, value || 70));

  const currentTier =
    SPEED_TIERS.find((t) => currentWpm >= t.min && currentWpm <= t.max) ||
    SPEED_TIERS[SPEED_TIERS.length - 1];

  const TierIcon = currentTier.icon;

  const updateSpeed = (newVal: number) => {
    const clamped = Math.max(30, Math.min(220, newVal));
    sound.unlockAudio();
    sound.playKeystroke(false, false);
    onChange(clamped);
  };

  const adjustBy = (delta: number) => {
    updateSpeed(currentWpm + delta);
  };

  return (
    <div
      id="humanized-target-speed-goal"
      className="p-3 sm:p-4 rounded-xl border transition-all space-y-3 sm:space-y-3.5 select-none w-full"
      style={{
        backgroundColor: 'var(--surface-2)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Top Header with Humanized Tier Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-xs shrink-0"
            style={{ backgroundColor: 'var(--surface)', color: 'var(--accent)' }}
          >
            <TierIcon size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold flex items-center gap-1.5 truncate" style={{ color: 'var(--text)' }}>
              <span>Target Speed Goal</span>
            </div>
            <p className="text-[11px] font-medium truncate" style={{ color: 'var(--sub)' }}>
              {currentTier.title} • <span style={{ color: 'var(--accent)' }}>{currentTier.badge}</span>
            </p>
          </div>
        </div>

        {/* Large Tactile Display */}
        <div
          className="px-2.5 sm:px-3 py-1 rounded-lg border font-mono flex items-baseline gap-1 shrink-0"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--accent)',
          }}
        >
          <span className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--accent)' }}>
            {currentWpm}
          </span>
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider" style={{ color: 'var(--sub)' }}>
            WPM
          </span>
        </div>
      </div>

      {/* Stepped Increment / Decrement Controls & Responsive Slider */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => adjustBy(-5)}
            className="px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all hover:opacity-80 active:scale-95 cursor-pointer min-h-[36px] flex items-center justify-center"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--sub)',
            }}
            title="Decrease speed goal by 5 WPM"
            aria-label="Decrease speed goal by 5 WPM"
          >
            -5
          </button>
          <button
            type="button"
            onClick={() => adjustBy(-1)}
            className="p-2 rounded-lg border transition-all hover:opacity-80 active:scale-95 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--sub)',
            }}
            title="Decrease speed goal by 1 WPM"
            aria-label="Decrease speed goal by 1 WPM"
          >
            <Minus size={15} />
          </button>
        </div>

        {/* Responsive Interactive Slider */}
        <div className="flex-1 px-1 sm:px-2 min-w-0">
          <input
            id="target-wpm-range-slider"
            type="range"
            min={30}
            max={180}
            step={5}
            value={currentWpm}
            onChange={(e) => updateSpeed(Number(e.target.value))}
            className="w-full accent-[var(--accent)] cursor-pointer h-2 bg-transparent"
            aria-label="Adjust target speed goal"
          />
          <div className="flex justify-between text-[10px] font-mono mt-1 px-0.5" style={{ color: 'var(--sub)' }}>
            <span>30</span>
            <span className="hidden sm:inline">60</span>
            <span>90</span>
            <span className="hidden sm:inline">120</span>
            <span>150</span>
            <span>180+</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => adjustBy(1)}
            className="p-2 rounded-lg border transition-all hover:opacity-80 active:scale-95 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--sub)',
            }}
            title="Increase speed goal by 1 WPM"
            aria-label="Increase speed goal by 1 WPM"
          >
            <Plus size={15} />
          </button>
          <button
            type="button"
            onClick={() => adjustBy(5)}
            className="px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all hover:opacity-80 active:scale-95 cursor-pointer min-h-[36px] flex items-center justify-center"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--sub)',
            }}
            title="Increase speed goal by 5 WPM"
            aria-label="Increase speed goal by 5 WPM"
          >
            +5
          </button>
        </div>
      </div>

      {/* Humanized Quick Preset Milestone Chips */}
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pt-1 scrollbar-none">
        {PRESETS.map((preset) => {
          const isActive = currentWpm === preset.wpm;
          const PresetIcon = preset.icon;
          return (
            <button
              key={preset.wpm}
              type="button"
              onClick={() => updateSpeed(preset.wpm)}
              className="flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer active:scale-95"
              style={{
                backgroundColor: isActive ? 'var(--surface)' : 'transparent',
                borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                color: isActive ? 'var(--accent)' : 'var(--sub)',
                fontWeight: isActive ? '600' : '400',
              }}
            >
              <PresetIcon size={12} />
              <span className="font-mono">{preset.wpm}</span>
              <span className="hidden sm:inline text-[10px]">{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* Humanized Context & Encouragement Narrative */}
      {!compact && (
        <div
          className="p-3 rounded-lg text-[11px] leading-relaxed transition-all border"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--sub)',
          }}
        >
          <div className="flex items-start gap-2.5">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: 'var(--surface-2)', color: 'var(--accent)' }}
            >
              <TierIcon size={14} />
            </div>
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="font-medium text-xs leading-snug" style={{ color: 'var(--text)' }}>
                {currentTier.tagline}
              </p>
              <p className="text-[10px] font-mono" style={{ color: 'var(--sub)' }}>
                {currentTier.comparison}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
