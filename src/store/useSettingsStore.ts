import { create } from 'zustand';
import {
  Modifiers,
  Settings,
  ThemeColors,
  ThemeId,
  TestMode,
  WordCount,
  TimeDuration,
  QuoteLength,
  SoundProfileId,
  ThreadStyle,
  ThreadThickness,
} from '../types';
import {
  getStoredItem,
  setStoredItem,
  STORAGE_KEYS,
  getActiveProfileId,
  getProfileStorageKey,
} from '../engine/storage';
import { THEMES, applyTheme } from '../data/themes';
import { sound } from '../engine/sound';

export const DEFAULT_MODIFIERS: Modifiers = {
  punctuation: false,
  numbers: false,
  blind: false,
  confidence: false,
  strictSpace: false,
  stopOnError: false,
  mirror: false,
  reverseWords: false,
  randomCase: false,
};

export const DEFAULT_SETTINGS: Settings = {
  mode: 'words',
  wordCount: 25,
  timeDuration: 30,
  quoteLength: 'medium',
  modifiers: DEFAULT_MODIFIERS,
  theme: 'loom-dark',
  fontSize: 26,
  largeText: false,
  highContrast: false,
  reducedMotion: false,
  soundEnabled: true,
  soundVolume: 0.5,
  soundType: 'classic-mechanical',
  soundErrorEnabled: true,
  soundCompletionEnabled: true,
  soundPbEnabled: true,
  caretStyle: 'line',
  caretSpeed: 'smooth',
  highlightCurrentWord: false,
  showLiveWpm: true,
  showLiveAcc: true,
  showLiveBurst: false,
  threadStyle: 'silk',
  threadThickness: 'regular',
  liveThread: true,
  threadResultsAnimation: true,
  showThreadInHistory: true,
};

interface SettingsStoreState extends Settings {
  setMode: (mode: TestMode) => void;
  setWordCount: (count: WordCount) => void;
  setTimeDuration: (duration: TimeDuration) => void;
  setQuoteLength: (length: QuoteLength) => void;
  toggleModifier: (key: keyof Modifiers) => void;
  setModifier: (key: keyof Modifiers, value: boolean) => void;
  clearModifiers: () => void;
  setTheme: (theme: ThemeId) => void;
  setCustomThemeColors: (colors: Partial<ThemeColors>) => void;
  setFontSize: (size: number) => void;
  setLargeText: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setSoundType: (type: SoundProfileId) => void;
  setSoundProfile: (profile: SoundProfileId) => void;
  setSoundErrorEnabled: (enabled: boolean) => void;
  setPlayErrorSound: (enabled: boolean) => void;
  setSoundCompletionEnabled: (enabled: boolean) => void;
  setPlayCompleteSound: (enabled: boolean) => void;
  setSoundPbEnabled: (enabled: boolean) => void;
  setPlayPbSound: (enabled: boolean) => void;
  setCaretStyle: (style: 'line' | 'block' | 'underline') => void;
  setCaretSpeed: (speed: 'smooth' | 'snappy' | 'instant') => void;
  setHighlightCurrentWord: (enabled: boolean) => void;
  setShowLiveWpm: (show: boolean) => void;
  setShowLiveAcc: (show: boolean) => void;
  setShowLiveAccuracy: (show: boolean) => void;
  setShowLiveBurst: (show: boolean) => void;
  setThreadStyle: (style: ThreadStyle) => void;
  setThreadThickness: (thickness: ThreadThickness) => void;
  setLiveThread: (enabled: boolean) => void;
  setThreadResultsAnimation: (enabled: boolean) => void;
  setShowThreadInHistory: (enabled: boolean) => void;
  resetSettings: () => void;
  importSettings: (newSettings: Partial<Settings>) => void;
  loadForProfile: (profileId: string) => void;
}

const activeProfileId = getActiveProfileId();
const initialSettings = getStoredItem<Settings>(
  getProfileStorageKey(STORAGE_KEYS.SETTINGS, activeProfileId),
  getStoredItem<Settings>(STORAGE_KEYS.SETTINGS,
  DEFAULT_SETTINGS
  )
);

