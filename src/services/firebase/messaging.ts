import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {
  PushNotification,
  NotificationPayload,
  FCMTokenResult,
  ServiceResult,
  AsyncServiceResult,
} from './types';
export const NotificationChannels = {
  USAGE_ALERTS: 'usage_alerts',
  ACTIVITY_REMINDERS: 'activity_reminders',
  REWARDS: 'rewards',
  SOCIAL: 'social',
  DEFAULT: 'default',
} as const;
export type NotificationChannelId =
  (typeof NotificationChannels)[keyof typeof NotificationChannels];
const normalizeNotification = (
  message: FirebaseMessagingTypes.RemoteMessage
): PushNotification => ({
  messageId: message.messageId || '',
  title: message.notification?.title || null,
  body: message.notification?.body || null,
  data: (message.data as Record<string, string>) || {},
  sentTime: message.sentTime || Date.now(),
  category: message.category,
});
class MessagingService {
  private foregroundHandler: ((notification: PushNotification) => void) | null =
    null;
  private openHandler: ((notification: PushNotification) => void) | null = null;
  private unsubscribeForeground: (() => void) | null = null;
  private unsubscribeOpen: (() => void) | null = null;
  async requestPermission(): AsyncServiceResult<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return {
        success: true,
        data: enabled,
      };
    } catch (error) {
      console.error('[MessagingService] Permission error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  async checkPermission(): AsyncServiceResult<boolean> {
    try {
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return {
        success: true,
        data: enabled,
      };
    } catch (error) {
      console.error('[MessagingService] Check permission error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  async getToken(): AsyncServiceResult<FCMTokenResult> {
    try {
      const token = await messaging().getToken();
      return {
        success: true,
        data: {
          token,
          timestamp: new Date(),
          isRefresh: false,
        },
      };
    } catch (error) {
      console.error('[MessagingService] Get token error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  async deleteToken(): AsyncServiceResult<void> {
    try {
      await messaging().deleteToken();
      return {
        success: true,
      };
    } catch (error) {
      console.error('[MessagingService] Delete token error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  async subscribeToTopic(topic: string): AsyncServiceResult<void> {
    try {
      await messaging().subscribeToTopic(topic);
      return {
        success: true,
      };
    } catch (error) {
      console.error('[MessagingService] Subscribe to topic error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  async unsubscribeFromTopic(topic: string): AsyncServiceResult<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      return {
        success: true,
      };
    } catch (error) {
      console.error('[MessagingService] Unsubscribe from topic error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  async getInitialNotification(): AsyncServiceResult<PushNotification | null> {
    try {
      const message = await messaging().getInitialNotification();
      return {
        success: true,
        data: message ? normalizeNotification(message) : null,
      };
    } catch (error) {
      console.error('[MessagingService] Get initial notification error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
  setForegroundHandler(handler: (notification: PushNotification) => void): void {
    this.foregroundHandler = handler;
    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
    }
    this.unsubscribeForeground = messaging().onMessage((message) => {
      const notification = normalizeNotification(message);
      this.foregroundHandler?.(notification);
    });
  }
  setOpenHandler(handler: (notification: PushNotification) => void): void {
    this.openHandler = handler;
    if (this.unsubscribeOpen) {
      this.unsubscribeOpen();
    }
    this.unsubscribeOpen = messaging().onNotificationOpenedApp((message) => {
      const notification = normalizeNotification(message);
      this.openHandler?.(notification);
    });
  }
  onTokenRefresh(callback: (token: string) => void): () => void {
    return messaging().onTokenRefresh(callback);
  }
  removeAllListeners(): void {
    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
      this.unsubscribeForeground = null;
    }
    if (this.unsubscribeOpen) {
      this.unsubscribeOpen();
      this.unsubscribeOpen = null;
    }
    this.foregroundHandler = null;
    this.openHandler = null;
  }
  setBackgroundHandler(
    handler: (message: FirebaseMessagingTypes.RemoteMessage) => Promise<void>
  ): void {
    messaging().setBackgroundMessageHandler(handler);
  }
}
export const messagingService = new MessagingService();
export const setupBackgroundMessaging = (): void => {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('[MessagingService] Background message:', remoteMessage);
  });
};
