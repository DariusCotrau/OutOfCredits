import type {
  UserId,
  DocumentId,
  BadgeId,
  Timestamp,
  DateString,
} from './common';


import type { ActivityCategory } from './activity';


export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  criteria: string;
  category: BadgeCategory;
  tier: BadgeTier;
  icon: string;
  color: string;
  xpReward: number;
  isSecret: boolean;
  isRepeatable: boolean;
  maxEarnings: number | null;
  requirements: BadgeRequirements;
  sortOrder: number;
  isActive: boolean;
  unlocksAvatar: string | null;
}


export type BadgeCategory =
  | 'milestone'
  | 'streak'
  | 'activity'
  | 'social'
  | 'challenge'
  | 'special'
  | 'exploration';


export type BadgeTier =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond';


export const BadgeTierInfo: Record<
  BadgeTier,
  { label: string; color: string; xpMultiplier: number }
> = {
  bronze: { label: 'Bronze', color: '#CD7F32', xpMultiplier: 1 },
  silver: { label: 'Silver', color: '#C0C0C0', xpMultiplier: 1.5 },
  gold: { label: 'Gold', color: '#FFD700', xpMultiplier: 2 },
  platinum: { label: 'Platinum', color: '#E5E4E2', xpMultiplier: 3 },
  diamond: { label: 'Diamond', color: '#B9F2FF', xpMultiplier: 5 },
};


export interface BadgeRequirements {
  type: RequirementType;
  targetValue: number;
  activityId?: string;
  category?: ActivityCategory;
  timeConstraint?: TimeConstraint;
  conditions?: RequirementCondition[];
}


export type RequirementType =
  | 'total_minutes'
  | 'streak_days'
  | 'activities_completed'
  | 'category_activities'
  | 'daily_goal_met'
  | 'screen_time_reduced'
  | 'friends_added'
  | 'challenges_won'
  | 'level_reached'
  | 'perfect_week'
  | 'custom';


export interface TimeConstraint {
  type: 'within_days' | 'within_week' | 'single_day' | 'consecutive';
  value: number;
}
export interface RequirementCondition {
  field: string;
  operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains';
  value: unknown;
}


export interface UserBadge {
  id: DocumentId;
  userId: UserId;
  badgeId: BadgeId;
  badge: Badge;
  earnCount: number;
  firstEarnedAt: Timestamp;
  lastEarnedAt: Timestamp;
  totalXpEarned: number;
  isViewed: boolean;
  isFeatured: boolean;
}


export interface BadgeProgress {
  badgeId: BadgeId;
  currentValue: number;
  targetValue: number;
  percentage: number;
  isEarned: boolean;
  estimatedCompletion: DateString | null;
}


export interface Streak {
  id: DocumentId;
  userId: UserId;
  type: StreakType;
  currentCount: number;
  longestCount: number;
  startDate: DateString;
  lastActivityDate: DateString;
  isAtRisk: boolean;
  totalStreaksStarted: number;
  freezeTokens: number;
  freezeTokensUsed: number;
  milestones: StreakMilestone[];
}


export type StreakType =
  | 'daily_activity'
  | 'daily_goal'
  | 'weekly_goal'
  | 'meditation'
  | 'exercise';


export interface StreakMilestone {
  days: number;
  achievedAt: DateString;
  xpBonus: number;
  badgeAwarded: BadgeId | null;
}


export interface StreakFreeze {
  id: DocumentId;
  userId: UserId;
  usedDate: DateString;
  streakType: StreakType;
  autoApplied: boolean;
}
export interface Level {
  level: number;
  xpRequired: number;
  totalXpRequired: number;
  title: string;
  rewards: LevelReward[];
  badgeId: BadgeId | null;
}
export interface LevelReward {
  type: RewardType;
  value: string;
  description: string;
}
export type RewardType =
  | 'avatar'
  | 'badge'
  | 'feature'
  | 'activity'
  | 'freeze_token'
  | 'theme'
  | 'title';
export interface XPTransaction {
  id: DocumentId;
  userId: UserId;
  amount: number;
  type: XPTransactionType;
  source: string;
  relatedId: string | null;
  timestamp: Timestamp;
  balanceAfter: number;
}
export type XPTransactionType =
  | 'activity_complete'
  | 'badge_earned'
  | 'streak_bonus'
  | 'challenge_won'
  | 'daily_bonus'
  | 'referral'
  | 'level_up'
  | 'event'
  | 'adjustment';
export interface LeaderboardEntry {
  id: DocumentId;
  userId: UserId;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  rank: number;
  score: number;
  previousRank: number | null;
  rankChange: number;
  leaderboardType: LeaderboardType;
  period: LeaderboardPeriod;
  periodStart: DateString;
  updatedAt: Timestamp;
}
export type LeaderboardType =
  | 'total_xp'
  | 'weekly_xp'
  | 'mindful_minutes'
  | 'streak'
  | 'screen_time_reduction'
  | 'activities_completed';
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';
export interface Leaderboard {
  type: LeaderboardType;
  period: LeaderboardPeriod;
  periodStart: DateString;
  periodEnd: DateString;
  entries: LeaderboardEntry[];
  totalParticipants: number;
  currentUserEntry: LeaderboardEntry | null;
  updatedAt: Timestamp;
}
export interface Challenge {
  id: DocumentId;
  name: string;
  description: string;
  type: ChallengeType;
  goal: ChallengeGoal;
  startDate: DateString;
  endDate: DateString;
  xpReward: number;
  badgeId: BadgeId | null;
  maxParticipants: number;
  participantCount: number;
  isActive: boolean;
  isFriendChallenge: boolean;
  creatorId: UserId | null;
  invitedUsers: UserId[];
}
export type ChallengeType =
  | 'global'
  | 'friends'
  | 'personal';
export interface ChallengeGoal {
  type: ChallengeGoalType;
  targetValue: number;
  category?: ActivityCategory;
}
export type ChallengeGoalType =
  | 'total_minutes'
  | 'streak_days'
  | 'activities'
  | 'screen_time'
  | 'daily_goals';
export interface ChallengeParticipation {
  id: DocumentId;
  userId: UserId;
  challengeId: DocumentId;
  currentProgress: number;
  goalValue: number;
  percentage: number;
  rank: number;
  isCompleted: boolean;
  completedAt: Timestamp | null;
  joinedAt: Timestamp;
  updatedAt: Timestamp;
}
export interface DailyBonus {
  id: DocumentId;
  userId: UserId;
  date: DateString;
  type: DailyBonusType;
  xpAmount: number;
  isClaimed: boolean;
  claimedAt: Timestamp | null;
  streakDay: number;
}
export type DailyBonusType =
  | 'login'
  | 'streak'
  | 'goal_met'
  | 'challenge'
  | 'special';
