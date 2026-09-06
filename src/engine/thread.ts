import { TestResult, ThreadData, ThreadPoint, ThreadStyle, ThreadThickness } from '../types';

/**
 * Deterministic pseudo-random number generator using Mulberry32.
 * Ensures the same result seed always produces the exact same thread geometry.
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Creates a deterministic numeric seed from test metadata.
 */
export function deriveThreadSeed(id: string, wpm: number, accuracy: number, duration: number): number {
  let hash = 0;
  const str = `${id}-${wpm}-${accuracy}-${duration}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 42;
}

/**
 * Calculates humanized rhythm smoothness metric (0 - 100).
 */
export function calculateThreadSmoothness(consistency: number, errors: number, duration: number): number {
  const errorPenalty = Math.min(30, (errors / Math.max(1, duration / 10)) * 6);
  return Math.max(10, Math.min(100, Math.round(consistency * 0.85 + (100 - errorPenalty) * 0.15)));
}

/**
 * Calculates thread energy from WPM and burst speed.
 */
export function calculateThreadEnergy(wpm: number, burst: number): number {
  const baseline = Math.min(1, Math.max(0.2, wpm / 120));
  const burstBoost = Math.min(0.3, Math.max(0, (burst - wpm) / 100));
  return Math.min(1, baseline + burstBoost);
}

/**
 * Generates compact deterministic ThreadData from typing metrics.
 */
export function generateThreadData(
  result: Partial<TestResult> & {
    wpm: number;
    rawWpm?: number;
    accuracy: number;
    consistency: number;
    errors: number;
    burst?: number;
    elapsedSeconds?: number;
    secondBySecondWpm?: number[];
  },
  options: {
    style?: ThreadStyle;
    thickness?: ThreadThickness;
  } = {}
): ThreadData {
  const wpm = result.wpm || 0;
  const rawWpm = result.rawWpm ?? wpm;
  const accuracy = Math.max(0, Math.min(100, result.accuracy ?? 100));
  const consistency = Math.max(0, Math.min(100, result.consistency ?? 80));
  const errors = Math.max(0, result.errors ?? 0);
  const burst = result.burst ?? Math.max(wpm, rawWpm);
  const elapsedSeconds = Math.max(1, result.elapsedSeconds ?? 15);
  const rawSamples = result.secondBySecondWpm && result.secondBySecondWpm.length > 0
    ? result.secondBySecondWpm
    : [wpm];

  const seed = deriveThreadSeed(result.id || 'live', wpm, accuracy, elapsedSeconds);
  const rng = mulberry32(seed);

  const style: ThreadStyle = options.style || 'silk';
  const thickness: ThreadThickness = options.thickness || 'regular';

  // Resample into 16 to 32 balanced spatial points for the spline
  const sampleCount = Math.max(12, Math.min(36, Math.max(rawSamples.length * 2, 18)));
  const points: ThreadPoint[] = [];

  const maxSpeed = Math.max(...rawSamples, burst, wpm + 10, 30);
  const minSpeed = Math.max(0, Math.min(...rawSamples, wpm - 10));
  const speedRange = Math.max(15, maxSpeed - minSpeed);

  // Distribute error knots deterministically across points
  const knotIndices = new Set<number>();
  if (errors > 0) {
    const errorCount = Math.min(errors, Math.floor(sampleCount / 2));
    for (let e = 0; e < errorCount; e++) {
      const idx = Math.floor(1 + rng() * (sampleCount - 2));
      knotIndices.add(idx);
    }
  }

  // Identify pause gaps where typing dropped significantly
  const gapIndices = new Set<number>();
  for (let s = 1; s < rawSamples.length; s++) {
    if (rawSamples[s] < rawSamples[s - 1] * 0.6 && rawSamples[s] < wpm * 0.5) {
      const pointIdx = Math.floor((s / rawSamples.length) * sampleCount);
      gapIndices.add(pointIdx);
    }
  }

  for (let i = 0; i < sampleCount; i++) {
    const progress = i / (sampleCount - 1);
    const sampleIdx = Math.min(rawSamples.length - 1, Math.floor(progress * rawSamples.length));
    const sampleWpm = rawSamples[sampleIdx] ?? wpm;

    // Vertical displacement: centered around 0.5 with wave based on speed variance
    const speedNorm = (sampleWpm - minSpeed) / speedRange;
    const waveOffset = Math.sin(progress * Math.PI * 3 + rng() * 0.3) * 0.12 * (1 - consistency / 120);
    const yVal = 0.5 - (speedNorm - 0.5) * 0.55 + waveOffset;
    const clampedY = Math.max(0.12, Math.min(0.88, yVal));

    const isKnot = knotIndices.has(i);
    const hasGap = gapIndices.has(i);

    points.push({
      x: Number(progress.toFixed(4)),
      y: Number(clampedY.toFixed(4)),
      wpm: Math.round(sampleWpm),
      energy: Number((0.3 + 0.7 * (sampleWpm / Math.max(1, maxSpeed))).toFixed(2)),
      smoothness: Number((consistency / 100).toFixed(2)),
      knot: isKnot || undefined,
      gapBefore: hasGap ? Number((0.4 + rng() * 0.5).toFixed(2)) : undefined,
    });
  }

  const humanSummary = generateAccessibleSummary(wpm, accuracy, consistency, errors, elapsedSeconds, burst);

  return {
    points,
    style,
    thickness,
    avgWpm: Math.round(wpm),
    peakWpm: Math.round(burst),
    accuracy: Math.round(accuracy),
    consistency: Math.round(consistency),
    errors,
    isPb: Boolean(result.isPb),
    seed,
    summary: humanSummary,
  };
}

/**
 * Builds an accessible humanized description of the thread.
 */
function generateAccessibleSummary(
  wpm: number,
  accuracy: number,
  consistency: number,
  errors: number,
  duration: number,
  burst: number
): string {
  const errorText = errors === 0
    ? 'zero errors'
    : errors === 1
    ? '1 subtle knot'
    : `${errors} small knots`;

  const paceDesc = consistency >= 90
    ? 'steady, uninterrupted cadence'
    : consistency >= 75
    ? 'balanced, flowing momentum'
    : 'expressive, dynamic pacing';

  return `Living Thread: ${wpm} WPM across ${duration}s with ${accuracy}% accuracy, peak speed of ${burst} WPM, and ${errorText} along a ${paceDesc}.`;
}

/**
 * Converts Thread points into a smooth SVG Bezier path.
 */
export function buildThreadSvgPath(points: ThreadPoint[], width: number, height: number): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M 0,${height * points[0].y} L ${width},${height * points[0].y}`;

  const coords = points.map((p) => ({
    x: p.x * width,
    y: p.y * height,
  }));

  let path = `M ${coords[0].x.toFixed(1)},${coords[0].y.toFixed(1)}`;

  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(coords.length - 1, i + 2)];

    // Catmull-Rom to Cubic Bezier conversion
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  return path;
}

/**
 * Returns poetic contextual commentary derived from actual typing metrics.
 */
export function getThreadContextCopy(result: {
  isPb?: boolean;
  accuracy: number;
  consistency: number;
  wpm: number;
  burst?: number;
}): { headline: string; reflection: string } {
  if (result.isPb) {
    return {
      headline: 'New personal best',
      reflection: 'Your highest rhythm yet. Every movement flowed with clarity and confidence.',
    };
  }

  if (result.accuracy === 100) {
    return {
      headline: 'Pristine thread',
      reflection: 'Flawless precision with zero knots from the first character to the last.',
    };
  }

  if (result.consistency >= 90) {
    return {
      headline: 'That was a steady rhythm',
      reflection: 'Unbroken cadence. Your pace remained calm, even, and deliberate throughout.',
    };
  }

  if (result.burst && result.burst >= result.wpm * 1.35) {
    return {
      headline: 'Nice burst',
      reflection: 'Energetic accelerations woven into your pace.',
    };
  }

  if (result.accuracy >= 95) {
    return {
      headline: 'Clean run',
      reflection: 'Controlled precision with graceful rhythm.',
    };
  }

  return {
    headline: 'Your Thread',
    reflection: 'Every run leaves a thread. This is how your typing moved.',
  };
}
