export const AUTH_SCREENS = {
  LANDING: 'Landing',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  RESET_PASSWORD: 'ResetPassword',
  VERIFY_EMAIL: 'VerifyEmail',
} as const;
export const ONBOARDING_SCREENS = {
  WELCOME: 'OnboardingWelcome',
  PERMISSIONS: 'OnboardingPermissions',
  GOALS: 'OnboardingGoals',
  APPS: 'OnboardingApps',
  ACTIVITIES: 'OnboardingActivities',
  NOTIFICATIONS: 'OnboardingNotifications',
  COMPLETE: 'OnboardingComplete',
} as const;
export const MAIN_TABS = {
  HOME: 'Home',
  ACTIVITIES: 'Activities',
  STATS: 'Stats',
  PROFILE: 'Profile',
} as const;
export const HOME_SCREENS = {
  DASHBOARD: 'Dashboard',
  USAGE_DETAILS: 'UsageDetails',
  APP_DETAILS: 'AppDetails',
  DAILY_SUMMARY: 'DailySummary',
  WEEKLY_REPORT: 'WeeklyReport',
} as const;
export const ACTIVITY_SCREENS = {
  LIST: 'ActivityList',
  DETAIL: 'ActivityDetail',
  SESSION: 'ActivitySession',
  COMPLETE: 'ActivityComplete',
  HISTORY: 'ActivityHistory',
  DETECTION: 'ActivityDetection',
} as const;
export const STATS_SCREENS = {
  OVERVIEW: 'StatsOverview',
  USAGE: 'UsageStats',
  ACTIVITIES: 'ActivityStats',
  TRENDS: 'Trends',
  COMPARISONS: 'Comparisons',
  INSIGHTS: 'Insights',
} as const;
export const PROFILE_SCREENS = {
  MAIN: 'ProfileMain',
  EDIT: 'EditProfile',
  SETTINGS: 'Settings',
  NOTIFICATIONS: 'NotificationSettings',
  PRIVACY: 'PrivacySettings',
  APP_LIMITS: 'AppLimits',
  BLOCKED_APPS: 'BlockedApps',
  FOCUS_MODE: 'FocusMode',
  ACCOUNT: 'AccountSettings',
  HELP: 'Help',
  ABOUT: 'About',
} as const;
export const GAMIFICATION_SCREENS = {
  BADGES: 'Badges',
  BADGE_DETAIL: 'BadgeDetail',
  ACHIEVEMENTS: 'Achievements',
  LEADERBOARD: 'Leaderboard',
  LEVEL: 'Level',
  STREAK: 'Streak',
} as const;
export const SOCIAL_SCREENS = {
  FRIENDS: 'Friends',
  FRIEND_PROFILE: 'FriendProfile',
  FIND_FRIENDS: 'FindFriends',
  REQUESTS: 'FriendRequests',
  CHALLENGES: 'Challenges',
  CHALLENGE_DETAIL: 'ChallengeDetail',
  CREATE_CHALLENGE: 'CreateChallenge',
} as const;
export const MODAL_SCREENS = {
  APP_LIMIT_PICKER: 'AppLimitPicker',
  TIME_PICKER: 'TimePicker',
  DATE_PICKER: 'DatePicker',
  ACTIVITY_PICKER: 'ActivityPicker',
  FILTER: 'Filter',
  SORT: 'Sort',
  CONFIRMATION: 'Confirmation',
} as const;
export const SCREENS = {
  ...AUTH_SCREENS,
  ...ONBOARDING_SCREENS,
  ...MAIN_TABS,
  ...HOME_SCREENS,
  ...ACTIVITY_SCREENS,
  ...STATS_SCREENS,
  ...PROFILE_SCREENS,
  ...GAMIFICATION_SCREENS,
  ...SOCIAL_SCREENS,
  ...MODAL_SCREENS,
} as const;
export type ScreenName = (typeof SCREENS)[keyof typeof SCREENS];
const screenValues = <T extends Record<string, ScreenName>>(
  obj: T
): ScreenName[] => Object.values(obj) as ScreenName[];
export const TAB_CONFIG = {
  [MAIN_TABS.HOME]: {
    icon: 'home',
    label: 'Home',
    testID: 'tab-home',
  },
  [MAIN_TABS.ACTIVITIES]: {
    icon: 'timer',
    label: 'Activities',
    testID: 'tab-activities',
  },
  [MAIN_TABS.STATS]: {
    icon: 'chart',
    label: 'Stats',
    testID: 'tab-stats',
  },
  [MAIN_TABS.PROFILE]: {
    icon: 'user',
    label: 'Profile',
    testID: 'tab-profile',
  },
} as const;
export const HIDE_TAB_BAR_SCREENS: ScreenName[] = [
  ACTIVITY_SCREENS.SESSION,
  ACTIVITY_SCREENS.DETECTION,
  MODAL_SCREENS.APP_LIMIT_PICKER,
  MODAL_SCREENS.TIME_PICKER,
  MODAL_SCREENS.DATE_PICKER,
];
export const CUSTOM_HEADER_SCREENS: ScreenName[] = [
  HOME_SCREENS.DASHBOARD,
  STATS_SCREENS.OVERVIEW,
  PROFILE_SCREENS.MAIN,
];
export const AUTH_REQUIRED_SCREENS: ScreenName[] = [
  ...screenValues(MAIN_TABS),
  ...screenValues(HOME_SCREENS),
  ...screenValues(ACTIVITY_SCREENS),
  ...screenValues(STATS_SCREENS),
  ...screenValues(PROFILE_SCREENS),
  ...screenValues(GAMIFICATION_SCREENS),
  ...screenValues(SOCIAL_SCREENS),
];
export const PREMIUM_REQUIRED_SCREENS: ScreenName[] = [
  STATS_SCREENS.INSIGHTS,
  STATS_SCREENS.COMPARISONS,
  SOCIAL_SCREENS.CHALLENGES,
  SOCIAL_SCREENS.CREATE_CHALLENGE,
];
export const DEEP_LINK_PREFIXES = [
  'mindfultime://',
  'https://mindfultime.app',
  'https://app.mindfultime.com',
] as const;
export const DEEP_LINK_CONFIG = {
  screens: {
    [AUTH_SCREENS.RESET_PASSWORD]: 'reset-password/:token',
    [AUTH_SCREENS.VERIFY_EMAIL]: 'verify-email/:token',
    [HOME_SCREENS.DASHBOARD]: 'home',
    [ACTIVITY_SCREENS.LIST]: 'activities',
    [STATS_SCREENS.OVERVIEW]: 'stats',
    [PROFILE_SCREENS.MAIN]: 'profile',
    [HOME_SCREENS.APP_DETAILS]: 'app/:appId',
    [ACTIVITY_SCREENS.DETAIL]: 'activity/:activityId',
    [GAMIFICATION_SCREENS.BADGE_DETAIL]: 'badge/:badgeId',
    [SOCIAL_SCREENS.FRIEND_PROFILE]: 'user/:userId',
    [SOCIAL_SCREENS.CHALLENGE_DETAIL]: 'challenge/:challengeId',
  },
} as const;
