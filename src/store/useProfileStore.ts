import { create } from 'zustand';
import { UserProfile, UserAccount, TestMode } from '../types';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../engine/storage';

const DEFAULT_PROFILE: UserProfile = {
  id: 'guest',
  fullName: 'Typist',
  username: 'typist',
  bio: 'Tactile typing in effortless rhythm.',
  targetWpm: 75,
  dailyMinutesGoal: 10,
  preferredMode: 'words',
  avatarColor: '#d47942',
  createdAt: Date.now(),
  testsCompleted: 0,
  totalTimeTypedSeconds: 0,
};

interface ProfileStoreState {
  currentAccount: UserAccount | null;
  accounts: UserAccount[];
  isLoggedIn: boolean;

  // Active typist fields
  id: string;
  fullName: string;
  username: string;
  bio: string;
  targetWpm: number;
  dailyMinutesGoal: number;
  preferredMode: TestMode;
  avatarColor: string;
  createdAt: number;
  testsCompleted: number;
  totalTimeTypedSeconds: number;

  // Actions
  register: (params: {
    fullName: string;
    username?: string;
    password?: string;
    bio?: string;
    avatarColor?: string;
    targetWpm?: number;
    dailyMinutesGoal?: number;
  }) => Promise<{ success: boolean; error?: string; account?: UserAccount }>;

  createProfile: (params: {
    fullName: string;
    username?: string;
    password?: string;
    bio?: string;
    avatarColor?: string;
    targetWpm?: number;
    dailyMinutesGoal?: number;
  }) => { success: boolean; error?: string; account: UserAccount };

  login: (usernameOrId: string, password?: string) => Promise<{ success: boolean; error?: string }>;

  logout: () => void;

  switchAccount: (accountId: string) => void;

  updateProfile: (
    data: Partial<Omit<UserProfile, 'id' | 'createdAt'>>,
    password?: string
  ) => Promise<{ success: boolean; error?: string }>;

  deleteAccount: (accountId: string, passwordAttempt?: string) => { success: boolean; error?: string };

  recordSession: (seconds: number) => void;

  importProfile: (profile: Partial<UserProfile>, accounts?: UserAccount[]) => void;

  resetProfile: () => void;
}

function generateCleanHandle(name: string, existingAccounts: UserAccount[]): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 16) || 'typist';

  let handle = base;
  let counter = 1;
  while (existingAccounts.some((a) => a.username.toLowerCase() === handle.toLowerCase())) {
    handle = `${base}${counter}`;
    counter++;
  }
  return handle;
}

const initialAccounts = getStoredItem<UserAccount[]>(STORAGE_KEYS.ACCOUNTS, []);
const initialCurrent = getStoredItem<UserAccount | null>(STORAGE_KEYS.PROFILE, null);

