/**
 * Validare input pentru reguli de blocare și configurații.
 */
import { DEFAULTS } from './constants';

/**
 * Validează o limită de timp în minute.
 * @param {number} minutes
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateTimeLimit = (minutes) => {
  if (typeof minutes !== 'number' || isNaN(minutes)) {
    return { valid: false, error: 'Limita de timp trebuie să fie un număr.' };
  }
  if (!Number.isInteger(minutes)) {
    return { valid: false, error: 'Limita de timp trebuie să fie un număr întreg.' };
  }
  if (minutes < DEFAULTS.MIN_TIME_LIMIT_MINUTES) {
    return { valid: false, error: `Limita minimă este ${DEFAULTS.MIN_TIME_LIMIT_MINUTES} minut(e).` };
  }
  if (minutes > DEFAULTS.MAX_TIME_LIMIT_MINUTES) {
    return { valid: false, error: `Limita maximă este ${DEFAULTS.MAX_TIME_LIMIT_MINUTES} minute (24 ore).` };
  }
  return { valid: true, error: null };
};

/**
 * Validează un package name Android.
 * @param {string} packageName
 * @returns {{valid: boolean, error: string|null}}
 */
export const validatePackageName = (packageName) => {
  if (!packageName || typeof packageName !== 'string') {
    return { valid: false, error: 'Package name este obligatoriu.' };
  }
  // Format: cel puțin două segmente separate de punct
  const pattern = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/;
  if (!pattern.test(packageName)) {
    return { valid: false, error: 'Package name invalid. Exemplu: com.example.app' };
  }
  return { valid: true, error: null };
};

/**
 * Validează datele pentru crearea unei reguli de blocare.
 * @param {string} packageName
 * @param {string} appName
 * @param {number} timeLimitMinutes
 * @returns {{valid: boolean, errors: string[]}}
 */
export const validateBlockRuleInput = (packageName, appName, timeLimitMinutes) => {
  const errors = [];

  const pkgValidation = validatePackageName(packageName);
  if (!pkgValidation.valid) errors.push(pkgValidation.error);

  if (!appName || typeof appName !== 'string' || appName.trim().length === 0) {
    errors.push('Numele aplicației este obligatoriu.');
  }

  const timeValidation = validateTimeLimit(timeLimitMinutes);
  if (!timeValidation.valid) errors.push(timeValidation.error);

  return { valid: errors.length === 0, errors };
};
