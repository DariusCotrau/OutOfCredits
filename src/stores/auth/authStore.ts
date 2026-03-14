import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, FirebaseUser } from '@services/firebase';
import type { UserProfile, UserSettings } from '@shared/types';

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

export type AuthErrorCode =
  | 'invalid-email'
  | 'user-disabled'
  | 'user-not-found'
  | 'wrong-password'
  | 'email-already-in-use'
  | 'weak-password'
  | 'operation-not-allowed'
  | 'too-many-requests'
  | 'network-error'
  | 'unknown';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthState {
  status: AuthStatus;
  user: FirebaseUser | null;
  profile: UserProfile | null;
  settings: UserSettings | null;
  error: AuthError | null;
  isInitialized: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signUp: (data: SignUpData) => Promise<boolean>;
  signIn: (data: SignInData) => Promise<boolean>;
  signInAnonymously: () => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<boolean>;
  updateEmail: (newEmail: string, password: string) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  deleteAccount: (password: string) => Promise<boolean>;
  clearError: () => void;
  setProfile: (profile: UserProfile | null) => void;
  setSettings: (settings: UserSettings | null) => void;
}

const FB_ERRORS: Partial<Record<string, string>> = {
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
};

const FB_CODE_MAP: Partial<Record<string, AuthErrorCode>> = {
  'auth/invalid-email': 'invalid-email',
  'auth/user-disabled': 'user-disabled',
  'auth/user-not-found': 'user-not-found',
  'auth/wrong-password': 'wrong-password',
  'auth/email-already-in-use': 'email-already-in-use',
  'auth/weak-password': 'weak-password',
  'auth/operation-not-allowed': 'operation-not-allowed',
  'auth/too-many-requests': 'too-many-requests',
  'auth/network-request-failed': 'network-error',
};

const parseFirebaseError = (result: {
  error?: string | { code: string; message: string };
  errorCode?: string;
}): AuthError => {
  const raw = result.errorCode
    ?? (typeof result.error === 'string' ? result.error : result.error?.code)
    ?? '';
  const code: AuthErrorCode = FB_CODE_MAP[raw] ?? 'unknown';
  const message = FB_ERRORS[raw] ?? 'An unexpected error occurred. Please try again.';
  return { code, message };
};

const DEV_IDS = new Set(['dariusc', 'dariusc@local', 'dariusc@local.dev']);
const DEV_PASS = 'dariusc123';

const isHardcodedLogin = (email: string, password: string) =>
  DEV_IDS.has(email.trim().toLowerCase()) && password === DEV_PASS;

const buildLocalUser = (): FirebaseUser => {
  const now = new Date();
  return {
    uid: 'local-dariusc',
    email: 'dariusc@local.dev',
    displayName: 'dariusc',
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    createdAt: now,
    lastSignInAt: now,
    idToken: 'local-dev-token',
  };
};

const buildProfile = (user: FirebaseUser, displayName: string): UserProfile => {
  const now = Date.now();
  return {
    id: user.uid,
    email: user.email ?? '',
    displayName: displayName || user.displayName || 'User',
    photoURL: user.photoURL ?? null,
    avatarId: null,
    createdAt: now,
    updatedAt: now,
    lastActiveAt: now,
    onboardingCompleted: false,
    timezone: 'UTC',
    language: 'en',
    status: 'active',
    subscription: {
      isPremium: false,
      plan: 'free',
      startDate: null,
      endDate: null,
      autoRenew: false,
    },
    totalXP: 0,
    level: 1,
  };
};

