export interface AppUsageRecord {
  packageName: string;
  appName: string;
  appIcon?: string;
  totalTimeInForeground: number;
  launchCount: number;
  lastTimeUsed: number;
  firstTimeUsed: number;
  category?: AppCategory;
  isSystemApp: boolean;
}
export type AppCategory =
  | 'social'
  | 'entertainment'
  | 'productivity'
  | 'communication'
  | 'games'
  | 'education'
  | 'health'
  | 'news'
  | 'shopping'
  | 'travel'
  | 'finance'
  | 'utilities'
  | 'other';
export type UsageEventType =
  | 'ACTIVITY_RESUMED'
  | 'ACTIVITY_PAUSED'
  | 'ACTIVITY_STOPPED'
  | 'CONFIGURATION_CHANGE'
  | 'SHORTCUT_INVOCATION'
  | 'USER_INTERACTION'
  | 'SCREEN_INTERACTIVE'
  | 'SCREEN_NON_INTERACTIVE'
  | 'KEYGUARD_SHOWN'
  | 'KEYGUARD_HIDDEN'
  | 'FOREGROUND_SERVICE_START'
  | 'FOREGROUND_SERVICE_STOP';
export interface UsageEvent {
  packageName: string;
  eventType: UsageEventType;
  timestamp: number;
  className?: string;
}
export interface DailyUsageSummary {
  date: string;
  totalScreenTime: number;
  unlockCount: number;
  notificationCount: number;
  topApps: AppUsageRecord[];
  hourlyUsage: number[];
  categoryUsage: Record<AppCategory, number>;
  firstUnlock?: number;
  lastActivity?: number;
}
export interface WeeklyUsageSummary {
  weekStart: string;
  weekEnd: string;
  dailySummaries: DailyUsageSummary[];
  totalScreenTime: number;
  averageDailyScreenTime: number;
  totalUnlocks: number;
  topApps: AppUsageRecord[];
  peakDay: string;
  lowestDay: string;
  weekOverWeekChange: number;
}
export interface AppLimit {
  id: string;
  target: string;
  type: 'app' | 'category';
  dailyLimitMs: number;
  isActive: boolean;
  activeDays: number[];
  startTime?: string;
  endTime?: string;
  action: 'notify' | 'block' | 'both';
  gracePeriodMinutes: number;
  createdAt: number;
  updatedAt: number;
}
export interface LimitStatus {
  limitId: string;
  target: string;
  dailyLimitMs: number;
  usedTodayMs: number;
  remainingMs: number;
  percentageUsed: number;
  isExceeded: boolean;
  isInGracePeriod: boolean;
  gracePeriodRemaining?: number;
}
export interface UsageQueryOptions {
  startTime: number;
  endTime: number;
  includeSystemApps?: boolean;
  minUsageTime?: number;
  limit?: number;
  sortBy?: 'time' | 'launches' | 'lastUsed';
  sortOrder?: 'asc' | 'desc';
}
export interface UsagePermissionStatus {
  hasUsageAccess: boolean;
  hasOverlayPermission: boolean;
  hasNotificationPermission: boolean;
}
export interface UsageServiceResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
export interface UsageStatsNativeModule {
  checkPermission(): Promise<UsagePermissionStatus>;
  requestPermission(): Promise<void>;
  getAppUsageStats(options: UsageQueryOptions): Promise<AppUsageRecord[]>;
  getDailySummary(date: string): Promise<DailyUsageSummary>;
  getWeeklySummary(weekStart: string): Promise<WeeklyUsageSummary>;
  getUsageEvents(startTime: number, endTime: number): Promise<UsageEvent[]>;
  getCurrentForegroundApp(): Promise<string | null>;
  startMonitoring(): Promise<void>;
  stopMonitoring(): Promise<void>;
  isMonitoringActive(): Promise<boolean>;
  getInstalledApps(includeSystemApps: boolean): Promise<AppUsageRecord[]>;
  getAppInfo(packageName: string): Promise<AppUsageRecord | null>;
  addUsageUpdateListener(
    callback: (usage: AppUsageRecord) => void
  ): () => void;
  addLimitExceededListener(
    callback: (status: LimitStatus) => void
  ): () => void;
}
