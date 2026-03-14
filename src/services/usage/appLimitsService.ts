import AsyncStorage from '@react-native-async-storage/async-storage';
import { firestoreService } from '@services/firebase';
import { COLLECTIONS } from '@shared/constants';
import { STORAGE_KEYS } from '@shared/utils/storage';
import { generateUUID } from '@shared/utils';
import type {
  AppLimit,
  LimitStatus,
  AppUsageRecord,
  UsageServiceResult,
} from './types';
const LIMITS_STORAGE_KEY = STORAGE_KEYS.APP_LIMITS ?? '@mindfultime/app_limits';
class AppLimitsService {
  private limits: Map<string, AppLimit> = new Map();
  private initialized = false;
  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const stored = await AsyncStorage.getItem(LIMITS_STORAGE_KEY);
      if (stored) {
        const parsed: AppLimit[] = JSON.parse(stored);
        parsed.forEach((limit) => {
          this.limits.set(limit.id, limit);
        });
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize app limits:', error);
    }
  }
  private async saveLimits(): Promise<void> {
    try {
      const limitsArray = Array.from(this.limits.values());
      await AsyncStorage.setItem(LIMITS_STORAGE_KEY, JSON.stringify(limitsArray));
    } catch (error) {
      console.error('Failed to save limits:', error);
    }
  }
  async createLimit(
    limitData: Omit<AppLimit, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<UsageServiceResult<AppLimit>> {
    try {
      await this.initialize();
      const now = Date.now();
      const limit: AppLimit = {
        ...limitData,
        id: generateUUID(),
        createdAt: now,
        updatedAt: now,
      };
      this.limits.set(limit.id, limit);
      await this.saveLimits();
      return { success: true, data: limit };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_LIMIT_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async getAllLimits(): Promise<UsageServiceResult<AppLimit[]>> {
    try {
      await this.initialize();
      return { success: true, data: Array.from(this.limits.values()) };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_LIMITS_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async getLimitById(id: string): Promise<UsageServiceResult<AppLimit | null>> {
    try {
      await this.initialize();
      const limit = this.limits.get(id) ?? null;
      return { success: true, data: limit };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_LIMIT_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async getLimitForApp(packageName: string): Promise<UsageServiceResult<AppLimit | null>> {
    try {
      await this.initialize();
      const limit = Array.from(this.limits.values()).find(
        (l) => l.type === 'app' && l.target === packageName && l.isActive
      );
      return { success: true, data: limit ?? null };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_LIMIT_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async getLimitForCategory(category: string): Promise<UsageServiceResult<AppLimit | null>> {
    try {
      await this.initialize();
      const limit = Array.from(this.limits.values()).find(
        (l) => l.type === 'category' && l.target === category && l.isActive
      );
      return { success: true, data: limit ?? null };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_LIMIT_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async updateLimit(
    id: string,
    updates: Partial<Omit<AppLimit, 'id' | 'createdAt'>>
  ): Promise<UsageServiceResult<AppLimit>> {
    try {
      await this.initialize();
      const existing = this.limits.get(id);
      if (!existing) {
        return {
          success: false,
          error: {
            code: 'LIMIT_NOT_FOUND',
            message: 'Limit not found',
          },
        };
      }
      const updated: AppLimit = {
        ...existing,
        ...updates,
        updatedAt: Date.now(),
      };
      this.limits.set(id, updated);
      await this.saveLimits();
      return { success: true, data: updated };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_LIMIT_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async deleteLimit(id: string): Promise<UsageServiceResult<void>> {
    try {
      await this.initialize();
      if (!this.limits.has(id)) {
        return {
          success: false,
          error: {
            code: 'LIMIT_NOT_FOUND',
            message: 'Limit not found',
          },
        };
      }
      this.limits.delete(id);
      await this.saveLimits();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DELETE_LIMIT_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async toggleLimit(id: string): Promise<UsageServiceResult<AppLimit>> {
    const result = await this.getLimitById(id);
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error ?? {
          code: 'LIMIT_NOT_FOUND',
          message: 'Limit not found',
        },
      };
    }
    return this.updateLimit(id, { isActive: !result.data.isActive });
  }
  async checkLimitStatus(
    packageName: string,
    usedTodayMs: number
  ): Promise<UsageServiceResult<LimitStatus | null>> {
    try {
      const limitResult = await this.getLimitForApp(packageName);
      if (!limitResult.success || !limitResult.data) {
        return { success: true, data: null };
      }
      const limit = limitResult.data;
      const status = this.calculateLimitStatus(limit, usedTodayMs);
      return { success: true, data: status };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CHECK_STATUS_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async checkAllLimits(
    usageRecords: AppUsageRecord[]
  ): Promise<UsageServiceResult<LimitStatus[]>> {
    try {
      await this.initialize();
      const statuses: LimitStatus[] = [];
      const activeLimits = Array.from(this.limits.values()).filter(
        (l) => l.isActive
      );
      for (const limit of activeLimits) {
        let usedMs = 0;
        if (limit.type === 'app') {
          const record = usageRecords.find(
            (r) => r.packageName === limit.target
          );
          usedMs = record?.totalTimeInForeground ?? 0;
        } else if (limit.type === 'category') {
          usedMs = usageRecords
            .filter((r) => r.category === limit.target)
            .reduce((sum, r) => sum + r.totalTimeInForeground, 0);
        }
        const status = this.calculateLimitStatus(limit, usedMs);
        statuses.push(status);
      }
      return { success: true, data: statuses };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CHECK_ALL_LIMITS_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  private calculateLimitStatus(limit: AppLimit, usedMs: number): LimitStatus {
    const remainingMs = Math.max(0, limit.dailyLimitMs - usedMs);
    const percentageUsed = Math.min(100, (usedMs / limit.dailyLimitMs) * 100);
    const isExceeded = usedMs >= limit.dailyLimitMs;
    const gracePeriodMs = limit.gracePeriodMinutes * 60 * 1000;
    const isInGracePeriod =
      isExceeded && usedMs < limit.dailyLimitMs + gracePeriodMs;
    return {
      limitId: limit.id,
      target: limit.target,
      dailyLimitMs: limit.dailyLimitMs,
      usedTodayMs: usedMs,
      remainingMs,
      percentageUsed,
      isExceeded,
      isInGracePeriod,
      gracePeriodRemaining: isInGracePeriod
        ? Math.ceil((limit.dailyLimitMs + gracePeriodMs - usedMs) / 60000)
        : undefined,
    };
  }
  async syncWithFirestore(userId: string): Promise<UsageServiceResult<void>> {
    try {
      await this.initialize();
      const remoteResult = await firestoreService.query<AppLimit>(
        COLLECTIONS.APP_LIMITS,
        [{ field: 'userId', operator: '==', value: userId }]
      );
      if (remoteResult.success && remoteResult.data) {
        for (const remote of remoteResult.data) {
          const local = this.limits.get(remote.id);
          if (!local || remote.updatedAt > local.updatedAt) {
            this.limits.set(remote.id, remote);
          }
        }
      }
      for (const limit of this.limits.values()) {
        await firestoreService.set(
          COLLECTIONS.APP_LIMITS,
          limit.id,
          { ...limit, userId }
        );
      }
      await this.saveLimits();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SYNC_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async clearAllLimits(): Promise<UsageServiceResult<void>> {
    try {
      this.limits.clear();
      await AsyncStorage.removeItem(LIMITS_STORAGE_KEY);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CLEAR_LIMITS_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}
export const appLimitsService = new AppLimitsService();
export default appLimitsService;
