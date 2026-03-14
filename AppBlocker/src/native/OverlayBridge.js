/**
 * Bridge JS pentru modulul nativ OverlayModule.
 */
import { NativeModules } from 'react-native';

const { OverlayModule } = NativeModules;

/**
 * Verifică dacă permisiunea de overlay (draw over other apps) este acordată.
 * @returns {Promise<boolean>}
 */
export const hasOverlayPermission = () => OverlayModule.hasOverlayPermission();

/**
 * Deschide setările pentru a acorda permisiunea de overlay.
 */
export const requestOverlayPermission = () => OverlayModule.requestOverlayPermission();