const buildSettings = (userId: string): UserSettings => ({
  userId,
  notifications: {
    enabled: true,
    usageAlerts: true,
    usageAlertThreshold: 80,
    activityReminders: true,
    badgeUnlocks: true,
    socialUpdates: true,
    dailySummary: true,
    dailySummaryTime: '21:00',
    weeklyReport: true,
    weeklyReportDay: 'sunday',
    streakReminders: true,
    doNotDisturb: {
      enabled: false,
      startTime: '22:00',
      endTime: '07:00',
      activeDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    },
  },
  privacy: {
    showOnLeaderboard: true,
    useRealName: true,
    friendRequests: 'friends_of_friends',
    activityVisibility: 'friends',
    shareUsageStats: false,
    analyticsEnabled: true,
  },
  appearance: {
    theme: 'light',
    useSystemTheme: true,
    accentColor: '#4CAF50',
    fontScale: 1,
    animationsEnabled: true,
    reduceMotion: false,
    hapticFeedback: true,
  },
  goals: {
    defaultDailyGoal: 120,
    useAppLimits: true,
    weeklyGoal: 840,
    dailyMindfulMinutes: 15,
    adaptiveGoals: true,
  },
  focusMode: {
    defaultDuration: 25,
    breakDuration: 5,
    allowedApps: [],
    blockNotifications: true,
    ambientSounds: false,
    selectedSound: null,
    scheduledSessions: [],
  },
  dataSync: {
    wifiOnly: true,
    autoBackup: false,
    lastBackup: null,
    syncFrequency: 24,
  },
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      user: null,
      profile: null,
      settings: null,
      error: null,
      isInitialized: false,
      isAuthenticated: false,
      isLoading: false,

      initialize: async () => {
        try {
          set({ status: 'loading', isLoading: true });
          authService.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
              set({
                status: 'authenticated',
                user: firebaseUser,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
                error: null,
              });
            } else {
              set({
                status: 'unauthenticated',
                user: null,
                profile: null,
                settings: null,
                isAuthenticated: false,
                isLoading: false,
                isInitialized: true,
              });
            }
          });
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            set({ status: 'authenticated', user: currentUser, isAuthenticated: true, isLoading: false, isInitialized: true });
          } else {
            set({ status: 'unauthenticated', isLoading: false, isInitialized: true });
          }
        } catch {
          set({
            status: 'error',
            error: { code: 'unknown', message: 'Failed to initialize authentication' },
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      signUp: async (data: SignUpData) => {
        try {
          set({ status: 'loading', isLoading: true, error: null });
          const result = await authService.signUpWithEmail({ email: data.email, password: data.password });
          if (result.success && result.data) {
            set({
              status: 'authenticated',
              user: result.data,
              profile: buildProfile(result.data, data.displayName),
              settings: buildSettings(result.data.uid),
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          set({ status: 'error', error: parseFirebaseError(result), isLoading: false });
          return false;
        } catch {
          set({ status: 'error', error: { code: 'unknown', message: 'Failed to create account' }, isLoading: false });
          return false;
        }
      },

      signIn: async (data: SignInData) => {
        try {
          set({ status: 'loading', isLoading: true, error: null });
          if (isHardcodedLogin(data.email, data.password)) {
            const user = buildLocalUser();
            set({
              status: 'authenticated',
              user,
              profile: buildProfile(user, user.displayName ?? 'dariusc'),
              settings: buildSettings(user.uid),
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          const result = await authService.signInWithEmail({ email: data.email, password: data.password });
          if (result.success && result.data) {
            set({ status: 'authenticated', user: result.data, isAuthenticated: true, isLoading: false });
            return true;
          }
          set({ status: 'error', error: parseFirebaseError(result), isLoading: false });
          return false;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to sign in';
          set({ status: 'error', error: { code: 'unknown', message: msg }, isLoading: false });
          return false;
        }
      },

      signInAnonymously: async () => {
        try {
          set({ status: 'loading', isLoading: true, error: null });
          const result = await authService.signInAnonymously();
          if (result.success && result.data) {
            set({
              status: 'authenticated',
              user: result.data,
              profile: buildProfile(result.data, 'Anonymous User'),
              settings: buildSettings(result.data.uid),
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          set({ status: 'error', error: parseFirebaseError(result), isLoading: false });
          return false;
        } catch {
          set({ status: 'error', error: { code: 'unknown', message: 'Failed to sign in anonymously' }, isLoading: false });
          return false;
        }
      },

      signOut: async () => {
        try {
          set({ status: 'loading', isLoading: true });
          await authService.signOut();
          set({
            status: 'unauthenticated',
            user: null,
            profile: null,
            settings: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch {
          set({ status: 'error', error: { code: 'unknown', message: 'Failed to sign out' }, isLoading: false });
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ status: 'loading', isLoading: true, error: null });
          const result = await authService.sendPasswordResetEmail(email);
          set({ isLoading: false });
          if (result.success) return true;
          set({ error: parseFirebaseError(result) });
          return false;
        } catch {
          set({ error: { code: 'unknown', message: 'Failed to send reset email' }, isLoading: false });
          return false;
        }
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        try {
          const { profile } = get();
          if (!profile) return false;
          set({ profile: { ...profile, ...updates, updatedAt: Date.now() } });
          return true;
        } catch {
          return false;
        }
      },

      updateSettings: async (updates: Partial<UserSettings>) => {
        try {
          const { settings } = get();
          if (!settings) return false;
          set({ settings: { ...settings, ...updates } });
          return true;
        } catch {
          return false;
        }
      },

      updateEmail: async (newEmail: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const reauth = await authService.reauthenticate(password);
          if (!reauth.success) {
            set({ error: parseFirebaseError(reauth), isLoading: false });
            return false;
          }
          const result = await authService.updateEmail(newEmail);
          set({ isLoading: false });
          if (result.success) {
            const current = authService.getCurrentUser();
            if (current) set({ user: current });
            return true;
          }
          set({ error: parseFirebaseError(result) });
          return false;
        } catch {
          set({ error: { code: 'unknown', message: 'Failed to update email' }, isLoading: false });
          return false;
        }
      },

      updatePassword: async (currentPassword: string, newPassword: string) => {
        try {
          set({ isLoading: true, error: null });
          const reauth = await authService.reauthenticate(currentPassword);
          if (!reauth.success) {
            set({ error: parseFirebaseError(reauth), isLoading: false });
            return false;
          }
          const result = await authService.updatePassword(newPassword);
          set({ isLoading: false });
          if (result.success) return true;
          set({ error: parseFirebaseError(result) });
          return false;
        } catch {
          set({ error: { code: 'unknown', message: 'Failed to update password' }, isLoading: false });
          return false;
        }
      },

      deleteAccount: async (password: string) => {
        try {
          set({ isLoading: true, error: null });
          const reauth = await authService.reauthenticate(password);
          if (!reauth.success) {
            set({ error: parseFirebaseError(reauth), isLoading: false });
            return false;
          }
          const result = await authService.deleteAccount();
          if (result.success) {
            set({ status: 'unauthenticated', user: null, profile: null, settings: null, isAuthenticated: false, isLoading: false });
            return true;
          }
          set({ error: parseFirebaseError(result), isLoading: false });
          return false;
        } catch {
          set({ error: { code: 'unknown', message: 'Failed to delete account' }, isLoading: false });
          return false;
        }
      },

      clearError: () => set({ error: null }),
      setProfile: (profile) => set({ profile }),
      setSettings: (settings) => set({ settings }),
    }),
    {
      name: 'mindfultime-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        settings: state.settings,
      }),
    }
  )
);

export const selectAuthStatus = (state: AuthState) => state.status;
export const selectUser = (state: AuthState) => state.user;
export const selectProfile = (state: AuthState) => state.profile;
export const selectSettings = (state: AuthState) => state.settings;
export const selectAuthError = (state: AuthState) => state.error;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectIsInitialized = (state: AuthState) => state.isInitialized;

export const useAuthActions = () => useAuthStore((state) => ({
  initialize: state.initialize,
  signUp: state.signUp,
  signIn: state.signIn,
  signInAnonymously: state.signInAnonymously,
  signOut: state.signOut,
  resetPassword: state.resetPassword,
  updateProfile: state.updateProfile,
  updateSettings: state.updateSettings,
  updateEmail: state.updateEmail,
  updatePassword: state.updatePassword,
  deleteAccount: state.deleteAccount,
  clearError: state.clearError,
}));

export const useCurrentUser = () => useAuthStore((s) => s.user);
export const useUserProfile = () => useAuthStore((s) => s.profile);
export const useUserSettings = () => useAuthStore((s) => s.settings);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);

export default useAuthStore;
