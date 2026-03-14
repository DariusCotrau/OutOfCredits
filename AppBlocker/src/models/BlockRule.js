/**
 * Model pentru o regulă de blocare.
 * Definește ce aplicație este blocată și cu ce limită de timp.
 */

/**
 * Creează o regulă de blocare nouă.
 * @param {string} packageName - Package name-ul aplicației Android
 * @param {string} appName - Numele afișat al aplicației
 * @param {number} timeLimitMinutes - Limita de timp în minute (per zi)
 * @param {boolean} isActive - Dacă regula este activă
 * @returns {BlockRule}
 */
export const createBlockRule = (packageName, appName, timeLimitMinutes, isActive = true) => ({
  id: `${packageName}_${Date.now()}`,
  packageName,
  appName,
  timeLimitMinutes,
  isActive,
  createdAt: new Date().toISOString(),
});

/**
 * Verifică dacă o regulă a fost depășită pe baza timpului utilizat.
 * @param {BlockRule} rule - Regula de verificat
 * @param {number} usedTimeMs - Timpul utilizat în milisecunde
 * @returns {boolean}
 */
export const isLimitExceeded = (rule, usedTimeMs) => {
  if (!rule.isActive) return false;
  const limitMs = rule.timeLimitMinutes * 60 * 1000;
  return usedTimeMs >= limitMs;
};

/**
 * Calculează timpul rămas pentru o regulă.
 * @param {BlockRule} rule - Regula
 * @param {number} usedTimeMs - Timpul utilizat în milisecunde
 * @returns {number} Timpul rămas în milisecunde (minim 0)
 */
export const getRemainingTime = (rule, usedTimeMs) => {
  const limitMs = rule.timeLimitMinutes * 60 * 1000;
  return Math.max(0, limitMs - usedTimeMs);
};
