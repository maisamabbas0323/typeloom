import React from 'react';
import { CloseIcon } from './Icons';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="confirm-dialog-backdrop"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
      onClick={onCancel}
    >
      <div
        id="confirm-dialog"
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="flex items-center justify-between">
          <h3 id="confirm-dialog-title" className="text-base font-semibold" style={{ color: 'var(--text)' }}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-md hover:opacity-75"
            style={{ color: 'var(--sub)' }}
            aria-label="Cancel"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <p className="text-xs leading-relaxed" style={{ color: 'var(--sub)' }}>
          {description}
        </p>

        <div className="flex items-center justify-end gap-2.5 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            Cancel
          </button>

          <button
            id="confirm-action-btn"
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm"
            style={{
              backgroundColor: isDestructive ? 'var(--error)' : 'var(--accent)',
              color: '#ffffff',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
