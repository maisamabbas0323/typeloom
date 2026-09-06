import React from 'react';

interface ShortcutsBarProps {
  isTyping: boolean;
  onOpenSettings: () => void;
}

export const ShortcutsBar: React.FC<ShortcutsBarProps> = ({ isTyping, onOpenSettings }) => {
  return (
    <footer
      id="typeloom-shortcuts-bar"
      className={`w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 transition-opacity duration-500 select-none text-[11px] font-mono flex flex-wrap items-center justify-between gap-y-3 ${
        isTyping ? 'opacity-50' : 'opacity-60 hover:opacity-90'
      }`}
      style={{ color: 'var(--sub)' }}
    >
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] text-[10px]">
            Tab
          </kbd>
          or
          <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] text-[10px]">
            Enter
          </kbd>
          restart
        </span>

        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] text-[10px]">
            Esc
          </kbd>
          preferences
        </span>

        <span className="hidden sm:flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] text-[10px]">
            1-4
          </kbd>
          modes
        </span>

        <span className="hidden md:flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] text-[10px]">
            ⌘/Ctrl + K
          </kbd>
          search
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSettings}
          className="hover:underline cursor-pointer"
        >
          Preferences
        </button>
        <span>•</span>
        <span>Offline-first &amp; private</span>
      </div>
    </footer>
  );
};
