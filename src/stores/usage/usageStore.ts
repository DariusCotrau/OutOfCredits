import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  usageStatsService,
  appLimitsService,
  type AppUsageRecord,
  type DailyUsageSummary,
  type WeeklyUsageSummary,
  type AppLimit,
  type LimitStatus,
  type UsagePermissionStatus,
} from '@services/usage';
import { formatDateKey } from '@shared/utils';
export interface UsageState {
  permissionStatus: UsagePermissionStatus | null;
  hasCheckedPermission: boolean;
  todayUsage: AppUsageRecord[];
  todaySummary: DailyUsageSummary | null;
  todayDate: string;
  weeklySummary: WeeklyUsageSummary | null;
  weekStartDate: string;
  limits: AppLimit[];
  limitStatuses: LimitStatus[];
  isLoadingPermission: boolean;
  isLoadingTodayUsage: boolean;
  isLoadingWeeklyUsage: boolean;
  isLoadingLimits: boolean;
  isMonitoring: boolean;
  error: string | null;
  lastUpdated: number;
  lastSyncedAt: number;
}
export interface UsageActions {
  checkPermission: () => Promise<boolean>;
  requestPermission: () => Promise<void>;
  fetchTodayUsage: () => Promise<void>;
  fetchTodaySummary: () => Promise<void>;
  fetchWeeklySummary: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  fetchLimits: () => Promise<void>;
  createLimit: (limit: Omit<AppLimit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateLimit: (id: string, updates: Partial<AppLimit>) => Promise<boolean>;
  deleteLimit: (id: string) => Promise<boolean>;
  toggleLimit: (id: string) => Promise<boolean>;
  checkLimitStatuses: () => Promise<void>;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  getAppUsage: (packageName: string) => AppUsageRecord | undefined;
  getLimitForApp: (packageName: string) => AppLimit | undefined;
  getLimitStatus: (limitId: string) => LimitStatus | undefined;
  clearError: () => void;
  reset: () => void;
}
export type UsageStore = UsageState & UsageActions;
const initialState: UsageState = {
  permissionStatus: null,
  hasCheckedPermission: false,
  todayUsage: [],
  todaySummary: null,
  todayDate: formatDateKey(new Date()),
  weeklySummary: null,
  weekStartDate: '',
  limits: [],
  limitStatuses: [],
  isLoadingPermission: false,
  isLoadingTodayUsage: false,
  isLoadingWeeklyUsage: false,
  isLoadingLimits: false,
  isMonitoring: false,
  error: null,
  lastUpdated: 0,
  lastSyncedAt: 0,
};
export const useUsageStore = create<UsageStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      checkPermission: async () => {
        set({ isLoadingPermission: true });
        try {
          const result = await usageStatsService.checkPermission();
          if (result.success && result.data) {
            set({
              permissionStatus: result.data,
              hasCheckedPermission: true,
              isLoadingPermission: false,
            });
            return result.data.hasUsageAccess;
          }
          set({
            hasCheckedPermission: true,
            isLoadingPermission: false,
            error: result.error?.message ?? 'Failed to check permission',
          });
          return false;
        } catch (error) {
          set({
            hasCheckedPermission: true,
            isLoadingPermission: false,
            error: 'Failed to check permission',
          });
          return false;
        }
      },
      requestPermission: async () => {
        try {
          await usageStatsService.requestPermission();
        } catch (error) {
          set({ error: 'Failed to request permission' });
        }
      },
      fetchTodayUsage: async () => {
        const today = formatDateKey(new Date());
        set({
          isLoadingTodayUsage: true,
          todayDate: today,
        });
        try {
          const result = await usageStatsService.getTodayUsage();
          if (result.success && result.data) {
            set({
              todayUsage: result.data,
              isLoadingTodayUsage: false,
              lastUpdated: Date.now(),
            });
            get().checkLimitStatuses();
          } else {
            set({
              isLoadingTodayUsage: false,
              error: result.error?.message ?? 'Failed to fetch usage',
            });
          }
        } catch (error) {
          set({
            isLoadingTodayUsage: false,
            error: 'Failed to fetch today\'s usage',
          });
        }
      },
      fetchTodaySummary: async () => {
        set({ isLoadingTodayUsage: true });
        try {
          const result = await usageStatsService.getDailySummary();
          if (result.success && result.data) {
            set({
              todaySummary: result.data,
              todayDate: result.data.date,
              isLoadingTodayUsage: false,
              lastUpdated: Date.now(),
            });
          } else {
            set({ isLoadingTodayUsage: false, error: result.error?.message ?? 'Failed to fetch summary' });
          }
        } catch {
          set({ isLoadingTodayUsage: false, error: 'Summary fetch failed' });
        }
      },
      fetchWeeklySummary: async () => {
        set({ isLoadingWeeklyUsage: true });
        try {
          const result = await usageStatsService.getWeeklySummary();
          if (result.success && result.data) {
            set({
              weeklySummary: result.data,
              weekStartDate: result.data.weekStart,
              isLoadingWeeklyUsage: false,
              lastUpdated: Date.now(),
            });
          } else {
            set({
              isLoadingWeeklyUsage: false,
              error: result.error?.message ?? 'Failed to fetch weekly summary',
            });
          }
        } catch (error) {
          set({
            isLoadingWeeklyUsage: false,
            error: 'Failed to fetch weekly summary',
          });
        }
      },
      refreshAllData: async () => {
        const { fetchTodayUsage, fetchTodaySummary, fetchWeeklySummary, fetchLimits } = get();
        await Promise.all([
          fetchTodayUsage(),
          fetchTodaySummary(),
          fetchWeeklySummary(),
          fetchLimits(),
        ]);
      },
      fetchLimits: async () => {
        set({ isLoadingLimits: true });
        try {
          const result = await appLimitsService.getAllLimits();
          if (result.success && result.data) {
            set({
              limits: result.data,
              isLoadingLimits: false,
            });
            get().checkLimitStatuses();
          } else {
            set({
              isLoadingLimits: false,
              error: result.error?.message ?? 'Failed to fetch limits',
            });
          }
        } catch (error) {
          set({
            isLoadingLimits: false,
            error: 'Failed to fetch limits',
          });
        }
      },
      createLimit: async (limitData) => {
        try {
          const result = await appLimitsService.createLimit(limitData);
          if (result.success && result.data) {
            set((state) => ({
              limits: [...state.limits, result.data!],
            }));
            get().checkLimitStatuses();
            return true;
          }
          set({ error: result.error?.message ?? 'Failed to create limit' });
          return false;
        } catch (error) {
          set({ error: 'Failed to create limit' });
          return false;
        }
      },
      updateLimit: async (id, updates) => {
        try {
          const result = await appLimitsService.updateLimit(id, updates);
          if (result.success && result.data) {
            set((state) => ({
              limits: state.limits.map((l) =>
                l.id === id ? result.data! : l
              ),
            }));
            get().checkLimitStatuses();
            return true;
          }
          set({ error: result.error?.message ?? 'Failed to update limit' });
          return false;
        } catch (error) {
          set({ error: 'Failed to update limit' });
          return false;
        }
      },
      deleteLimit: async (id) => {
        try {
          const result = await appLimitsService.deleteLimit(id);
          if (result.success) {
            set((state) => ({
              limits: state.limits.filter((l) => l.id !== id),
              limitStatuses: state.limitStatuses.filter((s) => s.limitId !== id),
            }));
            return true;
          }
          set({ error: result.error?.message ?? 'Failed to delete limit' });
          return false;
        } catch (error) {
          set({ error: 'Failed to delete limit' });
          return false;
        }
      },
      toggleLimit: async (id) => {
        try {
          const result = await appLimitsService.toggleLimit(id);
          if (result.success && result.data) {
            set((state) => ({
              limits: state.limits.map((l) =>
                l.id === id ? result.data! : l
              ),
            }));
            get().checkLimitStatuses();
            return true;
          }
          return false;
        } catch (error) {
          return false;
        }
      },
      checkLimitStatuses: async () => {
        const { todayUsage, limits } = get();
        if (limits.length === 0 || todayUsage.length === 0) {
          set({ limitStatuses: [] });
          return;
        }
        try {
          const result = await appLimitsService.checkAllLimits(todayUsage);
          if (result.success && result.data) {
            set({ limitStatuses: result.data });
          }
        } catch (error) {
        }
      },
      startMonitoring: async () => {
        try {
          const result = await usageStatsService.startMonitoring();
          if (result.success) {
            set({ isMonitoring: true });
          } else {
            set({ error: result.error?.message ?? 'Failed to start monitoring' });
          }
        } catch (error) {
          set({ error: 'Failed to start monitoring' });
        }
      },
      stopMonitoring: async () => {
        try {
          const result = await usageStatsService.stopMonitoring();
          if (result.success) {
            set({ isMonitoring: false });
          }
        } catch (error) {
        }
      },
      getAppUsage: (packageName) => {
        return get().todayUsage.find((u) => u.packageName === packageName);
      },
      getLimitForApp: (packageName) => {
        return get().limits.find(
          (l) => l.type === 'app' && l.target === packageName && l.isActive
        );
      },
      getLimitStatus: (limitId) => {
        return get().limitStatuses.find((s) => s.limitId === limitId);
      },
      clearError: () => {
        set({ error: null });
      },
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'mindfultime-usage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        limits: state.limits,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);
export const selectPermissionStatus = (s: UsageStore) => s.permissionStatus;
export const selectHasUsageAccess = (s: UsageStore) =>
  s.permissionStatus?.hasUsageAccess ?? false;
export const selectTodayUsage = (state: UsageStore) => state.todayUsage;
export const selectTodaySummary = (state: UsageStore) => state.todaySummary;
export const selectWeeklySummary = (state: UsageStore) => state.weeklySummary;
export const selectLimits = (s: UsageStore) => s.limits;
export const selectActiveLimits = (state: UsageStore) =>
  state.limits.filter((l) => l.isActive);
export const selectLimitStatuses = (state: UsageStore) => state.limitStatuses;
export const selectExceededLimits = (s: UsageStore) =>
  s.limitStatuses.filter((ls) => ls.isExceeded);
export const selectTodayScreenTime = (state: UsageStore) =>
  state.todaySummary?.totalScreenTime ??
  state.todayUsage.reduce((sum, u) => sum + u.totalTimeInForeground, 0);
export const selectIsLoading = (s: UsageStore) =>
  s.isLoadingTodayUsage || s.isLoadingWeeklyUsage || s.isLoadingLimits;
export const useUsageActions = () =>
  useUsageStore((state) => ({
    checkPermission: state.checkPermission,
    requestPermission: state.requestPermission,
    fetchTodayUsage: state.fetchTodayUsage,
    fetchTodaySummary: state.fetchTodaySummary,
    fetchWeeklySummary: state.fetchWeeklySummary,
    refreshAllData: state.refreshAllData,
    fetchLimits: state.fetchLimits,
    createLimit: state.createLimit,
    updateLimit: state.updateLimit,
    deleteLimit: state.deleteLimit,
    toggleLimit: state.toggleLimit,
    startMonitoring: state.startMonitoring,
    stopMonitoring: state.stopMonitoring,
    clearError: state.clearError,
  }));
export const useTodayUsage = () =>
  useUsageStore((state) => ({
    usage: state.todayUsage,
    summary: state.todaySummary,
    isLoading: state.isLoadingTodayUsage,
    date: state.todayDate,
  }));
export const useWeeklyUsage = () =>
  useUsageStore((state) => ({
    summary: state.weeklySummary,
    isLoading: state.isLoadingWeeklyUsage,
    weekStart: state.weekStartDate,
  }));
export const useAppLimits = () =>
  useUsageStore((state) => ({
    limits: state.limits,
    statuses: state.limitStatuses,
    isLoading: state.isLoadingLimits,
    exceeded: state.limitStatuses.filter((s) => s.isExceeded),
  }));
export default useUsageStore;
