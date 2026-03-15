/**
 * Constante globale pentru aplicația AppBlocker.
 */

// Chei AsyncStorage
export const STORAGE_KEYS = {
  BLOCK_RULES: '@AppBlocker:blockRules',
  USAGE_HISTORY: '@AppBlocker:usageHistory',
  APP_PROFILES: '@AppBlocker:appProfiles',
  GROUPED_RULES: '@AppBlocker:groupedRules',
  APP_VERSION: '@AppBlocker:appVersion',
};

// Limite default
export const DEFAULTS = {
  TIME_LIMIT_MINUTES: 60,
  MIN_TIME_LIMIT_MINUTES: 1,
  MAX_TIME_LIMIT_MINUTES: 1440, // 24 ore
  POLLING_INTERVAL_MS: 5000, // 5 secunde
  WARNING_THRESHOLD_PERCENT: 80,
};

// Categorii predefinite pentru grupuri de aplicații
export const APP_CATEGORIES = {
  SOCIAL_MEDIA: 'Social Media',
  GAMES: 'Jocuri',
  VIDEO: 'Video & Streaming',
  NEWS: 'Știri',
  PRODUCTIVITY: 'Productivitate',
  OTHER: 'Altele',
};

// Pachete cunoscute per categorie
export const KNOWN_PACKAGES = {
  [APP_CATEGORIES.SOCIAL_MEDIA]: [
    'com.instagram.android',
    'com.facebook.katana',
    'com.zhiliaoapp.musically', // TikTok
    'com.twitter.android',
    'com.snapchat.android',
    'com.whatsapp',
  ],
  [APP_CATEGORIES.VIDEO]: [
    'com.google.android.youtube',
    'com.netflix.mediaclient',
    'com.hbo.hbonow',
  ],
  [APP_CATEGORIES.GAMES]: [],
};

// Durate predefinite pentru quick-select
export const PRESET_LIMITS = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '1 oră', minutes: 60 },
  { label: '2 ore', minutes: 120 },
  { label: '4 ore', minutes: 240 },
];

// Istoric - câte zile păstrăm
export const HISTORY_RETENTION_DAYS = 30;
