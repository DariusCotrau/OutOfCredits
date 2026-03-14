import type {
  UserId,
  DocumentId,
  Timestamp,
  DateString,
  TimeString,
  DayOfWeek,
  DurationMinutes,
  DurationMs,
  PackageName,
  Percentage,
} from './common';
export interface AppInfo {
  packageName: PackageName;
  appName: string;
  icon: string | null;
  category: AppCategory;
  isSystemApp: boolean;
  firstInstallTime: Timestamp;
  lastUpdateTime: Timestamp;
  version: string;
}
export type AppCategory =
  | 'social'
  | 'entertainment'
  | 'games'
  | 'productivity'
  | 'communication'
  | 'education'
  | 'shopping'
  | 'finance'
  | 'health'
  | 'news'
  | 'travel'
  | 'utilities'
  | 'photography'
  | 'music'
  | 'video'
  | 'books'
  | 'sports'
  | 'food'
  | 'lifestyle'
  | 'business'
  | 'other';
export const AppCategoryLabels: Record<AppCategory, string> = {
  social: 'Social Media',
  entertainment: 'Entertainment',
  games: 'Games',
  productivity: 'Productivity',
  communication: 'Communication',
  education: 'Education',
  shopping: 'Shopping',
  finance: 'Finance',
  health: 'Health & Fitness',
  news: 'News',
  travel: 'Travel',
  utilities: 'Utilities',
  photography: 'Photography',
  music: 'Music',
  video: 'Video',
  books: 'Books',
  sports: 'Sports',
  food: 'Food & Drink',
  lifestyle: 'Lifestyle',
  business: 'Business',
  other: 'Other',
};
export interface AppUsageRecord {
  id: DocumentId;
  userId: UserId;
  packageName: PackageName;
  appName: string;
  date: DateString;
  usageTime: DurationMinutes;
  openCount: number;
  firstOpenTime: Timestamp | null;
  lastCloseTime: Timestamp | null;
  sessions: UsageSession[];
  category: AppCategory;
  hasLimit: boolean;
  limitMinutes: DurationMinutes | null;
  limitExceeded: boolean;
  syncedAt: Timestamp;
}
export interface UsageSession {
  startTime: Timestamp;
  endTime: Timestamp;
  duration: DurationMs;
  duringFocusMode: boolean;
}
export interface DailyUsageSummary {
  id: DocumentId;
  userId: UserId;
  date: DateString;
  totalScreenTime: DurationMinutes;
  categoryBreakdown: CategoryBreakdown[];
  topApps: TopAppUsage[];
  totalOpenCount: number;
  unlockCount: number;
  firstUnlock: Timestamp | null;
  lastScreenOff: Timestamp | null;
  hourlyDistribution: DurationMinutes[];
  dailyGoal: DurationMinutes;
  goalProgress: number;
  goalAchieved: boolean;
  previousDayDiff: DurationMinutes;
  weeklyAverageDiff: DurationMinutes;
}
export interface CategoryBreakdown {
  category: AppCategory;
  totalTime: DurationMinutes;
  percentage: number;
  appCount: number;
}
export interface TopAppUsage {
  packageName: PackageName;
  appName: string;
  icon: string | null;
  usageTime: DurationMinutes;
  percentage: number;
  openCount: number;
  category: AppCategory;
}
export interface UsageGoal {
  id: DocumentId;
  userId: UserId;
  type: GoalType;
  targetValue: number;
  currentValue: number;
  period: GoalPeriod;
  periodStart: DateString;
  periodEnd: DateString;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
export type GoalType =
  | 'daily_limit'
  | 'weekly_limit'
  | 'app_limit'
  | 'category_limit'
  | 'mindful_minutes'
  | 'unlock_limit'
  | 'no_phone_hours';
export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';
export interface AppLimit {
  id: DocumentId;
  userId: UserId;
  packageName: PackageName;
  appName: string;
  dailyLimit: DurationMinutes;
  isActive: boolean;
  limitAction: LimitAction;
  warningThreshold: number;
  activeDays: DayOfWeek[];
  startTime: TimeString | null;
  endTime: TimeString | null;
  gracePeriod: DurationMinutes;
  gracePeriodUsesToday: number;
  maxGracePeriodUses: number;
  createdAt: Timestamp;
}
export type LimitAction =
  | 'notify'
  | 'warn'
  | 'block'
  | 'block_strict';
export interface CategoryLimit {
  id: DocumentId;
  userId: UserId;
  category: AppCategory;
  dailyLimit: DurationMinutes;
  isActive: boolean;
  limitAction: LimitAction;
  warningThreshold: number;
  activeDays: DayOfWeek[];
}
export interface CurrentUsageState {
  todayScreenTime: DurationMinutes;
  todayGoal: DurationMinutes;
  progressPercentage: number;
  activeApp: ActiveAppInfo | null;
  appsNearLimit: AppLimitStatus[];
  categoriesNearLimit: CategoryLimitStatus[];
  todayUnlocks: number;
  lastUpdated: Timestamp;
  isActive: boolean;
}
export interface ActiveAppInfo {
  packageName: PackageName;
  appName: string;
  sessionStart: Timestamp;
  sessionDuration: DurationMs;
  todayTotal: DurationMinutes;
  limit: DurationMinutes | null;
}
export interface AppLimitStatus {
  packageName: PackageName;
  appName: string;
  currentUsage: DurationMinutes;
  limit: DurationMinutes;
  percentage: number;
  exceeded: boolean;
  remaining: DurationMinutes;
}
export interface CategoryLimitStatus {
  category: AppCategory;
  currentUsage: DurationMinutes;
  limit: DurationMinutes;
  percentage: number;
  exceeded: boolean;
  remaining: DurationMinutes;
}
export interface UsageAlert {
  id: DocumentId;
  userId: UserId;
  type: AlertType;
  trigger: AlertTrigger;
  enabled: boolean;
  cooldown: DurationMinutes;
  lastTriggered: Timestamp | null;
  customMessage: string | null;
}
export type AlertType =
  | 'usage_threshold'
  | 'limit_reached'
  | 'app_limit'
  | 'category_limit'
  | 'unlock_threshold'
  | 'time_of_day'
  | 'streak_risk';
export interface AlertTrigger {
  thresholdPercent?: number;
  timeOfDay?: TimeString;
  packageName?: PackageName;
  category?: AppCategory;
  unlockCount?: number;
}
export interface UsageExport {
  meta: ExportMeta;
  dailySummaries: DailyUsageSummary[];
  appUsage: AppUsageRecord[];
  goals: UsageGoal[];
}
export interface ExportMeta {
  userId: UserId;
  exportedAt: Timestamp;
  startDate: DateString;
  endDate: DateString;
  version: string;
}