const profileSettingsKey = () => getProfileStorageKey(STORAGE_KEYS.SETTINGS, getActiveProfileId());

// Normalize legacy soundType if needed
if (initialSettings.soundType === ('soft' as any)) {
  initialSettings.soundType = 'soft-mechanical';
} else if (initialSettings.soundType === ('mechanical' as any)) {
  initialSettings.soundType = 'classic-mechanical';
} else if (initialSettings.soundType === ('wood' as any)) {
  initialSettings.soundType = 'wooden-keys';
}
if (initialSettings.soundVolume === undefined || initialSettings.soundVolume < 0.35) {
  initialSettings.soundVolume = 0.5;
}
initialSettings.soundEnabled = initialSettings.soundEnabled !== false;
initialSettings.soundErrorEnabled = initialSettings.soundErrorEnabled !== false;
initialSettings.soundCompletionEnabled = initialSettings.soundCompletionEnabled !== false;
initialSettings.soundPbEnabled = initialSettings.soundPbEnabled !== false;
initialSettings.modifiers = {
  ...DEFAULT_MODIFIERS,
  ...(initialSettings.modifiers || {}),
};

// Apply initial theme
if (typeof window !== 'undefined') {
  const themeObj =
    initialSettings.theme === 'custom' && initialSettings.customThemeColors
      ? { ...THEMES['custom'], ...initialSettings.customThemeColors }
      : THEMES[initialSettings.theme] || THEMES['loom-dark'];
  applyTheme(themeObj);
  sound.setConfig(
    initialSettings.soundEnabled,
    initialSettings.soundVolume,
    initialSettings.soundType,
    initialSettings.soundErrorEnabled ?? true,
    initialSettings.soundCompletionEnabled ?? true,
    initialSettings.soundPbEnabled ?? true
  );
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  ...initialSettings,

  setMode: (mode) => {
    set({ mode });
    setStoredItem(profileSettingsKey(), { ...get(), mode });
  },

  setWordCount: (wordCount) => {
    set({ wordCount });
    setStoredItem(profileSettingsKey(), { ...get(), wordCount });
  },

  setTimeDuration: (timeDuration) => {
    set({ timeDuration });
    setStoredItem(profileSettingsKey(), { ...get(), timeDuration });
  },

  setQuoteLength: (quoteLength) => {
    set({ quoteLength });
    setStoredItem(profileSettingsKey(), { ...get(), quoteLength });
  },

  toggleModifier: (key) => {
    const currentModifiers = get().modifiers || DEFAULT_MODIFIERS;
    const current = Boolean(currentModifiers[key]);
    const newModifiers = { ...DEFAULT_MODIFIERS, ...currentModifiers, [key]: !current };
    set({ modifiers: newModifiers });
    setStoredItem(profileSettingsKey(), { ...get(), modifiers: newModifiers });
  },

  setModifier: (key, value) => {
    const currentModifiers = get().modifiers || DEFAULT_MODIFIERS;
    const newModifiers = { ...DEFAULT_MODIFIERS, ...currentModifiers, [key]: value };
    set({ modifiers: newModifiers });
    setStoredItem(profileSettingsKey(), { ...get(), modifiers: newModifiers });
  },

  clearModifiers: () => {
    set({ modifiers: DEFAULT_MODIFIERS });
    setStoredItem(profileSettingsKey(), { ...get(), modifiers: DEFAULT_MODIFIERS });
  },

  setTheme: (themeId) => {
    set({ theme: themeId });
    const themeColors =
      themeId === 'custom' && get().customThemeColors
        ? { ...THEMES['custom'], ...get().customThemeColors }
        : THEMES[themeId] || THEMES['loom-dark'];
    applyTheme(themeColors);
    setStoredItem(profileSettingsKey(), { ...get(), theme: themeId });
  },

  setCustomThemeColors: (colors) => {
    const updatedCustom = { ...(get().customThemeColors || {}), ...colors };
    set({ customThemeColors: updatedCustom });
    if (get().theme === 'custom') {
      applyTheme({ ...THEMES['custom'], ...updatedCustom });
    }
    setStoredItem(profileSettingsKey(), {
      ...get(),
      customThemeColors: updatedCustom,
    });
  },

  setFontSize: (fontSize) => {
    const clamped = Math.max(22, Math.min(48, fontSize));
    set({ fontSize: clamped });
    setStoredItem(profileSettingsKey(), { ...get(), fontSize: clamped });
  },

  setLargeText: (largeText) => {
    set({ largeText });
    setStoredItem(profileSettingsKey(), { ...get(), largeText });
  },

  setHighContrast: (highContrast) => {
    set({ highContrast });
    setStoredItem(profileSettingsKey(), { ...get(), highContrast });
  },

  setReducedMotion: (reducedMotion) => {
    set({ reducedMotion });
    setStoredItem(profileSettingsKey(), { ...get(), reducedMotion });
  },

  setSoundEnabled: (soundEnabled) => {
    set({ soundEnabled });
    sound.setConfig(
      soundEnabled,
      get().soundVolume,
      get().soundType,
      get().soundErrorEnabled,
      get().soundCompletionEnabled,
      get().soundPbEnabled
    );
    setStoredItem(profileSettingsKey(), { ...get(), soundEnabled });
  },

  setSoundVolume: (soundVolume) => {
    const clamped = Math.max(0, Math.min(1, soundVolume));
    set({ soundVolume: clamped });
    sound.setConfig(
      get().soundEnabled,
      clamped,
      get().soundType,
      get().soundErrorEnabled,
      get().soundCompletionEnabled,
      get().soundPbEnabled
    );
    setStoredItem(profileSettingsKey(), { ...get(), soundVolume: clamped });
  },

  setSoundType: (soundType) => {
    set({ soundType, soundProfile: soundType });
    sound.setConfig(
      get().soundEnabled,
      get().soundVolume,
      soundType,
      get().soundErrorEnabled,
      get().soundCompletionEnabled,
      get().soundPbEnabled
    );
    setStoredItem(profileSettingsKey(), { ...get(), soundType });
  },

  setSoundProfile: (soundProfile) => {
    get().setSoundType(soundProfile);
  },

  setSoundErrorEnabled: (soundErrorEnabled) => {
    set({ soundErrorEnabled, playErrorSound: soundErrorEnabled });
    sound.setConfig(
      get().soundEnabled,
      get().soundVolume,
      get().soundType,
      soundErrorEnabled,
      get().soundCompletionEnabled,
      get().soundPbEnabled
    );
    setStoredItem(profileSettingsKey(), { ...get(), soundErrorEnabled });
  },

  setPlayErrorSound: (enabled) => {
    get().setSoundErrorEnabled(enabled);
  },

  setSoundCompletionEnabled: (soundCompletionEnabled) => {
    set({ soundCompletionEnabled, playCompleteSound: soundCompletionEnabled });
    sound.setConfig(
      get().soundEnabled,
      get().soundVolume,
      get().soundType,
      get().soundErrorEnabled,
      soundCompletionEnabled,
      get().soundPbEnabled
    );
    setStoredItem(profileSettingsKey(), { ...get(), soundCompletionEnabled });
  },

  setPlayCompleteSound: (enabled) => {
    get().setSoundCompletionEnabled(enabled);
  },

  setSoundPbEnabled: (soundPbEnabled) => {
    set({ soundPbEnabled, playPbSound: soundPbEnabled });
    sound.setConfig(
      get().soundEnabled,
      get().soundVolume,
      get().soundType,
      get().soundErrorEnabled,
      get().soundCompletionEnabled,
      soundPbEnabled
    );
    setStoredItem(profileSettingsKey(), { ...get(), soundPbEnabled });
  },

  setPlayPbSound: (enabled) => {
    get().setSoundPbEnabled(enabled);
  },

  setCaretStyle: (caretStyle) => {
    set({ caretStyle });
    setStoredItem(profileSettingsKey(), { ...get(), caretStyle });
  },

  setCaretSpeed: (caretSpeed) => {
    set({ caretSpeed });
    setStoredItem(profileSettingsKey(), { ...get(), caretSpeed });
  },

  setHighlightCurrentWord: (highlightCurrentWord) => {
    set({ highlightCurrentWord });
    setStoredItem(profileSettingsKey(), { ...get(), highlightCurrentWord });
  },

  setShowLiveWpm: (showLiveWpm) => {
    set({ showLiveWpm });
    setStoredItem(profileSettingsKey(), { ...get(), showLiveWpm });
  },

  setShowLiveAcc: (showLiveAcc) => {
    set({ showLiveAcc, showLiveAccuracy: showLiveAcc });
    setStoredItem(profileSettingsKey(), { ...get(), showLiveAcc });
  },

  setShowLiveAccuracy: (showLiveAccuracy) => {
    get().setShowLiveAcc(showLiveAccuracy);
  },

  setShowLiveBurst: (showLiveBurst) => {
    set({ showLiveBurst });
    setStoredItem(profileSettingsKey(), { ...get(), showLiveBurst });
  },

  setThreadStyle: (threadStyle) => {
    set({ threadStyle });
    setStoredItem(profileSettingsKey(), { ...get(), threadStyle });
  },

  setThreadThickness: (threadThickness) => {
    set({ threadThickness });
    setStoredItem(profileSettingsKey(), { ...get(), threadThickness });
  },

  setLiveThread: (liveThread) => {
    set({ liveThread });
    setStoredItem(profileSettingsKey(), { ...get(), liveThread });
  },

  setThreadResultsAnimation: (threadResultsAnimation) => {
    set({ threadResultsAnimation });
    setStoredItem(profileSettingsKey(), { ...get(), threadResultsAnimation });
  },

  setShowThreadInHistory: (showThreadInHistory) => {
    set({ showThreadInHistory });
    setStoredItem(profileSettingsKey(), { ...get(), showThreadInHistory });
  },

  resetSettings: () => {
    set(DEFAULT_SETTINGS);
    applyTheme(THEMES['loom-dark']);
    sound.setConfig(
      DEFAULT_SETTINGS.soundEnabled,
      DEFAULT_SETTINGS.soundVolume,
      DEFAULT_SETTINGS.soundType,
      DEFAULT_SETTINGS.soundErrorEnabled,
      DEFAULT_SETTINGS.soundCompletionEnabled,
      DEFAULT_SETTINGS.soundPbEnabled
    );
    setStoredItem(profileSettingsKey(), DEFAULT_SETTINGS);
  },

  loadForProfile: (profileId) => {
    const stored = getStoredItem<Partial<Settings>>(
      getProfileStorageKey(STORAGE_KEYS.SETTINGS, profileId),
      profileId === 'guest' ? getStoredItem<Partial<Settings>>(STORAGE_KEYS.SETTINGS, {}) : {}
    );
    const merged = {
      ...DEFAULT_SETTINGS,
      ...stored,
      modifiers: { ...DEFAULT_MODIFIERS, ...(stored.modifiers || {}) },
    };
    set(merged);
    const themeColors =
      merged.theme === 'custom' && merged.customThemeColors
        ? { ...THEMES.custom, ...merged.customThemeColors }
        : THEMES[merged.theme] || THEMES['loom-dark'];
    applyTheme(themeColors);
    sound.setConfig(
      merged.soundEnabled,
      merged.soundVolume,
      merged.soundType,
      merged.soundErrorEnabled,
      merged.soundCompletionEnabled,
      merged.soundPbEnabled
    );
  },

  importSettings: (newSettings) => {
    const merged = {
      ...DEFAULT_SETTINGS,
      ...newSettings,
      modifiers: {
        ...DEFAULT_MODIFIERS,
        ...(newSettings.modifiers || {}),
      },
    };
    set(merged);
    const themeColors =
      merged.theme === 'custom' && merged.customThemeColors
        ? { ...THEMES['custom'], ...merged.customThemeColors }
        : THEMES[merged.theme] || THEMES['loom-dark'];
    applyTheme(themeColors);
    sound.setConfig(
      merged.soundEnabled,
      merged.soundVolume,
      merged.soundType,
      merged.soundErrorEnabled,
      merged.soundCompletionEnabled,
      merged.soundPbEnabled
    );
    setStoredItem(profileSettingsKey(), merged);
  },
}));
