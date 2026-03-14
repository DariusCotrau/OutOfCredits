export type NotificationCategory =
  | 'limit_warning'
  | 'limit_exceeded'
  | 'mindfulness_reminder'
  | 'daily_goal'
  | 'streak'
  | 'achievement'
  | 'level_up'
  | 'daily_reward'
  | 'general';
export type NotificationPriority = 'low' | 'default' | 'high' | 'max';
export type NotificationRepeat = 'minute' | 'hour' | 'day' | 'week' | null;
export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: 'none' | 'min' | 'low' | 'default' | 'high' | 'max';
  vibration: boolean;
  sound: boolean;
  lights: boolean;
  lightColor?: string;
}
export interface NotificationAction {
  id: string;
  title: string;
  foreground?: boolean;
  destructive?: boolean;
}
export interface NotificationData {
  category: NotificationCategory;
  entityType?: 'app' | 'activity' | 'badge' | 'goal';
  entityId?: string;
  targetScreen?: string;
  targetParams?: Record<string, unknown>;
  [key: string]: unknown;
}
export interface LocalNotification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  data?: NotificationData;
  badge?: number;
  channelId?: string;
  smallIcon?: string;
  largeIcon?: string;
  sound?: string;
  vibrate?: number[];
  actions?: NotificationAction[];
  groupId?: string;
  autoCancel?: boolean;
}
export interface ScheduledNotification extends LocalNotification {
  scheduledAt: number;
  repeat?: NotificationRepeat;
  repeatDays?: number[];
  repeatTime?: string;
}
export interface NotificationSettings {
  enabled: boolean;
  limitWarnings: boolean;
  limitExceeded: boolean;
  mindfulnessReminders: boolean;
  mindfulnessReminderTime: string;
  dailyGoals: boolean;
  streakReminders: boolean;
  achievements: boolean;
  dailyRewards: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}
export interface NotificationPermissionStatus {
  hasPermission: boolean;
  canRequest: boolean;
  denied: boolean;
  settingsUrl?: string;
}
export interface NotificationEvent {
  type: 'received' | 'pressed' | 'dismissed' | 'action';
  notification: LocalNotification;
  actionId?: string;
  userInput?: string;
  timestamp: number;
}
export const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  limitWarnings: true,
  limitExceeded: true,
  mindfulnessReminders: true,
  mindfulnessReminderTime: '09:00',
  dailyGoals: true,
  streakReminders: true,
  achievements: true,
  dailyRewards: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
};
export const defaultNotificationChannels: NotificationChannel[] = [
  {
    id: 'limits',
    name: 'App Limits',
    description: 'Warnings when approaching or exceeding app limits',
    importance: 'high',
    vibration: true,
    sound: true,
    lights: true,
    lightColor: '#FF5722',
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness Reminders',
    description: 'Reminders to practice mindfulness activities',
    importance: 'default',
    vibration: true,
    sound: true,
    lights: true,
    lightColor: '#4CAF50',
  },
  {
    id: 'achievements',
    name: 'Achievements',
    description: 'Badge unlocks, level ups, and other achievements',
    importance: 'default',
    vibration: true,
    sound: true,
    lights: true,
    lightColor: '#FFD700',
  },
  {
    id: 'general',
    name: 'General',
    description: 'General app notifications',
    importance: 'low',
    vibration: false,
    sound: false,
    lights: false,
  },
];
