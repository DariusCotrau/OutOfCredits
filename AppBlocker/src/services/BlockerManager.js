/**
 * Manager central care coordonează logica de blocare.
 * Combină regulile din storage cu datele de utilizare și controlează serviciul nativ.
 */
import { loadBlockRules, saveBlockRules } from './StorageService';
import { getTodayUsageStats } from '../native/AppUsageBridge';
import { startBlocking, stopBlocking, isServiceRunning } from '../native/BlockerServiceBridge';
import { isLimitExceeded, getRemainingTime } from '../models/BlockRule';
import { saveCurrentDayUsage, getTopApps, getDailyTrend } from './UsageHistoryService';
import { shouldSendWarning } from '../utils/notificationUtils';
import { minutesToMs } from '../utils/timeUtils';
import { DEFAULTS } from '../utils/constants';

/**
 * Obține statusul complet al tuturor regulilor cu datele de utilizare curente.
 * @returns {Promise<Array<{rule: BlockRule, usedTimeMs: number, isExceeded: boolean, remainingMs: number, warningActive: boolean}>>}
 */
export const getBlockStatus = async () => {
  const [rules, usageStats] = await Promise.all([
    loadBlockRules(),
    getTodayUsageStats(),
  ]);

  const usageMap = {};
  usageStats.forEach((stat) => {
    usageMap[stat.packageName] = stat.totalTimeInForeground;
  });

  return rules.map((rule) => {
    const usedTimeMs = usageMap[rule.packageName] || 0;
    const limitMs = minutesToMs(rule.timeLimitMinutes);
    return {
      rule,
      usedTimeMs,
      isExceeded: isLimitExceeded(rule, usedTimeMs),
      remainingMs: getRemainingTime(rule, usedTimeMs),
      warningActive: shouldSendWarning(usedTimeMs, limitMs),
    };
  });
};

/**
 * Sincronizează regulile JS cu serviciul nativ.
 * Trimite configurația per-aplicație către serviciul nativ.
 * @returns {Promise<void>}
 */
export const syncRulesToNativeService = async () => {
  const rules = await loadBlockRules();
  const activeRules = rules.filter((r) => r.isActive);

  if (activeRules.length === 0) {
    const running = await isServiceRunning();
    if (running) {
      await stopBlocking();
    }
    return;
  }

  // Construim un map packageName -> limită specifică per aplicație
  const packageNames = activeRules.map((r) => r.packageName);
  // Folosim limita minimă ca fallback global pentru serviciul nativ
  // (serviciul nativ va fi extins de Persoana 1 pentru suport per-app)
  const minTimeLimit = Math.min(...activeRules.map((r) => r.timeLimitMinutes));

  await startBlocking(packageNames, minTimeLimit);
};

/**
 * Activează blocarea pe baza regulilor active salvate.
 */
export const activateBlocking = async () => {
  const rules = await loadBlockRules();
  const activeRules = rules.filter((r) => r.isActive);

  if (activeRules.length === 0) {
    throw new Error('Nu există reguli active de blocare');
  }

  await syncRulesToNativeService();
};

/**
 * Dezactivează blocarea - oprește serviciul nativ.
 */
export const deactivateBlocking = async () => {
  await stopBlocking();
};

/**
 * Verifică dacă blocarea este activă.
 * @returns {Promise<boolean>}
 */
export const isBlockingActive = async () => {
  return await isServiceRunning();
};

/**
 * Obține statistici agregate pentru dashboard.
 * @returns {Promise<{totalUsedTodayMs: number, appsExceeded: number, appsWarning: number, topApps: Array, dailyTrend: Array}>}
 */
export const getAggregateStats = async () => {
  const [blockStatus, topApps, dailyTrend] = await Promise.all([
    getBlockStatus(),
    getTopApps(7, 5),
    getDailyTrend(7),
  ]);

  const totalUsedTodayMs = blockStatus.reduce((sum, s) => sum + s.usedTimeMs, 0);
  const appsExceeded = blockStatus.filter((s) => s.isExceeded).length;
  const appsWarning = blockStatus.filter((s) => s.warningActive).length;

  return {
    totalUsedTodayMs,
    appsExceeded,
    appsWarning,
    topApps,
    dailyTrend,
  };
};

/**
 * Salvează un snapshot al utilizării curente și face cleanup.
 * Apelat periodic sau la închiderea aplicației.
 */
export const persistUsageSnapshot = async () => {
  await saveCurrentDayUsage();
};
