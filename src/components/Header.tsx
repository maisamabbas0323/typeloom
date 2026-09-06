import React from 'react';
import {
  Volume2,
  VolumeX,
} from 'lucide-react';
import { TypeloomIcon } from './Icons';
import { useSettingsStore } from '../store/useSettingsStore';
import { THEMES } from '../data/themes';
import { ThemeId } from '../types';

interface HeaderProps {
  isTyping: boolean;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenProfile: () => void;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isTyping,
  onNavigateHome,
}) => {
  const { theme, setTheme, soundEnabled, setSoundEnabled } = useSettingsStore();

  const themeKeys: ThemeId[] = [
    'loom-dark',
    'midnight-thread',
    'paperloom',
    'ink-linen',
    'copper-thread',
    'forest-desk',
    'winter-paper',
    'evening-coffee',
    'old-library',
    'moss-stone',
    'blue-hour',
    'sunlit-paper',
  ];

  const cycleTheme = () => {
    const currentIndex = themeKeys.indexOf(theme as ThemeId);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  };

  const currentThemeMeta = THEMES[theme] || THEMES['loom-dark'];

  return (
    <header
      id="typeloom-header"
      className={`w-full max-w-5xl mx-auto pt-6 pb-4 px-4 sm:px-6 flex items-center justify-between transition-opacity duration-500 select-none ${
        isTyping ? 'opacity-70 hover:opacity-100' : 'opacity-100'
      }`}
    >
      {/* Brand & Wordmark */}
      <div className="relative group">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-3 text-left cursor-pointer outline-none"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all shadow-xs group-hover:scale-105"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <TypeloomIcon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text)' }}>
                TYPELOOM
              </span>
            </div>
            <p className="text-xs hidden sm:block tracking-normal" style={{ color: 'var(--sub)' }}>
              threads of thought, typed in effortless rhythm
            </p>
          </div>
        </button>

        {/* Responsive Tooltip for Brand */}
        <div
          role="tooltip"
          className="absolute pointer-events-none opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-150 ease-out z-50
            left-0 top-full mt-2
            px-2.5 py-1.5 rounded-lg text-xs font-medium border shadow-lg whitespace-nowrap hidden sm:flex items-center"
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <span>Return to Typing Surface</span>
        </div>
      </div>

      {/* Header Utilities */}
      <div className="flex items-center gap-2">
        {/* Sound toggle with responsive tooltip */}
        <div className="relative group">
          <button
            id="sound-toggle-btn"
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl transition-all border hover:opacity-90 shrink-0 cursor-pointer shadow-xs"
            style={{
              backgroundColor: soundEnabled ? 'var(--surface-2)' : 'var(--surface)',
              borderColor: soundEnabled ? 'var(--accent)' : 'var(--border)',
              color: soundEnabled ? 'var(--accent)' : 'var(--sub)',
            }}
            aria-label={soundEnabled ? 'Mute keyboard sound' : 'Enable keyboard sound'}
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Tooltip */}
          <div
            role="tooltip"
            className="absolute pointer-events-none opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-150 ease-out z-50
              right-0 top-full mt-2
              px-2.5 py-1 rounded-lg text-xs font-medium border shadow-lg whitespace-nowrap flex items-center"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <span>{soundEnabled ? 'Mute Audio' : 'Enable Sound'}</span>
          </div>
        </div>

        {/* Theme cycler with responsive tooltip */}
        <div className="relative group">
          <button
            id="theme-quick-btn"
            type="button"
            onClick={cycleTheme}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 hover:opacity-90 shrink-0 cursor-pointer shadow-xs"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--sub)',
            }}
            aria-label={`Cycle theme, currently ${currentThemeMeta?.name}`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs transition-transform group-hover:scale-110"
              style={{ backgroundColor: 'var(--accent)' }}
            />
            <span className="hidden sm:inline font-mono">{currentThemeMeta?.name}</span>
          </button>

          {/* Tooltip */}
          <div
            role="tooltip"
            className="absolute pointer-events-none opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-150 ease-out z-50
              right-0 top-full mt-2
              px-2.5 py-1 rounded-lg text-xs font-medium border shadow-lg whitespace-nowrap flex items-center"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <span>Theme: {currentThemeMeta?.name} (Click to cycle)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
