import React, { useState, useId } from 'react';
import {
  User,
  Check,
  UserPlus,
  Edit3,
  Sparkles,
  Keyboard,
  CheckCircle2,
  Trash2,
  Layers,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useProfileStore } from '../../store/useProfileStore';
import { AVATAR_PALETTES, getInitials } from '../../engine/auth';
import { UserAccount } from '../../types';

interface ProfileViewProps {
  onSwitchToTyping?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onSwitchToTyping }) => {
  const {
    isLoggedIn,
    currentAccount,
    accounts,
    fullName,
    username,
    bio,
    avatarColor,
    createProfile,
    switchAccount,
    updateProfile,
    deleteAccount,
  } = useProfileStore();

  // Active view state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(!isLoggedIn || accounts.length === 0);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Form states
  const [formFullName, setFormFullName] = useState<string>(fullName || '');
  const [formUsername, setFormUsername] = useState<string>(username || '');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formBio, setFormBio] = useState<string>(bio || '');
  const [formColor, setFormColor] = useState<string>(avatarColor || AVATAR_PALETTES[0].bg);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Delete modal states
  const [deletingAccount, setDeletingAccount] = useState<UserAccount | null>(null);
  const [deletePasswordAttempt, setDeletePasswordAttempt] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fullNameId = useId();
  const usernameId = useId();
  const passwordId = useId();
  const bioId = useId();

  const handleOpenEdit = () => {
    setFormFullName(fullName);
    setFormUsername(username);
    setFormPassword('');
    setFormBio(bio);
    setFormColor(avatarColor);
    setIsCreatingNew(false);
    setIsFormOpen(true);
  };

  const handleOpenCreateNew = () => {
    setFormFullName('');
    setFormUsername('');
    setFormPassword('');
    setFormBio('');
    setFormColor(AVATAR_PALETTES[accounts.length % AVATAR_PALETTES.length].bg);
    setIsCreatingNew(true);
    setIsFormOpen(true);
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = formFullName.trim() || 'Typist';

    if (isCreatingNew || !isLoggedIn) {
      createProfile({
        fullName: cleanName,
        username: formUsername.trim() || undefined,
        password: formPassword.trim() || undefined,
        bio: formBio.trim() || 'Tactile typing in effortless rhythm.',
        avatarColor: formColor,
      });
    } else {
      updateProfile(
        {
          fullName: cleanName,
          username: formUsername.trim() || username,
          bio: formBio.trim(),
          avatarColor: formColor,
        },
        formPassword
      );
    }

    setIsFormOpen(false);
    setIsCreatingNew(false);

    // Direct transition to typing tab on save!
    if (onSwitchToTyping) {
      onSwitchToTyping();
    }
  };

  const handlePromptDelete = (acc: UserAccount) => {
    setDeletingAccount(acc);
    setDeletePasswordAttempt('');
    setDeleteError(null);
  };

  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletingAccount) return;

    const result = deleteAccount(deletingAccount.id, deletePasswordAttempt);

    if (result.success) {
      setDeletingAccount(null);
      setDeletePasswordAttempt('');
      setDeleteError(null);

      // If no accounts left, open form
      if (useProfileStore.getState().accounts.length === 0) {
        setIsCreatingNew(true);
        setIsFormOpen(true);
      }
    } else {
      setDeleteError(result.error || 'Failed to delete profile. Please check password.');
    }
  };

  const handleForceDelete = () => {
    if (!deletingAccount) return;
    const result = deleteAccount(deletingAccount.id, 'FORCE_DELETE');
    if (result.success) {
      setDeletingAccount(null);
      setDeletePasswordAttempt('');
      setDeleteError(null);
      if (useProfileStore.getState().accounts.length === 0) {
        setIsCreatingNew(true);
        setIsFormOpen(true);
      }
    }
  };

  const currentInitials = getInitials(fullName || username);

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 flex flex-col gap-5 sm:gap-6 animate-in fade-in duration-300 select-none">
      {/* 1. Header Card - Active Typist Overview */}
      <div
        className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 shadow-xs relative overflow-hidden"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-4 sm:gap-5">
          <div
            className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl flex items-center justify-center font-bold text-xl sm:text-3xl text-white shadow-md select-none shrink-0"
            style={{ backgroundColor: avatarColor || '#d47942' }}
          >
            {currentInitials}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                {fullName || 'Typist'}
              </h2>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--accent)',
                }}
              >
                @{username || 'typist'}
              </span>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--accent)',
                }}
              >
                <Sparkles size={11} />
                Local Typist Profile
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed max-w-xl" style={{ color: 'var(--sub)' }}>
              {bio || 'Tactile typing in effortless rhythm on TYPELOOM.'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-center shrink-0">
          {onSwitchToTyping && (
            <button
              type="button"
              onClick={onSwitchToTyping}
              className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
            >
              <Keyboard size={15} />
              Start Typing
            </button>
          )}

          <button
            type="button"
            onClick={isFormOpen ? () => setIsFormOpen(false) : handleOpenEdit}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all hover:bg-[var(--surface-2)] cursor-pointer"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <Edit3 size={14} />
            {isFormOpen ? 'Close Form' : 'Edit Profile'}
          </button>

          <button
            type="button"
            onClick={handleOpenCreateNew}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all hover:bg-[var(--surface-2)] cursor-pointer"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <UserPlus size={14} />
            New Profile
          </button>

          {currentAccount && (
            <button
              type="button"
              onClick={() => handlePromptDelete(currentAccount)}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold border border-red-500/30 text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Delete current active profile"
            >
              <Trash2 size={14} />
              Delete Active
            </button>
          )}
        </div>
      </div>

      {/* 2. Hyper-Responsive Saved Typist Profiles Grid */}
      <div
        className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border flex flex-col gap-4 shadow-xs"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between border-b pb-3.5" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Layers size={18} style={{ color: 'var(--accent)' }} />
            <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text)' }}>
              Local Profiles on Device ({accounts.length})
            </h3>
          </div>
          <span className="text-xs font-mono" style={{ color: 'var(--sub)' }}>
            Switch or delete anytime
          </span>
        </div>

        {accounts.length === 0 ? (
          <div className="py-8 text-center text-xs" style={{ color: 'var(--sub)' }}>
            No profiles saved yet. Fill in the form below to create your first local typist profile!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {accounts.map((acc) => {
              const isSelected = acc.id === currentAccount?.id;
              const hasPassword = !!(acc.passwordHash && acc.passwordHash.length > 0);

              return (
                <div
                  key={acc.id}
                  className={`p-4 rounded-xl sm:rounded-2xl border flex flex-col justify-between gap-3 transition-all relative ${
                    isSelected ? 'ring-2 ring-[var(--accent)]' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs shrink-0"
                      style={{ backgroundColor: acc.avatarColor || 'var(--accent)' }}
                    >
                      {getInitials(acc.fullName || acc.username)}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-sm truncate" style={{ color: 'var(--text)' }}>
                          {acc.fullName}
                        </span>
                        {hasPassword && (
                          <Lock size={11} className="shrink-0" style={{ color: 'var(--sub)' }} title="Password protected" />
                        )}
                      </div>
                      <span className="text-[11px] font-mono truncate" style={{ color: 'var(--sub)' }}>
                        @{acc.username}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                    {isSelected ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg border bg-[var(--surface)] text-[var(--accent)] border-[var(--accent)] flex items-center gap-1">
                        <Check size={12} />
                        Active Profile
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => switchAccount(acc.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:bg-[var(--surface)] cursor-pointer"
                        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                      >
                        Switch Profile
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePromptDelete(acc)}
                      className="p-1.5 rounded-lg border text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      style={{ borderColor: 'var(--border)' }}
                      title="Delete profile"
                      aria-label={`Delete profile for ${acc.fullName}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Streamlined Profile Creation & Editing Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitProfile}
          className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl border flex flex-col gap-5 shadow-xs animate-in fade-in zoom-in-95 duration-200"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between border-b pb-3.5" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <User size={18} style={{ color: 'var(--accent)' }} />
              <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text)' }}>
                {isCreatingNew
                  ? 'Create New Typist Profile'
                  : isLoggedIn
                  ? 'Personalize Your Typist Profile'
                  : 'Set Up Your Typist Profile'}
              </h3>
            </div>
            <span className="text-xs font-mono" style={{ color: 'var(--sub)' }}>
              Stored locally on device
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor={fullNameId} className="text-xs font-semibold" style={{ color: 'var(--sub)' }}>
                Typist Name / Display Name *
              </label>
              <input
                id={fullNameId}
                type="text"
                required
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition-all focus:border-[var(--accent)]"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>

            {/* Handle / Username */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor={usernameId} className="text-xs font-semibold" style={{ color: 'var(--sub)' }}>
                Typist Handle (@username)
              </label>
              <input
                id={usernameId}
                type="text"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder="e.g. alex_fast"
                className="px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition-all focus:border-[var(--accent)] font-mono"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>

            {/* Optional Security Password */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label htmlFor={passwordId} className="text-xs font-semibold flex items-center justify-between" style={{ color: 'var(--sub)' }}>
                <span className="flex items-center gap-1">
                  <Lock size={12} style={{ color: 'var(--accent)' }} />
                  Profile Security Password (Optional)
                </span>
                <span className="text-[11px] font-normal" style={{ color: 'var(--sub)' }}>
                  Required to confirm profile deletion
                </span>
              </label>
              <div className="relative flex items-center">
                <input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Set an optional password for profile modification or deletion..."
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border text-xs sm:text-sm outline-none transition-all focus:border-[var(--accent)] font-mono"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[var(--sub)] hover:text-[var(--text)] transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Avatar Palette Picker */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--sub)' }}>
                Avatar Color Theme
              </label>
              <div className="flex items-center gap-2.5 flex-wrap pt-1">
                {AVATAR_PALETTES.map((palette) => (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => setFormColor(palette.bg)}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-xs"
                    style={{
                      backgroundColor: palette.bg,
                      borderColor: formColor === palette.bg ? 'var(--text)' : 'transparent',
                    }}
                    title={palette.label}
                  >
                    {formColor === palette.bg && <Check size={14} className="text-white drop-shadow-sm" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Bio / Focus Motto */}
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label htmlFor={bioId} className="text-xs font-semibold" style={{ color: 'var(--sub)' }}>
                Focus Motto / Personal Note
              </label>
              <input
                id={bioId}
                type="text"
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                placeholder="e.g. Quiet focus, effortless muscle memory..."
                className="px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition-all focus:border-[var(--accent)]"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            {isLoggedIn && accounts.length > 0 && (
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors hover:bg-[var(--surface-2)] cursor-pointer"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
            >
              <CheckCircle2 size={16} />
              Save Profile & Start Typing
            </button>
          </div>
        </form>
      )}

      {/* 4. Delete Profile Password Confirmation Modal */}
      {deletingAccount && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setDeletingAccount(null)}
        >
          <div
            className="w-full max-w-md p-6 rounded-2xl sm:rounded-3xl border shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 text-red-400">
                <ShieldAlert size={18} />
                <h3 className="font-bold text-sm sm:text-base">Confirm Profile Deletion</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeletingAccount(null)}
                className="p-1 rounded-lg hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                style={{ color: 'var(--sub)' }}
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
              Are you sure you want to delete profile <strong className="text-[var(--accent)]">{deletingAccount.fullName}</strong> (@{deletingAccount.username})?
              This action cannot be undone.
            </p>

            <form onSubmit={handleConfirmDelete} className="flex flex-col gap-3">
              {deletingAccount.passwordHash ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--sub)' }}>
                    Enter Profile Password:
                  </label>
                  <input
                    type="password"
                    required
                    autoFocus
                    value={deletePasswordAttempt}
                    onChange={(e) => setDeletePasswordAttempt(e.target.value)}
                    placeholder="Enter password to confirm..."
                    className="px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none font-mono"
                    style={{
                      backgroundColor: 'var(--surface-2)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
              ) : (
                <p className="text-xs font-mono p-2.5 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-500">
                  Notice: No password set for this profile. Click confirm below to permanently remove it.
                </p>
              )}

              {deleteError && (
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                    <AlertCircle size={14} />
                    <span>{deleteError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleForceDelete}
                    className="text-xs font-semibold underline text-red-400 hover:text-red-300 text-left cursor-pointer"
                  >
                    Forgot password? Click here to Force Delete Profile anyway
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t mt-1" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setDeletingAccount(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border transition-colors hover:bg-[var(--surface-2)] cursor-pointer"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Delete Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
