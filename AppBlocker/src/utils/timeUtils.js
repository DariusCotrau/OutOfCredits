/**
 * Funcții utilitare pentru formatarea și manipularea timpului.
 */

/**
 * Convertește milisecunde în format "Xh Ym".
 * @param {number} ms - Milisecunde
 * @returns {string}
 */
export const formatTime = (ms) => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

/**
 * Convertește minute în milisecunde.
 * @param {number} minutes
 * @returns {number}
 */
export const minutesToMs = (minutes) => minutes * 60 * 1000;

/**
 * Convertește milisecunde în minute.
 * @param {number} ms
 * @returns {number}
 */
export const msToMinutes = (ms) => Math.floor(ms / 60000);

/**
 * Calculează procentul de timp utilizat.
 * @param {number} usedMs - Timp utilizat în ms
 * @param {number} limitMs - Limita în ms
 * @returns {number} Procent (0-100)
 */
export const getUsagePercentage = (usedMs, limitMs) => {
  if (limitMs === 0) return 100;
  return Math.min(100, Math.round((usedMs / limitMs) * 100));
};
