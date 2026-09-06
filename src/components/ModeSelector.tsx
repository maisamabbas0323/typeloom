import React from 'react';
import {
  Keyboard,
  Timer,
  Quote,
  FileText,
  SlidersHorizontal,
  X,
  Binary,
  AtSign,
} from 'lucide-react';
import { useSettingsStore, DEFAULT_MODIFIERS } from '../store/useSettingsStore';
import { Modifiers, QuoteLength, TestMode, TimeDuration, WordCount } from '../types';

interface ModeSelectorProps {
  onSelectModeChange: () => void;
  onOpenCustomModal: () => void;
  onOpenModifierPanel: () => void;
  isTyping: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  onSelectModeChange,
  onOpenCustomModal,
  onOpenModifierPanel,
  isTyping,
}) => {
  const {
    mode,
    setMode,
    wordCount,
    setWordCount,
    timeDuration,
    setTimeDuration,
    quoteLength,
    setQuoteLength,
    modifiers: rawModifiers,
    toggleModifier,
  } = useSettingsStore();

  const modifiers: Modifiers = rawModifiers || DEFAULT_MODIFIERS;

  const wordCounts: WordCount[] = [10, 25, 50, 100];
  const timeDurations: TimeDuration[] = [15, 30, 60, 120];
  const quoteLengths: QuoteLength[] = ['short', 'medium', 'long'];

  const handleModeClick = (newMode: TestMode) => {
    if (newMode === 'custom') {
      onOpenCustomModal();
    }
    setMode(newMode);
    onSelectModeChange();
  };

  const modifierLabels: Record<keyof Modifiers, string> = {
    punctuation: 'Punctuation',
    numbers: 'Numbers',
    blind: 'Blind',
    confidence: 'Confidence',
    strictSpace: 'Strict Space',
    stopOnError: 'Stop on Error',
    mirror: 'Mirror',
    reverseWords: 'Reverse Words',
    randomCase: 'Random Case',
  };

  // Modifiers that aren't the primary punctuation/numbers
  const specialActiveModifiers = (Object.keys(modifiers) as Array<keyof Modifiers>).filter(
    (k) => modifiers[k] && k !== 'punctuation' && k !== 'numbers'
  );

  const totalActiveModifiers = (Object.keys(modifiers) as Array<keyof Modifiers>).filter(
    (k) => modifiers[k]
  ).length;

  return (
    <div
      id="mode-selector-bar"
      className={`w-full max-w-5xl mx-auto px-3 sm:px-6 mb-6 transition-opacity duration-300 select-none ${
        isTyping ? 'opacity-60 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5">
        {/* Group 1: Quick toggles (Punctuation & Numbers) */}
        <div
          id="mode-group-quick-toggles"
          className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-2.5 py-1 rounded-xl transition-all shadow-xs"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          {/* Punctuation */}
          <div className="relative group">
            <button
              id="quick-mod-punctuation"
              type="button"
              onClick={() => {
                toggleModifier('punctuation');
                onSelectModeChange();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer hover:opacity-100"
              style={{
                color: modifiers.punctuation ? 'var(--accent)' : 'var(--sub)',
                fontWeight: modifiers.punctuation ? '600' : '400',
              }}
              aria-label="Toggle Punctuation"
              aria-pressed={modifiers.punctuation}
            >
              <AtSign size={13} />
              <span>punctuation</span>
            </button>

            {/* Responsive Tooltip */}
            <div
              role="tooltip"
              className="absolute pointer-events-none opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-150 ease-out z-50
                left-1/2 -translate-x-1/2 bottom-full mb-2
                px-2 py-1 rounded-md text-[11px] font-medium border shadow-lg whitespace-nowrap hidden sm:flex items-center"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <span>{modifiers.punctuation ? 'Disable Punctuation' : 'Add commas, periods, quotes'}</span>
            </div>
          </div>

          {/* Numbers */}
          <div className="relative group">
            <button
              id="quick-mod-numbers"
              type="button"
              onClick={() => {
                toggleModifier('numbers');
                onSelectModeChange();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer hover:opacity-100"
              style={{
                color: modifiers.numbers ? 'var(--accent)' : 'var(--sub)',
                fontWeight: modifiers.numbers ? '600' : '400',
              }}
              aria-label="Toggle Numbers"
              aria-pressed={modifiers.numbers}
            >
              <Binary size={13} />
              <span>numbers</span>
            </button>

            {/* Responsive Tooltip */}
            <div
              role="tooltip"
              className="absolute pointer-events-none opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-150 ease-out z-50
                left-1/2 -translate-x-1/2 bottom-full mb-2
                px-2 py-1 rounded-md text-[11px] font-medium border shadow-lg whitespace-nowrap hidden sm:flex items-center"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <span>{modifiers.numbers ? 'Disable Numbers' : 'Include numeric digits (0-9)'}</span>
            </div>
          </div>
        </div>

        {/* Group 2: Primary Modes */}
        <div
          id="mode-group-primary"
          className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-2.5 py-1 rounded-xl transition-all shadow-xs"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          {/* Words */}
          <div className="relative group">
            <button
              id="mode-btn-words"
              type="button"
              onClick={() => handleModeClick('words')}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              style={{
                color: mode === 'words' ? 'var(--accent)' : 'var(--sub)',
                fontWeight: mode === 'words' ? '600' : '400',
              }}
              aria-label="Words Mode"
            >
              <Keyboard size={13} />
              <span>words</span>
            </button>
            <div
              role="tooltip"
              className="absolute pointer-events-none opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-150 ease-out z-50
                left-1/2 -translate-x-1/2 bottom-full mb-2
                px-2 py-1 rounded-md text-[11px] font-medium border shadow-lg whitespace-nowrap hidden sm:flex items-center"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <span>Fixed word count test</span>
            </div>
          </div>

          {/* Time */}
          <div className="relative group">
            <button
              id="mode-btn-time"
              type="button"
              onClick={() => handleModeClick('time')}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              style={{
                color: mode === 'time' ? 'var(--accent)' : 'var(--sub)',
                fontWeight: mode === 'time' ? '600' : '400',
              }}
              aria-label="Time Mode"
            >
              <Timer size={13} />
              <span>time</span>
            </button>
            <div
              role="tooltip"
              className="absolute pointer-events-none opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-150 ease-out z-50
                left-1/2 -translate-x-1/2 bottom-full mb-2
                px-2 py-1 rounded-md text-[11px] font-medium border shadow-lg whitespace-nowrap hidden sm:flex items-center"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <span>Timed countdown test</span>
            </div>
          </div>

          {/* Quote */}
          <div className="relative group">
            <button
              id="mode-btn-quote"
              type="button"
              onClick={() => handleModeClick('quote')}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              style={{
                color: mode === 'quote' ? 'var(--accent)' : 'var(--sub)',
                fontWeight: mode === 'quote' ? '600' : '400',
              }}
              aria-label="Quote Mode"
            >
              <Quote size={13} />
              <span>quote</span>
            </button>
            <div
              role="tooltip"
              className="absolute pointer-events-none opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-150 ease-out z-50
                left-1/2 -translate-x-1/2 bottom-full mb-2
                px-2 py-1 rounded-md text-[11px] font-medium border shadow-lg whitespace-nowrap hidden sm:flex items-center"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <span>Literary passages & quotes</span>
            </div>
          </div>

          {/* Custom */}
          <div className="relative group">
            <button
              id="mode-btn-custom"
              type="button"
              onClick={() => handleModeClick('custom')}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              style={{
                color: mode === 'custom' ? 'var(--accent)' : 'var(--sub)',
                fontWeight: mode === 'custom' ? '600' : '400',
              }}
              aria-label="Custom Text Mode"
            >
              <FileText size={13} />
              <span>custom</span>
            </button>
            <div
              role="tooltip"
              className="absolute pointer-events-none opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-150 ease-out z-50
                left-1/2 -translate-x-1/2 bottom-full mb-2
                px-2 py-1 rounded-md text-[11px] font-medium border shadow-lg whitespace-nowrap hidden sm:flex items-center"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <span>Type your own custom text</span>
            </div>
          </div>
        </div>

        {/* Group 3: Sub-mode Presets */}
        {mode === 'words' && (
          <div
            id="mode-group-presets-words"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all shadow-xs"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            {wordCounts.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => {
                  setWordCount(count);
                  onSelectModeChange();
                }}
                className="px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                style={{
                  color: wordCount === count ? 'var(--accent)' : 'var(--sub)',
                  fontWeight: wordCount === count ? '600' : '400',
                }}
                aria-label={`${count} Words`}
              >
                {count}
              </button>
            ))}
          </div>
        )}

        {mode === 'time' && (
          <div
            id="mode-group-presets-time"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all shadow-xs"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            {timeDurations.map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => {
                  setTimeDuration(duration);
                  onSelectModeChange();
                }}
                className="px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                style={{
                  color: timeDuration === duration ? 'var(--accent)' : 'var(--sub)',
                  fontWeight: timeDuration === duration ? '600' : '400',
                }}
                aria-label={`${duration} Seconds`}
              >
                {duration}s
              </button>
            ))}
          </div>
        )}

        {mode === 'quote' && (
          <div
            id="mode-group-presets-quote"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all shadow-xs"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            {quoteLengths.map((length) => (
              <button
                key={length}
                type="button"
                onClick={() => {
                  setQuoteLength(length);
                  onSelectModeChange();
                }}
                className="px-2 py-1 rounded-lg text-xs font-medium transition-colors capitalize cursor-pointer"
                style={{
                  color: quoteLength === length ? 'var(--accent)' : 'var(--sub)',
                  fontWeight: quoteLength === length ? '600' : '400',
                }}
                aria-label={`${length} Quote`}
              >
                {length}
              </button>
            ))}
          </div>
        )}

        {/* Group 4: Modifier Panel Trigger */}
        <div className="relative group">
          <button
            id="open-modifiers-btn"
            type="button"
            onClick={onOpenModifierPanel}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all border cursor-pointer hover:opacity-90 shadow-xs"
            style={{
              backgroundColor: totalActiveModifiers > 0 ? 'var(--surface-2)' : 'var(--surface)',
              borderColor: totalActiveModifiers > 0 ? 'var(--accent)' : 'var(--border)',
              color: totalActiveModifiers > 0 ? 'var(--accent)' : 'var(--sub)',
            }}
            aria-label="Modifiers & Challenge Modes"
          >
            <SlidersHorizontal size={13} />
            <span>modifiers</span>
            {totalActiveModifiers > 0 && (
              <span
                className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {totalActiveModifiers}
              </span>
            )}
          </button>

          {/* Responsive Tooltip */}
          <div
            role="tooltip"
            className="absolute pointer-events-none opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-150 ease-out z-50
              right-0 bottom-full mb-2
              px-2.5 py-1 rounded-md text-[11px] font-medium border shadow-lg whitespace-nowrap hidden sm:flex items-center"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <span>Blind, Confidence, Strict Space, Mirror & more</span>
          </div>
        </div>
      </div>

      {/* Active Special Modifier Chips */}
      {specialActiveModifiers.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 flex-wrap mt-2.5">
          {specialActiveModifiers.map((modKey) => (
            <span
              key={modKey}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border animate-in fade-in"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
              }}
            >
              <span>{modifierLabels[modKey]}</span>
              <button
                type="button"
                onClick={() => {
                  toggleModifier(modKey);
                  onSelectModeChange();
                }}
                className="hover:opacity-75 cursor-pointer ml-0.5"
                title={`Remove ${modifierLabels[modKey]}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
