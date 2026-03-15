/**
 * Serviciu de migrare date la actualizarea versiunii aplicației.
 * Asigură compatibilitatea datelor persistate între versiuni.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

const CURRENT_VERSION = 2;

/**
 * Obține versiunea curentă stocată.
 * @returns {Promise<number>}
 */
const getStoredVersion = async () => {
  const version = await AsyncStorage.getItem(STORAGE_KEYS.APP_VERSION);
  return version ? parseInt(version, 10) : 1;
};

/**
 * Salvează versiunea curentă.
 * @param {number} version
 */
const setStoredVersion = async (version) => {
  await AsyncStorage.setItem(STORAGE_KEYS.APP_VERSION, String(version));
};

/**
 * Migrarea v1 -> v2: Adaugă câmpul `createdAt` la regulile care nu îl au.
 */
const migrateV1toV2 = async () => {
  const json = await AsyncStorage.getItem(STORAGE_KEYS.BLOCK_RULES);
  if (!json) return;

  const rules = JSON.parse(json);
  let changed = false;

  const updated = rules.map((rule) => {
    if (!rule.createdAt) {
      changed = true;
      return { ...rule, createdAt: new Date().toISOString() };
    }
    return rule;
  });

  if (changed) {
    await AsyncStorage.setItem(STORAGE_KEYS.BLOCK_RULES, JSON.stringify(updated));
  }
};

// Registrul de migrări — fiecare intrare se execută o singură dată
const MIGRATIONS = [
  { fromVersion: 1, toVersion: 2, migrate: migrateV1toV2 },
];

/**
 * Rulează toate migrările necesare.
 * Apelat la pornirea aplicației.
 * @returns {Promise<{migrated: boolean, fromVersion: number, toVersion: number}>}
 */
export const runMigrations = async () => {
  const storedVersion = await getStoredVersion();

  if (storedVersion >= CURRENT_VERSION) {
    return { migrated: false, fromVersion: storedVersion, toVersion: storedVersion };
  }

  const pendingMigrations = MIGRATIONS.filter(
    (m) => m.fromVersion >= storedVersion && m.toVersion <= CURRENT_VERSION
  );

  for (const migration of pendingMigrations) {
    await migration.migrate();
  }

  await setStoredVersion(CURRENT_VERSION);

  return { migrated: true, fromVersion: storedVersion, toVersion: CURRENT_VERSION };
};
