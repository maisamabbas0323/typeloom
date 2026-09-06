import React, { useState, useEffect, useId } from 'react';
import {
  User,
  Check,
  X,
  Target,
  Sparkles,
  UserPlus,
  Edit3,
  CheckCircle2,
  Trash2,
  Layers,
  Keyboard,
} from 'lucide-react';
import { useProfileStore } from '../store/useProfileStore';
import { AVATAR_PALETTES, getInitials } from '../engine/auth';
import { TargetSpeedGoalPicker } from './TargetSpeedGoalPicker';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    isLoggedIn,
    currentAccount,
    accounts,
    fullName,
    username,
    bio,
    targetWpm,
    dailyMinutesGoal,
    avatarColor,
    createProfile,
    switchAccount,
    updateProfile,
    deleteAccount,
  } = useProfileStore();

  const [isEditing, setIsEditing] = useState<boolean>(!isLoggedIn || accounts.length === 0);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  const [formFullName, setFormFullName] = useState<string>(fullName || '');
  const [formUsername, setFormUsername] = useState<string>(username || '');
  const [formBio, setFormBio] = useState<string>(bio || '');
  const [formColor, setFormColor] = useState<string>(avatarColor || AVATAR_PALETTES[0].bg);
  const [formTargetWpm, setFormTargetWpm] = useState<number>(targetWpm || 75);
  const [formDailyMinutes, setFormDailyMinutes] = useState<number>(dailyMinutesGoal || 10);

  const fullNameId = useId();
  const usernameId = useId();
  const bioId = useId();

  useEffect(() => {
    if (isOpen) {
      if (!isLoggedIn || accounts.length === 0) {
        setIsEditing(true);
        setIsCreatingNew(true);
        setFormFullName('');
        setFormUsername('');
        setFormBio('');
        setFormColor(AVATAR_PALETTES[0].bg);
        setFormTargetWpm(75);
        setFormDailyMinutes(10);
      } else {
        setIsEditing(false);
        setIsCreatingNew(false);
        setFormFullName(fullName);
        setFormUsername(username);
        setFormBio(bio);
        setFormColor(avatarColor);
        setFormTargetWpm(targetWpm);
        setFormDailyMinutes(dailyMinutesGoal);
      }
    }
  }, [isOpen, isLoggedIn, accounts.length, fullName, username, bio, avatarColor, targetWpm, dailyMinutesGoal]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formFullName.trim() || 'Typist';

    if (isCreatingNew || !isLoggedIn) {
      createProfile({
        fullName: cleanName,
        username: formUsername.trim() || undefined,
        bio: formBio.trim() || 'Tactile typing in effortless rhythm.',
        avatarColor: formColor,
        targetWpm: formTargetWpm,
        dailyMinutesGoal: formDailyMinutes,
      });
    } else {
      updateProfile({
        fullName: cleanName,
        username: formUsername.trim() || username,
        bio: formBio.trim(),
        avatarColor: formColor,
        targetWpm: formTargetWpm,
        dailyMinutesGoal: formDailyMinutes,
      });
    }

    onClose();
  };

  const currentInitials = getInitials(fullName || username);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)',
                color: 'var(--accent)',
              }}
            >
              <User size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold">
                {isEditing ? (isCreatingNew ? 'Create Typist Profile' : 'Edit Typist Profile') : 'Typist Profile'}
              </h3>
              <p className="text-xs text-[var(--sub)]">
                Local-first storage on this browser session.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border transition-colors hover:bg-[var(--surface-2)] cursor-pointer text-[var(--sub)] hover:text-[var(--text)]"
            style={{ borderColor: 'var(--border)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form or View */}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={fullNameId} className="text-xs font-medium text-[var(--sub)]">
                Typist Display Name
              </label>
              <input
                id={fullNameId}
                type="text"
                required
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={usernameId} className="text-xs font-medium text-[var(--sub)]">
                Typist Handle (@username)
              </label>
              <input
                id={usernameId}
                type="text"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder="e.g. alex_typing"
                className="px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none font-mono"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--sub)]">
                Avatar Palette
              </label>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {AVATAR_PALETTES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormColor(p.bg)}
                    className="w-7 h-7 rounded-lg border flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    style={{
                      backgroundColor: p.bg,
                      borderColor: formColor === p.bg ? 'var(--text)' : 'transparent',
                    }}
                    title={p.label}
                  >
                    {formColor === p.bg && <Check size={12} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={bioId} className="text-xs font-medium text-[var(--sub)]">
                Focus Motto / Bio
              </label>
              <input
                id={bioId}
                type="text"
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                placeholder="Quiet typing in effortless rhythm..."
                className="px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <span className="text-xs font-medium text-[var(--sub)]">Target Speed Goal</span>
              <TargetSpeedGoalPicker
                targetWpm={formTargetWpm}
                onSelectTargetWpm={setFormTargetWpm}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              {isLoggedIn && accounts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium border cursor-pointer hover:bg-[var(--surface-2)]"
                  style={{ borderColor: 'var(--border)' }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
              >
                <CheckCircle2 size={14} />
                Save & Start Typing
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3.5 p-4 rounded-xl border" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-xs shrink-0"
                style={{ backgroundColor: avatarColor }}
              >
                {currentInitials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm">{fullName || 'Typist'}</h4>
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--accent)] border" style={{ borderColor: 'var(--border)' }}>
                    @{username}
                  </span>
                </div>
                <p className="text-xs text-[var(--sub)] mt-0.5">{bio || 'Tactile typing enthusiast'}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setIsCreatingNew(false);
                }}
                className="flex-1 py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 hover:bg-[var(--surface-2)] cursor-pointer"
                style={{ borderColor: 'var(--border)' }}
              >
                <Edit3 size={13} />
                Edit Details
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setIsCreatingNew(true);
                  setFormFullName('');
                  setFormUsername('');
                  setFormBio('');
                }}
                className="flex-1 py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 hover:bg-[var(--surface-2)] cursor-pointer"
                style={{ borderColor: 'var(--border)' }}
              >
                <UserPlus size={13} />
                New Profile
              </button>
            </div>

            {/* Close & Continue to Typing button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
              style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
            >
              <Keyboard size={15} />
              Continue to Typing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
