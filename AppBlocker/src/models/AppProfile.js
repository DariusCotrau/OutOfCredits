/**
 * Model pentru profilul unei aplicații.
 * Cache pentru informații despre aplicațiile instalate.
 */

/**
 * Creează un profil de aplicație.
 * @param {string} packageName - Package name-ul aplicației
 * @param {string} appName - Numele afișat
 * @param {string|null} category - Categoria aplicației (ex: "Social", "Games")
 * @returns {AppProfile}
 */
export const createAppProfile = (packageName, appName, category = null) => ({
  packageName,
  appName,
  category,
  cachedAt: new Date().toISOString(),
});

/**
 * Verifică dacă un profil cache-uit este expirat.
 * @param {AppProfile} profile
 * @param {number} maxAgeMs - Vârsta maximă în milisecunde (default: 24h)
 * @returns {boolean}
 */
export const isProfileExpired = (profile, maxAgeMs = 24 * 60 * 60 * 1000) => {
  const cachedTime = new Date(profile.cachedAt).getTime();
  return Date.now() - cachedTime > maxAgeMs;
};

/**
 * Filtrează profilele după categorie.
 * @param {AppProfile[]} profiles
 * @param {string} category
 * @returns {AppProfile[]}
 */
export const filterByCategory = (profiles, category) =>
  profiles.filter((p) => p.category === category);

/**
 * Creează un map packageName -> AppProfile pentru lookup rapid.
 * @param {AppProfile[]} profiles
 * @returns {Object.<string, AppProfile>}
 */
export const createProfileMap = (profiles) => {
  const map = {};
  profiles.forEach((p) => {
    map[p.packageName] = p;
  });
  return map;
};
