export const API_BASE_URLS = {
  development: 'http://localhost:3000/api',
  staging: 'https://staging-api.mindfultime.app/api',
  production: 'https://api.mindfultime.app/api',
} as const;
export const ENVIRONMENT = __DEV__ ? 'development' : 'production';
export const API_BASE_URL = API_BASE_URLS[ENVIRONMENT];
export const API_VERSION = 'v1';
export const API_URL = `${API_BASE_URL}/${API_VERSION}`;
export const COLLECTIONS = {
  USERS: 'users',
  USER_PROFILES: 'userProfiles',
  USER_SETTINGS: 'userSettings',
  USER_STATS: 'userStats',
  USAGE_RECORDS: 'usageRecords',
  DAILY_SUMMARIES: 'dailySummaries',
  ACTIVITIES: 'activities',
  ACTIVITY_SESSIONS: 'activitySessions',
  BADGES: 'badges',
  USER_BADGES: 'userBadges',
  STREAKS: 'streaks',
  LEVELS: 'levels',
  LEADERBOARDS: 'leaderboards',
  FRIENDS: 'friends',
  FRIEND_REQUESTS: 'friendRequests',
  CHALLENGES: 'challenges',
  NOTIFICATIONS: 'notifications',
  APP_LIMITS: 'appLimits',
  BLOCKED_APPS: 'blockedApps',
  FOCUS_SESSIONS: 'focusSessions',
} as const;
export const SUBCOLLECTIONS = {
  DAILY_USAGE: 'dailyUsage',
  WEEKLY_USAGE: 'weeklyUsage',
  MONTHLY_USAGE: 'monthlyUsage',
  ACTIVITY_HISTORY: 'activityHistory',
  EARNED_BADGES: 'earnedBadges',
  CHALLENGE_PROGRESS: 'challengeProgress',
} as const;
export const AUTH_ENDPOINTS = {
  SIGN_UP: '/auth/signup',
  SIGN_IN: '/auth/signin',
  SIGN_OUT: '/auth/signout',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  DELETE_ACCOUNT: '/auth/delete-account',
} as const;
export const USER_ENDPOINTS = {
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  SETTINGS: '/users/settings',
  UPDATE_SETTINGS: '/users/settings',
  STATS: '/users/stats',
  SEARCH: '/users/search',
  UPLOAD_AVATAR: '/users/avatar',
} as const;
export const USAGE_ENDPOINTS = {
  RECORD: '/usage/record',
  DAILY: '/usage/daily',
  WEEKLY: '/usage/weekly',
  MONTHLY: '/usage/monthly',
  SUMMARY: '/usage/summary',
  APPS: '/usage/apps',
  LIMITS: '/usage/limits',
  BLOCKED: '/usage/blocked',
} as const;
export const ACTIVITY_ENDPOINTS = {
  LIST: '/activities',
  START: '/activities/start',
  COMPLETE: '/activities/complete',
  CANCEL: '/activities/cancel',
  HISTORY: '/activities/history',
  TEMPLATES: '/activities/templates',
  DETECTION: '/activities/detect',
} as const;
export const GAMIFICATION_ENDPOINTS = {
  BADGES: '/gamification/badges',
  USER_BADGES: '/gamification/badges/user',
  LEVEL: '/gamification/level',
  XP: '/gamification/xp',
  STREAK: '/gamification/streak',
  LEADERBOARD: '/gamification/leaderboard',
} as const;
export const SOCIAL_ENDPOINTS = {
  FRIENDS: '/social/friends',
  FRIEND_REQUESTS: '/social/friends/requests',
  SEND_REQUEST: '/social/friends/request',
  ACCEPT_REQUEST: '/social/friends/accept',
  REJECT_REQUEST: '/social/friends/reject',
  REMOVE_FRIEND: '/social/friends/remove',
  CHALLENGES: '/social/challenges',
  JOIN_CHALLENGE: '/social/challenges/join',
} as const;
export const NOTIFICATION_ENDPOINTS = {
  LIST: '/notifications',
  REGISTER_TOKEN: '/notifications/token',
  MARK_READ: '/notifications/read',
  SETTINGS: '/notifications/settings',
} as const;
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
export const ERROR_CODES = {
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS: 'USERNAME_ALREADY_EXISTS',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  RATE_LIMITED: 'RATE_LIMITED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  PREMIUM_REQUIRED: 'PREMIUM_REQUIRED',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
} as const;
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const;
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 30000,
  BACKOFF_FACTOR: 2,
  RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504],
} as const;
