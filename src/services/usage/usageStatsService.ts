import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { UsageStatsNative, type NativeAppUsage } from './native';
import type {
  AppUsageRecord,
  DailyUsageSummary,
  WeeklyUsageSummary,
  UsageEvent,
  UsageQueryOptions,
  UsagePermissionStatus,
  UsageServiceResult,
  AppCategory,
  LimitStatus,
} from './types';
import {
  startOfDay,
  startOfWeek,
  endOfWeek,
  formatDateKey,
  getDaysBetween,
} from '@shared/utils';
const MOCK_ENABLED = __DEV__ && Platform.OS !== 'android';
const CATEGORY_MAPPINGS: Record<string, AppCategory> = {
  'com.facebook': 'social',
  'com.instagram': 'social',
  'com.twitter': 'social',
  'com.snapchat': 'social',
  'com.tiktok': 'social',
  'com.linkedin': 'social',
  'com.pinterest': 'social',
  'com.whatsapp': 'communication',
  'com.telegram': 'communication',
  'com.viber': 'communication',
  'com.discord': 'communication',
  'com.skype': 'communication',
  'com.slack': 'communication',
  'com.google.android.apps.messaging': 'communication',
  'com.netflix': 'entertainment',
  'com.spotify': 'entertainment',
  'com.youtube': 'entertainment',
  'com.amazon.avod': 'entertainment',
  'com.disney': 'entertainment',
  'com.hbo': 'entertainment',
  'com.google.android.youtube': 'entertainment',
  'com.supercell': 'games',
  'com.king': 'games',
  'com.rovio': 'games',
  'com.ea': 'games',
  'com.gameloft': 'games',
  'com.mojang': 'games',
  'com.google.android.apps.docs': 'productivity',
  'com.microsoft.office': 'productivity',
  'com.notion': 'productivity',
  'com.todoist': 'productivity',
  'com.evernote': 'productivity',
  'com.google.android.gm': 'productivity',
  'com.duolingo': 'education',
  'com.quizlet': 'education',
  'com.coursera': 'education',
  'com.udemy': 'education',
  'com.amazon.mShop': 'shopping',
  'com.ebay': 'shopping',
  'com.alibaba': 'shopping',
  'com.shopify': 'shopping',
  'com.uber': 'travel',
  'com.lyft': 'travel',
  'com.booking': 'travel',
  'com.airbnb': 'travel',
  'com.google.android.apps.maps': 'travel',
  'com.paypal': 'finance',
  'com.venmo': 'finance',
  'com.robinhood': 'finance',
  'com.mint': 'finance',
};
const generateMockUsageData = (): AppUsageRecord[] => {
  const apps = [
    { name: 'Instagram', pkg: 'com.instagram.android', category: 'social' as AppCategory },
    { name: 'YouTube', pkg: 'com.google.android.youtube', category: 'entertainment' as AppCategory },
    { name: 'WhatsApp', pkg: 'com.whatsapp', category: 'communication' as AppCategory },
    { name: 'Twitter', pkg: 'com.twitter.android', category: 'social' as AppCategory },
    { name: 'Chrome', pkg: 'com.android.chrome', category: 'utilities' as AppCategory },
    { name: 'Gmail', pkg: 'com.google.android.gm', category: 'productivity' as AppCategory },
    { name: 'TikTok', pkg: 'com.zhiliaoapp.musically', category: 'entertainment' as AppCategory },
    { name: 'Spotify', pkg: 'com.spotify.music', category: 'entertainment' as AppCategory },
    { name: 'Netflix', pkg: 'com.netflix.mediaclient', category: 'entertainment' as AppCategory },
    { name: 'Maps', pkg: 'com.google.android.apps.maps', category: 'travel' as AppCategory },
  ];
  return apps.map((app) => ({
    packageName: app.pkg,
    appName: app.name,
    totalTimeInForeground: Math.floor(Math.random() * 3600000) + 300000,
    launchCount: Math.floor(Math.random() * 20) + 1,
    lastTimeUsed: Date.now() - Math.floor(Math.random() * 86400000),
    firstTimeUsed: Date.now() - 86400000,
    category: app.category,
    isSystemApp: false,
  }));
};
const generateMockDailySummary = (date: string): DailyUsageSummary => {
  const topApps = generateMockUsageData().slice(0, 5);
  const totalScreenTime = topApps.reduce((sum, app) => sum + app.totalTimeInForeground, 0);
  const hourlyUsage = Array(24).fill(0).map((_, hour) => {
    if (hour < 7 || hour > 23) return Math.floor(Math.random() * 60000);
    if (hour >= 9 && hour <= 17) return Math.floor(Math.random() * 300000) + 60000;
    return Math.floor(Math.random() * 600000) + 120000;
  });
  const categoryUsage: Record<AppCategory, number> = {
    social: Math.floor(totalScreenTime * 0.3),
    entertainment: Math.floor(totalScreenTime * 0.25),
    communication: Math.floor(totalScreenTime * 0.15),
    productivity: Math.floor(totalScreenTime * 0.1),
    games: Math.floor(totalScreenTime * 0.08),
    education: Math.floor(totalScreenTime * 0.05),
    health: Math.floor(totalScreenTime * 0.02),
    news: Math.floor(totalScreenTime * 0.02),
    shopping: Math.floor(totalScreenTime * 0.01),
    travel: Math.floor(totalScreenTime * 0.01),
    finance: Math.floor(totalScreenTime * 0.005),
    utilities: Math.floor(totalScreenTime * 0.005),
    other: 0,
  };
  return {
    date,
    totalScreenTime,
    unlockCount: Math.floor(Math.random() * 80) + 20,
    notificationCount: Math.floor(Math.random() * 150) + 30,
    topApps,
    hourlyUsage,
    categoryUsage,
    firstUnlock: new Date(date).setHours(7, Math.floor(Math.random() * 30), 0, 0),
    lastActivity: new Date(date).setHours(23, Math.floor(Math.random() * 59), 0, 0),
  };
};
class UsageStatsService {
  private nativeModule: any;
  private eventEmitter: NativeEventEmitter | null = null;
  private usageListeners: Set<(usage: AppUsageRecord) => void> = new Set();
  private limitListeners: Set<(status: LimitStatus) => void> = new Set();
  constructor() {
    if (Platform.OS === 'android' && NativeModules.UsageStatsModule) {
      this.nativeModule = NativeModules.UsageStatsModule;
      this.eventEmitter = new NativeEventEmitter(this.nativeModule);
      this.setupEventListeners();
    }
  }
  private setupEventListeners(): void {
    if (!this.eventEmitter) return;
    this.eventEmitter.addListener('onUsageUpdate', (usage: AppUsageRecord) => {
      this.usageListeners.forEach((listener) => listener(usage));
    });
    this.eventEmitter.addListener('onLimitExceeded', (status: LimitStatus) => {
      this.limitListeners.forEach((listener) => listener(status));
    });
  }
  private categorizeApp(packageName: string): AppCategory {
    for (const [prefix, category] of Object.entries(CATEGORY_MAPPINGS)) {
      if (packageName.startsWith(prefix)) {
        return category;
      }
    }
    return 'other';
  }
  private enhanceRecords(records: AppUsageRecord[]): AppUsageRecord[] {
    return records.map((record) => ({
      ...record,
      category: record.category ?? this.categorizeApp(record.packageName),
    }));
  }
  async checkPermission(): Promise<UsageServiceResult<UsagePermissionStatus>> {
    try {
      if (MOCK_ENABLED) {
        return {
          success: true,
          data: {
            hasUsageAccess: true,
            hasOverlayPermission: true,
            hasNotificationPermission: true,
          },
        };
      }
      if (!UsageStatsNative.isAvailable) {
        return {
          success: false,
          error: {
            code: 'MODULE_NOT_AVAILABLE',
            message: 'Usage stats module is not available on this platform',
          },
        };
      }
      const permStatus = await UsageStatsNative.checkPermission();
      const overlayStatus = await UsageStatsNative.checkOverlayPermission();
      return {
        success: true,
        data: {
          hasUsageAccess: permStatus.hasPermission,
          hasOverlayPermission: overlayStatus,
          hasNotificationPermission: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_CHECK_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async requestPermission(): Promise<UsageServiceResult<void>> {
    try {
      if (MOCK_ENABLED) {
        return { success: true };
      }
      if (!UsageStatsNative.isAvailable) {
        return {
          success: false,
          error: {
            code: 'MODULE_NOT_AVAILABLE',
            message: 'Usage stats module is not available',
          },
        };
      }
      await UsageStatsNative.requestPermission();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_REQUEST_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async getAppUsageStats(
    options: UsageQueryOptions
  ): Promise<UsageServiceResult<AppUsageRecord[]>> {
    try {
      if (MOCK_ENABLED) {
        let records = generateMockUsageData();
        if (options.minUsageTime) {
          records = records.filter(
            (r) => r.totalTimeInForeground >= options.minUsageTime!
          );
        }
        if (!options.includeSystemApps) {
          records = records.filter((r) => !r.isSystemApp);
        }
        if (options.limit) {
          records = records.slice(0, options.limit);
        }
        return { success: true, data: this.enhanceRecords(records) };
      }
      if (!this.nativeModule) {
        return {
          success: false,
          error: {
            code: 'MODULE_NOT_AVAILABLE',
            message: 'Usage stats module is not available',
          },
        };
      }
      const records = await this.nativeModule.getAppUsageStats(options);
      return { success: true, data: this.enhanceRecords(records) };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'QUERY_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  private convertNativeUsage(nativeUsage: NativeAppUsage[]): AppUsageRecord[] {
    return nativeUsage.map((app) => ({
      packageName: app.packageName,
      appName: app.appName,
      totalTimeInForeground: app.totalTimeInForeground,
      launchCount: 0,
      lastTimeUsed: Date.now(),
      firstTimeUsed: Date.now(),
      category: this.categorizeApp(app.packageName),
      isSystemApp: app.isSystemApp,
    }));
  }
  async getTodayUsage(): Promise<UsageServiceResult<AppUsageRecord[]>> {
    try {
      if (MOCK_ENABLED) {
        const now = Date.now();
        return this.getAppUsageStats({
          startTime: startOfDay(now),
          endTime: now,
          includeSystemApps: false,
          minUsageTime: 60000,
          sortBy: 'time',
          sortOrder: 'desc',
        });
      }
      if (!UsageStatsNative.isAvailable) {
        return {
          success: false,
          error: {
            code: 'MODULE_NOT_AVAILABLE',
            message: 'Usage stats module is not available',
          },
        };
      }
      const nativeUsage = await UsageStatsNative.getTodayUsage();
      const records = this.convertNativeUsage(nativeUsage)
        .filter((r) => r.totalTimeInForeground >= 60000 && !r.isSystemApp)
        .sort((a, b) => b.totalTimeInForeground - a.totalTimeInForeground);
      return { success: true, data: records };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'QUERY_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async getDailySummary(
    date?: Date
  ): Promise<UsageServiceResult<DailyUsageSummary>> {
    try {
      const targetDate = date ?? new Date();
      const dateKey = formatDateKey(targetDate);
      if (MOCK_ENABLED) {
        return { success: true, data: generateMockDailySummary(dateKey) };
      }
      if (!UsageStatsNative.isAvailable) {
        return {
          success: false,
          error: {
            code: 'MODULE_NOT_AVAILABLE',
            message: 'Usage stats module is not available',
          },
        };
      }
      const nativeUsage = await UsageStatsNative.getTodayUsage();
      const eventsResult = await UsageStatsNative.getTodayEvents();
      const records = this.convertNativeUsage(nativeUsage)
        .filter((r) => !r.isSystemApp)
        .sort((a, b) => b.totalTimeInForeground - a.totalTimeInForeground);
      const totalScreenTime = records.reduce(
        (sum, app) => sum + app.totalTimeInForeground,
        0
      );
      const categoryUsage: Record<AppCategory, number> = {
        social: 0,
        entertainment: 0,
        communication: 0,
        productivity: 0,
        games: 0,
        education: 0,
        health: 0,
        news: 0,
        shopping: 0,
        travel: 0,
        finance: 0,
        utilities: 0,
        other: 0,
      };
      records.forEach((app) => {
        const category = app.category ?? 'other';
        categoryUsage[category] += app.totalTimeInForeground;
      });
      const hourlyUsage = Array(24).fill(0);
      const currentHour = new Date().getHours();
      const avgPerHour = totalScreenTime / Math.max(currentHour, 1);
      for (let i = 0; i <= currentHour; i++) {
        hourlyUsage[i] = Math.floor(avgPerHour * (0.5 + Math.random()));
      }
      return {
        success: true,
        data: {
          date: dateKey,
          totalScreenTime,
          unlockCount: eventsResult.unlockCount,
          notificationCount: 0,
          topApps: records.slice(0, 10),
          hourlyUsage,
          categoryUsage,
          firstUnlock: startOfDay(Date.now()) + 7 * 60 * 60 * 1000,
          lastActivity: Date.now(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SUMMARY_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async getWeeklySummary(
    weekStart?: Date
  ): Promise<UsageServiceResult<WeeklyUsageSummary>> {
    try {
      const startDate = weekStart ?? new Date(startOfWeek(Date.now()));
      const endDate = new Date(endOfWeek(startDate.getTime()));
      const startKey = formatDateKey(startDate);
      const endKey = formatDateKey(endDate);
      if (MOCK_ENABLED) {
        const days = getDaysBetween(startDate, endDate);
        const dailySummaries = days.map((day) =>
          generateMockDailySummary(formatDateKey(day))
        );
        const totalScreenTime = dailySummaries.reduce(
          (sum, day) => sum + day.totalScreenTime,
          0
        );
        const allApps: Record<string, AppUsageRecord> = {};
        dailySummaries.forEach((day) => {
          day.topApps.forEach((app) => {
            if (allApps[app.packageName]) {
              allApps[app.packageName].totalTimeInForeground +=
                app.totalTimeInForeground;
              allApps[app.packageName].launchCount += app.launchCount;
            } else {
              allApps[app.packageName] = { ...app };
            }
          });
        });
        const topApps = Object.values(allApps)
          .sort((a, b) => b.totalTimeInForeground - a.totalTimeInForeground)
          .slice(0, 10);
        const sortedDays = [...dailySummaries].sort(
          (a, b) => b.totalScreenTime - a.totalScreenTime
        );
        return {
          success: true,
          data: {
            weekStart: startKey,
            weekEnd: endKey,
            dailySummaries,
            totalScreenTime,
            averageDailyScreenTime: totalScreenTime / dailySummaries.length,
            totalUnlocks: dailySummaries.reduce(
              (sum, day) => sum + day.unlockCount,
              0
            ),
            topApps,
            peakDay: sortedDays[0]?.date ?? startKey,
            lowestDay: sortedDays[sortedDays.length - 1]?.date ?? startKey,
            weekOverWeekChange: Math.floor(Math.random() * 40) - 20,
          },
        };
      }
      if (!this.nativeModule) {
        return {
          success: false,
          error: {
            code: 'MODULE_NOT_AVAILABLE',
            message: 'Usage stats module is not available',
          },
        };
      }
      const summary = await this.nativeModule.getWeeklySummary(startKey);
      return {
        success: true,
        data: {
          ...summary,
          topApps: this.enhanceRecords(summary.topApps),
          dailySummaries: summary.dailySummaries.map(
            (day: DailyUsageSummary) => ({
              ...day,
              topApps: this.enhanceRecords(day.topApps),
            })
          ),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SUMMARY_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async getUsageEvents(
    startTime: number,
    endTime: number
  ): Promise<UsageServiceResult<UsageEvent[]>> {
    try {
      if (MOCK_ENABLED) {
        return { success: true, data: [] };
      }
      if (!this.nativeModule) {
        return {
          success: false,
          error: {
            code: 'MODULE_NOT_AVAILABLE',
            message: 'Usage stats module is not available',
          },
        };
      }
      const events = await this.nativeModule.getUsageEvents(startTime, endTime);
      return { success: true, data: events };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EVENTS_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async startMonitoring(): Promise<UsageServiceResult<void>> {
    try {
      if (MOCK_ENABLED) {
        return { success: true };
      }
      if (!this.nativeModule) {
        return {
          success: false,
          error: {
            code: 'MODULE_NOT_AVAILABLE',
            message: 'Usage stats module is not available',
          },
        };
      }
      await this.nativeModule.startMonitoring();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MONITORING_START_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async stopMonitoring(): Promise<UsageServiceResult<void>> {
    try {
      if (MOCK_ENABLED) {
        return { success: true };
      }
      if (!this.nativeModule) {
        return {
          success: false,
          error: {
            code: 'MODULE_NOT_AVAILABLE',
            message: 'Usage stats module is not available',
          },
        };
      }
      await this.nativeModule.stopMonitoring();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MONITORING_STOP_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async isMonitoringActive(): Promise<boolean> {
    try {
      if (MOCK_ENABLED) {
        return true;
      }
      if (!this.nativeModule) {
        return false;
      }
      return await this.nativeModule.isMonitoringActive();
    } catch {
      return false;
    }
  }
  async getCurrentForegroundApp(): Promise<string | null> {
    try {
      if (MOCK_ENABLED) {
        return 'com.android.launcher';
      }
      if (!this.nativeModule) {
        return null;
      }
      return await this.nativeModule.getCurrentForegroundApp();
    } catch {
      return null;
    }
  }
  async getInstalledApps(
    includeSystemApps = false
  ): Promise<UsageServiceResult<AppUsageRecord[]>> {
    try {
      if (MOCK_ENABLED) {
        return { success: true, data: generateMockUsageData() };
      }
      if (!this.nativeModule) {
        return {
          success: false,
          error: {
            code: 'MODULE_NOT_AVAILABLE',
            message: 'Usage stats module is not available',
          },
        };
      }
      const apps = await this.nativeModule.getInstalledApps(includeSystemApps);
      return { success: true, data: this.enhanceRecords(apps) };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_APPS_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async getAppInfo(
    packageName: string
  ): Promise<UsageServiceResult<AppUsageRecord | null>> {
    try {
      if (MOCK_ENABLED) {
        const mockApps = generateMockUsageData();
        const app = mockApps.find((a) => a.packageName === packageName);
        return { success: true, data: app ?? null };
      }
      if (!this.nativeModule) {
        return {
          success: false,
          error: {
            code: 'MODULE_NOT_AVAILABLE',
            message: 'Usage stats module is not available',
          },
        };
      }
      const app = await this.nativeModule.getAppInfo(packageName);
      return {
        success: true,
        data: app ? this.enhanceRecords([app])[0] : null,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_APP_INFO_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  addUsageUpdateListener(callback: (usage: AppUsageRecord) => void): () => void {
    this.usageListeners.add(callback);
    return () => {
      this.usageListeners.delete(callback);
    };
  }
  addLimitExceededListener(callback: (status: LimitStatus) => void): () => void {
    this.limitListeners.add(callback);
    return () => {
      this.limitListeners.delete(callback);
    };
  }
}
export const usageStatsService = new UsageStatsService();
export default usageStatsService;
