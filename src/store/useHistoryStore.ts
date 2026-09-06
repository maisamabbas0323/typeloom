import { create } from 'zustand';
import { PersonalBest, TestResult } from '../types';
import {
  getPbKey,
  getStoredItem,
  setStoredItem,
  STORAGE_KEYS,
  getActiveProfileId,
  getProfileStorageKey,
} from '../engine/storage';
import { generateThreadData } from '../engine/thread';
import { useSettingsStore } from './useSettingsStore';

const MAX_HISTORY_ITEMS = 500;

interface HistoryStoreState {
  history: TestResult[];
  pbs: Record<string, PersonalBest>;
  addResult: (resultData: Omit<TestResult, 'id' | 'createdAt' | 'isPb'>) => TestResult;
  togglePinResult: (id: string) => void;
  renameResult: (id: string, name: string) => void;
  getPbFor: (mode: string, length: string | number) => PersonalBest | undefined;
  clearHistory: () => void;
  loadForProfile: (profileId: string) => void;
  importHistory: (history: TestResult[], pbs: Record<string, PersonalBest>) => void;
  getStats: () => {
    totalTests: number;
    avgWpm: number;
    maxWpm: number;
    avgAccuracy: number;
    totalTimeSeconds: number;
  };
}

const activeProfileId = getActiveProfileId();
const initialHistory = getStoredItem<TestResult[]>(
  getProfileStorageKey(STORAGE_KEYS.HISTORY, activeProfileId),
  getStoredItem<TestResult[]>(STORAGE_KEYS.HISTORY, [])
);
const initialPbs = getStoredItem<Record<string, PersonalBest>>(
  getProfileStorageKey(STORAGE_KEYS.PBS, activeProfileId),
  getStoredItem<Record<string, PersonalBest>>(STORAGE_KEYS.PBS, {})
);

export const useHistoryStore = create<HistoryStoreState>((set, get) => ({
  history: Array.isArray(initialHistory) ? initialHistory : [],
  pbs: typeof initialPbs === 'object' && initialPbs !== null ? initialPbs : {},

  addResult: (resultData) => {
    const id = 'run_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const createdAt = Date.now();
    const pbKey = getPbKey(resultData.mode, resultData.length);
    const currentPb = get().pbs[pbKey];

    // Check if new PB: must have at least 15 seconds or completed test, accuracy >= 70%
    const isNewPb =
      resultData.wpm > 0 &&
      resultData.accuracy >= 70 &&
      (!currentPb || resultData.wpm > currentPb.wpm);

    // Automatically construct thread if not explicitly passed
    const currentSettings = useSettingsStore.getState();
    const threadData = resultData.thread || generateThreadData(
      { ...resultData, id, isPb: isNewPb },
      {
        style: currentSettings.threadStyle,
        thickness: currentSettings.threadThickness,
      }
    );

    const newResult: TestResult = {
      ...resultData,
      id,
      createdAt,
      isPb: isNewPb,
      thread: threadData,
    };

    let updatedPbs = { ...get().pbs };
    if (isNewPb) {
      updatedPbs[pbKey] = {
        wpm: resultData.wpm,
        rawWpm: resultData.rawWpm,
        accuracy: resultData.accuracy,
        date: createdAt,
        testId: id,
      };
    }

    const updatedHistory = [newResult, ...get().history].slice(0, MAX_HISTORY_ITEMS);

    set({
      history: updatedHistory,
      pbs: updatedPbs,
    });

    setStoredItem(getProfileStorageKey(STORAGE_KEYS.HISTORY, getActiveProfileId()), updatedHistory);
    setStoredItem(getProfileStorageKey(STORAGE_KEYS.PBS, getActiveProfileId()), updatedPbs);

    return newResult;
  },

  togglePinResult: (id: string) => {
    const updatedHistory = get().history.map((item) =>
      item.id === id ? { ...item, pinned: !item.pinned } : item
    );
    set({ history: updatedHistory });
    setStoredItem(getProfileStorageKey(STORAGE_KEYS.HISTORY, getActiveProfileId()), updatedHistory);
  },

  renameResult: (id: string, name: string) => {
    const updatedHistory = get().history.map((item) =>
      item.id === id ? { ...item, customName: name.trim() || undefined } : item
    );
    set({ history: updatedHistory });
    setStoredItem(getProfileStorageKey(STORAGE_KEYS.HISTORY, getActiveProfileId()), updatedHistory);
  },

  getPbFor: (mode, length) => {
    const key = getPbKey(mode, length);
    return get().pbs[key];
  },

  clearHistory: () => {
    set({ history: [], pbs: {} });
    setStoredItem(getProfileStorageKey(STORAGE_KEYS.HISTORY, getActiveProfileId()), []);
    setStoredItem(getProfileStorageKey(STORAGE_KEYS.PBS, getActiveProfileId()), {});
  },

  loadForProfile: (profileId) => {
    const history = getStoredItem<TestResult[]>(
      getProfileStorageKey(STORAGE_KEYS.HISTORY, profileId),
      profileId === 'guest' ? getStoredItem<TestResult[]>(STORAGE_KEYS.HISTORY, []) : []
    );
    const pbs = getStoredItem<Record<string, PersonalBest>>(
      getProfileStorageKey(STORAGE_KEYS.PBS, profileId),
      profileId === 'guest'
        ? getStoredItem<Record<string, PersonalBest>>(STORAGE_KEYS.PBS, {})
        : {}
    );
    set({ history: Array.isArray(history) ? history : [], pbs: pbs && typeof pbs === 'object' ? pbs : {} });
  },

  importHistory: (history, pbs) => {
    const validHistory = Array.isArray(history) ? history.slice(0, MAX_HISTORY_ITEMS) : [];
    const validPbs = typeof pbs === 'object' && pbs !== null ? pbs : {};
    set({ history: validHistory, pbs: validPbs });
    setStoredItem(getProfileStorageKey(STORAGE_KEYS.HISTORY, getActiveProfileId()), validHistory);
    setStoredItem(getProfileStorageKey(STORAGE_KEYS.PBS, getActiveProfileId()), validPbs);
  },

  getStats: () => {
    const history = get().history;
    if (history.length === 0) {
      return {
        totalTests: 0,
        avgWpm: 0,
        maxWpm: 0,
        avgAccuracy: 0,
        totalTimeSeconds: 0,
      };
    }

    const totalTests = history.length;
    const totalWpm = history.reduce((sum, h) => sum + (h.wpm || 0), 0);
    const avgWpm = Math.round(totalWpm / totalTests);
    const maxWpm = history.reduce((max, h) => Math.max(max, h.wpm || 0), 0);
    const totalAcc = history.reduce((sum, h) => sum + (h.accuracy || 0), 0);
    const avgAccuracy = Math.round((totalAcc / totalTests) * 10) / 10;
    const totalTimeSeconds = Math.round(
      history.reduce((sum, h) => sum + (h.elapsedSeconds || 0), 0)
    );

    return {
      totalTests,
      avgWpm,
      maxWpm,
      avgAccuracy,
      totalTimeSeconds,
    };
  },
}));
