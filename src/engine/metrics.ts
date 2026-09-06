/**
 * Pure calculation functions for typing metrics.
 * Defensive against division by zero, empty inputs, and NaN/Infinity edge cases.
 */

/**
 * Standard net WPM calculation.
 * Formula: ((correct characters including spaces) / 5) * (60 / elapsed seconds)
 */
export function calculateWPM(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0 || correctChars <= 0) return 0;
  const words = correctChars / 5;
  const minutes = elapsedSeconds / 60;
  const wpm = words / minutes;
  return Math.max(0, Math.round(wpm));
}

/**
 * Raw WPM based on all typed characters regardless of errors.
 * Formula: ((total characters typed) / 5) * (60 / elapsed seconds)
 */
export function calculateRawWPM(totalTypedChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0 || totalTypedChars <= 0) return 0;
  const words = totalTypedChars / 5;
  const minutes = elapsedSeconds / 60;
  const rawWpm = words / minutes;
  return Math.max(0, Math.round(rawWpm));
}

/**
 * Accuracy as a percentage (0 - 100).
 * Formula: correct / (correct + errors)
 * Returns 100 if no characters have been typed yet.
 */
export function calculateAccuracy(correctChars: number, errors: number): number {
  const total = correctChars + errors;
  if (total <= 0) return 100;
  const acc = (correctChars / total) * 100;
  return Math.min(100, Math.max(0, Math.round(acc * 10) / 10));
}

/**
 * Consistency score from 0 to 100 based on the Coefficient of Variation (CV)
 * of per-second raw WPM values.
 * Handles small samples, zero mean, and edge cases safely without NaN.
 */
export function calculateConsistency(perSecondWpm: number[]): number {
  // Filter out any invalid numbers
  const valid = perSecondWpm.filter((v) => typeof v === 'number' && !isNaN(v) && isFinite(v));
  if (valid.length < 2) return 100;

  const mean = valid.reduce((sum, val) => sum + val, 0) / valid.length;
  if (mean <= 0) return 100;

  const variance =
    valid.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / valid.length;
  const stdDev = Math.sqrt(variance);

  // Coefficient of variation: lower CV = higher consistency
  const cv = stdDev / mean;

  // Map CV: cv of 0 = 100% consistency, cv of 0.5 = 50%, cv >= 1.0 = 0%
  const consistency = Math.max(0, Math.min(100, Math.round((1 - Math.min(cv, 1)) * 100)));
  return isNaN(consistency) ? 100 : consistency;
}

/**
 * Calculates burst speed: the peak short-window typing speed (e.g. maximum per-second WPM or 2-sec moving rate).
 */
export function calculateBurst(perSecondWpm: number[]): number {
  if (!perSecondWpm || perSecondWpm.length === 0) return 0;
  const max = Math.max(...perSecondWpm);
  return isFinite(max) && !isNaN(max) && max > 0 ? Math.round(max) : 0;
}

/**
 * Formats seconds into MM:SS or SS.
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins > 0) {
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${secs}s`;
}
