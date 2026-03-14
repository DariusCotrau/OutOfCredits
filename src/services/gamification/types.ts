export type XPTransactionType =
  | 'activity_completed'
  | 'daily_goal_reached'
  | 'weekly_goal_reached'
  | 'streak_bonus'
  | 'badge_earned'
  | 'challenge_completed'
  | 'first_activity'
  | 'screen_time_goal'
  | 'referral_bonus'
  | 'special_event';
export interface XPTransaction {
  id: string;
  userId: string;
  type: XPTransactionType;
  amount: number;
  description: string;
  relatedEntityId?: string;
  createdAt: number;
}
export interface Level {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  icon: string;
  color: string;
  unlockedFeatures: string[];
}
export interface LevelProgress {
  currentLevel: Level;
  nextLevel: Level | null;
  totalXP: number;
  currentLevelXP: number;
  xpToNextLevel: number;
  progressPercent: number;
}
export type BadgeCategory =
  | 'beginner'
  | 'consistency'
  | 'milestone'
  | 'mastery'
  | 'special'
  | 'social'
  | 'challenge';
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  icon: string;
  color: string;
  xpReward: number;
  isSecret: boolean;
  sortOrder: number;
}
export interface UserBadge {
  badgeId: string;
  userId: string;
  earnedAt: number;
  progress: number;
  isEarned: boolean;
  currentValue: number;
  targetValue: number;
}
export type AchievementTrigger =
  | 'sessions_completed'
  | 'total_mindfulness_time'
  | 'streak_days'
  | 'activities_tried'
  | 'screen_time_reduced'
  | 'goals_completed'
  | 'level_reached'
  | 'badges_earned'
  | 'friends_added'
  | 'challenges_won';
export interface Achievement {
  id: string;
  name: string;
  description: string;
  trigger: AchievementTrigger;
  targetValue: number;
  badgeId: string;
  isRepeatable: boolean;
  repeatIntervalDays?: number;
}
export type ChallengeType = 'daily' | 'weekly' | 'monthly' | 'special' | 'friend';
export type ChallengeStatus = 'active' | 'completed' | 'failed' | 'expired';
export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  requirement: AchievementTrigger;
  targetValue: number;
  xpReward: number;
  badgeId?: string;
  startAt: number;
  endAt: number;
  icon: string;
  color: string;
}
export interface UserChallenge {
  challengeId: string;
  userId: string;
  currentValue: number;
  status: ChallengeStatus;
  joinedAt: number;
  completedAt?: number;
}
export type LeaderboardType =
  | 'total_xp'
  | 'weekly_xp'
  | 'monthly_xp'
  | 'mindfulness_time'
  | 'streak'
  | 'badges';
export type LeaderboardPeriod = 'all_time' | 'weekly' | 'monthly';
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  level: number;
  score: number;
  change: number;
  isCurrentUser: boolean;
}
export interface Leaderboard {
  type: LeaderboardType;
  period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  currentUserEntry?: LeaderboardEntry;
  totalParticipants: number;
  updatedAt: number;
}
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakStartDate: string | null;
  lastActivityDate: string | null;
  isActiveToday: boolean;
  daysToMilestone: number;
  nextMilestone: number;
  streakFreezeAvailable: boolean;
  lastFreezeUsedDate: string | null;
}
export type RewardType = 'xp' | 'badge' | 'streak_freeze' | 'theme' | 'feature';
export interface Reward {
  id: string;
  type: RewardType;
  name: string;
  description: string;
  value: string | number;
  icon: string;
}
export interface DailyReward {
  day: number;
  reward: Reward;
  isClaimed: boolean;
  isAvailable: boolean;
}
export interface GamificationStats {
  totalXP: number;
  level: number;
  badgesEarned: number;
  challengesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  rankPercentile: number;
  totalMindfulnessTime: number;
  sessionsCompleted: number;
}
export interface GamificationServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
