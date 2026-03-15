/**
 * Serviciu pentru salvarea și interogarea istoricului de utilizare zilnic.
 * Persistă date de utilizare per aplicație per zi în AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, HISTORY_RETENTION_DAYS } from '../utils/constants';
import { createUsageRecord, getTodayDate, getTotalUsage } from '../models/UsageRecord';
import { getTodayUsageStats } from '../native/AppUsageBridge';

/**
 * Încarcă tot istoricul de utilizare.
 * @returns {Promise<UsageRecord[]>}
 */
export const loadUsageHistory = async () => {
  const json = await AsyncStorage.getItem(STORAGE_KEYS.USAGE_HISTORY);
  if (!json) return [];
  return JSON.parse(json);
};

/**
 * Salvează istoricul complet.
 * @param {UsageRecord[]} records
 */
const saveUsageHistory = async (records) => {
  await AsyncStorage.setItem(STORAGE_KEYS.USAGE_HISTORY, JSON.stringify(records));
};

/**
 * Salvează snapshot-ul de utilizare pentru ziua curentă.
 * Preia datele din modulul nativ și le persistă.
 * @returns {Promise<UsageRecord[]>} Records actualizate pentru azi
 */
export const saveCurrentDayUsage = async () => {
  const today = getTodayDate();
  const usageStats = await getTodayUsageStats();
  const history = await loadUsageHistory();

  // Creăm un map al records existente pentru azi
  const todayMap = {};
  history.forEach((record) => {
    if (record.date === today) {
      todayMap[record.packageName] = record;
    }
  });

  // Actualizăm sau creăm records noi
  const updatedTodayRecords = [];
  usageStats.forEach((stat) => {
    if (stat.totalTimeInForeground > 0) {
      updatedTodayRecords.push(
        createUsageRecord(stat.packageName, today, stat.totalTimeInForeground)
      );
    }
  });

  // Înlocuim records de azi cu cele noi, păstrăm restul
  const otherDays = history.filter((r) => r.date !== today);
  const allRecords = [...otherDays, ...updatedTodayRecords];

  await saveUsageHistory(allRecords);
  return updatedTodayRecords;
};

/**
 * Obține istoricul de utilizare pentru o aplicație specifică.
 * @param {string} packageName
 * @param {number} days - Câte zile înapoi (default: 7)
 * @returns {Promise<UsageRecord[]>}
 */
export const getAppHistory = async (packageName, days = 7) => {
  const history = await loadUsageHistory();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffDate = cutoff.toISOString().split('T')[0];

  return history.filter(
    (r) => r.packageName === packageName && r.date >= cutoffDate
  );
};

/**
 * Obține istoricul de utilizare pentru o zi specifică.
 * @param {string} date - Data în format YYYY-MM-DD
 * @returns {Promise<UsageRecord[]>}
 */
export const getDayHistory = async (date) => {
  const history = await loadUsageHistory();
  return history.filter((r) => r.date === date);
};

/**
 * Obține top aplicații după timp de utilizare într-o perioadă.
 * @param {number} days - Număr de zile
 * @param {number} limit - Câte aplicații să returneze
 * @returns {Promise<Array<{packageName: string, totalMs: number}>>}
 */
export const getTopApps = async (days = 7, limit = 10) => {
  const history = await loadUsageHistory();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffDate = cutoff.toISOString().split('T')[0];

  // Agregăm per aplicație
  const totals = {};
  history.forEach((r) => {
    if (r.date >= cutoffDate) {
      totals[r.packageName] = (totals[r.packageName] || 0) + r.usedTimeMs;
    }
  });

  return Object.entries(totals)
    .map(([packageName, totalMs]) => ({ packageName, totalMs }))
    .sort((a, b) => b.totalMs - a.totalMs)
    .slice(0, limit);
};

/**
 * Obține trend-ul zilnic (timp total per zi) într-o perioadă.
 * @param {number} days
 * @returns {Promise<Array<{date: string, totalMs: number}>>}
 */
export const getDailyTrend = async (days = 7) => {
  const history = await loadUsageHistory();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffDate = cutoff.toISOString().split('T')[0];

  const dayTotals = {};
  history.forEach((r) => {
    if (r.date >= cutoffDate) {
      dayTotals[r.date] = (dayTotals[r.date] || 0) + r.usedTimeMs;
    }
  });

  return Object.entries(dayTotals)
    .map(([date, totalMs]) => ({ date, totalMs }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Șterge records mai vechi decât limita de retenție.
 * @returns {Promise<number>} Număr de records șterse
 */
export const cleanupOldRecords = async () => {
  const history = await loadUsageHistory();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - HISTORY_RETENTION_DAYS);
  const cutoffDate = cutoff.toISOString().split('T')[0];

  const filtered = history.filter((r) => r.date >= cutoffDate);
  const removedCount = history.length - filtered.length;

  if (removedCount > 0) {
    await saveUsageHistory(filtered);
  }

  return removedCount;
};
