import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gamificationService } from '@services/gamification';
import type {
  XPTransaction,
  XPTransactionType,
  Level,
  LevelProgress,
  Badge,
  BadgeCategory,
  UserBadge,
  Leaderboard,
  LeaderboardType,
  LeaderboardPeriod,
  DailyReward,
  GamificationStats,
} from '@services/gamification';
export interface GamificationState {
  levelProgress: LevelProgress | null;
  allBadges: Badge[];
  userBadges: UserBadge[];
  xpHistory: XPTransaction[];
  leaderboard: Leaderboard | null;
  dailyRewards: DailyReward[];
  stats: GamificationStats | null;
  levels: Level[];
  selectedBadgeCategory: BadgeCategory | 'all';
  selectedLeaderboardType: LeaderboardType;
  selectedLeaderboardPeriod: LeaderboardPeriod;
  isLoading: boolean;
  isBadgesLoading: boolean;
  isLeaderboardLoading: boolean;
  error: string | null;
  lastRefresh: number | null;
}
export interface GamificationActions {
  fetchLevelProgress: (userId: string) => Promise<void>;
  fetchBadges: (userId: string) => Promise<void>;
  fetchXPHistory: (userId: string, limit?: number) => Promise<void>;
  fetchLeaderboard: (userId: string) => Promise<void>;
  fetchDailyRewards: (userId: string) => Promise<void>;
  fetchStats: (userId: string) => Promise<void>;
  refreshAll: (userId: string) => Promise<void>;
  addXP: (
    userId: string,
    type: XPTransactionType,
    amount: number,
    description: string,
    relatedEntityId?: string
  ) => Promise<void>;
  awardBadge: (userId: string, badgeId: string) => Promise<void>;
  updateBadgeProgress: (
    userId: string,
    badgeId: string,
    currentValue: number,
    targetValue: number
  ) => Promise<void>;
  claimDailyReward: (userId: string) => Promise<void>;
  setSelectedBadgeCategory: (category: BadgeCategory | 'all') => void;
  setLeaderboardType: (type: LeaderboardType) => void;
  setLeaderboardPeriod: (period: LeaderboardPeriod) => void;
  clearError: () => void;
  reset: () => void;
}
export type GamificationStore = GamificationState & GamificationActions;
const initialState: GamificationState = {
  levelProgress: null,
  allBadges: [],
  userBadges: [],
  xpHistory: [],
  leaderboard: null,
  dailyRewards: [],
  stats: null,
  levels: [],
  selectedBadgeCategory: 'all',
  selectedLeaderboardType: 'total_xp',
  selectedLeaderboardPeriod: 'weekly',
  isLoading: false,
  isBadgesLoading: false,
  isLeaderboardLoading: false,
  error: null,
  lastRefresh: null,
};
export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      fetchLevelProgress: async (userId: string) => {
        try {
          const result = await gamificationService.getLevelProgress(userId);
          if (result.success && result.data) {
            set({ levelProgress: result.data });
          }
        } catch {
        }
      },
      fetchBadges: async (userId: string) => {
        set({ isBadgesLoading: true });
        try {
          const allBadges = gamificationService.getAllBadges();
          const userBadgesResult = await gamificationService.getUserBadges(userId);
          set({
            allBadges,
            userBadges: userBadgesResult.data ?? [],
            isBadgesLoading: false,
          });
        } catch (err) {
          set({ isBadgesLoading: false });
          console.warn('fetchBadges:', err);
        }
      },
      fetchXPHistory: async (userId: string, limit?: number) => {
        try {
          const result = await gamificationService.getXPHistory(userId, limit);
          if (result.success && result.data) {
            set({ xpHistory: result.data });
          }
        } catch {
        }
      },
      fetchLeaderboard: async (userId: string) => {
        set({ isLeaderboardLoading: true });
        try {
          const { selectedLeaderboardType, selectedLeaderboardPeriod } = get();
          const result = await gamificationService.getLeaderboard(
            selectedLeaderboardType,
            selectedLeaderboardPeriod,
            userId
          );
          if (result.success && result.data) {
            set({ leaderboard: result.data, isLeaderboardLoading: false });
          } else {
            set({ isLeaderboardLoading: false });
          }
        } catch (err) {
          set({ isLeaderboardLoading: false });
          console.warn('fetchLeaderboard failed', err);
        }
      },
      fetchDailyRewards: async (userId: string) => {
        try {
          const result = await gamificationService.getDailyRewards(userId);
          if (result.success && result.data) {
            set({ dailyRewards: result.data });
          }
        } catch {
        }
      },
      fetchStats: async (userId: string) => {
        try {
          const result = await gamificationService.getStats(userId);
          if (result.success && result.data) {
            set({ stats: result.data });
          }
        } catch (err) {
          console.warn('fetchStats:', err);
        }
      },
      refreshAll: async (userId: string) => {
        set({ isLoading: true });
        try {
          const levels = gamificationService.getAllLevels();
          set({ levels });
          await Promise.all([
            get().fetchLevelProgress(userId),
            get().fetchBadges(userId),
            get().fetchXPHistory(userId, 20),
            get().fetchLeaderboard(userId),
            get().fetchDailyRewards(userId),
            get().fetchStats(userId),
          ]);
          set({ lastRefresh: Date.now(), isLoading: false });
        } catch (error) {
          set({ isLoading: false });
        }
      },
      addXP: async (
        userId: string,
        type: XPTransactionType,
        amount: number,
        description: string,
        relatedEntityId?: string
      ) => {
        try {
          const result = await gamificationService.addXP(
            userId,
            type,
            amount,
            description,
            relatedEntityId
          );
          if (result.success) {
            await get().fetchLevelProgress(userId);
            await get().fetchXPHistory(userId, 20);
            await get().fetchStats(userId);
          }
        } catch (error) {
          console.error('Failed to add XP:', error);
        }
      },
      awardBadge: async (userId: string, badgeId: string) => {
        try {
          const result = await gamificationService.awardBadge(userId, badgeId);
          if (result.success) {
            await get().fetchBadges(userId);
            await get().fetchLevelProgress(userId);
            await get().fetchStats(userId);
          }
        } catch {
        }
      },
      updateBadgeProgress: async (
        userId: string,
        badgeId: string,
        currentValue: number,
        targetValue: number
      ) => {
        try {
          const result = await gamificationService.updateBadgeProgress(
            userId,
            badgeId,
            currentValue,
            targetValue
          );
          if (result.success) {
            await get().fetchBadges(userId);
            if (result.data?.isEarned) {
              await get().fetchLevelProgress(userId);
              await get().fetchStats(userId);
            }
          }
        } catch (err) {
          console.warn('updateBadgeProgress:', err);
        }
      },
      claimDailyReward: async (userId: string) => {
        try {
          const result = await gamificationService.claimDailyReward(userId);
          if (result.success) {
            await get().fetchDailyRewards(userId);
            await get().fetchLevelProgress(userId);
            await get().fetchXPHistory(userId, 20);
          } else {
            set({ error: result.error });
          }
        } catch {
        }
      },
      setSelectedBadgeCategory: (category: BadgeCategory | 'all') =>
        set({ selectedBadgeCategory: category }),
      setLeaderboardType: (type: LeaderboardType) =>
        set({ selectedLeaderboardType: type }),
      setLeaderboardPeriod: (period: LeaderboardPeriod) =>
        set({ selectedLeaderboardPeriod: period }),
      clearError: () => set({ error: null }),
      reset: () => set(initialState),
    }),
    {
      name: 'mindfultime-gamification-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedBadgeCategory: state.selectedBadgeCategory,
        selectedLeaderboardType: state.selectedLeaderboardType,
        selectedLeaderboardPeriod: state.selectedLeaderboardPeriod,
      }),
    }
  )
);
export const selectFilteredBadges = (state: GamificationState): Badge[] => {
  if (state.selectedBadgeCategory === 'all') {
    return state.allBadges;
  }
  return state.allBadges.filter((b) => b.category === state.selectedBadgeCategory);
};
export const selectEarnedBadges = (state: GamificationState): UserBadge[] => {
  return state.userBadges.filter((ub) => ub.isEarned);
};
export const selectBadgesInProgress = (state: GamificationState): UserBadge[] => {
  return state.userBadges.filter((ub) => !ub.isEarned && ub.progress > 0);
};
export const selectCurrentLevel = (state: GamificationState): number => {
  return state.levelProgress?.currentLevel.level ?? 1;
};
export const selectTotalXP = (state: GamificationState): number => {
  return state.levelProgress?.totalXP ?? 0;
};
export const selectDailyRewardAvailable = (state: GamificationState): boolean => {
  return state.dailyRewards.some((r) => r.isAvailable);
};
export const useGamificationActions = () =>
  useGamificationStore((s) => ({
    fetchLevelProgress: s.fetchLevelProgress,
    fetchBadges: s.fetchBadges,
    fetchXPHistory: s.fetchXPHistory,
    fetchLeaderboard: s.fetchLeaderboard,
    fetchDailyRewards: s.fetchDailyRewards,
    fetchStats: s.fetchStats,
    refreshAll: s.refreshAll,
    addXP: s.addXP,
    awardBadge: s.awardBadge,
    updateBadgeProgress: s.updateBadgeProgress,
    claimDailyReward: s.claimDailyReward,
    setSelectedBadgeCategory: s.setSelectedBadgeCategory,
    setLeaderboardType: s.setLeaderboardType,
    setLeaderboardPeriod: s.setLeaderboardPeriod,
    clearError: s.clearError,
    reset: s.reset,
  }));
export const useLevelProgress = () =>
  useGamificationStore((state) => state.levelProgress);
export const useUserBadges = () =>
  useGamificationStore((s) => s.userBadges);
export const useGamificationStats = () =>
  useGamificationStore((state) => state.stats);
export const useLeaderboard = () =>
  useGamificationStore((s) => s.leaderboard);
export const useDailyRewards = () =>
  useGamificationStore((state) => state.dailyRewards);
export default useGamificationStore;
