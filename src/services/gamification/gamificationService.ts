import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  XPTransaction,
  XPTransactionType,
  Level,
  LevelProgress,
  Badge,
  BadgeCategory,
  UserBadge,
  Challenge,
  UserChallenge,
  Leaderboard,
  LeaderboardType,
  LeaderboardPeriod,
  LeaderboardEntry,
  StreakData,
  DailyReward,
  GamificationStats,
  GamificationServiceResult,
  Reward,
} from './types';
const XP_STORAGE_KEY = '@mindfultime/xp_transactions';
const BADGES_STORAGE_KEY = '@mindfultime/user_badges';
const CHALLENGES_STORAGE_KEY = '@mindfultime/user_challenges';
const STATS_STORAGE_KEY = '@mindfultime/gamification_stats';
const DAILY_REWARDS_KEY = '@mindfultime/daily_rewards';
const LEVELS: Level[] = [
  { level: 1, name: 'Novice', minXP: 0, maxXP: 100, icon: 'seedling', color: '#8BC34A', unlockedFeatures: [] },
  { level: 2, name: 'Apprentice', minXP: 100, maxXP: 250, icon: 'leaf', color: '#4CAF50', unlockedFeatures: ['custom_presets'] },
  { level: 3, name: 'Student', minXP: 250, maxXP: 500, icon: 'sprout', color: '#009688', unlockedFeatures: ['background_music'] },
  { level: 4, name: 'Practitioner', minXP: 500, maxXP: 850, icon: 'tree', color: '#00BCD4', unlockedFeatures: ['statistics'] },
  { level: 5, name: 'Adept', minXP: 850, maxXP: 1300, icon: 'mountain', color: '#03A9F4', unlockedFeatures: ['challenges'] },
  { level: 6, name: 'Expert', minXP: 1300, maxXP: 1900, icon: 'sun', color: '#2196F3', unlockedFeatures: ['leaderboards'] },
  { level: 7, name: 'Master', minXP: 1900, maxXP: 2700, icon: 'star', color: '#673AB7', unlockedFeatures: ['custom_themes'] },
  { level: 8, name: 'Sage', minXP: 2700, maxXP: 3800, icon: 'crown', color: '#9C27B0', unlockedFeatures: ['friend_challenges'] },
  { level: 9, name: 'Enlightened', minXP: 3800, maxXP: 5200, icon: 'lotus', color: '#E91E63', unlockedFeatures: ['all_activities'] },
  { level: 10, name: 'Zen Master', minXP: 5200, maxXP: Infinity, icon: 'infinity', color: '#FF9800', unlockedFeatures: ['everything'] },
];
const BADGES: Badge[] = [
  {
    id: 'first-session',
    name: 'First Step',
    description: 'Complete your first mindfulness session',
    requirement: 'Complete 1 session',
    category: 'beginner',
    rarity: 'common',
    icon: 'footprints',
    color: '#8BC34A',
    xpReward: 25,
    isSecret: false,
    sortOrder: 1,
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete a session before 7 AM',
    requirement: 'Session before 7:00 AM',
    category: 'beginner',
    rarity: 'uncommon',
    icon: 'sunrise',
    color: '#FFC107',
    xpReward: 50,
    isSecret: false,
    sortOrder: 2,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete a session after 10 PM',
    requirement: 'Session after 10:00 PM',
    category: 'beginner',
    rarity: 'uncommon',
    icon: 'moon',
    color: '#5D6D7E',
    xpReward: 50,
    isSecret: false,
    sortOrder: 3,
  },
  {
    id: 'streak-3',
    name: 'Getting Started',
    description: 'Maintain a 3-day streak',
    requirement: '3 consecutive days',
    category: 'consistency',
    rarity: 'common',
    icon: 'fire',
    color: '#FF5722',
    xpReward: 50,
    isSecret: false,
    sortOrder: 1,
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    requirement: '7 consecutive days',
    category: 'consistency',
    rarity: 'uncommon',
    icon: 'fire',
    color: '#FF5722',
    xpReward: 100,
    isSecret: false,
    sortOrder: 2,
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    requirement: '30 consecutive days',
    category: 'consistency',
    rarity: 'rare',
    icon: 'fire',
    color: '#FF5722',
    xpReward: 300,
    isSecret: false,
    sortOrder: 3,
  },
  {
    id: 'streak-100',
    name: 'Century Club',
    description: 'Maintain a 100-day streak',
    requirement: '100 consecutive days',
    category: 'consistency',
    rarity: 'epic',
    icon: 'fire',
    color: '#FF5722',
    xpReward: 1000,
    isSecret: false,
    sortOrder: 4,
  },
  {
    id: 'streak-365',
    name: 'Year of Zen',
    description: 'Maintain a 365-day streak',
    requirement: '365 consecutive days',
    category: 'consistency',
    rarity: 'legendary',
    icon: 'fire',
    color: '#FF5722',
    xpReward: 5000,
    isSecret: false,
    sortOrder: 5,
  },
  {
    id: 'sessions-10',
    name: 'Dedicated',
    description: 'Complete 10 sessions',
    requirement: '10 total sessions',
    category: 'milestone',
    rarity: 'common',
    icon: 'target',
    color: '#2196F3',
    xpReward: 75,
    isSecret: false,
    sortOrder: 1,
  },
  {
    id: 'sessions-50',
    name: 'Committed',
    description: 'Complete 50 sessions',
    requirement: '50 total sessions',
    category: 'milestone',
    rarity: 'uncommon',
    icon: 'target',
    color: '#2196F3',
    xpReward: 200,
    isSecret: false,
    sortOrder: 2,
  },
  {
    id: 'sessions-100',
    name: 'Centurion',
    description: 'Complete 100 sessions',
    requirement: '100 total sessions',
    category: 'milestone',
    rarity: 'rare',
    icon: 'target',
    color: '#2196F3',
    xpReward: 500,
    isSecret: false,
    sortOrder: 3,
  },
  {
    id: 'time-1h',
    name: 'Hour of Peace',
    description: 'Accumulate 1 hour of mindfulness',
    requirement: '1 hour total time',
    category: 'milestone',
    rarity: 'common',
    icon: 'clock',
    color: '#9C27B0',
    xpReward: 50,
    isSecret: false,
    sortOrder: 4,
  },
  {
    id: 'time-10h',
    name: 'Ten Hours',
    description: 'Accumulate 10 hours of mindfulness',
    requirement: '10 hours total time',
    category: 'milestone',
    rarity: 'uncommon',
    icon: 'clock',
    color: '#9C27B0',
    xpReward: 200,
    isSecret: false,
    sortOrder: 5,
  },
  {
    id: 'time-100h',
    name: 'Hundred Hours',
    description: 'Accumulate 100 hours of mindfulness',
    requirement: '100 hours total time',
    category: 'milestone',
    rarity: 'epic',
    icon: 'clock',
    color: '#9C27B0',
    xpReward: 1000,
    isSecret: false,
    sortOrder: 6,
  },
  {
    id: 'all-categories',
    name: 'Well Rounded',
    description: 'Try all activity categories',
    requirement: 'Complete session in each category',
    category: 'mastery',
    rarity: 'rare',
    icon: 'compass',
    color: '#00BCD4',
    xpReward: 250,
    isSecret: false,
    sortOrder: 1,
  },
  {
    id: 'meditation-master',
    name: 'Meditation Master',
    description: 'Complete 50 meditation sessions',
    requirement: '50 meditation sessions',
    category: 'mastery',
    rarity: 'rare',
    icon: 'meditation',
    color: '#6B4EE6',
    xpReward: 300,
    isSecret: false,
    sortOrder: 2,
  },
  {
    id: 'breathing-expert',
    name: 'Breathing Expert',
    description: 'Complete 50 breathing sessions',
    requirement: '50 breathing sessions',
    category: 'mastery',
    rarity: 'rare',
    icon: 'breathing',
    color: '#45B7D1',
    xpReward: 300,
    isSecret: false,
    sortOrder: 3,
  },
  {
    id: 'perfect-week',
    name: 'Perfect Week',
    description: 'Complete sessions every day for a week',
    requirement: '7 days with at least 1 session each',
    category: 'special',
    rarity: 'rare',
    icon: 'calendar-check',
    color: '#4CAF50',
    xpReward: 200,
    isSecret: false,
    sortOrder: 1,
  },
  {
    id: 'screen-time-goal',
    name: 'Digital Detox',
    description: 'Meet your screen time goal for a week',
    requirement: 'Under screen time goal 7 days',
    category: 'special',
    rarity: 'rare',
    icon: 'phone-off',
    color: '#E91E63',
    xpReward: 250,
    isSecret: false,
    sortOrder: 2,
  },
  {
    id: 'midnight-zen',
    name: 'Midnight Zen',
    description: 'Complete a session at exactly midnight',
    requirement: 'Session at 00:00',
    category: 'special',
    rarity: 'epic',
    icon: 'stars',
    color: '#1A237E',
    xpReward: 150,
    isSecret: true,
    sortOrder: 3,
  },
];
const DAILY_REWARDS: Reward[] = [
  { id: 'day1', type: 'xp', name: '10 XP', description: 'Day 1 bonus', value: 10, icon: 'star' },
  { id: 'day2', type: 'xp', name: '15 XP', description: 'Day 2 bonus', value: 15, icon: 'star' },
  { id: 'day3', type: 'xp', name: '20 XP', description: 'Day 3 bonus', value: 20, icon: 'star' },
  { id: 'day4', type: 'xp', name: '25 XP', description: 'Day 4 bonus', value: 25, icon: 'star' },
  { id: 'day5', type: 'xp', name: '30 XP', description: 'Day 5 bonus', value: 30, icon: 'star' },
  { id: 'day6', type: 'xp', name: '40 XP', description: 'Day 6 bonus', value: 40, icon: 'star' },
  { id: 'day7', type: 'xp', name: '50 XP + Streak Freeze', description: 'Weekly bonus', value: 50, icon: 'gift' },
];
class GamificationService {
  async addXP(
    userId: string,
    type: XPTransactionType,
    amount: number,
    description: string,
    relatedEntityId?: string
  ): Promise<GamificationServiceResult<XPTransaction>> {
    try {
      const transaction: XPTransaction = {
        id: `xp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type,
        amount,
        description,
        relatedEntityId,
        createdAt: Date.now(),
      };
      const transactions = await this.loadXPTransactions(userId);
      transactions.push(transaction);
      await this.saveXPTransactions(userId, transactions);
      await this.updateStats(userId, { totalXP: amount });
      return { success: true, data: transaction };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add XP',
      };
    }
  }
  async getTotalXP(userId: string): Promise<GamificationServiceResult<number>> {
    try {
      const txns = await this.loadXPTransactions(userId);
      return { success: true, data: txns.reduce((sum, t) => sum + t.amount, 0) };
    } catch {
      return { success: false, error: 'Failed to get XP' };
    }
  }
  async getXPHistory(
    userId: string,
    limit?: number
  ): Promise<GamificationServiceResult<XPTransaction[]>> {
    try {
      const txns = await this.loadXPTransactions(userId);
      const sorted = txns.sort((a, b) => b.createdAt - a.createdAt);
      return { success: true, data: limit ? sorted.slice(0, limit) : sorted };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  }
  getAllLevels(): Level[] {
    return LEVELS;
  }
  getLevelForXP(xp: number): Level {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].minXP) {
        return LEVELS[i];
      }
    }
    return LEVELS[0];
  }
  async getLevelProgress(userId: string): Promise<GamificationServiceResult<LevelProgress>> {
    try {
      const xpResult = await this.getTotalXP(userId);
      if (!xpResult.success || xpResult.data === undefined) {
        return { success: false, error: xpResult.error };
      }
      const totalXP = xpResult.data;
      const currentLevel = this.getLevelForXP(totalXP);
      const levelIndex = LEVELS.findIndex((l) => l.level === currentLevel.level);
      const nextLevel = levelIndex < LEVELS.length - 1 ? LEVELS[levelIndex + 1] : null;
      const currentLevelXP = totalXP - currentLevel.minXP;
      const xpToNextLevel = nextLevel ? nextLevel.minXP - totalXP : 0;
      const levelRange = (nextLevel?.minXP ?? currentLevel.maxXP) - currentLevel.minXP;
      const progressPercent = nextLevel ? (currentLevelXP / levelRange) * 100 : 100;
      return {
        success: true,
        data: {
          currentLevel,
          nextLevel,
          totalXP,
          currentLevelXP,
          xpToNextLevel,
          progressPercent: Math.min(100, progressPercent),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get level progress',
      };
    }
  }
  getAllBadges(): Badge[] {
    return BADGES;
  }
  getBadgesByCategory(category: BadgeCategory): Badge[] {
    return BADGES.filter((b) => b.category === category);
  }
  async getUserBadges(userId: string): Promise<GamificationServiceResult<UserBadge[]>> {
    try {
      const stored = await AsyncStorage.getItem(`${BADGES_STORAGE_KEY}_${userId}`);
      const badges: UserBadge[] = stored ? JSON.parse(stored) : [];
      return { success: true, data: badges };
    } catch {
      return { success: false, error: 'Failed to get badges' };
    }
  }
  async awardBadge(
    userId: string,
    badgeId: string
  ): Promise<GamificationServiceResult<UserBadge>> {
    try {
      const badge = BADGES.find((b) => b.id === badgeId);
      if (!badge) {
        return { success: false, error: 'Badge not found' };
      }
      const userBadgesResult = await this.getUserBadges(userId);
      const userBadges = userBadgesResult.data ?? [];
      const existing = userBadges.find((ub) => ub.badgeId === badgeId);
      if (existing?.isEarned) {
        return { success: true, data: existing };
      }
      const userBadge: UserBadge = {
        badgeId,
        userId,
        earnedAt: Date.now(),
        progress: 100,
        isEarned: true,
        currentValue: 1,
        targetValue: 1,
      };
      const updatedBadges = userBadges.filter((ub) => ub.badgeId !== badgeId);
      updatedBadges.push(userBadge);
      await AsyncStorage.setItem(
        `${BADGES_STORAGE_KEY}_${userId}`,
        JSON.stringify(updatedBadges)
      );
      await this.addXP(userId, 'badge_earned', badge.xpReward, `Earned badge: ${badge.name}`, badgeId);
      await this.updateStats(userId, { badgesEarned: 1 });
      return { success: true, data: userBadge };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to award badge',
      };
    }
  }
  async updateBadgeProgress(
    userId: string,
    badgeId: string,
    currentValue: number,
    targetValue: number
  ): Promise<GamificationServiceResult<UserBadge>> {
    try {
      const userBadgesResult = await this.getUserBadges(userId);
      const userBadges = userBadgesResult.data ?? [];
      const progress = Math.min(100, (currentValue / targetValue) * 100);
      const isEarned = currentValue >= targetValue;
      let userBadge = userBadges.find((ub) => ub.badgeId === badgeId);
      if (userBadge) {
        if (userBadge.isEarned) {
          return { success: true, data: userBadge };
        }
        userBadge.currentValue = currentValue;
        userBadge.targetValue = targetValue;
        userBadge.progress = progress;
        if (isEarned) {
          userBadge.isEarned = true;
          userBadge.earnedAt = Date.now();
        }
      } else {
        userBadge = {
          badgeId,
          userId,
          earnedAt: isEarned ? Date.now() : 0,
          progress,
          isEarned,
          currentValue,
          targetValue,
        };
        userBadges.push(userBadge);
      }
      await AsyncStorage.setItem(
        `${BADGES_STORAGE_KEY}_${userId}`,
        JSON.stringify(userBadges)
      );
      if (isEarned && userBadge.earnedAt === Date.now()) {
        const badge = BADGES.find((b) => b.id === badgeId);
        if (badge) {
          await this.addXP(userId, 'badge_earned', badge.xpReward, `Earned badge: ${badge.name}`, badgeId);
          await this.updateStats(userId, { badgesEarned: 1 });
        }
      }
      return { success: true, data: userBadge };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update badge progress',
      };
    }
  }
  async getLeaderboard(
    type: LeaderboardType,
    period: LeaderboardPeriod,
    userId: string
  ): Promise<GamificationServiceResult<Leaderboard>> {
    try {
      const mockEntries: LeaderboardEntry[] = [
        { rank: 1, userId: 'user1', displayName: 'MindfulMaster', level: 8, score: 5200, change: 2, isCurrentUser: false },
        { rank: 2, userId: 'user2', displayName: 'ZenWarrior', level: 7, score: 4800, change: 0, isCurrentUser: false },
        { rank: 3, userId: 'user3', displayName: 'PeacefulSoul', level: 7, score: 4500, change: -1, isCurrentUser: false },
        { rank: 4, userId: 'user4', displayName: 'CalmSeeker', level: 6, score: 3900, change: 1, isCurrentUser: false },
        { rank: 5, userId: 'user5', displayName: 'InnerPeace', level: 6, score: 3600, change: 3, isCurrentUser: false },
        { rank: 6, userId: userId, displayName: 'You', level: 4, score: 1200, change: 2, isCurrentUser: true },
      ];
      const leaderboard: Leaderboard = {
        type,
        period,
        entries: mockEntries,
        currentUserEntry: mockEntries.find((e) => e.isCurrentUser),
        totalParticipants: 1247,
        updatedAt: Date.now(),
      };
      return { success: true, data: leaderboard };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get leaderboard',
      };
    }
  }
  async getDailyRewards(userId: string): Promise<GamificationServiceResult<DailyReward[]>> {
    try {
      const stored = await AsyncStorage.getItem(`${DAILY_REWARDS_KEY}_${userId}`);
      const data = stored ? JSON.parse(stored) : { lastClaimDate: null, currentDay: 0 };
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = data.lastClaimDate !== today;
      const rewards: DailyReward[] = DAILY_REWARDS.map((reward, index) => ({
        day: index + 1,
        reward,
        isClaimed: index < data.currentDay,
        isAvailable: index === data.currentDay && isNewDay,
      }));
      return { success: true, data: rewards };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Failed to get daily rewards' };
    }
  }
  async claimDailyReward(userId: string): Promise<GamificationServiceResult<Reward>> {
    try {
      const stored = await AsyncStorage.getItem(`${DAILY_REWARDS_KEY}_${userId}`);
      const data = stored ? JSON.parse(stored) : { lastClaimDate: null, currentDay: 0 };
      const today = new Date().toISOString().split('T')[0];
      if (data.lastClaimDate === today) {
        return { success: false, error: 'Already claimed today' };
      }
      const reward = DAILY_REWARDS[data.currentDay % DAILY_REWARDS.length];
      if (reward.type === 'xp') {
        await this.addXP(userId, 'daily_goal_reached', reward.value as number, 'Daily reward');
      }
      data.lastClaimDate = today;
      data.currentDay = (data.currentDay + 1) % DAILY_REWARDS.length;
      await AsyncStorage.setItem(`${DAILY_REWARDS_KEY}_${userId}`, JSON.stringify(data));
      return { success: true, data: reward };
    } catch {
      return { success: false, error: 'Failed to claim reward' };
    }
  }
  async getStats(userId: string): Promise<GamificationServiceResult<GamificationStats>> {
    const defaultStats: GamificationStats = {
      totalXP: 0,
      level: 1,
      badgesEarned: 0,
      challengesCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      rankPercentile: 100,
      totalMindfulnessTime: 0,
      sessionsCompleted: 0,
    };
    try {
      const stored = await AsyncStorage.getItem(`${STATS_STORAGE_KEY}_${userId}`);
      return { success: true, data: stored ? JSON.parse(stored) : defaultStats };
    } catch {
      return { success: false, error: 'Failed to get stats' };
    }
  }
  async updateStats(
    userId: string,
    updates: Partial<GamificationStats>
  ): Promise<GamificationServiceResult<GamificationStats>> {
    try {
      const currentResult = await this.getStats(userId);
      const current = currentResult.data ?? {
        totalXP: 0,
        level: 1,
        badgesEarned: 0,
        challengesCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        rankPercentile: 100,
        totalMindfulnessTime: 0,
        sessionsCompleted: 0,
      };
      const updated: GamificationStats = {
        ...current,
        totalXP: current.totalXP + (updates.totalXP ?? 0),
        badgesEarned: current.badgesEarned + (updates.badgesEarned ?? 0),
        challengesCompleted: current.challengesCompleted + (updates.challengesCompleted ?? 0),
        currentStreak: updates.currentStreak ?? current.currentStreak,
        longestStreak: Math.max(current.longestStreak, updates.longestStreak ?? 0),
        totalMindfulnessTime: current.totalMindfulnessTime + (updates.totalMindfulnessTime ?? 0),
        sessionsCompleted: current.sessionsCompleted + (updates.sessionsCompleted ?? 0),
      };
      updated.level = this.getLevelForXP(updated.totalXP).level;
      await AsyncStorage.setItem(`${STATS_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
      return { success: true, data: updated };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update stats',
      };
    }
  }
  private async loadXPTransactions(userId: string): Promise<XPTransaction[]> {
    const stored = await AsyncStorage.getItem(`${XP_STORAGE_KEY}_${userId}`);
    return stored ? JSON.parse(stored) : [];
  }
  private async saveXPTransactions(userId: string, transactions: XPTransaction[]): Promise<void> {
    await AsyncStorage.setItem(`${XP_STORAGE_KEY}_${userId}`, JSON.stringify(transactions));
  }
}
export const gamificationService = new GamificationService();
export default gamificationService;
