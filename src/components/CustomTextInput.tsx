import React, { useState } from 'react';
import { CloseIcon, ArrowRightIcon, TrashIcon } from './Icons';
import { prepareCustomText } from '../engine/generator';

interface CustomTextInputProps {
  isOpen: boolean;
  initialText: string;
  onSaveAndStart: (text: string) => void;
  onClose: () => void;
}

export const CustomTextInput: React.FC<CustomTextInputProps> = ({
  isOpen,
  initialText,
  onSaveAndStart,
  onClose,
}) => {
  const [text, setText] = useState(initialText || '');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const sanitized = prepareCustomText(text);
  const wordCount = sanitized ? sanitized.split(/\s+/).length : 0;
  const charCount = sanitized.length;

  const handleStart = () => {
    if (!sanitized || sanitized.length < 5) {
      setErrorMsg('Please enter at least a few words (minimum 5 characters).');
      return;
    }
    setErrorMsg('');
    onSaveAndStart(sanitized);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleStart();
    }
  };

  return (
    <div
      id="custom-text-modal-backdrop"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        id="custom-text-dialog"
        className="w-full max-w-2xl rounded-2xl border p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-text-heading"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 id="custom-text-heading" className="text-base font-semibold" style={{ color: 'var(--text)' }}>
              Custom Practice Text
            </h3>
            <p className="text-xs" style={{ color: 'var(--sub)' }}>
              Paste or type your own practice material. Everything stays on this device.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--sub)',
            }}
            aria-label="Close custom text modal"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            id="custom-text-textarea"
            rows={8}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Paste poetry, code comments, literature, or custom drills here..."
            className="w-full rounded-xl p-4 font-mono text-sm leading-relaxed border outline-none resize-y transition-colors"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: errorMsg ? 'var(--error)' : 'var(--border)',
              color: 'var(--text)',
            }}
            autoFocus
          />
          {errorMsg && (
            <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>
              {errorMsg}
            </p>
          )}
        </div>

        {/* Footer & Actions */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 font-mono" style={{ color: 'var(--sub)' }}>
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>

          <div className="flex items-center gap-2">
            {text && (
              <button
                type="button"
                onClick={() => setText('')}
                className="px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 hover:opacity-80"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: 'var(--border)',
                  color: 'var(--sub)',
                }}
              >
                <TrashIcon size={13} />
                <span>Clear</span>
              </button>
            )}

            <button
              id="start-custom-run-btn"
              type="button"
              onClick={handleStart}
              className="px-4 py-2 rounded-lg font-medium text-xs transition-all flex items-center gap-1.5 shadow-sm"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--bg)',
              }}
            >
              <span>Begin Run</span>
              <ArrowRightIcon size={14} />
              <kbd className="ml-1 text-[10px] opacity-75 font-mono px-1 py-0.5 rounded bg-black/20">
                ⌘+Enter
              </kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