export const useProfileStore = create<ProfileStoreState>((set, get) => {
  const active = initialCurrent || (initialAccounts.length > 0 ? initialAccounts[0] : null);
  const isLogged = !!active;

  return {
    currentAccount: active,
    accounts: initialAccounts,
    isLoggedIn: isLogged,

    id: active?.id || DEFAULT_PROFILE.id,
    fullName: active?.fullName || DEFAULT_PROFILE.fullName,
    username: active?.username || DEFAULT_PROFILE.username,
    bio: active?.bio || DEFAULT_PROFILE.bio,
    targetWpm: active?.targetWpm || DEFAULT_PROFILE.targetWpm,
    dailyMinutesGoal: active?.dailyMinutesGoal || DEFAULT_PROFILE.dailyMinutesGoal,
    preferredMode: active?.preferredMode || DEFAULT_PROFILE.preferredMode,
    avatarColor: active?.avatarColor || DEFAULT_PROFILE.avatarColor,
    createdAt: active?.createdAt || DEFAULT_PROFILE.createdAt,
    testsCompleted: active?.testsCompleted || DEFAULT_PROFILE.testsCompleted,
    totalTimeTypedSeconds: active?.totalTimeTypedSeconds || DEFAULT_PROFILE.totalTimeTypedSeconds,

    createProfile: ({
      fullName,
      username,
      password,
      bio = '',
      avatarColor = '#d47942',
      targetWpm = 75,
      dailyMinutesGoal = 10,
    }) => {
      const cleanName = fullName.trim() || 'Typist';
      const cleanUsername = username?.trim() || generateCleanHandle(cleanName, get().accounts);

      // Check if existing profile matches this username
      const existing = get().accounts.find(
        (a) => a.username.toLowerCase() === cleanUsername.toLowerCase()
      );

      if (existing) {
        // Update and activate existing profile
        const updated: UserAccount = {
          ...existing,
          fullName: cleanName,
          bio: bio.trim() || existing.bio,
          avatarColor: avatarColor || existing.avatarColor,
          targetWpm: Math.max(1, targetWpm),
          dailyMinutesGoal: Math.max(1, dailyMinutesGoal),
          passwordHash: password ? password.trim() : existing.passwordHash,
          lastLoginAt: Date.now(),
        };

        const updatedAccounts = get().accounts.map((a) => (a.id === updated.id ? updated : a));
        set({
          accounts: updatedAccounts,
          currentAccount: updated,
          isLoggedIn: true,
          id: updated.id,
          fullName: updated.fullName,
          username: updated.username,
          bio: updated.bio,
          targetWpm: updated.targetWpm,
          dailyMinutesGoal: updated.dailyMinutesGoal,
          preferredMode: updated.preferredMode,
          avatarColor: updated.avatarColor,
          createdAt: updated.createdAt,
          testsCompleted: updated.testsCompleted,
          totalTimeTypedSeconds: updated.totalTimeTypedSeconds,
        });

        setStoredItem(STORAGE_KEYS.ACCOUNTS, updatedAccounts);
        setStoredItem(STORAGE_KEYS.PROFILE, updated);

        return { success: true, account: updated };
      }

      const newAccount: UserAccount = {
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        fullName: cleanName,
        username: cleanUsername,
        passwordHash: password ? password.trim() : '',
        bio: bio.trim() || 'Tactile typing in effortless rhythm.',
        targetWpm: Math.max(1, targetWpm),
        dailyMinutesGoal: Math.max(1, dailyMinutesGoal),
        preferredMode: 'words',
        avatarColor: avatarColor || '#d47942',
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        testsCompleted: 0,
        totalTimeTypedSeconds: 0,
      };

      const updatedAccounts = [...get().accounts, newAccount];
      set({
        accounts: updatedAccounts,
        currentAccount: newAccount,
        isLoggedIn: true,
        id: newAccount.id,
        fullName: newAccount.fullName,
        username: newAccount.username,
        bio: newAccount.bio,
        targetWpm: newAccount.targetWpm,
        dailyMinutesGoal: newAccount.dailyMinutesGoal,
        preferredMode: newAccount.preferredMode,
        avatarColor: newAccount.avatarColor,
        createdAt: newAccount.createdAt,
        testsCompleted: 0,
        totalTimeTypedSeconds: 0,
      });

      setStoredItem(STORAGE_KEYS.ACCOUNTS, updatedAccounts);
      setStoredItem(STORAGE_KEYS.PROFILE, newAccount);

      return { success: true, account: newAccount };
    },

    register: async (params) => {
      const res = get().createProfile(params);
      return { success: res.success, error: res.error, account: res.account };
    },

    login: async (usernameOrId) => {
      const q = usernameOrId.trim().toLowerCase();
      const accounts = get().accounts;

      let matched = accounts.find(
        (a) =>
          a.id === usernameOrId ||
          a.username.toLowerCase() === q ||
          a.fullName.toLowerCase() === q
      );

      // If no account exists yet, automatically create one on the fly!
      if (!matched) {
        const created = get().createProfile({
          fullName: usernameOrId.trim() || 'Typist',
          username: generateCleanHandle(usernameOrId, accounts),
        });
        matched = created.account;
      } else {
        const updatedAccount: UserAccount = {
          ...matched,
          lastLoginAt: Date.now(),
        };

        const updatedAccounts = accounts.map((a) =>
          a.id === updatedAccount.id ? updatedAccount : a
        );

        set({
          accounts: updatedAccounts,
          currentAccount: updatedAccount,
          isLoggedIn: true,
          id: updatedAccount.id,
          fullName: updatedAccount.fullName,
          username: updatedAccount.username,
          bio: updatedAccount.bio,
          targetWpm: updatedAccount.targetWpm,
          dailyMinutesGoal: updatedAccount.dailyMinutesGoal,
          preferredMode: updatedAccount.preferredMode,
          avatarColor: updatedAccount.avatarColor,
          createdAt: updatedAccount.createdAt,
          testsCompleted: updatedAccount.testsCompleted,
          totalTimeTypedSeconds: updatedAccount.totalTimeTypedSeconds,
        });

        setStoredItem(STORAGE_KEYS.ACCOUNTS, updatedAccounts);
        setStoredItem(STORAGE_KEYS.PROFILE, updatedAccount);
      }

      return { success: true };
    },

    logout: () => {
      set({
        currentAccount: null,
        isLoggedIn: false,
        id: DEFAULT_PROFILE.id,
        fullName: DEFAULT_PROFILE.fullName,
        username: DEFAULT_PROFILE.username,
        bio: DEFAULT_PROFILE.bio,
        targetWpm: DEFAULT_PROFILE.targetWpm,
        dailyMinutesGoal: DEFAULT_PROFILE.dailyMinutesGoal,
        preferredMode: DEFAULT_PROFILE.preferredMode,
        avatarColor: DEFAULT_PROFILE.avatarColor,
        createdAt: Date.now(),
        testsCompleted: 0,
        totalTimeTypedSeconds: 0,
      });
      setStoredItem(STORAGE_KEYS.PROFILE, null);
    },

    switchAccount: (accountId) => {
      const found = get().accounts.find((a) => a.id === accountId);
      if (!found) return;

      const updatedAccount = { ...found, lastLoginAt: Date.now() };
      const updatedAccounts = get().accounts.map((a) =>
        a.id === accountId ? updatedAccount : a
      );

      set({
        accounts: updatedAccounts,
        currentAccount: updatedAccount,
        isLoggedIn: true,
        id: updatedAccount.id,
        fullName: updatedAccount.fullName,
        username: updatedAccount.username,
        bio: updatedAccount.bio,
        targetWpm: updatedAccount.targetWpm,
        dailyMinutesGoal: updatedAccount.dailyMinutesGoal,
        preferredMode: updatedAccount.preferredMode,
        avatarColor: updatedAccount.avatarColor,
        createdAt: updatedAccount.createdAt,
        testsCompleted: updatedAccount.testsCompleted,
        totalTimeTypedSeconds: updatedAccount.totalTimeTypedSeconds,
      });

      setStoredItem(STORAGE_KEYS.ACCOUNTS, updatedAccounts);
      setStoredItem(STORAGE_KEYS.PROFILE, updatedAccount);
    },

    updateProfile: async (data, password) => {
      const current = get().currentAccount;
      if (!current) {
        get().createProfile({
          fullName: data.fullName || 'Typist',
          username: data.username,
          password: password,
          bio: data.bio,
          avatarColor: data.avatarColor,
        });
        return { success: true };
      }

      const updatedAccount: UserAccount = {
        ...current,
        ...data,
        passwordHash: password !== undefined ? password.trim() : current.passwordHash,
      };

      const updatedAccounts = get().accounts.map((a) =>
        a.id === updatedAccount.id ? updatedAccount : a
      );

      set({
        accounts: updatedAccounts,
        currentAccount: updatedAccount,
        fullName: updatedAccount.fullName,
        username: updatedAccount.username,
        bio: updatedAccount.bio,
        avatarColor: updatedAccount.avatarColor,
      });

      setStoredItem(STORAGE_KEYS.ACCOUNTS, updatedAccounts);
      setStoredItem(STORAGE_KEYS.PROFILE, updatedAccount);

      return { success: true };
    },

    deleteAccount: (accountId, passwordAttempt) => {
      const accounts = get().accounts;
      const target = accounts.find((a) => a.id === accountId);
      if (!target) {
        return { success: false, error: 'Profile not found' };
      }

      // Check password if set and passwordAttempt was provided
      if (target.passwordHash && target.passwordHash.length > 0) {
        if (passwordAttempt !== undefined && passwordAttempt !== null && passwordAttempt !== 'FORCE_DELETE') {
          if (passwordAttempt.trim() !== target.passwordHash.trim()) {
            return { success: false, error: 'Incorrect profile password' };
          }
        }
      }

      const updatedAccounts = accounts.filter((a) => a.id !== accountId);
      const isCurrent = get().currentAccount?.id === accountId || get().id === accountId;

      if (isCurrent) {
        if (updatedAccounts.length > 0) {
          const nextAccount = updatedAccounts[0];
          set({
            accounts: updatedAccounts,
            currentAccount: nextAccount,
            isLoggedIn: true,
            id: nextAccount.id,
            fullName: nextAccount.fullName,
            username: nextAccount.username,
            bio: nextAccount.bio,
            targetWpm: nextAccount.targetWpm,
            dailyMinutesGoal: nextAccount.dailyMinutesGoal,
            preferredMode: nextAccount.preferredMode,
            avatarColor: nextAccount.avatarColor,
            createdAt: nextAccount.createdAt,
            testsCompleted: nextAccount.testsCompleted,
            totalTimeTypedSeconds: nextAccount.totalTimeTypedSeconds,
          });
          setStoredItem(STORAGE_KEYS.PROFILE, nextAccount);
        } else {
          set({
            accounts: [],
            currentAccount: null,
            isLoggedIn: false,
            id: DEFAULT_PROFILE.id,
            fullName: DEFAULT_PROFILE.fullName,
            username: DEFAULT_PROFILE.username,
            bio: DEFAULT_PROFILE.bio,
            targetWpm: DEFAULT_PROFILE.targetWpm,
            dailyMinutesGoal: DEFAULT_PROFILE.dailyMinutesGoal,
            preferredMode: DEFAULT_PROFILE.preferredMode,
            avatarColor: DEFAULT_PROFILE.avatarColor,
            createdAt: Date.now(),
            testsCompleted: 0,
            totalTimeTypedSeconds: 0,
          });
          setStoredItem(STORAGE_KEYS.PROFILE, null);
        }
      } else {
        set({ accounts: updatedAccounts });
      }

      setStoredItem(STORAGE_KEYS.ACCOUNTS, updatedAccounts);
      return { success: true };
    },

    recordSession: (seconds) => {
      const current = get().currentAccount;
      const testsCompleted = get().testsCompleted + 1;
      const totalTimeTypedSeconds = get().totalTimeTypedSeconds + seconds;

      set({ testsCompleted, totalTimeTypedSeconds });

      if (current) {
        const updatedCurrent: UserAccount = {
          ...current,
          testsCompleted,
          totalTimeTypedSeconds,
        };
        const updatedAccounts = get().accounts.map((a) =>
          a.id === current.id ? updatedCurrent : a
        );

        set({
          currentAccount: updatedCurrent,
          accounts: updatedAccounts,
        });

        setStoredItem(STORAGE_KEYS.ACCOUNTS, updatedAccounts);
        setStoredItem(STORAGE_KEYS.PROFILE, updatedCurrent);
      }
    },

    importProfile: (profile, accounts) => {
      if (accounts && accounts.length > 0) {
        set({ accounts });
        setStoredItem(STORAGE_KEYS.ACCOUNTS, accounts);
      }
      if (profile) {
        set((state) => ({
          ...state,
          ...profile,
        }));
        if (profile.username) {
          const matched = (accounts || get().accounts).find(
            (a) => a.username.toLowerCase() === profile.username?.toLowerCase()
          );
          if (matched) {
            set({ currentAccount: matched, isLoggedIn: true });
            setStoredItem(STORAGE_KEYS.PROFILE, matched);
          }
        }
      }
    },

    resetProfile: () => {
      set({
        currentAccount: null,
        accounts: [],
        isLoggedIn: false,
        ...DEFAULT_PROFILE,
      });
      setStoredItem(STORAGE_KEYS.ACCOUNTS, []);
      setStoredItem(STORAGE_KEYS.PROFILE, null);
    },
  };
});
