import React, { useId } from 'react';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  EyeOff,
  ShieldAlert,
  Space,
  Ban,
  FlipHorizontal,
  ArrowLeftRight,
  Type,
  Binary,
  Sparkles,
} from 'lucide-react';
import { useSettingsStore, DEFAULT_MODIFIERS } from '../store/useSettingsStore';
import { Modifiers } from '../types';

interface ModifierPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ModifierItem {
  key: keyof Modifiers;
  label: string;
  tagline: string;
  icon: React.ReactNode;
  category: 'core' | 'focus' | 'twists';
}

const MODIFIER_ITEMS: ModifierItem[] = [
  // CORE
  {
    key: 'punctuation',
    label: 'Punctuation',
    tagline: 'Weaves commas, periods, hyphens, and quotes into sentences',
    icon: <Type size={16} />,
    category: 'core',
  },
  {
    key: 'numbers',
    label: 'Numbers',
    tagline: 'Intersperses numbers (0-9) to train top-row reach',
    icon: <Binary size={16} />,
    category: 'core',
  },

  // FOCUS
  {
    key: 'blind',
    label: 'Blind Mode',
    tagline: 'Hides error red-lines while typing; see true flow at the end',
    icon: <EyeOff size={16} />,
    category: 'focus',
  },
  {
    key: 'confidence',
    label: 'Confidence',
    tagline: 'Disables backspacing to train steady forward momentum',
    icon: <ShieldAlert size={16} />,
    category: 'focus',
  },
  {
    key: 'strictSpace',
    label: 'Strict Space',
    tagline: 'Forces exact spacebar timing between completed words',
    icon: <Space size={16} />,
    category: 'focus',
  },
  {
    key: 'stopOnError',
    label: 'Stop on Error',
    tagline: 'Pauses input until the incorrect character is corrected',
    icon: <Ban size={16} />,
    category: 'focus',
  },

  // TWISTS
  {
    key: 'mirror',
    label: 'Mirror Words',
    tagline: 'Inverts letter order inside every word (e.g. loom → mool)',
    icon: <FlipHorizontal size={16} />,
    category: 'twists',
  },
  {
    key: 'reverseWords',
    label: 'Reverse Order',
    tagline: 'Reverses overall word sequence across the sentence',
    icon: <ArrowLeftRight size={16} />,
    category: 'twists',
  },
  {
    key: 'randomCase',
    label: 'Random Case',
    tagline: 'Mixes uppercase and lowercase letters for shift-key agility',
    icon: <Sparkles size={16} />,
    category: 'twists',
  },
];

export const ModifierPanel: React.FC<ModifierPanelProps> = ({ isOpen, onClose }) => {
  const { modifiers: rawModifiers, toggleModifier, clearModifiers } = useSettingsStore();
  const modifiers: Modifiers = rawModifiers || DEFAULT_MODIFIERS;
  const headingId = useId();

  if (!isOpen) return null;

  const activeCount = Object.values(modifiers).filter(Boolean).length;

  const renderGroup = (
    title: string,
    subtitle: string,
    category: 'core' | 'focus' | 'twists'
  ) => {
    const items = MODIFIER_ITEMS.filter((item) => item.category === category);

    return (
      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text">{title}</h3>
            <span className="text-[11px]" style={{ color: 'var(--sub)' }}>
              {subtitle}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {items.map((item) => {
            const isActive = modifiers[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleModifier(item.key)}
                className={`p-3 rounded-lg border text-left transition-all flex items-start justify-between gap-3 ${
                  isActive ? 'ring-1 ring-accent' : 'hover:opacity-90'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--surface-2)' : 'var(--surface)',
                  borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                }}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="p-1.5 rounded-md mt-0.5"
                    style={{
                      backgroundColor: isActive ? 'var(--surface)' : 'var(--surface-2)',
                      color: isActive ? 'var(--accent)' : 'var(--sub)',
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-xs font-semibold block" style={{ color: 'var(--text)' }}>
                      {item.label}
                    </span>
                    <p className="text-[11px] leading-snug mt-0.5" style={{ color: 'var(--sub)' }}>
                      {item.tagline}
                    </p>
                  </div>
                </div>

                <div
                  className="w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors mt-0.5"
                  style={{
                    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                    borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  {isActive && <Check size={11} color="#ffffff" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 sm:px-6 py-4 border-b"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--accent)',
              }}
            >
              <SlidersHorizontal size={16} />
            </div>
            <div>
              <h2 id={headingId} className="font-semibold text-base tracking-tight leading-none">
                Shape Your Run
              </h2>
              <p className="text-xs tracking-normal mt-0.5" style={{ color: 'var(--sub)' }}>
                {activeCount > 0 ? `${activeCount} active modifiers` : 'Standard pure text run'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearModifiers}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 hover:opacity-80 transition-colors"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--sub)',
                }}
                title="Turn off all modifiers"
              >
                <RotateCcw size={12} />
                <span>Reset All</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border transition-colors hover:opacity-80"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--surface)',
                color: 'var(--sub)',
              }}
              title="Close dialog (Esc)"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Groups */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {renderGroup('Core Mechanics', 'Essential typing fundamentals', 'core')}
          {renderGroup('Focus & Discipline', 'Mental training for accuracy and posture', 'focus')}
          {renderGroup('Twists & Gymnastics', 'Agility challenges for neuroplasticity', 'twists')}
        </div>

        {/* Footer */}
        <div
          className="px-5 sm:px-6 py-3.5 border-t flex items-center justify-between text-xs"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}
        >
          <span style={{ color: 'var(--sub)' }}>
            Modifiers apply immediately to your next typing test.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Apply & Ready
          </button>
        </div>
      </div>
    </div>
  );
};
