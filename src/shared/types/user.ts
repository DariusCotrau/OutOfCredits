import type {
  UserId,
  DocumentId,
  Timestamp,
  DateString,
  TimeString,
  DayOfWeek,
  DurationMinutes,
  PackageName,
} from './common';
export interface UserProfile {
  id: UserId;
  email: string;
  displayName: string;
  photoURL: string | null;
  avatarId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActiveAt: Timestamp;
  onboardingCompleted: boolean;
  timezone: string;
  language: string;
  status: UserStatus;
  subscription: SubscriptionStatus;
  totalXP: number;
  level: number;
}
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'deleted';
export interface SubscriptionStatus {
  isPremium: boolean;
  plan: SubscriptionPlan;
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  autoRenew: boolean;
}
export type SubscriptionPlan = 'free' | 'premium_monthly' | 'premium_yearly';
export interface UserSettings {
  userId: UserId;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
  goals: GoalSettings;
  focusMode: FocusModeSettings;
  dataSync: DataSyncSettings;
}
export interface NotificationSettings {
  enabled: boolean;
  usageAlerts: boolean;
  usageAlertThreshold: number;
  activityReminders: boolean;
  badgeUnlocks: boolean;
  socialUpdates: boolean;
  dailySummary: boolean;
  dailySummaryTime: TimeString;
  weeklyReport: boolean;
  weeklyReportDay: DayOfWeek;
  streakReminders: boolean;
  doNotDisturb: DoNotDisturbSettings;
}
export interface DoNotDisturbSettings {
  enabled: boolean;
  startTime: TimeString;
  endTime: TimeString;
  activeDays: DayOfWeek[];
}
export interface PrivacySettings {
  showOnLeaderboard: boolean;
  useRealName: boolean;
  friendRequests: 'everyone' | 'friends_of_friends' | 'nobody';
  activityVisibility: 'public' | 'friends' | 'private';
  shareUsageStats: boolean;
  analyticsEnabled: boolean;
}
export interface AppearanceSettings {
  theme: ThemeMode;
  useSystemTheme: boolean;
  accentColor: string;
  fontScale: number;
  animationsEnabled: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;
}
export type ThemeMode = 'light' | 'dark';
export interface GoalSettings {
  defaultDailyGoal: DurationMinutes;
  useAppLimits: boolean;
  weeklyGoal: DurationMinutes;
  dailyMindfulMinutes: DurationMinutes;
  adaptiveGoals: boolean;
}
export interface FocusModeSettings {
  defaultDuration: DurationMinutes;
  breakDuration: DurationMinutes;
  allowedApps: PackageName[];
  blockNotifications: boolean;
  ambientSounds: boolean;
  selectedSound: string | null;
  scheduledSessions: ScheduledFocusSession[];
}
export interface ScheduledFocusSession {
  id: string;
  name: string;
  startTime: TimeString;
  duration: DurationMinutes;
  days: DayOfWeek[];
  enabled: boolean;
}
export interface DataSyncSettings {
  wifiOnly: boolean;
  autoBackup: boolean;
  lastBackup: Timestamp | null;
  syncFrequency: number;
}
export interface UserStats {
  userId: UserId;
  totalScreenTime: DurationMinutes;
  totalMindfulMinutes: DurationMinutes;
  totalActivitiesCompleted: number;
  totalBadgesEarned: number;
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  goalsMetCount: number;
  goalsMissedCount: number;
  averageDailyScreenTime: DurationMinutes;
  screenTimeTrend: number;
  weekOverWeekChange: number;
  updatedAt: Timestamp;
}
export interface DailyStats {
  id: DocumentId;
  userId: UserId;
  date: DateString;
  screenTime: DurationMinutes;
  dailyGoal: DurationMinutes;
  goalMet: boolean;
  mindfulMinutes: DurationMinutes;
  activitiesCompleted: number;
  unlockCount: number;
  mostUsedApp: PackageName | null;
  mostUsedAppTime: DurationMinutes;
  xpEarned: number;
  badgesEarned: string[];
}
export interface WeeklyStats {
  id: DocumentId;
  userId: UserId;
  weekStart: DateString;
  weekEnd: DateString;
  totalScreenTime: DurationMinutes;
  averageDaily: DurationMinutes;
  daysGoalMet: number;
  totalMindfulMinutes: DurationMinutes;
  activitiesCompleted: number;
  previousWeekComparison: number;
  bestDay: DayOfWeek | null;
  worstDay: DayOfWeek | null;
  xpEarned: number;
}
export interface OnboardingProgress {
  userId: UserId;
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  skippedSteps: string[];
  isComplete: boolean;
  startedAt: Timestamp;
  completedAt: Timestamp | null;
  selections: OnboardingSelections;
}
export interface OnboardingSelections {
  goals: string[];
  dailyLimit: DurationMinutes;
  avatar: string | null;
  trackedApps: PackageName[];
  notificationsEnabled: boolean;
}
export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  category: AvatarCategory;
  isPremium: boolean;
  unlockXP: number;
  isDefault: boolean;
}
export type AvatarCategory =
  | 'default'
  | 'animals'
  | 'nature'
  | 'abstract'
  | 'characters'
  | 'seasonal'
  | 'achievement';
export interface UserAvatars {
  userId: UserId;
  selectedId: string;
  unlockedIds: string[];
  achievementAvatars: Record<string, string>;
}
