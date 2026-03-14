/**
 * Bridge JS pentru modulul nativ BlockerServiceModule.
 */
import { NativeModules } from 'react-native';

const { BlockerServiceModule } = NativeModules;

/**
 * Pornește serviciul de blocare.
 * @param {string[]} packageNames - Lista de pachete de blocat
 * @param {number} timeLimitMinutes - Limita de timp în minute
 * @returns {Promise<boolean>}
 */
export const startBlocking = (packageNames, timeLimitMinutes) =>
  BlockerServiceModule.startBlocking(packageNames, timeLimitMinutes);

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
