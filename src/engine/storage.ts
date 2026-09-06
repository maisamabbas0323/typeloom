import {
  ExportDataPayload,
  PersonalBest,
  Settings,
  TestResult,
  UserProfile,
} from '../types';

export const STORAGE_KEYS = {
  SETTINGS: 'typeloom.settings',
  HISTORY: 'typeloom.history',
  PBS: 'typeloom.pbs',
  PROFILE: 'typeloom.profile',
  ACCOUNTS: 'typeloom.accounts',
} as const;

export function getProfileStorageKey(key: string, profileId: string): string {
  return `${key}.${profileId}`;
}

export function getActiveProfileId(): string {
  const active = getStoredItem<{ id?: string } | null>(STORAGE_KEYS.PROFILE, null);
  return active?.id || 'guest';
}

/**
 * Checks if localStorage is available and functional.
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__typeloom_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely reads an item from localStorage.
 */
export function getStoredItem<T>(key: string, fallback: T): T {
  if (!isStorageAvailable()) return fallback;
  try {
    const item = window.localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely writes an item to localStorage.
 */
export function setStoredItem<T>(key: string, value: T): boolean {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Removes an item from localStorage.
 */
export function removeStoredItem(key: string): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore error
  }
}

/**
 * Generates PB key based on mode and length.
 * e.g. words-25, time-30, quote-medium
 */
export function getPbKey(mode: string, length: string | number): string {
  return `${mode}-${length}`;
}

/**
 * Exports all local data into a clean, versioned JSON payload and downloads it.
 */
export function exportLocalData(
  settings: Settings,
  profile: UserProfile,
  history: TestResult[],
  pbs: Record<string, PersonalBest>,
  accounts?: import('../types').UserAccount[]
): void {
  const payload: ExportDataPayload = {
    app: 'Typeloom',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    profile,
    accounts,
    history,
    pbs,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `typeloom-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validates and parses an imported JSON file string.
 * Returns parsed payload or throws a human-friendly error message.
 */
export function parseAndValidateImport(jsonString: string): ExportDataPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('The selected file is not valid JSON.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid file structure. Expected a Typeloom backup.');
  }

  const obj = parsed as Record<string, unknown>;

  if (obj.app !== 'Typeloom') {
    throw new Error('This file does not appear to be a Typeloom backup file.');
  }

  // Validate history array if present
  const history = Array.isArray(obj.history) ? (obj.history as TestResult[]) : [];
  const pbs =
    typeof obj.pbs === 'object' && obj.pbs !== null
      ? (obj.pbs as Record<string, PersonalBest>)
      : {};

  const accounts = Array.isArray(obj.accounts) ? (obj.accounts as import('../types').UserAccount[]) : undefined;

  const rawProfile = typeof obj.profile === 'object' && obj.profile !== null ? (obj.profile as Record<string, unknown>) : {};

  return {
    app: 'Typeloom',
    version: 1,
    exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString(),
    settings: (obj.settings as Settings) || {},
    profile: {
      id: typeof rawProfile.id === 'string' ? rawProfile.id : 'guest',
      fullName: typeof rawProfile.fullName === 'string' ? rawProfile.fullName : '',
      username: typeof rawProfile.username === 'string' ? rawProfile.username : 'Weaver',
      bio: typeof rawProfile.bio === 'string' ? rawProfile.bio : '',
      targetWpm: typeof rawProfile.targetWpm === 'number' ? rawProfile.targetWpm : 70,
      dailyMinutesGoal: typeof rawProfile.dailyMinutesGoal === 'number' ? rawProfile.dailyMinutesGoal : 10,
      preferredMode: (rawProfile.preferredMode as import('../types').TestMode) || 'words',
      avatarColor: typeof rawProfile.avatarColor === 'string' ? rawProfile.avatarColor : '#d47942',
      createdAt: typeof rawProfile.createdAt === 'number' ? rawProfile.createdAt : Date.now(),
      testsCompleted: typeof rawProfile.testsCompleted === 'number' ? rawProfile.testsCompleted : 0,
      totalTimeTypedSeconds: typeof rawProfile.totalTimeTypedSeconds === 'number' ? rawProfile.totalTimeTypedSeconds : 0,
    },
    accounts,
    history,
    pbs,
  };
}
