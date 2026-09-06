import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Download,
  Upload,
  Trash2,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  Keyboard,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { THEMES } from '../data/themes';
import { sound, SOUND_PROFILES } from '../engine/sound';
import { ThemeId, SoundProfileId, CaretStyle, CaretSpeed, Modifiers, ThreadStyle, ThreadThickness } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onTriggerImport: () => void;
}

const ALL_THEME_IDS: ThemeId[] = [
  'loom-dark',
  'midnight-thread',
  'paperloom',
  'ink-linen',
  'copper-thread',
  'forest-desk',
  'winter-paper',
  'evening-coffee',
  'old-library',
  'moss-stone',
  'blue-hour',
  'sunlit-paper',
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onTriggerImport,
}) => {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    largeText,
    setLargeText,
    reducedMotion,
    setReducedMotion,
    caretStyle,
    setCaretStyle,
    caretSpeed,
    setCaretSpeed,
    highContrast,
    setHighContrast,
    highlightCurrentWord,
    setHighlightCurrentWord,
    showLiveWpm,
    setShowLiveWpm,
    showLiveAccuracy,
    setShowLiveAccuracy,
    showLiveBurst,
    setShowLiveBurst,
    soundEnabled,
    setSoundEnabled,
    soundVolume,
    setSoundVolume,
    soundProfile,
    setSoundProfile,
    playErrorSound,
    setPlayErrorSound,
    playCompleteSound,
    setPlayCompleteSound,
    playPbSound,
    setPlayPbSound,
    modifiers,
    toggleModifier,
    threadStyle,
    setThreadStyle,
    threadThickness,
    setThreadThickness,
    liveThread,
    setLiveThread,
    threadResultsAnimation,
    setThreadResultsAnimation,
    showThreadInHistory,
    setShowThreadInHistory,
    resetSettings,
  } = useSettingsStore();

  const { clearHistory } = useHistoryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<
    'all' | 'threads' | 'appearance' | 'sound' | 'modifiers' | 'metrics' | 'shortcuts' | 'privacy'
  >('all');
  const [showResetSettingsConfirm, setShowResetSettingsConfirm] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);

  // Modifiers definition list for settings
  const modifierList: Array<{
    key: keyof Modifiers;
    label: string;
    desc: string;
  }> = [
    { key: 'punctuation', label: 'Punctuation', desc: 'Adds natural punctuation, quotes, and capitalized letters' },
    { key: 'numbers', label: 'Numbers', desc: 'Injects numbers throughout the target words' },
    { key: 'blind', label: 'Blind Mode', desc: 'Hides character state colors to build pure muscle memory' },
    { key: 'confidence', label: 'Confidence Mode', desc: 'Disables backspace crutch to encourage fluid forward momentum' },
    { key: 'strictSpace', label: 'Strict Space', desc: 'Spaces must match exactly; prevents skipping words' },
    { key: 'stopOnError', label: 'Stop on Error', desc: 'Locks cursor until the incorrect character is fixed' },
    { key: 'mirror', label: 'Mirror Words', desc: 'Mirrors internal letter sequence inside each word' },
    { key: 'reverseWords', label: 'Reverse Words', desc: 'Inverts sentence order of practice words' },
    { key: 'randomCase', label: 'Random Case', desc: 'Tests uppercase and lowercase shifting agility' },
  ];

  // Search filtering logic
  const filteredModifiers = useMemo(() => {
    if (!searchQuery) return modifierList;
    const q = searchQuery.toLowerCase();
    return modifierList.filter(
      (m) => m.label.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)
    );
  }, [searchQuery, modifierList]);

  if (!isOpen) return null;

  const matchesSearch = (text: string) => {
    if (!searchQuery) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const handlePreviewSound = (profileId: SoundProfileId) => {
    sound.setProfile(profileId);
    sound.playKeystroke(false);
  };

  const handlePreviewError = () => {
    sound.playError();
  };

  const handlePreviewCompletion = () => {
    sound.playCompletion();
  };

  return (
    <>
      <div
        id="settings-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          id="settings-dialog"
          className="w-full max-w-3xl h-[85vh] sm:h-[82vh] min-h-[540px] max-h-[92vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
          }}
        >
          {/* Header Bar */}
          <div
            className="flex items-center justify-between px-5 sm:px-6 py-4 border-b shrink-0"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
          >
            <div>
              <h2 className="font-semibold text-base tracking-tight leading-none">
                Preferences & Settings
              </h2>
              <p className="text-xs tracking-normal mt-0.5" style={{ color: 'var(--sub)' }}>
                Customize your typing loom environment
              </p>
            </div>

            {/* Search Input & Close */}
            <div className="flex items-center gap-3">
              <div
                className="flex items-center px-2.5 py-1.5 rounded-lg border text-xs"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <Search size={14} className="mr-2" style={{ color: 'var(--sub)' }} />
                <input
                  id="settings-search-input"
                  type="text"
                  placeholder="Search settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs outline-none w-32 sm:w-44 font-medium"
                  style={{ color: 'var(--text)' }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-0.5 hover:opacity-80"
                    style={{ color: 'var(--sub)' }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--sub)',
                }}
                aria-label="Close preferences modal"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Section Navigation Tabs - Constant & responsive with zero layout shift */}
          {!searchQuery && (
            <div
              className="flex items-center gap-1 border-b px-4 sm:px-6 pt-2.5 overflow-x-auto text-xs font-medium shrink-0 scrollbar-none"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
            >
              {[
                { id: 'all', label: 'All' },
                { id: 'threads', label: 'Living Thread (8 Styles)' },
                { id: 'appearance', label: 'Appearance & Themes' },
                { id: 'sound', label: 'Sound (12 Types)' },
                { id: 'modifiers', label: 'Modifiers' },
                { id: 'metrics', label: 'Live Metrics' },
                { id: 'shortcuts', label: 'Shortcuts' },
                { id: 'privacy', label: 'Privacy & Backup' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`shrink-0 pb-2.5 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id ? 'border-accent font-semibold' : 'border-transparent hover:opacity-80'
                  }`}
                  style={{
                    borderColor: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--accent)' : 'var(--sub)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Scrollable Settings Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-8 min-h-0 [scrollbar-gutter:stable]">
            {/* LIVING THREAD SECTION */}
            {(activeTab === 'all' || activeTab === 'threads') &&
              (matchesSearch('thread') ||
                matchesSearch('silk') ||
                matchesSearch('ink') ||
                matchesSearch('pencil') ||
                matchesSearch('ribbon') ||
                matchesSearch('typewriter') ||
                matchesSearch('wire') ||
                matchesSearch('paper') ||
                matchesSearch('fiber')) && (
                <section className="space-y-4">
                  <div className="border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sub)' }}>
                      Living Thread Customization
                    </h3>
                  </div>

                  {/* Thread Styles (8 Styles) */}
                  <div
                    className="p-4 rounded-xl border flex flex-col gap-3"
                    style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                  >
                    <div>
                      <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                        Thread Art Style (8 Distinct Aesthetics)
                      </span>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--sub)' }}>
                        Transforms your typing rhythm into an authentic, organic visual artifact.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'silk' as ThreadStyle, label: 'Silk', desc: 'Smooth organic fluid curve' },
                        { id: 'ink' as ThreadStyle, label: 'Ink', desc: 'Calligraphic stroke taper' },
                        { id: 'pencil' as ThreadStyle, label: 'Pencil', desc: 'Fine graphite double grain' },
                        { id: 'fiber' as ThreadStyle, label: 'Fiber', desc: 'Woven filament texture' },
                        { id: 'ribbon' as ThreadStyle, label: 'Ribbon', desc: 'Flowing translucent band' },
                        { id: 'typewriter' as ThreadStyle, label: 'Typewriter', desc: 'Stepped mechanical ticks' },
                        { id: 'wire' as ThreadStyle, label: 'Wire', desc: 'Clean crisp tension line' },
                        { id: 'paper' as ThreadStyle, label: 'Paper', desc: 'Subtle archival dashed grain' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setThreadStyle(item.id)}
                          className="p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all"
                          style={{
                            backgroundColor: threadStyle === item.id ? 'var(--surface)' : 'transparent',
                            borderColor: threadStyle === item.id ? 'var(--accent)' : 'var(--border)',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                              {item.label}
                            </span>
                            {threadStyle === item.id && (
                              <Check size={13} style={{ color: 'var(--accent)' }} />
                            )}
                          </div>
                          <span className="text-[10px] mt-1" style={{ color: 'var(--sub)' }}>
                            {item.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Thread Thickness */}
                  <div
                    className="p-4 rounded-xl border flex items-center justify-between"
                    style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                  >
                    <div>
                      <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                        Thread Weight
                      </span>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--sub)' }}>
                        Adjust stroke width of the generated visualization.
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {(['fine', 'regular', 'bold'] as ThreadThickness[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setThreadThickness(t)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                          style={{
                            backgroundColor: threadThickness === t ? 'var(--accent)' : 'var(--surface)',
                            color: threadThickness === t ? 'var(--bg)' : 'var(--sub)',
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Living Thread Toggles */}
                  <div
                    className="p-4 rounded-xl border flex flex-col divide-y gap-3"
                    style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                  >
                    {/* Live Thread indicator */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="font-semibold text-xs" style={{ color: 'var(--text)' }}>
                          Live Typing Thread
                        </span>
                        <p className="text-[11px]" style={{ color: 'var(--sub)' }}>
                          Subtly animates beneath the typing line during practice.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLiveThread(!liveThread)}
                        className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                          liveThread ? 'bg-accent' : 'bg-sub/30'
                        }`}
                        style={{ backgroundColor: liveThread ? 'var(--accent)' : 'var(--border)' }}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                            liveThread ? 'left-5' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Thread Results Animation */}
                    <div className="flex items-center justify-between pt-3">
                      <div>
                        <span className="font-semibold text-xs" style={{ color: 'var(--text)' }}>
                          Progressive Results Animation
                        </span>
                        <p className="text-[11px]" style={{ color: 'var(--sub)' }}>
                          Draws the completed thread progressively from start to finish on the results card.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setThreadResultsAnimation(!threadResultsAnimation)}
                        className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                          threadResultsAnimation ? 'bg-accent' : 'bg-sub/30'
                        }`}
                        style={{ backgroundColor: threadResultsAnimation ? 'var(--accent)' : 'var(--border)' }}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                            threadResultsAnimation ? 'left-5' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Show in History */}
                    <div className="flex items-center justify-between pt-3">
                      <div>
                        <span className="font-semibold text-xs" style={{ color: 'var(--text)' }}>
                          Miniature Threads in History
                        </span>
                        <p className="text-[11px]" style={{ color: 'var(--sub)' }}>
                          Renders miniature thread previews in the history table.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowThreadInHistory(!showThreadInHistory)}
                        className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                          showThreadInHistory ? 'bg-accent' : 'bg-sub/30'
                        }`}
                        style={{ backgroundColor: showThreadInHistory ? 'var(--accent)' : 'var(--border)' }}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                            showThreadInHistory ? 'left-5' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </section>
              )}
            {/* 1. APPEARANCE SECTION */}
            {(activeTab === 'all' || activeTab === 'appearance') &&
              (matchesSearch('theme') ||
                matchesSearch('font size') ||
                matchesSearch('caret') ||
                matchesSearch('contrast') ||
                matchesSearch('large text') ||
                matchesSearch('motion')) && (
                <section className="space-y-4">
                  <div className="border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sub)' }}>
                      Appearance & Palettes
                    </h3>
                  </div>

                  {/* 12 Themes Grid */}
                  {matchesSearch('theme') && (
                    <div
                      className="p-4 rounded-xl border flex flex-col gap-3"
                      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                            Color Palette ({ALL_THEME_IDS.length} Curated Themes)
                          </span>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--sub)' }}>
                            High-contrast, warm and cool balanced colorways.
                          </p>
                        </div>
                        <span className="text-xs font-mono font-medium" style={{ color: 'var(--accent)' }}>
                          {THEMES[theme]?.name}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {ALL_THEME_IDS.map((tId) => {
                          const th = THEMES[tId];
                          const isCurrent = theme === tId;
                          return (
                            <button
                              key={tId}
                              type="button"
                              onClick={() => setTheme(tId)}
                              className="p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all"
                              style={{
                                backgroundColor: th.bg,
                                borderColor: isCurrent ? th.accent : 'rgba(128,128,128,0.25)',
                                boxShadow: isCurrent ? `0 0 0 2px ${th.accent}` : 'none',
                              }}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-semibold text-xs truncate mr-1" style={{ color: th.text }}>
                                  {th.name}
                                </span>
                                <span
                                  className="w-3 h-3 rounded-full shrink-0 border"
                                  style={{
                                    backgroundColor: th.accent,
                                    borderColor: 'rgba(255,255,255,0.4)',
                                  }}
                                />
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <div
                                  className="h-2 rounded flex-1"
                                  style={{ backgroundColor: th.surface }}
                                />
                                <div
                                  className="h-2 rounded flex-1"
                                  style={{ backgroundColor: th.accent }}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Font Size Slider */}
                  {matchesSearch('font size') && (
                    <div
                      className="p-4 rounded-xl border flex flex-col gap-2"
                      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                            Typing Text Size
                          </span>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--sub)' }}>
                            Adjust monospace test font size for optimal eye comfort.
                          </p>
                        </div>
                        <span className="font-mono text-sm font-bold" style={{ color: 'var(--accent)' }}>
                          {fontSize}px
                        </span>
                      </div>
                      <input
                        id="font-size-slider"
                        type="range"
                        min={20}
                        max={44}
                        step={1}
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                        className="w-full accent-[var(--accent)] cursor-pointer"
                      />
                      <div
                        className="p-3 rounded-lg border font-mono-typeloom select-none text-center mt-1 text-sm sm:text-base font-normal"
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--border)',
                          color: 'var(--text)',
                        }}
                      >
                        the quick brown fox jumped over the quiet loom
                      </div>
                    </div>
                  )}

                  {/* Caret Style & Speed */}
                  {matchesSearch('caret') && (
                    <div
                      className="p-4 rounded-xl border space-y-4"
                      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                            Caret Style
                          </span>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--sub)' }}>
                            Visual shape of the typing cursor.
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {(['line', 'block', 'underline'] as CaretStyle[]).map((style) => (
                            <button
                              key={style}
                              type="button"
                              onClick={() => setCaretStyle(style)}
                              className="px-3 py-1.5 rounded-lg capitalize border text-xs transition-colors"
                              style={{
                                backgroundColor:
                                  caretStyle === style ? 'var(--surface)' : 'transparent',
                                borderColor:
                                  caretStyle === style ? 'var(--accent)' : 'var(--border)',
                                color: caretStyle === style ? 'var(--accent)' : 'var(--sub)',
                                fontWeight: caretStyle === style ? '600' : '400',
                              }}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                        <div>
                          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                            Caret Motion Speed
                          </span>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--sub)' }}>
                            Smooth spring physics, snappy, or instant cursor jump.
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {(['smooth', 'snappy', 'instant'] as CaretSpeed[]).map((speed) => (
                            <button
                              key={speed}
                              type="button"
                              onClick={() => setCaretSpeed(speed)}
                              className="px-3 py-1.5 rounded-lg capitalize border text-xs transition-colors"
                              style={{
                                backgroundColor:
                                  caretSpeed === speed ? 'var(--surface)' : 'transparent',
                                borderColor:
                                  caretSpeed === speed ? 'var(--accent)' : 'var(--border)',
                                color: caretSpeed === speed ? 'var(--accent)' : 'var(--sub)',
                                fontWeight: caretSpeed === speed ? '600' : '400',
                              }}
                            >
                              {speed}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Accessibility Toggles: High Contrast & Large Text */}
                  {(matchesSearch('contrast') || matchesSearch('large text') || matchesSearch('word')) && (
                    <div
                      className="p-4 rounded-xl border space-y-3"
                      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-sm">High Contrast Mode</span>
                          <p className="text-[11px]" style={{ color: 'var(--sub)' }}>
                            Enhances text and border sharpness for maximum legibility.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHighContrast(!highContrast)}
                          className="w-11 h-6 rounded-full transition-colors relative border p-0.5"
                          style={{
                            backgroundColor: highContrast ? 'var(--accent)' : 'var(--surface)',
                            borderColor: 'var(--border)',
                          }}
                        >
                          <span
                            className="block w-4 h-4 rounded-full transition-transform"
                            style={{
                              backgroundColor: highContrast ? 'var(--bg)' : 'var(--sub)',
                              transform: highContrast ? 'translateX(20px)' : 'translateX(0)',
                            }}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                        <div>
                          <span className="font-semibold text-sm">Highlight Active Word</span>
                          <p className="text-[11px]" style={{ color: 'var(--sub)' }}>
                            Subtle background glow beneath the word currently being typed.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHighlightCurrentWord(!highlightCurrentWord)}
                          className="w-11 h-6 rounded-full transition-colors relative border p-0.5"
                          style={{
                            backgroundColor: highlightCurrentWord ? 'var(--accent)' : 'var(--surface)',
                            borderColor: 'var(--border)',
                          }}
                        >
                          <span
                            className="block w-4 h-4 rounded-full transition-transform"
                            style={{
                              backgroundColor: highlightCurrentWord ? 'var(--bg)' : 'var(--sub)',
                              transform: highlightCurrentWord ? 'translateX(20px)' : 'translateX(0)',
                            }}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                        <div>
                          <span className="font-semibold text-sm">Reduced Motion</span>
                          <p className="text-[11px]" style={{ color: 'var(--sub)' }}>
                            Disables spring animations for instant transitions.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReducedMotion(!reducedMotion)}
                          className="w-11 h-6 rounded-full transition-colors relative border p-0.5"
                          style={{
                            backgroundColor: reducedMotion ? 'var(--accent)' : 'var(--surface)',
                            borderColor: 'var(--border)',
                          }}
                        >
                          <span
                            className="block w-4 h-4 rounded-full transition-transform"
                            style={{
                              backgroundColor: reducedMotion ? 'var(--bg)' : 'var(--sub)',
                              transform: reducedMotion ? 'translateX(20px)' : 'translateX(0)',
                            }}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              )}

            {/* 2. SOUND SECTION */}
            {(activeTab === 'all' || activeTab === 'sound') &&
              (matchesSearch('sound') || matchesSearch('audio') || matchesSearch('volume')) && (
                <section className="space-y-4">
                  <div className="border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sub)' }}>
                      Acoustic & Tactile Sound Profiles
                    </h3>
                  </div>

                  {/* Sound Master Toggle */}
                  <div
                    className="p-4 rounded-xl border flex items-center justify-between"
                    style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                  >
                    <div>
                      <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                        Procedural Keyboard Audio
                      </span>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--sub)' }}>
                        Web Audio API frequency synthesis. 100% offline, zero audio file downloads.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="w-11 h-6 rounded-full transition-colors relative border p-0.5"
                      style={{
                        backgroundColor: soundEnabled ? 'var(--accent)' : 'var(--surface)',
                        borderColor: 'var(--border)',
                      }}
                      aria-label="Toggle sound"
                    >
                      <span
                        className="block w-4 h-4 rounded-full transition-transform"
                        style={{
                          backgroundColor: soundEnabled ? 'var(--bg)' : 'var(--sub)',
                          transform: soundEnabled ? 'translateX(20px)' : 'translateX(0)',
                        }}
                      />
                    </button>
                  </div>

                  {/* Sound Profiles (12 types) */}
                  {soundEnabled && (
                    <div
                      className="p-4 rounded-xl border space-y-3"
                      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-sm">
                            Switch Acoustic Profiles ({SOUND_PROFILES.length} Options)
                          </span>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--sub)' }}>
                            Select the mechanical or natural timber of your keystrokes.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePreviewSound(soundProfile)}
                          className="px-2.5 py-1 rounded-md border text-xs font-medium flex items-center gap-1 hover:opacity-80"
                          style={{
                            backgroundColor: 'var(--surface)',
                            borderColor: 'var(--border)',
                            color: 'var(--accent)',
                          }}
                        >
                          <Play size={12} />
                          <span>Test Current</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {SOUND_PROFILES.map((prof) => {
                          const isCurrent = soundProfile === prof.id;
                          return (
                            <div
                              key={prof.id}
                              onClick={() => {
                                setSoundProfile(prof.id);
                                handlePreviewSound(prof.id);
                              }}
                              className="p-2.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between"
                              style={{
                                backgroundColor: isCurrent ? 'var(--surface)' : 'transparent',
                                borderColor: isCurrent ? 'var(--accent)' : 'var(--border)',
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span
                                  className="font-semibold text-xs truncate"
                                  style={{ color: isCurrent ? 'var(--accent)' : 'var(--text)' }}
                                >
                                  {prof.name}
                                </span>
                                {isCurrent && (
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: 'var(--accent)' }}
                                  />
                                )}
                              </div>
                              <p className="text-[10px] leading-tight" style={{ color: 'var(--sub)' }}>
                                {prof.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Volume Slider & Audio Cue Toggles */}
                  {soundEnabled && (
                    <div
                      className="p-4 rounded-xl border space-y-4"
                      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-sm">Volume</span>
                          <span className="font-mono text-sm font-bold" style={{ color: 'var(--accent)' }}>
                            {Math.round(soundVolume * 100)}%
                          </span>
                        </div>
                        <input
                          id="sound-volume-slider"
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={soundVolume}
                          onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                          className="w-full accent-[var(--accent)] cursor-pointer"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t text-xs" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={handlePreviewError}
                              title="Audition Error Buzz"
                              className="p-1 rounded hover:opacity-80 transition-opacity"
                              style={{ color: 'var(--accent)' }}
                            >
                              <Play size={11} />
                            </button>
                            <span>Error Buzz</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPlayErrorSound(!playErrorSound)}
                            className="w-9 h-5 rounded-full relative border p-0.5"
                            style={{
                              backgroundColor: playErrorSound ? 'var(--accent)' : 'var(--surface)',
                              borderColor: 'var(--border)',
                            }}
                          >
                            <span
                              className="block w-3.5 h-3.5 rounded-full transition-transform"
                              style={{
                                backgroundColor: playErrorSound ? 'var(--bg)' : 'var(--sub)',
                                transform: playErrorSound ? 'translateX(16px)' : 'translateX(0)',
                              }}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={handlePreviewCompletion}
                              title="Audition Completion Chime"
                              className="p-1 rounded hover:opacity-80 transition-opacity"
                              style={{ color: 'var(--accent)' }}
                            >
                              <Play size={11} />
                            </button>
                            <span>Completion Chime</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPlayCompleteSound(!playCompleteSound)}
                            className="w-9 h-5 rounded-full relative border p-0.5"
                            style={{
                              backgroundColor: playCompleteSound ? 'var(--accent)' : 'var(--surface)',
                              borderColor: 'var(--border)',
                            }}
                          >
                            <span
                              className="block w-3.5 h-3.5 rounded-full transition-transform"
                              style={{
                                backgroundColor: playCompleteSound ? 'var(--bg)' : 'var(--sub)',
                                transform: playCompleteSound ? 'translateX(16px)' : 'translateX(0)',
                              }}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
                          <span>Personal Best Chime</span>
                          <button
                            type="button"
                            onClick={() => setPlayPbSound(!playPbSound)}
                            className="w-9 h-5 rounded-full relative border p-0.5"
                            style={{
                              backgroundColor: playPbSound ? 'var(--accent)' : 'var(--surface)',
                              borderColor: 'var(--border)',
                            }}
                          >
                            <span
                              className="block w-3.5 h-3.5 rounded-full transition-transform"
                              style={{
                                backgroundColor: playPbSound ? 'var(--bg)' : 'var(--sub)',
                                transform: playPbSound ? 'translateX(16px)' : 'translateX(0)',
                              }}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )}

            {/* 3. MODIFIERS SECTION */}
            {(activeTab === 'all' || activeTab === 'modifiers') && (
              <section className="space-y-4">
                <div className="border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sub)' }}>
                    Practice Modifiers ({filteredModifiers.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {filteredModifiers.map((mod) => {
                    const isActive = Boolean(modifiers?.[mod.key]);
                    return (
                      <div
                        key={mod.key}
                        className="p-3.5 rounded-xl border flex items-start justify-between gap-3 transition-colors"
                        style={{
                          backgroundColor: 'var(--surface-2)',
                          borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                        }}
                      >
                        <div>
                          <span className="font-semibold text-sm" style={{ color: isActive ? 'var(--accent)' : 'var(--text)' }}>
                            {mod.label}
                          </span>
                          <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--sub)' }}>
                            {mod.desc}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleModifier(mod.key)}
                          className="w-10 h-5 rounded-full transition-colors relative border p-0.5 shrink-0 mt-0.5"
                          style={{
                            backgroundColor: isActive ? 'var(--accent)' : 'var(--surface)',
                            borderColor: 'var(--border)',
                          }}
                          aria-label={`Toggle ${mod.label}`}
                        >
                          <span
                            className="block w-3.5 h-3.5 rounded-full transition-transform"
                            style={{
                              backgroundColor: isActive ? 'var(--bg)' : 'var(--sub)',
                              transform: isActive ? 'translateX(18px)' : 'translateX(0)',
                            }}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 4. LIVE METRICS SECTION */}
            {(activeTab === 'all' || activeTab === 'metrics') && (
              <section className="space-y-4">
                <div className="border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sub)' }}>
                    In-Run Live Feedback
                  </h3>
                </div>

                <div
                  className="p-4 rounded-xl border space-y-3"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm">Live WPM Counter</span>
                      <p className="text-[11px]" style={{ color: 'var(--sub)' }}>
                        Displays real-time speed in the top-left stats ribbon during typing.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLiveWpm(!showLiveWpm)}
                      className="w-11 h-6 rounded-full relative border p-0.5 transition-colors"
                      style={{
                        backgroundColor: showLiveWpm ? 'var(--accent)' : 'var(--surface)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <span
                        className="block w-4 h-4 rounded-full transition-transform"
                        style={{
                          backgroundColor: showLiveWpm ? 'var(--bg)' : 'var(--sub)',
                          transform: showLiveWpm ? 'translateX(20px)' : 'translateX(0)',
                        }}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <span className="font-semibold text-sm">Live Accuracy Percentage</span>
                      <p className="text-[11px]" style={{ color: 'var(--sub)' }}>
                        Displays real-time accuracy percentage as you type.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLiveAccuracy(!showLiveAccuracy)}
                      className="w-11 h-6 rounded-full relative border p-0.5 transition-colors"
                      style={{
                        backgroundColor: showLiveAccuracy ? 'var(--accent)' : 'var(--surface)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <span
                        className="block w-4 h-4 rounded-full transition-transform"
                        style={{
                          backgroundColor: showLiveAccuracy ? 'var(--bg)' : 'var(--sub)',
                          transform: showLiveAccuracy ? 'translateX(20px)' : 'translateX(0)',
                        }}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <span className="font-semibold text-sm">Live Burst WPM</span>
                      <p className="text-[11px]" style={{ color: 'var(--sub)' }}>
                        Calculates instantaneous speed on your current word.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLiveBurst(!showLiveBurst)}
                      className="w-11 h-6 rounded-full relative border p-0.5 transition-colors"
                      style={{
                        backgroundColor: showLiveBurst ? 'var(--accent)' : 'var(--surface)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <span
                        className="block w-4 h-4 rounded-full transition-transform"
                        style={{
                          backgroundColor: showLiveBurst ? 'var(--bg)' : 'var(--sub)',
                          transform: showLiveBurst ? 'translateX(20px)' : 'translateX(0)',
                        }}
                      />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* 5. SHORTCUTS SECTION */}
            {(activeTab === 'all' || activeTab === 'shortcuts') && (
              <section className="space-y-4">
                <div className="border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sub)' }}>
                    Keyboard Shortcuts Cheatsheet
                  </h3>
                </div>

                <div
                  className="p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center justify-between p-2 rounded border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                    <span style={{ color: 'var(--sub)' }}>Restart Active Run</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--accent)' }}>
                      Tab + Enter
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                    <span style={{ color: 'var(--sub)' }}>Quick Restart / Retry</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--accent)' }}>
                      Shift + Enter
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                    <span style={{ color: 'var(--sub)' }}>Close Modal / Esc</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--accent)' }}>
                      Escape
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                    <span style={{ color: 'var(--sub)' }}>Focus / Refocus Typing</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--accent)' }}>
                      Any key / Click
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* 6. PRIVACY & BACKUP SECTION */}
            {(activeTab === 'all' || activeTab === 'privacy') && (
              <section className="space-y-4">
                <div className="border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sub)' }}>
                    Local Privacy & Backup
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Privacy Banner */}
                  <div
                    className="p-4 rounded-xl border flex items-start gap-3 leading-relaxed"
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">
                        Zero servers, zero trackers, 100% local persistence.
                      </p>
                      <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--sub)' }}>
                        All your typing history, personal bests, local user profiles, and configuration
                        remain strictly inside this browser. You can export a JSON backup anytime or
                        import it on another device.
                      </p>
                    </div>
                  </div>

                  {/* Export & Import Actions */}
                  <div
                    className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3"
                    style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                  >
                    <div>
                      <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                        Backup & Restore Data
                      </span>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--sub)' }}>
                        Export your full accounts, test history, and settings to a JSON file.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onExport}
                        className="px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors hover:opacity-80"
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--border)',
                          color: 'var(--text)',
                        }}
                      >
                        <Download size={14} />
                        <span>Export Backup</span>
                      </button>

                      <button
                        type="button"
                        onClick={onTriggerImport}
                        className="px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors hover:opacity-80"
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--border)',
                          color: 'var(--text)',
                        }}
                      >
                        <Upload size={14} />
                        <span>Import Backup</span>
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div
                    className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3"
                    style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                  >
                    <div>
                      <span className="font-semibold text-sm" style={{ color: 'var(--error)' }}>
                        Reset Data
                      </span>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--sub)' }}>
                        Restore defaults or wipe practice records.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowResetSettingsConfirm(true)}
                        className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:opacity-80"
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: 'var(--border)',
                          color: 'var(--sub)',
                        }}
                      >
                        Reset settings
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowClearHistoryConfirm(true)}
                        className="px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors hover:opacity-80"
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: 'var(--border)',
                          color: 'var(--error)',
                        }}
                      >
                        <Trash2 size={14} />
                        <span>Delete all history</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showResetSettingsConfirm}
        title="Reset all settings?"
        description="This will restore all font sizes, themes, sound options, and modifiers to their default values. Your test history and user profiles will remain safe."
        confirmLabel="Reset settings"
        onConfirm={resetSettings}
        onCancel={() => setShowResetSettingsConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showClearHistoryConfirm}
        title="Delete all history?"
        description="This will permanently wipe all practice records and personal bests from this device. Consider downloading an export backup first."
        confirmLabel="Delete all history"
        isDestructive={true}
        onConfirm={clearHistory}
        onCancel={() => setShowClearHistoryConfirm(false)}
      />
    </>
  );
};
