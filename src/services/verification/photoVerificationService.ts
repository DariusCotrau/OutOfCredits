import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'react-native-vision-camera';
import { Platform, PermissionsAndroid } from 'react-native';
import type {
  VerificationSettings,
  SessionVerificationData,
  UserVerificationPreferences,
  VerificationServiceResult,
} from './types';

const VERIFICATION_PREFS_KEY = '@mindfultime/verification_preferences';
const SESSION_VERIFICATIONS_KEY = '@mindfultime/session_verifications';

const DEFAULT_PREFERENCES: UserVerificationPreferences = {
  defaultEnabled: true,
  defaultRequired: false,
  activityOverrides: {},
};

class PhotoVerificationService {
  private preferences: UserVerificationPreferences | null = null;

  async checkCameraPermission(): Promise<boolean> {
    const permission = await Camera.getCameraPermissionStatus();
    return permission === 'granted';
  }
  async requestCameraPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permisiune Camera',
            message:
              'MindfulTime are nevoie de acces la camera pentru a verifica completarea activitatilor.',
            buttonNeutral: 'Intreaba mai tarziu',
            buttonNegative: 'Refuza',
            buttonPositive: 'Permite',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Failed to request camera permission:', err);
        return false;
      }
    } else {
      const permission = await Camera.requestCameraPermission();
      return permission === 'granted';
    }
  }

  async hasCamera(): Promise<boolean> {
    try {
      const devices = await Camera.getAvailableCameraDevices();
      return devices.length > 0;
    } catch (error) {
      console.error('Failed to check camera availability:', error);
      return false;
    }
  }

  async recordVerification(
    sessionId: string
  ): Promise<VerificationServiceResult<SessionVerificationData>> {
    try {
      const verificationData: SessionVerificationData = {
        sessionId,
        isPhotoVerified: true,
        status: 'verified',
        verifiedAt: Date.now(),
      };

      const verifications = await this.loadSessionVerifications();
      verifications[sessionId] = verificationData;
      await this.saveSessionVerifications(verifications);

      return { success: true, data: verificationData };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record verification',
      };
    }
  }

  async recordSkippedVerification(
    sessionId: string
  ): Promise<VerificationServiceResult<SessionVerificationData>> {
    try {
      const verificationData: SessionVerificationData = {
        sessionId,
        isPhotoVerified: false,
        status: 'skipped',
        verifiedAt: null,
      };

      const verifications = await this.loadSessionVerifications();
      verifications[sessionId] = verificationData;
      await this.saveSessionVerifications(verifications);

      return { success: true, data: verificationData };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record skipped verification',
      };
    }
  }

  async getSessionVerification(
    sessionId: string
  ): Promise<VerificationServiceResult<SessionVerificationData | null>> {
    try {
      const verifications = await this.loadSessionVerifications();
      const data = verifications[sessionId] || null;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get verification',
      };
    }
  }

  async getActivityVerificationSettings(
    activityId: string
  ): Promise<VerificationServiceResult<VerificationSettings>> {
    try {
      const prefs = await this.loadPreferences();

      if (prefs.activityOverrides[activityId]) {
        return { success: true, data: prefs.activityOverrides[activityId] };
      }

      return {
        success: true,
        data: {
          enabled: prefs.defaultEnabled,
          required: prefs.defaultRequired,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get settings',
      };
    }
  }

  async updateActivityVerificationSettings(
    activityId: string,
    settings: VerificationSettings
  ): Promise<VerificationServiceResult<void>> {
    try {
      const prefs = await this.loadPreferences();
      prefs.activityOverrides[activityId] = settings;
      await this.savePreferences(prefs);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update settings',
      };
    }
  }

  async getUserPreferences(): Promise<VerificationServiceResult<UserVerificationPreferences>> {
    try {
      const prefs = await this.loadPreferences();
      return { success: true, data: prefs };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get preferences',
      };
    }
  }

  async updateUserPreferences(
    updates: Partial<UserVerificationPreferences>
  ): Promise<VerificationServiceResult<UserVerificationPreferences>> {
    try {
      const prefs = await this.loadPreferences();
      const updated = { ...prefs, ...updates };
      await this.savePreferences(updated);
      return { success: true, data: updated };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update preferences',
      };
    }
  }

  async resetActivityVerificationSettings(
    activityId: string
  ): Promise<VerificationServiceResult<void>> {
    try {
      const prefs = await this.loadPreferences();
      delete prefs.activityOverrides[activityId];
      await this.savePreferences(prefs);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset settings',
      };
    }
  }

  async getVerificationStats(): Promise<
    VerificationServiceResult<{
      totalVerified: number;
      totalSkipped: number;
      verificationRate: number;
    }>
  > {
    try {
      const verifications = await this.loadSessionVerifications();
      const values = Object.values(verifications);

      const totalVerified = values.filter((v) => v.status === 'verified').length;
      const totalSkipped = values.filter((v) => v.status === 'skipped').length;
      const total = totalVerified + totalSkipped;
      const verificationRate = total > 0 ? (totalVerified / total) * 100 : 0;

      return {
        success: true,
        data: {
          totalVerified,
          totalSkipped,
          verificationRate,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get stats',
      };
    }
  }

  private async loadPreferences(): Promise<UserVerificationPreferences> {
    if (this.preferences) {
      return this.preferences;
    }

    try {
      const stored = await AsyncStorage.getItem(VERIFICATION_PREFS_KEY);
      const prefs = stored ? JSON.parse(stored) : { ...DEFAULT_PREFERENCES };
      this.preferences = prefs;
      return prefs;
    } catch (error) {
      console.error('Failed to load verification preferences:', error);
      return { ...DEFAULT_PREFERENCES };
    }
  }

  private async savePreferences(prefs: UserVerificationPreferences): Promise<void> {
    this.preferences = prefs;
    await AsyncStorage.setItem(VERIFICATION_PREFS_KEY, JSON.stringify(prefs));
  }

  private async loadSessionVerifications(): Promise<Record<string, SessionVerificationData>> {
    try {
      const stored = await AsyncStorage.getItem(SESSION_VERIFICATIONS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load session verifications:', error);
      return {};
    }
  }

  private async saveSessionVerifications(
    verifications: Record<string, SessionVerificationData>
  ): Promise<void> {
    await AsyncStorage.setItem(SESSION_VERIFICATIONS_KEY, JSON.stringify(verifications));
  }

  async cleanupOldVerifications(): Promise<void> {
    try {
      const verifications = await this.loadSessionVerifications();
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      const filtered = Object.fromEntries(
        Object.entries(verifications).filter(([_, v]) => {
          return v.verifiedAt === null || v.verifiedAt > thirtyDaysAgo;
        })
      );

      await this.saveSessionVerifications(filtered);
    } catch (error) {
      console.error('Failed to cleanup old verifications:', error);
    }
  }
}

export const photoVerificationService = new PhotoVerificationService();
export default photoVerificationService;
