/**
 * Bridge JS pentru modulul nativ AppUsageModule.
 * Expune metodele native către codul React Native.
 */
import { NativeModules } from 'react-native';

const { AppUsageModule } = NativeModules;

/**
 * Verifică dacă permisiunea Usage Access este acordată.
 * @returns {Promise<boolean>}
 */
export const hasUsagePermission = () => AppUsageModule.hasUsagePermission();

/**
 * Deschide setările pentru Usage Access.
 */
export const requestUsagePermission = () => AppUsageModule.requestUsagePermission();

/**
 * Obține statisticile de utilizare pentru ziua curentă.
 * @returns {Promise<Array<{packageName: string, appName: string, totalTimeInForeground: number}>>}
 */
export const getTodayUsageStats = () => AppUsageModule.getTodayUsageStats();

/**
 * Obține lista aplicațiilor instalate (non-sistem).
 * @returns {Promise<Array<{packageName: string, appName: string}>>}
 */
export const getInstalledApps = () => AppUsageModule.getInstalledApps();
