import { NativeModules, Platform, NativeEventEmitter } from 'react-native';
export interface UsageStatsPermissionStatus {
  hasPermission: boolean;
  canRequest: boolean;
}
export interface NativeAppUsage {
  packageName: string;
  appName: string;
  isSystemApp: boolean;
  category: string;
  totalTimeInForeground: number;
}
export interface NativeAppInfo {
  packageName: string;
  appName: string;
  isSystemApp: boolean;
  category: string;
}
export interface NativeUsageEvent {
  packageName: string;
  eventType: number;
  timestamp: number;
}
export interface NativeEventsResult {
  events: NativeUsageEvent[];
  unlockCount: number;
}
interface UsageStatsModuleInterface {
  checkPermission(): Promise<UsageStatsPermissionStatus>;
  requestPermission(): Promise<boolean>;
  checkOverlayPermission(): Promise<boolean>;
  requestOverlayPermission(): Promise<boolean>;
  getTodayUsage(): Promise<NativeAppUsage[]>;
  getUsageStats(startTimeMs: number, endTimeMs: number): Promise<NativeAppUsage[]>;
  getWeeklyUsage(): Promise<NativeAppUsage[]>;
  getTodayEvents(): Promise<NativeEventsResult>;
  getCurrentApp(): Promise<NativeAppInfo | null>;
  getInstalledApps(includeSystemApps: boolean): Promise<NativeAppInfo[]>;
  getAppInfo(packageName: string): Promise<NativeAppInfo>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}
const { UsageStatsModule } = NativeModules as {
  UsageStatsModule: UsageStatsModuleInterface | undefined;
};
const isAvailable = Platform.OS === 'android' && UsageStatsModule != null;
export const UsageStatsNative = {
  isAvailable,
  checkPermission: async (): Promise<UsageStatsPermissionStatus> => {
    if (!isAvailable) {
      return { hasPermission: false, canRequest: false };
    }
    return UsageStatsModule!.checkPermission();
  },
  requestPermission: async (): Promise<boolean> => {
    if (!isAvailable) return false;
    return UsageStatsModule!.requestPermission();
  },
  checkOverlayPermission: async (): Promise<boolean> => {
    if (!isAvailable) return false;
    return UsageStatsModule!.checkOverlayPermission();
  },
  requestOverlayPermission: async (): Promise<boolean> => {
    if (!isAvailable) return false;
    return UsageStatsModule!.requestOverlayPermission();
  },
  getTodayUsage: async (): Promise<NativeAppUsage[]> => {
    if (!isAvailable) return [];
    return UsageStatsModule!.getTodayUsage();
  },
  getUsageStats: async (
    startTime: Date | number,
    endTime: Date | number
  ): Promise<NativeAppUsage[]> => {
    if (!isAvailable) return [];
    const startMs = typeof startTime === 'number' ? startTime : startTime.getTime();
    const endMs = typeof endTime === 'number' ? endTime : endTime.getTime();
    return UsageStatsModule!.getUsageStats(startMs, endMs);
  },
  getWeeklyUsage: async (): Promise<NativeAppUsage[]> => {
    if (!isAvailable) return [];
    return UsageStatsModule!.getWeeklyUsage();
  },
  getTodayEvents: async (): Promise<NativeEventsResult> => {
    if (!isAvailable) return { events: [], unlockCount: 0 };
    return UsageStatsModule!.getTodayEvents();
  },
  getCurrentApp: async (): Promise<NativeAppInfo | null> => {
    if (!isAvailable) return null;
    return UsageStatsModule!.getCurrentApp();
  },
  getInstalledApps: async (includeSystemApps = false): Promise<NativeAppInfo[]> => {
    if (!isAvailable) return [];
    return UsageStatsModule!.getInstalledApps(includeSystemApps);
  },
  getAppInfo: async (packageName: string): Promise<NativeAppInfo | null> => {
    if (!isAvailable) return null;
    try {
      return await UsageStatsModule!.getAppInfo(packageName);
    } catch {
      return null;
    }
  },
};
export const UsageStatsEventEmitter = isAvailable
  ? new NativeEventEmitter(UsageStatsModule as any)
  : null;
export default UsageStatsNative;
