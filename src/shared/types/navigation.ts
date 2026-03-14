import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { ActivityId, BadgeId, UserId } from './common';
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  ActivitySession: {
    activityId: ActivityId;
    duration?: number;
    presetId?: string;
  };
  BadgeDetail: {
    badgeId: BadgeId;
  };
  UserProfile: {
    userId: UserId;
  };
  Settings: NavigatorScreenParams<SettingsStackParamList>;
  NotificationHandler: {
    type: string;
    data?: Record<string, string>;
  };
};


export type AuthStackParamList = {
  Welcome: undefined;
  Login: {
    email?: string;
  };
  Register: undefined;
  ForgotPassword: {
    email?: string;
  };
  ResetPasswordSent: {
    email: string;
  };
};


export type OnboardingStackParamList = {
  OnboardingWelcome: undefined;
  OnboardingGoals: undefined;
  OnboardingLimits: undefined;
  OnboardingApps: undefined;
  OnboardingPermissions: undefined;
  OnboardingAvatar: undefined;
  OnboardingNotifications: undefined;
  OnboardingComplete: undefined;
};


export type MainTabParamList = {
  Dashboard: undefined;
  Usage: NavigatorScreenParams<UsageStackParamList>;
  Activity: NavigatorScreenParams<ActivityStackParamList>;
  Gamification: NavigatorScreenParams<GamificationStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};


export type UsageStackParamList = {
  UsageDashboard: undefined;
  AppDetails: {
    packageName: string;
  };
  AllApps: undefined;
  LimitsManagement: undefined;
  CreateLimit: {
    packageName?: string;
    category?: string;
  };
};


export type ActivityStackParamList = {
  ActivityList: undefined;
  ActivityDetail: {
    activityId: string;
  };
  ActivitySession: {
    activityId: string;
  };
};


export type GamificationStackParamList = {
  Rewards: undefined;
  Badges: undefined;
  Leaderboard: undefined;
};


export type HomeStackParamList = {
  Dashboard: undefined;
  TodayUsage: undefined;
  AppUsageDetail: {
    packageName: string;
    appName: string;
  };
  CategoryUsageDetail: {
    category: string;
  };
  QuickActivity: {
    suggestedActivityId?: ActivityId;
  };
  Notifications: undefined;
};


export type ActivitiesStackParamList = {
  ActivitiesList: {
    category?: string;
  };
  ActivityDetail: {
    activityId: ActivityId;
  };
  ActivityHistory: {
    activityId?: ActivityId;
  };
  CreatePreset: {
    activityId: ActivityId;
  };
  EditPreset: {
    presetId: string;
  };
  ScheduleActivity: {
    activityId: ActivityId;
  };
};


export type StatsStackParamList = {
  StatsOverview: undefined;
  WeeklyReport: {
    weekStart?: string;
  };
  MonthlyReport: {
    month?: string;
  };
  UsageTrends: undefined;
  AppBreakdown: undefined;
  CategoryBreakdown: undefined;
  GoalsProgress: undefined;
  ExportData: undefined;
};


export type RewardsStackParamList = {
  RewardsOverview: undefined;
  AllBadges: {
    category?: string;
  };
  BadgeDetail: {
    badgeId: BadgeId;
  };
  Streaks: undefined;
  Leaderboard: {
    type?: string;
    period?: string;
  };
  Challenges: undefined;
  ChallengeDetail: {
    challengeId: string;
  };
  CreateChallenge: undefined;
  LevelProgress: undefined;
  XPHistory: undefined;
};



export type ProfileStackParamList = {
  ProfileOverview: undefined;
  EditProfile: undefined;
  AvatarSelection: undefined;
  FriendsList: undefined;
  FriendRequests: undefined;
  AddFriend: undefined;
  FriendProfile: {
    userId: UserId;
  };
  PrivacySettings: undefined;
  AccountSettings: undefined;
};



export type SettingsStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  PrivacySettings: undefined;
  ScreenTimeSettings: undefined;
  AccountSettings: undefined;
  Help: undefined;
  SettingsMain: undefined;
  NotificationSettings: undefined;
  GoalSettings: undefined;
  AppLimits: undefined;
  EditAppLimit: {
    packageName: string;
  };
  CategoryLimits: undefined;
  FocusModeSettings: undefined;
  AppearanceSettings: undefined;
  PhotoVerificationSettings: undefined;
  DataSettings: undefined;
  About: undefined;
  HelpSupport: undefined;
  TermsPrivacy: undefined;
  Debug: undefined;
};



export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;



export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;



export type OnboardingStackScreenProps<
  T extends keyof OnboardingStackParamList,
> = CompositeScreenProps<
  NativeStackScreenProps<OnboardingStackParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;



export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;



export type UsageStackScreenProps<T extends keyof UsageStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<UsageStackParamList, T>,
    MainTabScreenProps<'Usage'>
  >;



export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, T>,
    MainTabScreenProps<'Dashboard'>
  >;



export type ActivitiesStackScreenProps<
  T extends keyof ActivitiesStackParamList,
> = CompositeScreenProps<
  NativeStackScreenProps<ActivitiesStackParamList, T>,
  MainTabScreenProps<'Activity'>
>;



export type StatsStackScreenProps<T extends keyof StatsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<StatsStackParamList, T>,
    MainTabScreenProps<'Usage'>
  >;


  
export type RewardsStackScreenProps<T extends keyof RewardsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<RewardsStackParamList, T>,
    MainTabScreenProps<'Gamification'>
  >;



export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, T>,
    MainTabScreenProps<'Settings'>
  >;



export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<SettingsStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;



export interface DeepLinkConfig {
  prefixes: string[];
  config: {
    screens: DeepLinkScreenConfig;
  };
}


export interface DeepLinkScreenConfig {
  [key: string]:
    | string
    | {
        path: string;
        parse?: Record<string, (value: string) => unknown>;
        screens?: DeepLinkScreenConfig;
      };
}


export interface NavigationStatePersistence {
  enabled: boolean;
  storageKey: string;
  excludeScreens: string[];
}
