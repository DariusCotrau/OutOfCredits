export const APP_NAME = 'MindfulTime';
export const APP_VERSION = '1.0.0';
export const APP_BUILD = '1';
export const BUNDLE_ID = 'com.mindfultime.app';
export const SUPPORT_EMAIL = 'support@mindfultime.app';
export const PRIVACY_POLICY_URL = 'https://mindfultime.app/privacy';
export const TERMS_OF_SERVICE_URL = 'https://mindfultime.app/terms';
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;
export const TIMEOUTS = {
  API_REQUEST: 30 * TIME.SECOND,
  SEARCH_DEBOUNCE: 300,
  AUTOSAVE_DEBOUNCE: TIME.SECOND,
  SESSION_INACTIVE: 30 * TIME.MINUTE,
  SPLASH_SCREEN: 2 * TIME.SECOND,
  TOAST_DISPLAY: 3 * TIME.SECOND,
  SNACKBAR_DISPLAY: 5 * TIME.SECOND,
  ANIMATION: 300,
} as const;
export const USAGE_TRACKING = {
  MIN_DURATION: 5 * TIME.SECOND,
  MAX_SESSION_DURATION: 4 * TIME.HOUR,
  SYNC_INTERVAL: 5 * TIME.MINUTE,
  BACKGROUND_INTERVAL: TIME.MINUTE,
  DEFAULT_DAILY_LIMIT: 2 * TIME.HOUR,
  WARNING_THRESHOLD: 0.8,
  CRITICAL_THRESHOLD: 0.95,
} as const;
export const ACTIVITY_CONFIG = {
  MIN_DURATION: 30 * TIME.SECOND,
  MAX_DURATION: 60 * TIME.MINUTE,
  DEFAULT_DURATION: 5 * TIME.MINUTE,
  DETECTION_CONFIDENCE: 0.7,
  COUNTDOWN_WARNING: 10 * TIME.SECOND,
  GRACE_PERIOD: 5 * TIME.SECOND,
} as const;
export const NOTIFICATION_CHANNELS = {
  GENERAL: 'mindfultime_general',
  USAGE_ALERTS: 'mindfultime_usage',
  ACTIVITY_REMINDERS: 'mindfultime_activities',
  ACHIEVEMENTS: 'mindfultime_achievements',
  SOCIAL: 'mindfultime_social',
} as const;
export const NOTIFICATION_TYPES = {
  USAGE_WARNING: 'usage_warning',
  USAGE_LIMIT_REACHED: 'usage_limit_reached',
  DAILY_SUMMARY: 'daily_summary',
  WEEKLY_REPORT: 'weekly_report',
  ACTIVITY_REMINDER: 'activity_reminder',
  ACTIVITY_STREAK: 'activity_streak',
  BREAK_SUGGESTION: 'break_suggestion',
  BADGE_EARNED: 'badge_earned',
  LEVEL_UP: 'level_up',
  STREAK_MILESTONE: 'streak_milestone',
  FRIEND_REQUEST: 'friend_request',
  CHALLENGE_INVITE: 'challenge_invite',
  LEADERBOARD_UPDATE: 'leaderboard_update',
} as const;
export const LIMITS = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  DISPLAY_NAME_MIN: 2,
  DISPLAY_NAME_MAX: 50,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 100,
  BIO_MAX: 200,
  APP_NAME_MAX: 50,
  MAX_APP_LIMITS: 50,
  MAX_BLOCKED_APPS: 100,
  MAX_FRIENDS: 500,
} as const;
export const FEATURES = {
  SOCIAL_ENABLED: true,
  AI_DETECTION_ENABLED: true,
  PREMIUM_ENABLED: true,
  ANALYTICS_ENABLED: true,
  CRASH_REPORTING_ENABLED: true,
  DEBUG_MODE: __DEV__,
  PERFORMANCE_MONITORING: true,
} as const;
export const CACHE_TTL = {
  USER_PROFILE: 5 * TIME.MINUTE,
  USAGE_DATA: TIME.MINUTE,
  LEADERBOARD: 5 * TIME.MINUTE,
  BADGES: TIME.HOUR,
  APP_LIST: TIME.HOUR,
  ACTIVITY_TEMPLATES: TIME.HOUR,
} as const;
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  LEADERBOARD_SIZE: 50,
  ACTIVITY_HISTORY_SIZE: 30,
  USAGE_HISTORY_SIZE: 7,
} as const;
