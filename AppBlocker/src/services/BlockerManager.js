/**
 * Manager central care coordonează logica de blocare.
 * Combină regulile din storage cu datele de utilizare și controlează serviciul nativ.
 */
import { loadBlockRules, saveBlockRules } from './StorageService';
import { getTodayUsageStats } from '../native/AppUsageBridge';
import { startBlocking, stopBlocking, isServiceRunning } from '../native/BlockerServiceBridge';
import { isLimitExceeded, getRemainingTime } from '../models/BlockRule';

/**
 * Obține statusul complet al tuturor regulilor cu datele de utilizare curente.
 * @returns {Promise<Array<{rule: BlockRule, usedTimeMs: number, isExceeded: boolean, remainingMs: number}>>}
 */
export const getBlockStatus = async () => {
  const [rules, usageStats] = await Promise.all([
    loadBlockRules(),
    getTodayUsageStats(),
  ]);

  // Creăm un map pentru lookup rapid
  const usageMap = {};
  usageStats.forEach((stat) => {
    usageMap[stat.packageName] = stat.totalTimeInForeground;
  });

  return rules.map((rule) => {
    const usedTimeMs = usageMap[rule.packageName] || 0;
    return {
      rule,
      usedTimeMs,
      isExceeded: isLimitExceeded(rule, usedTimeMs),
      remainingMs: getRemainingTime(rule, usedTimeMs),
    };
  });
};

/**
 * Activează blocarea pe baza regulilor active salvate.
 * Pornește serviciul nativ cu pachetele și limita de timp.
 */
export const activateBlocking = async () => {
  const rules = await loadBlockRules();
  const activeRules = rules.filter((r) => r.isActive);

  if (activeRules.length === 0) {
    throw new Error('Nu există reguli active de blocare');
  }

  const packageNames = activeRules.map((r) => r.packageName);
  // Folosim limita minimă dintre toate regulile active
  const minTimeLimit = Math.min(...activeRules.map((r) => r.timeLimitMinutes));

  await startBlocking(packageNames, minTimeLimit);
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
