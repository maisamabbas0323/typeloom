export type TestMode = 'words' | 'time' | 'quote' | 'custom';

export type WordCount = 10 | 25 | 50 | 100;
export type TimeDuration = 15 | 30 | 60 | 120;
export type QuoteLength = 'short' | 'medium' | 'long';

export interface Modifiers {
  punctuation: boolean;
  numbers: boolean;
  blind: boolean;
  confidence: boolean;
  strictSpace: boolean;
  stopOnError: boolean;
  mirror: boolean;
  reverseWords: boolean;
  randomCase: boolean;
}

export type ThemeId =
  | 'loom-dark'
  | 'midnight-thread'
  | 'paperloom'
  | 'ink-linen'
  | 'copper-thread'
  | 'forest-desk'
  | 'winter-paper'
  | 'evening-coffee'
  | 'old-library'
  | 'moss-stone'
  | 'blue-hour'
  | 'sunlit-paper'
  | 'custom';

export interface ThemeColors {
  id: ThemeId;
  name: string;
  description: string;
  bg: string;
  fg: string;
  sub: string;
  text: string;
  error: string;
  accent: string;
  surface: string;
  surface2: string;
  border: string;
  success: string;
  caret: string;
}

export type SoundProfileId =
  | 'soft-mechanical'
  | 'classic-mechanical'
  | 'low-mechanical'
  | 'typewriter'
  | 'quiet-keyboard'
  | 'soft-plastic'
  | 'marble-tap'
  | 'wooden-keys'
  | 'paper-type'
  | 'minimal-click'
  | 'studio-key'
  | 'retro-typewriter';

export type CaretStyle = 'line' | 'block' | 'underline';
export type CaretSpeed = 'smooth' | 'snappy' | 'instant';

export type ThreadStyle =
  | 'silk'
  | 'ink'
  | 'pencil'
  | 'fiber'
  | 'ribbon'
  | 'typewriter'
  | 'wire'
  | 'paper';

export type ThreadThickness = 'fine' | 'regular' | 'bold';

export interface ThreadPoint {
  x: number; // 0 to 1
  y: number; // 0 to 1
  wpm: number;
  energy: number; // 0 to 1
  smoothness: number; // 0 to 1
  knot?: boolean;
  gapBefore?: number;
}

export interface ThreadData {
  points: ThreadPoint[];
  style: ThreadStyle;
  thickness: ThreadThickness;
  avgWpm: number;
  peakWpm: number;
  accuracy: number;
  consistency: number;
  errors: number;
  isPb?: boolean;
  seed: number;
  summary: string;
}

export interface Settings {
  mode: TestMode;
  wordCount: WordCount;
  timeDuration: TimeDuration;
  quoteLength: QuoteLength;
  modifiers: Modifiers;
  theme: ThemeId;
  customThemeColors?: Partial<ThemeColors>;
  fontSize: number; // 22 to 48
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  soundType: SoundProfileId;
  soundProfile?: SoundProfileId;
  soundErrorEnabled: boolean;
  playErrorSound?: boolean;
  soundCompletionEnabled: boolean;
  playCompleteSound?: boolean;
  soundPbEnabled: boolean;
  playPbSound?: boolean;
  caretStyle: CaretStyle;
  caretSpeed: CaretSpeed;
  highlightCurrentWord: boolean;
  showLiveWpm: boolean;
  showLiveAcc: boolean;
  showLiveAccuracy?: boolean;
  showLiveBurst: boolean;
  // Living Thread Settings
  threadStyle: ThreadStyle;
  threadThickness: ThreadThickness;
  liveThread: boolean;
  threadResultsAnimation: boolean;
  showThreadInHistory: boolean;
}

export interface Quote {
  id: string;
  text: string;
  source: string;
  length: QuoteLength;
}

export interface TestResult {
  id: string;
  createdAt: number;
  mode: TestMode;
  length: number | string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  errors: number;
  burst: number;
  elapsedSeconds: number;
  charCount: number;
  correctCount: number;
  secondBySecondWpm: number[];
  modifiers: Partial<Modifiers>;
  isPb?: boolean;
  thread?: ThreadData;
  pinned?: boolean;
  customName?: string;
}

export interface PersonalBest {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  date: number;
  testId: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  bio: string;
  targetWpm: number;
  dailyMinutesGoal: number;
  preferredMode: TestMode;
  avatarColor: string;
  createdAt: number;
  testsCompleted: number;
  totalTimeTypedSeconds: number;
}

export interface UserAccount extends UserProfile {
  passwordHash: string;
  lastLoginAt: number;
}

export interface ExportDataPayload {
  app: 'Typeloom';
  version: 1;
  exportedAt: string;
  settings: Partial<Settings>;
  profile: Partial<UserProfile>;
  accounts?: UserAccount[];
  history: TestResult[];
  pbs: Record<string, PersonalBest>;
}
