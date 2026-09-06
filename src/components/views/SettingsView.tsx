import React, { useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { THEMES } from '../../data/themes';
import { sound, SOUND_PROFILES } from '../../engine/sound';
import { ThemeId, SoundProfileId } from '../../types';
import {
  Palette,
  Volume2,
  VolumeX,
  Type,
  Sliders,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Check,
  Play,
  Zap,
} from 'lucide-react';
import { ConfirmDialog } from '../ConfirmDialog';

interface SettingsViewProps {
  onExport: () => void;
  onTriggerImport: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onExport,
  onTriggerImport,
}) => {
  const settings = useSettingsStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [soundFeedback, setSoundFeedback] = useState(false);

  const themeList = Object.values(THEMES);

  const handleSoundTest = () => {
    sound.unlockAudio();
    sound.playKeystroke(false);
    setSoundFeedback(true);
    setTimeout(() => setSoundFeedback(false), 200);
  };

  const handlePreviewError = () => {
    sound.unlockAudio();
    sound.playError();
  };

  const handlePreviewCompletion = () => {
    sound.unlockAudio();
    sound.playCompletion();
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div
        className="p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div>
          <h2 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
            Settings & Customization
          </h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--sub)' }}>
            Configure visual themes, mechanical audio feedback, typography, and test constraints.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onExport}
            className="px-3.5 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors hover:bg-[var(--surface-2)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <Download size={14} />
            Export Backup
          </button>
          <button
            type="button"
            onClick={onTriggerImport}
            className="px-3.5 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors hover:bg-[var(--surface-2)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <Upload size={14} />
            Import Backup
          </button>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-2 rounded-lg text-xs font-medium border text-red-400 hover:bg-red-500/10 border-red-500/30 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={14} />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Theme Selection */}
      <div
        className="p-6 rounded-2xl border flex flex-col gap-4 shadow-sm"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-2">
          <Palette size={18} style={{ color: 'var(--accent)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            Color Theme Palette
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {themeList.map((th) => {
            const isSelected = settings.theme === th.id;
            return (
              <button
                key={th.id}
                type="button"
                onClick={() => settings.setTheme(th.id as ThemeId)}
                className={`p-3 rounded-xl border flex flex-col gap-2.5 text-left transition-all hover:scale-[1.02] ${
                  isSelected ? 'ring-2 ring-[var(--accent)]' : ''
                }`}
                style={{
                  backgroundColor: th.surface,
                  borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-semibold capitalize"
                    style={{ color: th.text }}
                  >
                    {th.name}
                  </span>
                  {isSelected && <Check size={14} style={{ color: th.accent }} />}
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: th.bg }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: th.surface }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: th.accent }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: th.text }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sound & Audio Studio */}
      <div
        className="p-6 rounded-2xl border flex flex-col gap-4 shadow-sm"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 size={18} style={{ color: 'var(--accent)' }} />
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
              Acoustic Sound Synthesizer
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSoundTest}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                soundFeedback ? 'scale-95 bg-[var(--surface-2)]' : ''
              }`}
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              <Play size={12} style={{ color: 'var(--accent)' }} />
              Audition Key
            </button>
            <button
              type="button"
              onClick={() => settings.setSoundEnabled(!settings.soundEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                settings.soundEnabled
                  ? 'bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--sub)] hover:text-[var(--text)]'
              }`}
            >
              {settings.soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              {settings.soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {SOUND_PROFILES.map((preset) => {
            const isSelected = settings.soundType === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  settings.setSoundType(preset.id as SoundProfileId);
                  handleSoundTest();
                }}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all hover:scale-[1.02] ${
                  isSelected ? 'border-[var(--accent)] bg-[var(--surface-2)] font-semibold' : 'border-[var(--border)]'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--surface-2)' : 'var(--surface)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: isSelected ? 'var(--accent)' : 'var(--text)' }}>
                    {preset.name}
                  </span>
                  {isSelected && <Check size={12} style={{ color: 'var(--accent)' }} />}
                </div>
                <span className="text-[10px] line-clamp-1" style={{ color: 'var(--sub)' }}>
                  {preset.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Volume & Audio Cue Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--sub)' }}>
              <span>Synthesizer Volume</span>
              <span className="font-mono">{Math.round(settings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                settings.setSoundVolume(vol);
              }}
              className="w-full accent-[var(--accent)] cursor-pointer"
            />
          </div>

          <div
            className="flex items-center justify-between p-3 rounded-xl border"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePreviewError}
                className="p-1 rounded hover:opacity-80 transition-opacity"
                style={{ color: 'var(--accent)' }}
                title="Audition Error Buzz"
              >
                <Play size={12} />
              </button>
              <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                Error Buzz
              </span>
            </div>
            <button
              type="button"
              onClick={() => settings.setSoundErrorEnabled(!settings.soundErrorEnabled)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                settings.soundErrorEnabled
                  ? 'bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--sub)]'
              }`}
            >
              {settings.soundErrorEnabled ? 'Active' : 'Off'}
            </button>
          </div>

          <div
            className="flex items-center justify-between p-3 rounded-xl border"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePreviewCompletion}
                className="p-1 rounded hover:opacity-80 transition-opacity"
                style={{ color: 'var(--accent)' }}
                title="Audition Completion Chime"
              >
                <Play size={12} />
              </button>
              <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                Completion Chime
              </span>
            </div>
            <button
              type="button"
              onClick={() => settings.setSoundCompletionEnabled(!settings.soundCompletionEnabled)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                settings.soundCompletionEnabled
                  ? 'bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--sub)]'
              }`}
            >
              {settings.soundCompletionEnabled ? 'Active' : 'Off'}
            </button>
          </div>
        </div>
      </div>

      {/* Typography & Caret Controls */}
      <div
        className="p-6 rounded-2xl border flex flex-col gap-4 shadow-sm"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-2">
          <Type size={18} style={{ color: 'var(--accent)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            Typography & Visual Caret
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--sub)' }}>
              <span>Font Size</span>
              <span className="font-mono">{settings.fontSize}px</span>
            </div>
            <input
              type="range"
              min="18"
              max="40"
              step="2"
              value={settings.fontSize}
              onChange={(e) => settings.setFontSize(Number(e.target.value))}
              className="w-full accent-[var(--accent)] cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs" style={{ color: 'var(--sub)' }}>
              Caret Style
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['line', 'block', 'underline'] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => settings.setCaretStyle(style)}
                  className={`py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors ${
                    settings.caretStyle === style
                      ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--surface-2)] font-semibold'
                      : 'border-[var(--border)] text-[var(--sub)] hover:text-[var(--text)]'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs" style={{ color: 'var(--sub)' }}>
              Caret Animation Speed
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['smooth', 'snappy', 'instant'] as const).map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => settings.setCaretSpeed(speed)}
                  className={`py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors ${
                    settings.caretSpeed === speed
                      ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--surface-2)] font-semibold'
                      : 'border-[var(--border)] text-[var(--sub)] hover:text-[var(--text)]'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Test Modifiers & Constraints */}
      <div
        className="p-6 rounded-2xl border flex flex-col gap-4 shadow-sm"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-2">
          <Sliders size={18} style={{ color: 'var(--accent)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            Practice Modifiers & Rules
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { key: 'punctuation', label: 'Punctuation', desc: 'Adds commas, periods, hyphens' },
            { key: 'numbers', label: 'Numbers', desc: 'Adds digit sequences' },
            { key: 'capitalize', label: 'Capitalization', desc: 'Random capitalized words' },
            { key: 'strictSpace', label: 'Strict Space', desc: 'Cannot skip uncorrected words' },
            { key: 'confidence', label: 'Confidence Mode', desc: 'Backspace is disabled' },
            { key: 'stopOnError', label: 'Stop on Error', desc: 'Must fix mistake before next key' },
          ].map((item) => {
            const isEnabled = settings.modifiers[item.key as keyof typeof settings.modifiers];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => settings.toggleModifier(item.key as any)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all ${
                  isEnabled
                    ? 'border-[var(--accent)] bg-[var(--surface-2)]'
                    : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
                }`}
                style={{ backgroundColor: isEnabled ? 'var(--surface-2)' : 'var(--surface)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: isEnabled ? 'var(--accent)' : 'var(--text)' }}>
                    {item.label}
                  </span>
                  {isEnabled && <Check size={12} style={{ color: 'var(--accent)' }} />}
                </div>
                <span className="text-[11px]" style={{ color: 'var(--sub)' }}>
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset All Preferences"
        description="Are you sure you want to reset all preferences, sound options, and caret styles to their default settings?"
        confirmLabel="Reset Defaults"
        onConfirm={() => {
          settings.resetSettings();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};

