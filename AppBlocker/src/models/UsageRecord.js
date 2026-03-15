/**
 * Model pentru un record de utilizare zilnică.
 * Stochează cât timp a fost folosită o aplicație într-o zi specifică.
 */

/**
 * Creează un record de utilizare.
 * @param {string} packageName - Package name-ul aplicației
 * @param {string} date - Data în format YYYY-MM-DD
 * @param {number} usedTimeMs - Timpul utilizat în milisecunde
 * @returns {UsageRecord}
 */
export const createUsageRecord = (packageName, date, usedTimeMs) => ({
  id: `${packageName}_${date}`,
  packageName,
  date,
  usedTimeMs,
  updatedAt: new Date().toISOString(),
});

/**
 * Calculează timpul mediu de utilizare dintr-o listă de records.
 * @param {UsageRecord[]} records - Lista de records
 * @returns {number} Media în milisecunde
 */
export const getAverageUsage = (records) => {
  if (records.length === 0) return 0;
  const total = records.reduce((sum, r) => sum + r.usedTimeMs, 0);
  return Math.round(total / records.length);
};

/**
 * Calculează timpul total de utilizare dintr-o listă de records.
 * @param {UsageRecord[]} records
 * @returns {number} Total în milisecunde
 */
export const getTotalUsage = (records) =>
  records.reduce((sum, r) => sum + r.usedTimeMs, 0);

/**
 * Returnează data de azi în format YYYY-MM-DD.
 * @returns {string}
 */
export const getTodayDate = () => new Date().toISOString().split('T')[0];
