/**
 * Serviciu care gestionează verificarea și cererea tuturor permisiunilor necesare.
 */
import { hasUsagePermission, requestUsagePermission } from '../native/AppUsageBridge';
import { hasOverlayPermission, requestOverlayPermission } from '../native/OverlayBridge';

/**
 * Verifică toate permisiunile necesare.
 * @returns {Promise<{usageAccess: boolean, overlay: boolean, allGranted: boolean}>}
 */
export const checkAllPermissions = async () => {
  const [usageAccess, overlay] = await Promise.all([
    hasUsagePermission(),
    hasOverlayPermission(),
  ]);

  return {
    usageAccess,
    overlay,
    allGranted: usageAccess && overlay,
  };
};

/**
 * Cere permisiunea Usage Access dacă nu este acordată.
 * @returns {Promise<boolean>} true dacă era deja acordată
 */
export const ensureUsagePermission = async () => {
  const granted = await hasUsagePermission();
  if (!granted) {
    requestUsagePermission();
  }
  return granted;
};

/**
 * Cere permisiunea Overlay dacă nu este acordată.
 * @returns {Promise<boolean>} true dacă era deja acordată
 */
export const ensureOverlayPermission = async () => {
  const granted = await hasOverlayPermission();
  if (!granted) {
    requestOverlayPermission();
  }
  return granted;
};
