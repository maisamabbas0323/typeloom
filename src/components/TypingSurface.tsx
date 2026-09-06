import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { CaretSpeed, CaretStyle, Modifiers } from '../types';
import { canAcceptNextCharacter, splitIntoWords } from '../engine/typing';
import { sound } from '../engine/sound';
import { useSettingsStore, DEFAULT_MODIFIERS } from '../store/useSettingsStore';
import { LiveThreadIndicator } from './LiveThreadIndicator';

interface TypingSurfaceProps {
  targetText: string;
  input: string;
  onInputChange: (value: string) => void;
  isTyping: boolean;
  isCompleted: boolean;
  onStartTyping: () => void;
  onRestart: () => void;
  fontSize?: number;
  largeText?: boolean;
  highContrast?: boolean;
  reducedMotion?: boolean;
  caretStyle?: CaretStyle;
  caretSpeed?: CaretSpeed;
  highlightCurrentWord?: boolean;
  modifiers?: Modifiers;
  liveWpm?: number;
  liveAccuracy?: number;
  recentErrors?: number;
  disabled?: boolean;
}

export const TypingSurface: React.FC<TypingSurfaceProps> = ({
  targetText,
  input,
  onInputChange,
  isTyping,
  isCompleted,
  onStartTyping,
  onRestart,
  fontSize: propFontSize,
  largeText: propLargeText,
  highContrast: propHighContrast,
  reducedMotion: propReducedMotion,
  caretStyle: propCaretStyle,
  caretSpeed: propCaretSpeed,
  highlightCurrentWord = false,
  modifiers: propModifiers,
  liveWpm = 0,
  liveAccuracy = 100,
  recentErrors = 0,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsWrapperRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [caretPos, setCaretPos] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [scrollY, setScrollY] = useState<number>(0);
  const [isFocused, setIsFocused] = useState<boolean>(true);
  const [hasErrorShimmer, setHasErrorShimmer] = useState<boolean>(false);

  // Read settings store with fallback
  const storeSettings = useSettingsStore();

  const effectiveModifiers: Modifiers = useMemo(() => {
    return {
      ...DEFAULT_MODIFIERS,
      ...(storeSettings?.modifiers || {}),
      ...(propModifiers || {}),
    };
  }, [propModifiers, storeSettings?.modifiers]);

  const effectiveFontSize = (propLargeText ?? storeSettings?.largeText)
    ? Math.max(28, (propFontSize ?? storeSettings?.fontSize ?? 26) + 6)
    : (propFontSize ?? storeSettings?.fontSize ?? 26);
  const effectiveHighContrast = propHighContrast ?? storeSettings?.highContrast ?? false;
  const effectiveReducedMotion = propReducedMotion ?? storeSettings?.reducedMotion ?? false;
  const effectiveCaretStyle = propCaretStyle ?? storeSettings?.caretStyle ?? 'line';
  const effectiveCaretSpeed = propCaretSpeed ?? storeSettings?.caretSpeed ?? 'smooth';

  const lineHeightPx = Math.round(effectiveFontSize * 1.55);
  const viewportHeightPx = lineHeightPx * 3;

  // Split target text into word objects with index bounds
  const words = useMemo(() => {
    return splitIntoWords(targetText);
  }, [targetText]);

  // Focus hidden input helper
  const focusInput = () => {
    if (disabled || isCompleted) return;
    if (hiddenInputRef.current) {
      try {
        hiddenInputRef.current.focus({ preventScroll: true });
      } catch {
        hiddenInputRef.current.focus();
      }
      setIsFocused(true);
      sound.unlockAudio();
    }
  };

  // Blur and unfocus immediately if disabled
  useEffect(() => {
    if (disabled) {
      hiddenInputRef.current?.blur();
      setIsFocused(false);
    } else if (!isCompleted) {
      focusInput();
    }
  }, [disabled, isCompleted]);

  // Re-calculate caret position and smooth MonkeyType 3-line scroll offset
  const updateCaretAndScroll = () => {
    if (!wordsWrapperRef.current || isCompleted) return;

    const currentIndex = input.length;
    const targetElement = wordsWrapperRef.current.querySelector(`span[data-index="${currentIndex}"]`) as HTMLElement | null;

    if (targetElement) {
      const wrapperRect = wordsWrapperRef.current.getBoundingClientRect();
      const elemRect = targetElement.getBoundingClientRect();

      setCaretPos({
        x: elemRect.left - wrapperRect.left,
        y: elemRect.top - wrapperRect.top,
        width: elemRect.width,
        height: elemRect.height,
      });

      // Calculate line index of current active word to smoothly scroll line-by-line
      const wordElem = targetElement.closest('[data-word-idx]') as HTMLElement | null;
      if (wordElem) {
        const wordOffsetTop = wordElem.offsetTop;
        const lineIndex = Math.max(0, Math.floor((wordOffsetTop + 4) / lineHeightPx));
        if (lineIndex <= 1) {
          setScrollY(0);
        } else {
          setScrollY((lineIndex - 1) * lineHeightPx);
        }
      }
    } else {
      // Past the end of text
      const lastIndex = Math.max(0, targetText.length - 1);
      const lastElement = wordsWrapperRef.current.querySelector(`span[data-index="${lastIndex}"]`) as HTMLElement | null;
      if (lastElement) {
        const wrapperRect = wordsWrapperRef.current.getBoundingClientRect();
        const elemRect = lastElement.getBoundingClientRect();
        setCaretPos({
          x: elemRect.right - wrapperRect.left,
          y: elemRect.top - wrapperRect.top,
          width: elemRect.width,
          height: elemRect.height,
        });

        const wordElem = lastElement.closest('[data-word-idx]') as HTMLElement | null;
        if (wordElem) {
          const wordOffsetTop = wordElem.offsetTop;
          const lineIndex = Math.max(0, Math.floor((wordOffsetTop + 4) / lineHeightPx));
          if (lineIndex <= 1) {
            setScrollY(0);
          } else {
            setScrollY((lineIndex - 1) * lineHeightPx);
          }
        }
      }
    }
  };

  useEffect(() => {
    updateCaretAndScroll();
  }, [input, targetText, effectiveFontSize, lineHeightPx]);

  useEffect(() => {
    const handleResize = () => updateCaretAndScroll();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [input, targetText, effectiveFontSize, lineHeightPx]);

  // Check whether the word currently being typed has errors
  const currentWordHasErrors = (): boolean => {
    if (input.length === 0) return false;
    const wordStart = input.lastIndexOf(' ') + 1;
    for (let i = wordStart; i < input.length; i++) {
      if (i < targetText.length && input[i] !== targetText[i]) {
        return true;
      }
    }
    return false;
  };

  // Core key processor for direct keystrokes and window captures
  const processKey = (
    key: string,
    modifiersKey: { ctrl?: boolean; alt?: boolean; meta?: boolean } = {}
  ): boolean => {
    if (disabled) return false;
    sound.unlockAudio();

    if (isCompleted) {
      if (key === 'Tab' || key === 'Enter') {
        onRestart();
        return true;
      }
      return false;
    }

    // Restart shortcut: Tab
    if (key === 'Tab') {
      onRestart();
      return true;
    }

    // Handle Backspace
    if (key === 'Backspace') {
      if (input.length === 0) return true;

      // Confidence Mode: backspace is disabled
      if (effectiveModifiers.confidence) {
        sound.playError();
        return true;
      }

      let deleteCount = 1;
      if (modifiersKey.ctrl || modifiersKey.alt || modifiersKey.meta) {
        // Word backspace
        let idx = input.length - 1;
        while (idx > 0 && input[idx] === ' ') idx--;
        while (idx > 0 && input[idx - 1] !== ' ') idx--;
        deleteCount = input.length - idx;
      }

      const nextInput = input.slice(0, input.length - deleteCount);
      onInputChange(nextInput);
      sound.playKeystroke(false, true);
      return true;
    }

    // Ignore modifier combinations (Ctrl+C, etc.) or multi-char navigation keys
    if (modifiersKey.ctrl || modifiersKey.alt || modifiersKey.meta || key.length > 1) {
      return false;
    }

    const char = key;

    if (!isTyping) {
      onStartTyping();
    }

    // Strict Space check
    if (effectiveModifiers.strictSpace && char === ' ' && targetText[input.length] !== ' ') {
      sound.playWordError();
      setHasErrorShimmer(true);
      setTimeout(() => setHasErrorShimmer(false), 150);
      return true;
    }

    // Stop on Error check
    if (!canAcceptNextCharacter(targetText, input, char, effectiveModifiers)) {
      sound.playError();
      setHasErrorShimmer(true);
      setTimeout(() => setHasErrorShimmer(false), 150);
      return true;
    }

    const isExpectedChar = targetText[input.length] === char;

    if (char === ' ') {
      // Space pressed
      if (isExpectedChar) {
        if (currentWordHasErrors()) {
          sound.playWordError();
        } else {
          sound.playKeystroke(true, false);
        }
      } else {
        sound.playWordError();
      }
    } else {
      // Normal character pressed
      if (isExpectedChar) {
        sound.playKeystroke(false, false);
      } else {
        sound.playError();
        setHasErrorShimmer(true);
        setTimeout(() => setHasErrorShimmer(false), 120);
      }
    }

    const nextInput = input + char;
    onInputChange(nextInput);
    return true;
  };

  // Global window listener: clicking or pressing printable keys refocuses input and types immediately
  useEffect(() => {
    if (disabled) return;
    focusInput();

    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      // Don't intercept if user is inside another input, textarea, or dialog modal
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT') &&
        activeEl !== hiddenInputRef.current
      ) {
        return;
      }

      // Check if any modal dialog is currently open in the DOM
      if (document.querySelector('[role="dialog"], [aria-modal="true"], .modal-backdrop')) {
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        onRestart();
        return;
      }

      // If key is printable or backspace
      if (e.key.length === 1 || e.key === 'Backspace') {
        if (!isCompleted) {
          focusInput();
          // If event did not originate from the hidden input, process it directly
          if (activeEl !== hiddenInputRef.current) {
            e.preventDefault();
            processKey(e.key, {
              ctrl: e.ctrlKey,
              alt: e.altKey,
              meta: e.metaKey,
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [targetText, input, isCompleted, disabled, effectiveModifiers, isTyping]);

  // Handle keyboard typing from focused input element
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      onRestart();
      return;
    }
    if (e.key.length === 1 || e.key === 'Backspace') {
      e.preventDefault();
      processKey(e.key, {
        ctrl: e.ctrlKey,
        alt: e.altKey,
        meta: e.metaKey,
      });
    }
  };

  // Support mobile soft keyboards / IME input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    sound.unlockAudio();
    const val = e.target.value;
    if (val.length > input.length && val.startsWith(input)) {
      const addedChars = val.slice(input.length);
      if (addedChars.length === 1) processKey(addedChars);
    } else if (val.length < input.length) {
      onInputChange(val.slice(0, input.length));
    }
  };

  const lineSpacing = `${effectiveFontSize * 1.65}px`;

  // Spring transition based on caretSpeed setting
  const getCaretTransition = () => {
    if (effectiveReducedMotion || effectiveCaretSpeed === 'instant') {
      return { duration: 0 };
    }
    if (effectiveCaretSpeed === 'snappy') {
      return {
        type: 'spring' as const,
        damping: 24,
        stiffness: 680,
        mass: 0.1,
      };
    }
    // smooth
    return {
      type: 'spring' as const,
      damping: 32,
      stiffness: 480,
      mass: 0.18,
    };
  };

  return (
    <div
      id="typing-surface-container"
      onClick={focusInput}
      className={`relative w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10 cursor-text select-none min-h-[200px] sm:min-h-[260px] transition-all outline-none ${
        hasErrorShimmer ? 'animate-error-shimmer' : ''
      }`}
    >
      {/* Invisible HTML input for physical & mobile keyboard capture */}
      <input
        id="typeloom-hidden-input"
        ref={hiddenInputRef}
        type="text"
        value={input}
        disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (!disabled) setIsFocused(true);
        }}
        onBlur={(e) => {
          // If focus did not move to another interactable element or modal, stay focused
          const related = e.relatedTarget as HTMLElement | null;
          if (related && (related.tagName === 'INPUT' || related.tagName === 'BUTTON' || related.tagName === 'TEXTAREA')) {
            setIsFocused(false);
          } else {
            setIsFocused(false);
          }
        }}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none cursor-text z-0"
        aria-label="Typing input area"
      />

      {/* Focus banner if typing area loses focus (suppressed if disabled/modal open) */}
      {!isFocused && !isCompleted && !disabled && (
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-20 cursor-pointer select-none"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            focusInput();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            focusInput();
          }}
        >
          <div
            className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium border shadow-md flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 select-none"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: 'var(--accent)' }} />
            Click or press any key to focus
          </div>
        </div>
      )}

      {/* Typing Text Viewport: Clean, focused 3-line height with overflow hidden like Monkeytype */}
      <div
        ref={containerRef}
        className={`relative font-mono-typeloom tracking-normal overflow-hidden select-none outline-none ${
          effectiveModifiers.mirror ? 'typeloom-mirrored' : ''
        }`}
        style={{
          fontSize: `${effectiveFontSize}px`,
          lineHeight: `${lineHeightPx}px`,
          height: `${viewportHeightPx}px`,
          letterSpacing: '0.02em',
        }}
      >
        {/* Inner Words Container: Translates smoothly on Y axis as user moves past line 2 */}
        <div
          ref={wordsWrapperRef}
          className="relative w-full transition-transform duration-200 ease-out"
          style={{
            transform: `translateY(-${scrollY}px)`,
          }}
        >
          {/* Spring Animated Responsive Caret */}
          {caretPos && !isCompleted && (
            <motion.div
              id="typeloom-caret"
              initial={false}
              animate={{
                x: caretPos.x,
                y: caretPos.y,
              }}
              transition={getCaretTransition()}
              className={`absolute pointer-events-none z-10 transition-colors ${
                !isTyping ? 'animate-caret-pulse' : ''
              }`}
              style={{
                width: effectiveCaretStyle === 'block' ? `${caretPos.width || 12}px` : '2.5px',
                height: effectiveCaretStyle === 'underline' ? '3px' : `${caretPos.height || lineHeightPx}px`,
                top: effectiveCaretStyle === 'underline' ? `${caretPos.height - 3}px` : 0,
                backgroundColor: 'var(--caret)',
                opacity: effectiveCaretStyle === 'block' ? 0.35 : 1,
                borderRadius: '2px',
              }}
            />
          )}

          {/* Words and Characters: Clean text with NO selection block or background rectangle */}
          {words.map((wObj, wordIdx) => {
            const isCurrentWord =
              highlightCurrentWord &&
              input.length >= wObj.startIndex &&
              input.length <= wObj.endIndex + 1;
            return (
              <span
                key={wordIdx}
                data-word-idx={wordIdx}
                className={`inline-block mr-[0.55em] rounded-sm transition-colors duration-150 ${
                  isCurrentWord ? 'bg-[var(--accent)]/10' : ''
                }`}
              >
              {wObj.word.split('').map((char, charOffset) => {
                const charIndex = wObj.startIndex + charOffset;
                const isTyped = charIndex < input.length;
                const isCorrect = isTyped && input[charIndex] === char;
                const isIncorrect = isTyped && input[charIndex] !== char;

                let charColor = 'var(--sub)';
                let opacity = effectiveHighContrast ? 0.7 : 0.5;

                if (effectiveModifiers.blind) {
                  if (isTyped) {
                    charColor = 'var(--text)';
                    opacity = 1;
                  }
                } else if (isCorrect) {
                  charColor = 'var(--text)';
                  opacity = 1;
                } else if (isIncorrect) {
                  charColor = 'var(--error)';
                  opacity = 1;
                }

                if (effectiveModifiers.confidence && isIncorrect) {
                  charColor = 'var(--sub)';
                  opacity = 0.5;
                }

                return (
                  <span
                    key={charIndex}
                    data-index={charIndex}
                    className="relative inline-block transition-colors duration-75"
                    style={{
                      color: charColor,
                      opacity,
                    }}
                  >
                    {/* Visual Space character representation if incorrect */}
                    {char === ' ' ? (
                      <span
                        className="inline-block"
                        style={{
                          width: '0.55em',
                          color: isIncorrect ? 'var(--error)' : 'inherit',
                          opacity: isIncorrect ? 1 : 0.4,
                        }}
                      >
                        {isIncorrect ? '␣' : ' '}
                      </span>
                    ) : (
                      char
                    )}
                  </span>
                );
              })}
            </span>
          );
        })}
        </div>
      </div>

      {/* Subtle Live Thread Indicator (non-intrusive) */}
      <div className="mt-4 pt-1">
        <LiveThreadIndicator
          isTyping={isTyping}
          liveWpm={liveWpm}
          accuracy={liveAccuracy}
          recentErrors={recentErrors || (hasErrorShimmer ? 1 : 0)}
          charProgress={targetText.length > 0 ? input.length / targetText.length : 0}
        />
      </div>
    </div>
  );
};
