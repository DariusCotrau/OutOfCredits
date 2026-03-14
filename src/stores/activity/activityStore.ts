import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { activityService } from '@services/activity';
import type {
  Activity,
  ActivityCategory,
  ActivitySession,
  ActivityPreset,
  ActiveSessionState,
  DailyActivitySummary,
  WeeklyActivitySummary,
  ActivityStreak,
  ActivityGoal,
} from '@services/activity';
export interface ActivityState {
  activities: Activity[];
  featuredActivities: Activity[];
  presets: ActivityPreset[];
  activeSession: ActiveSessionState | null;
  sessionHistory: ActivitySession[];
  todaySummary: DailyActivitySummary | null;
  weeklySummary: WeeklyActivitySummary | null;
  streak: ActivityStreak | null;
  goals: ActivityGoal[];
  selectedCategory: ActivityCategory | null;
  isLoading: boolean;
  isSessionLoading: boolean;
  error: string | null;
  lastRefresh: number | null;
}
export interface ActivityActions {
  fetchActivities: () => Promise<void>;
  fetchFeaturedActivities: () => Promise<void>;
  fetchPresets: (userId: string) => Promise<void>;
  fetchSessionHistory: (userId: string, limit?: number) => Promise<void>;
  fetchTodaySummary: (userId: string) => Promise<void>;
  fetchWeeklySummary: (userId: string) => Promise<void>;
  fetchStreak: (userId: string) => Promise<void>;
  refreshAll: (userId: string) => Promise<void>;
  startSession: (
    userId: string,
    activityId: string,
    durationMinutes: number,
    presetId?: string
  ) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: (moodAfter?: number, notes?: string) => Promise<void>;
  cancelSession: () => Promise<void>;
  updateSessionProgress: (elapsedMs: number) => void;
  createPreset: (preset: Omit<ActivityPreset, 'id' | 'createdAt'>) => Promise<void>;
  deletePreset: (presetId: string) => Promise<void>;
  setSelectedCategory: (category: ActivityCategory | null) => void;
  clearError: () => void;
  reset: () => void;
}
export type ActivityStore = ActivityState & ActivityActions;
const initialState: ActivityState = {
  activities: [],
  featuredActivities: [],
  presets: [],
  activeSession: null,
  sessionHistory: [],
  todaySummary: null,
  weeklySummary: null,
  streak: null,
  goals: [],
  selectedCategory: null,
  isLoading: false,
  isSessionLoading: false,
  error: null,
  lastRefresh: null,
};
export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      fetchActivities: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await activityService.getAllActivities();
          if (result.success && result.data) {
            set({ activities: result.data, isLoading: false });
          } else {
            set({ error: result.error ?? 'Failed to fetch activities', isLoading: false });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },
      fetchFeaturedActivities: async () => {
        try {
          const result = await activityService.getFeaturedActivities();
          if (result.success && result.data) {
            set({ featuredActivities: result.data });
          }
        } catch {
        }
      },
      fetchPresets: async (userId: string) => {
        try {
          const result = await activityService.getUserPresets(userId);
          if (result.success && result.data) {
            set({ presets: result.data });
          }
        } catch (err) {
          console.warn('fetchPresets failed', err);
        }
      },
      fetchSessionHistory: async (userId: string, limit?: number) => {
        try {
          const result = await activityService.getSessionHistory(userId, limit);
          if (result.success && result.data) {
            set({ sessionHistory: result.data });
          }
        } catch {
        }
      },
      fetchTodaySummary: async (userId: string) => {
        try {
          const result = await activityService.getDailySummary(userId);
          if (result.success && result.data) {
            set({ todaySummary: result.data });
          }
        } catch (err) {
          console.warn('fetchTodaySummary:', err);
        }
      },
      fetchWeeklySummary: async (userId: string) => {
        try {
          const result = await activityService.getWeeklySummary(userId);
          if (result.success && result.data) {
            set({ weeklySummary: result.data });
          }
        } catch {
        }
      },
      fetchStreak: async (userId: string) => {
        try {
          const result = await activityService.getStreak(userId);
          if (result.success && result.data) {
            set({ streak: result.data });
          }
        } catch (err) {
          console.warn('fetchStreak:', err);
        }
      },
      refreshAll: async (userId: string) => {
        set({ isLoading: true });
        try {
          await Promise.all([
            get().fetchActivities(),
            get().fetchFeaturedActivities(),
            get().fetchPresets(userId),
            get().fetchSessionHistory(userId, 20),
            get().fetchTodaySummary(userId),
            get().fetchWeeklySummary(userId),
            get().fetchStreak(userId),
          ]);
          set({ lastRefresh: Date.now(), isLoading: false });
        } catch (error) {
          set({ isLoading: false });
        }
      },
      startSession: async (
        userId: string,
        activityId: string,
        durationMinutes: number,
        presetId?: string
      ) => {
        set({ isSessionLoading: true, error: null });
        try {
          const durationMs = durationMinutes * 60 * 1000;
          const result = await activityService.createSession(
            userId,
            activityId,
            durationMs,
            presetId
          );
          if (result.success && result.data) {
            const activity = get().activities.find((a) => a.id === activityId);
            if (activity) {
              set({
                activeSession: {
                  session: result.data,
                  activity,
                  elapsedMs: 0,
                  isPaused: false,
                  progressPercent: 0,
                  remainingMs: durationMs,
                },
                isSessionLoading: false,
              });
            }
          } else {
            set({
              error: result.error ?? 'Failed to start session',
              isSessionLoading: false,
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isSessionLoading: false,
          });
        }
      },
      pauseSession: () => {
        const { activeSession } = get();
        if (!activeSession || activeSession.isPaused) return;
        set({
          activeSession: {
            ...activeSession,
            isPaused: true,
            pauseStartedAt: Date.now(),
          },
        });
      },
      resumeSession: () => {
        const { activeSession } = get();
        if (!activeSession || !activeSession.isPaused) return;
        const pauseDuration = activeSession.pauseStartedAt
          ? Date.now() - activeSession.pauseStartedAt
          : 0;
        const newSession = { ...activeSession.session };
        if (activeSession.pauseStartedAt) {
          newSession.pausedIntervals.push({
            startedAt: activeSession.pauseStartedAt,
            endedAt: Date.now(),
          });
          newSession.totalPausedMs += pauseDuration;
        }
        set({
          activeSession: {
            ...activeSession,
            session: newSession,
            isPaused: false,
            pauseStartedAt: undefined,
          },
        });
      },
      completeSession: async (moodAfter?: number, notes?: string) => {
        const { activeSession } = get();
        if (!activeSession) return;
        set({ isSessionLoading: true });
        try {
          const result = await activityService.completeSession(
            activeSession.session.id,
            moodAfter,
            notes
          );
          if (result.success) {
            const userId = activeSession.session.userId;
            set({ activeSession: null, isSessionLoading: false });
            get().fetchTodaySummary(userId);
            get().fetchWeeklySummary(userId);
            get().fetchStreak(userId);
            get().fetchSessionHistory(userId, 20);
          } else {
            set({
              error: result.error ?? 'Failed to complete session',
              isSessionLoading: false,
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isSessionLoading: false,
          });
        }
      },
      cancelSession: async () => {
        const { activeSession } = get();
        if (!activeSession) return;
        set({ isSessionLoading: true });
        try {
          await activityService.cancelSession(activeSession.session.id);
          set({ activeSession: null, isSessionLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isSessionLoading: false,
          });
        }
      },
      updateSessionProgress: (elapsedMs: number) => {
        const { activeSession } = get();
        if (!activeSession || activeSession.isPaused) return;
        const plannedMs = activeSession.session.plannedDurationMs;
        const progressPercent = Math.min(100, (elapsedMs / plannedMs) * 100);
        const remainingMs = Math.max(0, plannedMs - elapsedMs);
        set({
          activeSession: {
            ...activeSession,
            elapsedMs,
            progressPercent,
            remainingMs,
          },
        });
      },
      createPreset: async (preset: Omit<ActivityPreset, 'id' | 'createdAt'>) => {
        try {
          const result = await activityService.createPreset(preset);
          if (result.success && result.data) {
            set((state) => ({
              presets: [...state.presets, result.data!],
            }));
          }
        } catch (error) {
          console.error('Failed to create preset:', error);
        }
      },
      deletePreset: async (presetId: string) => {
        try {
          await activityService.deletePreset(presetId);
          set((state) => ({
            presets: state.presets.filter((p) => p.id !== presetId),
          }));
        } catch (error) {
          console.error('Failed to delete preset:', error);
        }
      },
      setSelectedCategory: (category: ActivityCategory | null) => {
        set({ selectedCategory: category });
      },
      clearError: () => set({ error: null }),
      reset: () => set(initialState),
    }),
    {
      name: 'mindfultime-activity-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        presets: state.presets,
        streak: state.streak,
        goals: state.goals,
      }),
    }
  )
);
export const selectActivitiesByCategory = (
  state: ActivityState,
  category: ActivityCategory
): Activity[] => {
  return state.activities.filter((a) => a.category === category);
};
export const selectFilteredActivities = (state: ActivityState): Activity[] => {
  if (!state.selectedCategory) return state.activities;
  return state.activities.filter((a) => a.category === state.selectedCategory);
};
export const selectHasActiveSession = (state: ActivityState): boolean => {
  return state.activeSession !== null;
};
export const selectTodayMindfulnessTime = (state: ActivityState): number => {
  return state.todaySummary?.totalTimeMs ?? 0;
};
export const selectCurrentStreak = (state: ActivityState): number => {
  return state.streak?.currentStreak ?? 0;
};
export const useActivityActions = () =>
  useActivityStore((s) => ({
    fetchActivities: s.fetchActivities,
    fetchFeaturedActivities: s.fetchFeaturedActivities,
    fetchPresets: s.fetchPresets,
    fetchSessionHistory: s.fetchSessionHistory,
    fetchTodaySummary: s.fetchTodaySummary,
    fetchWeeklySummary: s.fetchWeeklySummary,
    fetchStreak: s.fetchStreak,
    refreshAll: s.refreshAll,
    startSession: s.startSession,
    pauseSession: s.pauseSession,
    resumeSession: s.resumeSession,
    completeSession: s.completeSession,
    cancelSession: s.cancelSession,
    updateSessionProgress: s.updateSessionProgress,
    createPreset: s.createPreset,
    deletePreset: s.deletePreset,
    setSelectedCategory: s.setSelectedCategory,
    clearError: s.clearError,
    reset: s.reset,
  }));
export const useActiveSession = () =>
  useActivityStore((s) => s.activeSession);
export const useActivities = () =>
  useActivityStore((state) => state.activities);
export const useFeaturedActivities = () =>
  useActivityStore((s) => s.featuredActivities);
export const useActivityStreak = () =>
  useActivityStore((state) => state.streak);
export const useTodaySummary = () =>
  useActivityStore((s) => s.todaySummary);
export default useActivityStore;
