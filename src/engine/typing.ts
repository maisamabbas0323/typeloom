import { Modifiers, TestMode } from '../types';
import { calculateAccuracy, calculateBurst, calculateConsistency, calculateRawWPM, calculateWPM } from './metrics';

export type CharStatus = 'upcoming' | 'current' | 'correct' | 'incorrect';

export interface TypingStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  errors: number;
  burst: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  progressPercent: number;
  correctChars: number;
  totalTyped: number;
}

export interface KeystrokeRecord {
  char: string;
  expected: string;
  isCorrect: boolean;
  timestamp: number;
}

/**
 * Pure evaluation of a typed string against a target string with modifier support.
 */
export function evaluateTyping(
  target: string,
  input: string,
  modifiers: Partial<Modifiers> = {}
): {
  charStatuses: CharStatus[];
  correctCount: number;
  errorCount: number;
  isCompleted: boolean;
  currentIndex: number;
} {
  const charStatuses: CharStatus[] = new Array(target.length).fill('upcoming');
  let correctCount = 0;
  let errorCount = 0;

  const inputLen = input.length;
  const targetLen = target.length;

  for (let i = 0; i < inputLen && i < targetLen; i++) {
    const expected = target[i];
    const actual = input[i];

    const isMatch = expected === actual;

    if (isMatch) {
      charStatuses[i] = 'correct';
      correctCount++;
    } else {
      charStatuses[i] = 'incorrect';
      errorCount++;
    }
  }

  const currentIndex = Math.min(inputLen, targetLen);
  if (currentIndex < targetLen) {
    charStatuses[currentIndex] = 'current';
  }

  const isCompleted = inputLen >= targetLen;

  return {
    charStatuses,
    correctCount,
    errorCount,
    isCompleted,
    currentIndex,
  };
}

/**
 * Validates whether a proposed new input character should be accepted
 * under modifiers like 'stopOnError'.
 */
export function canAcceptNextCharacter(
  target: string,
  currentInput: string,
  nextChar: string,
  modifiers: Partial<Modifiers> = {}
): boolean {
  if (modifiers?.stopOnError) {
    const nextIdx = currentInput.length;
    if (nextIdx < target.length) {
      const expected = target[nextIdx];
      // If stopOnError is enabled, the next char MUST match the expected char
      if (nextChar !== expected) {
        return false;
      }
    }
  }
  return true;
}

export interface WordBound {
  word: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Splits target text into individual words preserving space boundary indices.
 */
export function splitIntoWords(text: string): WordBound[] {
  const words: WordBound[] = [];
  let currentWord = '';
  let startIndex = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === ' ') {
      words.push({
        word: currentWord + ' ',
        startIndex,
        endIndex: i,
      });
      currentWord = '';
      startIndex = i + 1;
    } else {
      currentWord += char;
    }
  }

  if (currentWord.length > 0) {
    words.push({
      word: currentWord,
      startIndex,
      endIndex: text.length - 1,
    });
  }

  return words;
}

