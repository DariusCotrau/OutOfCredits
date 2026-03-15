/**
 * Bridge JS pentru modulul nativ BlockerServiceModule.
 */
import { NativeModules } from 'react-native';

const { BlockerServiceModule } = NativeModules;

/**
 * Pornește serviciul de blocare cu limită globală (toate aplicațiile au aceeași limită).
 * @param {string[]} packageNames - Lista de pachete de blocat
 * @param {number} timeLimitMinutes - Limita de timp în minute
 * @returns {Promise<boolean>}
 */
export const startBlocking = (packageNames, timeLimitMinutes) =>
  BlockerServiceModule.startBlocking(packageNames, timeLimitMinutes);

/**
 * Pornește serviciul de blocare cu limite diferite per aplicație.
 * @param {Object} packageLimits - Obiect { packageName: minuteLimit, ... }
 *   ex: { "com.instagram.android": 30, "com.tiktok": 15 }
 * @returns {Promise<boolean>}
 */
export const startBlockingWithLimits = (packageLimits) =>
  BlockerServiceModule.startBlockingWithLimits(packageLimits);

/**
 * Oprește serviciul de blocare.
 * @returns {Promise<boolean>}
 */
export const stopBlocking = () => BlockerServiceModule.stopBlocking();

/**
 * Verifică dacă serviciul este activ.
 * @returns {Promise<boolean>}
 */
export const isServiceRunning = () => BlockerServiceModule.isServiceRunning();
