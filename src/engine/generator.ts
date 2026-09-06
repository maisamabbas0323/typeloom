import wordsList from '../data/words.json';
import quotesList from '../data/quotes.json';
import { Modifiers, Quote, QuoteLength, TestMode } from '../types';

/**
 * Shuffles an array with Fisher-Yates algorithm.
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Applies modifiers to a word array: punctuation, numbers, random case, reverse words.
 */
export function applyModifiersToWords(
  words: string[],
  modifiers: Partial<Modifiers> = {}
): string[] {
  let result = [...words];

  // 1. Numbers modifier: replace ~10% of words with numbers
  if (modifiers?.numbers) {
    result = result.map((w, idx) => {
      if (idx % 7 === 0 && idx !== 0) {
        const randNum = Math.floor(Math.random() * 900) + 10;
        return randNum.toString();
      }
      return w;
    });
  }

  // 2. Punctuation modifier: add punctuation and capitalization
  if (modifiers?.punctuation) {
    const marks = [',', '.', ';', '?', '!', ' -', '...'];
    let capitalizeNext = true;

    result = result.map((word, idx) => {
      let modWord = word;
      if (capitalizeNext) {
        modWord = modWord.charAt(0).toUpperCase() + modWord.slice(1);
        capitalizeNext = false;
      }

      // Add punctuation periodically or at the end
      if (idx === result.length - 1) {
        modWord = modWord + '.';
      } else if (idx > 0 && Math.random() < 0.22) {
        const mark = marks[Math.floor(Math.random() * marks.length)];
        modWord = modWord + mark;
        if (mark === '.' || mark === '?' || mark === '!') {
          capitalizeNext = true;
        }
      }

      return modWord;
    });
  }

  // 3. Random Case modifier
  if (modifiers?.randomCase) {
    result = result.map((word) => {
      return word
        .split('')
        .map((char) => {
          if (/[a-zA-Z]/.test(char)) {
            return Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase();
          }
          return char;
        })
        .join('');
    });
  }

  // 4. Reverse Words modifier
  if (modifiers?.reverseWords) {
    result = result.reverse();
  }

  return result;
}

/**
 * Generates text for a Words test.
 */
export function generateWordsText(count: number, modifiers: Partial<Modifiers> = {}): string {
  const pool = shuffle(wordsList as string[]);
  const selected: string[] = [];

  while (selected.length < count) {
    for (const w of pool) {
      if (selected.length >= count) break;
      selected.push(w);
    }
  }

  const modified = applyModifiersToWords(selected, modifiers);
  return modified.join(' ');
}

/**
 * Generates text buffer for a Time test (generates enough words for fast typists up to 250 WPM).
 */
export function generateTimeText(durationSeconds: number, modifiers: Partial<Modifiers> = {}): string {
  // 120 seconds at 200 WPM = ~400 words
  const count = Math.max(80, Math.ceil(durationSeconds * 3.5));
  return generateWordsText(count, modifiers);
}

/**
 * Selects a quote matching the length requirement.
 */
export function selectQuote(length: QuoteLength, excludeId?: string): Quote {
  const filtered = (quotesList as Quote[]).filter(
    (q) => q.length === length && (!excludeId || q.id !== excludeId)
  );

  if (filtered.length === 0) {
    // fallback if no other quote of length exists
    const anyQuote = (quotesList as Quote[]).filter((q) => q.length === length);
    return anyQuote[0] || (quotesList[0] as Quote);
  }

  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index];
}

/**
 * Sanitizes and normalizes custom text.
 */
export function prepareCustomText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/[ \u00A0]+/g, ' ')
    .trim();
}
