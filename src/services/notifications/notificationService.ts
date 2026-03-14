import AsyncStorage from '@react-native-async-storage/async-storage';
export interface NotificationSettings {
  limitWarningsEnabled: boolean;
  limitReachedEnabled: boolean;
  dailySummaryEnabled: boolean;
  dailySummaryTime: string;
  warningThresholds: number[];
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}
export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  scheduledTime: number;
  type: 'limit_warning' | 'limit_reached' | 'daily_summary' | 'reminder' | 'achievement' | 'level_up' | 'streak' | 'mindfulness_reminder' | 'daily_goal';
  data?: Record<string, unknown>;
}
export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
}
const NOTIFICATION_SETTINGS_KEY = '@mindfultime/notification_settings';
const SCHEDULED_NOTIFICATIONS_KEY = '@mindfultime/scheduled_notifications';
const DEFAULT_SETTINGS: NotificationSettings = {
  limitWarningsEnabled: true,
  limitReachedEnabled: true,
  dailySummaryEnabled: true,
  dailySummaryTime: '21:00',
  warningThresholds: [80, 90, 100],
  soundEnabled: true,
  vibrationEnabled: true,
};
class NotificationService {
  private settings: NotificationSettings = DEFAULT_SETTINGS;
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private initialized = false;
  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const storedSettings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (storedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
      }
      const storedNotifications = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
      if (storedNotifications) {
        const notifications: ScheduledNotification[] = JSON.parse(storedNotifications);
        notifications.forEach((n) => {
          this.scheduledNotifications.set(n.id, n);
        });
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }
  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }
  private async saveScheduledNotifications(): Promise<void> {
    try {
      const notifications = Array.from(this.scheduledNotifications.values());
      await AsyncStorage.setItem(
        SCHEDULED_NOTIFICATIONS_KEY,
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error('Failed to save scheduled notifications:', error);
    }
  }
  async getSettings(): Promise<NotificationSettings> {
    await this.initialize();
    return { ...this.settings };
  }
  async updateSettings(updates: Partial<NotificationSettings>): Promise<void> {
    await this.initialize();
    this.settings = { ...this.settings, ...updates };
    await this.saveSettings();
  }
  async resetSettings(): Promise<void> {
    this.settings = DEFAULT_SETTINGS;
    await this.saveSettings();
  }
  async showLimitWarning(
    appName: string,
    percentageUsed: number,
    remainingMinutes: number
  ): Promise<NotificationResult> {
    await this.initialize();
    if (!this.settings.limitWarningsEnabled) {
      return { success: false, error: 'Limit warnings disabled' };
    }
    const title = `${appName} Usage Warning`;
    const body =
      percentageUsed >= 100
        ? `You've reached your daily limit for ${appName}`
        : `You've used ${Math.round(percentageUsed)}% of your ${appName} limit. ${remainingMinutes} minutes remaining.`;
    return this.showNotification({
      id: `limit_warning_${appName}_${Date.now()}`,
      title,
      body,
      scheduledTime: Date.now(),
      type: 'limit_warning',
      data: { appName, percentageUsed },
    });
  }
  async showLimitReached(
    appName: string,
    gracePeriodMinutes: number
  ): Promise<NotificationResult> {
    await this.initialize();
    if (!this.settings.limitReachedEnabled) {
      return { success: false, error: 'Limit reached notifications disabled' };
    }
    const title = `${appName} Limit Reached`;
    const body =
      gracePeriodMinutes > 0
        ? `You've reached your daily limit for ${appName}. You have ${gracePeriodMinutes} minutes of grace time.`
        : `You've reached your daily limit for ${appName}. Consider taking a break!`;
    return this.showNotification({
      id: `limit_reached_${appName}_${Date.now()}`,
      title,
      body,
      scheduledTime: Date.now(),
      type: 'limit_reached',
      data: { appName, gracePeriodMinutes },
    });
  }
  async showDailySummary(
    totalScreenTime: string,
    topApp: string,
    limitsExceeded: number
  ): Promise<NotificationResult> {
    await this.initialize();
    if (!this.settings.dailySummaryEnabled) {
      return { success: false, error: 'Daily summary notifications disabled' };
    }
    const title = 'Your Daily Screen Time Summary';
    let body = `Total screen time: ${totalScreenTime}. Most used: ${topApp}.`;
    if (limitsExceeded > 0) {
      body += ` You exceeded ${limitsExceeded} limit${limitsExceeded > 1 ? 's' : ''} today.`;
    }
    return this.showNotification({
      id: `daily_summary_${Date.now()}`,
      title,
      body,
      scheduledTime: Date.now(),
      type: 'daily_summary',
      data: { totalScreenTime, topApp, limitsExceeded },
    });
  }
  async showAchievement(
    badgeName: string,
    description: string,
    xpReward: number
  ): Promise<NotificationResult> {
    await this.initialize();
    const title = 'Achievement Unlocked!';
    const body = `${badgeName}: ${description}. +${xpReward} XP`;
    return this.showNotification({
      id: `achievement_${Date.now()}`,
      title,
      body,
      scheduledTime: Date.now(),
      type: 'achievement',
      data: { badgeName, xpReward },
    });
  }
  async showLevelUp(
    level: number,
    levelName: string
  ): Promise<NotificationResult> {
    await this.initialize();
    const title = 'Level Up!';
    const body = `Congratulations! You've reached Level ${level}: ${levelName}`;
    return this.showNotification({
      id: `level_up_${Date.now()}`,
      title,
      body,
      scheduledTime: Date.now(),
      type: 'level_up',
      data: { level, levelName },
    });
  }
  async showStreakMilestone(
    streakDays: number,
    streakType: string
  ): Promise<NotificationResult> {
    await this.initialize();
    const title = 'Streak Milestone!';
    const body = `Amazing! You've reached a ${streakDays}-day ${streakType} streak. Keep going!`;
    return this.showNotification({
      id: `streak_${Date.now()}`,
      title,
      body,
      scheduledTime: Date.now(),
      type: 'streak',
      data: { streakDays, streakType },
    });
  }
  async showDailyGoalsComplete(
    goalsCompleted: number,
    totalGoals: number
  ): Promise<NotificationResult> {
    await this.initialize();
    const title = 'Daily Goals Complete!';
    const body = goalsCompleted === totalGoals
      ? "Great work! You've completed all your daily goals."
      : `You've completed ${goalsCompleted} of ${totalGoals} daily goals.`;
    return this.showNotification({
      id: `daily_goal_${Date.now()}`,
      title,
      body,
      scheduledTime: Date.now(),
      type: 'daily_goal',
      data: { goalsCompleted, totalGoals },
    });
  }
  async showMindfulnessReminder(): Promise<NotificationResult> {
    await this.initialize();
    const title = 'Time for Mindfulness';
    const body = 'Take a few minutes to practice mindfulness and center yourself.';
    return this.showNotification({
      id: `mindfulness_${Date.now()}`,
      title,
      body,
      scheduledTime: Date.now(),
      type: 'mindfulness_reminder',
      data: {},
    });
  }
  async showNotification(notification: ScheduledNotification): Promise<NotificationResult> {
    try {
      console.log('Notification:', notification.title, notification.body);
      this.scheduledNotifications.set(notification.id, notification);
      await this.saveScheduledNotifications();
      return { success: true, notificationId: notification.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  async scheduleNotification(
    notification: Omit<ScheduledNotification, 'scheduledTime'>,
    scheduledTime: Date
  ): Promise<NotificationResult> {
    try {
      const fullNotification: ScheduledNotification = {
        ...notification,
        scheduledTime: scheduledTime.getTime(),
      };
      this.scheduledNotifications.set(notification.id, fullNotification);
      await this.saveScheduledNotifications();
      return { success: true, notificationId: notification.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  async cancelNotification(notificationId: string): Promise<void> {
    this.scheduledNotifications.delete(notificationId);
    await this.saveScheduledNotifications();
  }
  async cancelNotificationsForApp(appName: string): Promise<void> {
    for (const [id, notification] of this.scheduledNotifications) {
      if (notification.data?.appName === appName) {
        this.scheduledNotifications.delete(id);
      }
    }
    await this.saveScheduledNotifications();
  }
  async cancelAllNotifications(): Promise<void> {
    this.scheduledNotifications.clear();
    await this.saveScheduledNotifications();
  }
  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    await this.initialize();
    return Array.from(this.scheduledNotifications.values());
  }
  async checkPermission(): Promise<boolean> {
    return true;
  }
  async requestPermission(): Promise<boolean> {
    return true;
  }
}
export const notificationService = new NotificationService();
export default notificationService;
