export const XP_REWARDS = {
  ACTIVITY_COMPLETED: 50,
  ACTIVITY_COMPLETED_BONUS: 25,
  FIRST_ACTIVITY_OF_DAY: 50,
  DAILY_GOAL_MET: 100,
  WEEKLY_GOAL_MET: 300,
  UNDER_LIMIT_BONUS: 50,
  STREAK_DAY: 20,
  STREAK_WEEK: 150,
  STREAK_MONTH: 500,
  FRIEND_ADDED: 25,
  CHALLENGE_JOINED: 50,
  CHALLENGE_COMPLETED: 200,
  CHALLENGE_WON: 300,
  BADGE_EARNED: 100,
  FIRST_APP_LIMIT_SET: 50,
  PROFILE_COMPLETED: 75,
  DAILY_LOGIN: 10,
  WEEKLY_REPORT_VIEWED: 25,
} as const;
export const LEVEL_NAMES = [
  'Novice',
  'Apprentice',
  'Student',
  'Practitioner',
  'Adept',
  'Expert',
  'Master',
  'Grandmaster',
  'Enlightened',
  'Transcendent',
  'Ascended',
] as const;
export const calculateLevelXP = (level: number): number => {
  const baseXP = 100;
  const exponent = 1.5;
  return Math.floor(baseXP * Math.pow(level, exponent));
};
export const getLevelFromXP = (totalXP: number): number => {
  let level = 1;
  let xpRequired = 0;
  while (xpRequired <= totalXP) {
    level++;
    xpRequired += calculateLevelXP(level);
  }
  return level - 1;
};
export const LEVEL_THRESHOLDS = Array.from({ length: 50 }, (_, i) => ({
  level: i + 1,
  xpRequired: calculateLevelXP(i + 1),
  totalXP: Array.from({ length: i + 1 }, (_, j) => calculateLevelXP(j + 1)).reduce(
    (a, b) => a + b,
    0
  ),
  name: LEVEL_NAMES[Math.min(i, LEVEL_NAMES.length - 1)],
}));
export const STREAK_MILESTONES = [
  { days: 3, name: 'Getting Started', xpBonus: 50 },
  { days: 7, name: 'One Week', xpBonus: 100 },
  { days: 14, name: 'Two Weeks', xpBonus: 200 },
  { days: 21, name: 'Three Weeks', xpBonus: 300 },
  { days: 30, name: 'One Month', xpBonus: 500 },
  { days: 60, name: 'Two Months', xpBonus: 750 },
  { days: 90, name: 'Three Months', xpBonus: 1000 },
  { days: 180, name: 'Six Months', xpBonus: 2000 },
  { days: 365, name: 'One Year', xpBonus: 5000 },
] as const;
export const STREAK_CONFIG = {
  GRACE_PERIOD_HOURS: 24,
  MAX_FREEZE_DAYS: 3,
  FREEZE_COST: 100,
  WEEKEND_OPTIONAL: false,
} as const;
export const BADGE_CATEGORIES = {
  ACTIVITY: 'activity',
  SCREEN_TIME: 'screen_time',
  STREAK: 'streak',
  SOCIAL: 'social',
  MILESTONE: 'milestone',
  SPECIAL: 'special',
} as const;
export type BadgeCategory =
  (typeof BADGE_CATEGORIES)[keyof typeof BADGE_CATEGORIES];
