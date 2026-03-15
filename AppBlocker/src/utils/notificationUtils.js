/**
 * Utilitare pentru generarea mesajelor de notificare.
 */
import { formatTime } from './timeUtils';
import { DEFAULTS } from './constants';

/**
 * Generează mesajul de avertizare când utilizatorul se apropie de limită.
 * @param {string} appName - Numele aplicației
 * @param {number} remainingMs - Timpul rămas în milisecunde
 * @returns {{title: string, body: string}}
 */
export const getWarningMessage = (appName, remainingMs) => ({
  title: `⏰ Aproape de limită: ${appName}`,
  body: `Mai ai ${formatTime(remainingMs)} disponibil. După aceea, aplicația va fi blocată.`,
});

/**
 * Generează mesajul când o aplicație a fost blocată.
 * @param {string} appName - Numele aplicației
 * @returns {{title: string, body: string}}
 */
export const getBlockedMessage = (appName) => ({
  title: `🚫 ${appName} a fost blocată`,
  body: 'Ai atins limita de timp zilnică pentru această aplicație.',
});

/**
 * Generează mesajul pentru notificarea persistentă a foreground service-ului.
 * @param {number} activeRulesCount - Numărul de reguli active
 * @returns {{title: string, body: string}}
 */
export const getServiceNotification = (activeRulesCount) => ({
  title: 'AppBlocker activ',
  body: `Monitorizez ${activeRulesCount} ${activeRulesCount === 1 ? 'aplicație' : 'aplicații'}.`,
});

/**
 * Generează mesajul de rezumat zilnic.
 * @param {number} totalBlockedMs - Timp total blocat în ms
 * @param {number} appsBlocked - Număr aplicații care au atins limita
 * @returns {{title: string, body: string}}
 */
export const getDailySummaryMessage = (totalBlockedMs, appsBlocked) => ({
  title: '📊 Rezumat zilnic AppBlocker',
  body: `Ai economisit ${formatTime(totalBlockedMs)} astăzi. ${appsBlocked} ${appsBlocked === 1 ? 'aplicație a atins' : 'aplicații au atins'} limita.`,
});

/**
 * Verifică dacă ar trebui trimisă notificarea de avertizare.
 * @param {number} usedMs - Timp utilizat
 * @param {number} limitMs - Limita de timp
 * @param {number} thresholdPercent - Procentul prag (default: 80%)
 * @returns {boolean}
 */
export const shouldSendWarning = (usedMs, limitMs, thresholdPercent = DEFAULTS.WARNING_THRESHOLD_PERCENT) => {
  if (limitMs === 0) return false;
  const percent = (usedMs / limitMs) * 100;
  return percent >= thresholdPercent && percent < 100;
};
