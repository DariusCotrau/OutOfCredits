import AsyncStorage from '@react-native-async-storage/async-storage';


export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}


const STORAGE_PREFIX = '@mindfultime:';
const getKey = (key: string): string => `${STORAGE_PREFIX}${key}`;


export const setItem = async <T>(
  key: string,
  value: T
): Promise<StorageResult<void>> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(getKey(key), jsonValue);
    return { success: true };
  } catch (error) {
    console.error(`[Storage] Error setting ${key}:`, error);
    return { success: false, error: error as Error };
  }
};


export const getItem = async <T>(key: string): Promise<StorageResult<T>> => {
  try {
    const jsonValue = await AsyncStorage.getItem(getKey(key));
    if (jsonValue === null) {
      return { success: true, data: undefined };
    }
    const data = JSON.parse(jsonValue) as T;
    return { success: true, data };
  } catch (error) {
    console.error(`[Storage] Error getting ${key}:`, error);
    return { success: false, error: error as Error };
  }
};


export const removeItem = async (key: string): Promise<StorageResult<void>> => {
  try {
    await AsyncStorage.removeItem(getKey(key));
    return { success: true };
  } catch (error) {
    console.error(`[Storage] Error removing ${key}:`, error);
    return { success: false, error: error as Error };
  }
};


export const clearAll = async (): Promise<StorageResult<void>> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const appKeys = keys.filter((key) => key.startsWith(STORAGE_PREFIX));
    await AsyncStorage.multiRemove(appKeys);
    return { success: true };
  } catch (error) {
    console.error('[Storage] Error clearing storage:', error);
    return { success: false, error: error as Error };
  }
};


export const getAllKeys = async (): Promise<StorageResult<string[]>> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const appKeys = keys
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .map((key) => key.replace(STORAGE_PREFIX, ''));
    return { success: true, data: appKeys };
  } catch (error) {
    console.error('[Storage] Error getting keys:', error);
    return { success: false, error: error as Error };
  }
};


export const setMultiple = async (
  items: Record<string, unknown>
): Promise<StorageResult<void>> => {
  try {
    const pairs = Object.entries(items).map(([key, value]) => [
      getKey(key),
      JSON.stringify(value),
    ]) as [string, string][];
    await AsyncStorage.multiSet(pairs);
    return { success: true };
  } catch (error) {
    console.error('[Storage] Error setting multiple items:', error);
    return { success: false, error: error as Error };
  }
};


export const getMultiple = async <T extends Record<string, unknown>>(
  keys: string[]
): Promise<StorageResult<Partial<T>>> => {
  try {
    const prefixedKeys = keys.map(getKey);
    const pairs = await AsyncStorage.multiGet(prefixedKeys);
    const result: Record<string, unknown> = {};
    pairs.forEach(([key, value]) => {
      if (value !== null) {
        const originalKey = key.replace(STORAGE_PREFIX, '');
        result[originalKey] = JSON.parse(value);
      }
    });
    return { success: true, data: result as Partial<T> };
  } catch (error) {
    console.error('[Storage] Error getting multiple items:', error);
    return { success: false, error: error as Error };
  }
};


export const createStorageAccessor = <T>(key: string, defaultValue?: T) => ({
  get: async (): Promise<T | undefined> => {
    const result = await getItem<T>(key);
    return result.data ?? defaultValue;
  },
  set: async (value: T): Promise<boolean> => {
    const result = await setItem(key, value);
    return result.success;
  },
  remove: async (): Promise<boolean> => {
    const result = await removeItem(key);
    return result.success;
  },
  exists: async (): Promise<boolean> => {
    const result = await getItem<T>(key);
    return result.data !== undefined;
  },
});


export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
  THEME_MODE: 'theme_mode',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  SOUND_ENABLED: 'sound_enabled',
  HAPTICS_ENABLED: 'haptics_enabled',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_STEP: 'onboarding_step',
  LAST_SYNC: 'last_sync',
  PENDING_SYNC: 'pending_sync',
  DAILY_USAGE_CACHE: 'daily_usage_cache',
  WEEKLY_STATS_CACHE: 'weekly_stats_cache',
  CURRENT_ACTIVITY: 'current_activity',
  ACTIVITY_HISTORY: 'activity_history',
  USER_LEVEL: 'user_level',
  USER_XP: 'user_xp',
  USER_STREAK: 'user_streak',
  BADGES: 'badges',
  APP_LIMITS: 'app_limits',
  BLOCKED_APPS: 'blocked_apps',
  FOCUS_MODE_SCHEDULE: 'focus_mode_schedule',
  FCM_TOKEN: 'fcm_token',
  FCM_TOKEN_SENT: 'fcm_token_sent',
} as const;


export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
export const themeStorage = createStorageAccessor<'light' | 'dark' | 'system'>(
  STORAGE_KEYS.THEME_MODE,
  'system'
);
export const authTokenStorage = createStorageAccessor<string>(
  STORAGE_KEYS.AUTH_TOKEN
);
export const userIdStorage = createStorageAccessor<string>(
  STORAGE_KEYS.USER_ID
);
export const onboardingStorage = createStorageAccessor<boolean>(
  STORAGE_KEYS.ONBOARDING_COMPLETED,
  false
);
export const fcmTokenStorage = createStorageAccessor<string>(
  STORAGE_KEYS.FCM_TOKEN
);
export const lastSyncStorage = createStorageAccessor<number>(
  STORAGE_KEYS.LAST_SYNC
);


export interface CachedValue<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}


export const setCachedItem = async <T>(
  key: string,
  value: T,
  ttlMs: number
): Promise<StorageResult<void>> => {
  const cached: CachedValue<T> = {
    data: value,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttlMs,
  };
  return setItem(key, cached);
};


export const getCachedItem = async <T>(
  key: string
): Promise<StorageResult<T | undefined>> => {
  const result = await getItem<CachedValue<T>>(key);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  if (!result.data) {
    return { success: true, data: undefined };
  }
  if (Date.now() > result.data.expiresAt) {
    await removeItem(key);
    return { success: true, data: undefined };
  }
  return { success: true, data: result.data.data };
};


export const isCacheValid = async (key: string): Promise<boolean> => {
  const result = await getItem<CachedValue<unknown>>(key);
  if (!result.success || !result.data) {
    return false;
  }
  return Date.now() <= result.data.expiresAt;
};