export const BADGE_RARITY = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
} as const;
export type BadgeRarity = (typeof BADGE_RARITY)[keyof typeof BADGE_RARITY];
export const RARITY_COLORS: Record<BadgeRarity, string> = {
  [BADGE_RARITY.COMMON]: '#9E9E9E',
  [BADGE_RARITY.UNCOMMON]: '#4CAF50',
  [BADGE_RARITY.RARE]: '#2196F3',
  [BADGE_RARITY.EPIC]: '#9C27B0',
  [BADGE_RARITY.LEGENDARY]: '#FF9800',
};
export const DEFAULT_BADGES = [
  {
    id: 'first-activity',
    name: 'First Step',
    description: 'Complete your first mindfulness activity',
    category: BADGE_CATEGORIES.ACTIVITY,
    rarity: BADGE_RARITY.COMMON,
    icon: 'star',
    xpReward: 100,
    requirement: { type: 'activities_completed', count: 1 },
  },
  {
    id: 'activity-10',
    name: 'Regular Practice',
    description: 'Complete 10 mindfulness activities',
    category: BADGE_CATEGORIES.ACTIVITY,
    rarity: BADGE_RARITY.UNCOMMON,
    icon: 'award',
    xpReward: 200,
    requirement: { type: 'activities_completed', count: 10 },
  },
  {
    id: 'activity-50',
    name: 'Dedicated Practitioner',
    description: 'Complete 50 mindfulness activities',
    category: BADGE_CATEGORIES.ACTIVITY,
    rarity: BADGE_RARITY.RARE,
    icon: 'trophy',
    xpReward: 500,
    requirement: { type: 'activities_completed', count: 50 },
  },
  {
    id: 'activity-100',
    name: 'Mindfulness Master',
    description: 'Complete 100 mindfulness activities',
    category: BADGE_CATEGORIES.ACTIVITY,
    rarity: BADGE_RARITY.EPIC,
    icon: 'crown',
    xpReward: 1000,
    requirement: { type: 'activities_completed', count: 100 },
  },
  {
    id: 'first-goal',
    name: 'Goal Setter',
    description: 'Meet your daily screen time goal for the first time',
    category: BADGE_CATEGORIES.SCREEN_TIME,
    rarity: BADGE_RARITY.COMMON,
    icon: 'target',
    xpReward: 100,
    requirement: { type: 'daily_goals_met', count: 1 },
  },
  {
    id: 'week-under-limit',
    name: 'Week Well Spent',
    description: 'Stay under your screen time limit for a full week',
    category: BADGE_CATEGORIES.SCREEN_TIME,
    rarity: BADGE_RARITY.UNCOMMON,
    icon: 'calendar-check',
    xpReward: 300,
    requirement: { type: 'consecutive_days_under_limit', count: 7 },
  },
  {
    id: 'digital-detox',
    name: 'Digital Detox',
    description: 'Use your phone for less than 1 hour in a day',
    category: BADGE_CATEGORIES.SCREEN_TIME,
    rarity: BADGE_RARITY.RARE,
    icon: 'phone-off',
    xpReward: 500,
    requirement: { type: 'daily_usage_under', minutes: 60 },
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    category: BADGE_CATEGORIES.STREAK,
    rarity: BADGE_RARITY.COMMON,
    icon: 'flame',
    xpReward: 150,
    requirement: { type: 'streak_days', count: 7 },
  },
  {
    id: 'streak-30',
    name: 'Monthly Champion',
    description: 'Maintain a 30-day streak',
    category: BADGE_CATEGORIES.STREAK,
    rarity: BADGE_RARITY.RARE,
    icon: 'fire',
    xpReward: 500,
    requirement: { type: 'streak_days', count: 30 },
  },
  {
    id: 'streak-100',
    name: 'Century Club',
    description: 'Maintain a 100-day streak',
    category: BADGE_CATEGORIES.STREAK,
    rarity: BADGE_RARITY.LEGENDARY,
    icon: 'medal',
    xpReward: 2000,
    requirement: { type: 'streak_days', count: 100 },
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Add 5 friends',
    category: BADGE_CATEGORIES.SOCIAL,
    rarity: BADGE_RARITY.UNCOMMON,
    icon: 'users',
    xpReward: 200,
    requirement: { type: 'friends_count', count: 5 },
  },
  {
    id: 'challenge-winner',
    name: 'Challenge Champion',
    description: 'Win your first challenge',
    category: BADGE_CATEGORIES.SOCIAL,
    rarity: BADGE_RARITY.RARE,
    icon: 'trophy',
    xpReward: 400,
    requirement: { type: 'challenges_won', count: 1 },
  },
  {
    id: 'level-5',
    name: 'Rising Star',
    description: 'Reach level 5',
    category: BADGE_CATEGORIES.MILESTONE,
    rarity: BADGE_RARITY.COMMON,
    icon: 'trending-up',
    xpReward: 200,
    requirement: { type: 'level', count: 5 },
  },
  {
    id: 'level-10',
    name: 'Expert',
    description: 'Reach level 10',
    category: BADGE_CATEGORIES.MILESTONE,
    rarity: BADGE_RARITY.RARE,
    icon: 'award',
    xpReward: 500,
    requirement: { type: 'level', count: 10 },
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete an activity before 7 AM',
    category: BADGE_CATEGORIES.SPECIAL,
    rarity: BADGE_RARITY.UNCOMMON,
    icon: 'sunrise',
    xpReward: 150,
    requirement: { type: 'activity_before_hour', hour: 7 },
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete an activity after 10 PM',
    category: BADGE_CATEGORIES.SPECIAL,
    rarity: BADGE_RARITY.UNCOMMON,
    icon: 'moon',
    xpReward: 150,
    requirement: { type: 'activity_after_hour', hour: 22 },
  },
  {
    id: 'variety',
    name: 'Jack of All Trades',
    description: 'Complete activities in 5 different categories',
    category: BADGE_CATEGORIES.SPECIAL,
    rarity: BADGE_RARITY.RARE,
    icon: 'grid',
    xpReward: 400,
    requirement: { type: 'activity_categories', count: 5 },
  },
] as const;
export const LEADERBOARD_TYPES = {
  DAILY_XP: 'daily_xp',
  WEEKLY_XP: 'weekly_xp',
  TOTAL_XP: 'total_xp',
  STREAK: 'streak',
  ACTIVITIES: 'activities',
  SCREEN_TIME_REDUCTION: 'screen_time_reduction',
} as const;
export type LeaderboardType =
  (typeof LEADERBOARD_TYPES)[keyof typeof LEADERBOARD_TYPES];
export const LEADERBOARD_CONFIG = {
  MAX_ENTRIES: 100,
  REFRESH_INTERVAL: 5 * 60 * 1000,
  PODIUM_SIZE: 3,
  PAGE_SIZE: 20,
} as const;
