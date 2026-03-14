import { firestoreService } from '@services/firebase';
import type { AsyncServiceResult } from '@services/firebase/types';
import { COLLECTIONS } from '@shared/constants';
import type { UserProfile, UserSettings } from '@shared/types';

export interface UserData {
  profile: UserProfile;
  settings: UserSettings;
}

export type ProfileUpdateData = Partial<
  Omit<UserProfile, 'id' | 'createdAt' | 'email'>
>;

export type SettingsUpdateData = Partial<Omit<UserSettings, 'userId'>>;

class UserProfileService {
  private readonly collection = COLLECTIONS.USERS;

  async createProfile(profile: UserProfile): AsyncServiceResult<UserProfile> {
    try {
      const result = await firestoreService.set<UserProfile>(
        this.collection,
        profile.id,
        profile
      );

      if (result.success) {
        return { success: true, data: profile };
      }

      return {
        success: false,
        error: {
          code: 'FIRESTORE_ERROR',
          message: 'Failed to create user profile',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  async getProfile(userId: string): AsyncServiceResult<UserProfile> {
    try {
      const result = await firestoreService.get<UserProfile>(
        this.collection,
        userId
      );

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }

      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User profile not found',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: ProfileUpdateData
  ): AsyncServiceResult<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Date.now(),
      };

      const result = await firestoreService.update(
        this.collection,
        userId,
        updateData
      );

      if (result.success) {
        return { success: true, data: undefined };
      }

      return {
        success: false,
        error: {
          code: 'FIRESTORE_ERROR',
          message: 'Failed to update user profile',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(userId: string): AsyncServiceResult<void> {
    return this.updateProfile(userId, { lastActiveAt: Date.now() });
  }

  /**
   * Subscribe to profile changes
   */
  subscribeToProfile(
    userId: string,
    onUpdate: (profile: UserProfile | null) => void,
    onError?: (error: Error) => void
  ): () => void {
    return firestoreService.subscribeToDoc<UserProfile>(
      this.collection,
      userId,
      onUpdate,
      onError
    );
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string): AsyncServiceResult<void> {
    try {
      const result = await firestoreService.delete(
        this.collection,
        userId
      );

      if (result.success) {
        return { success: true, data: undefined };
      }

      return {
        success: false,
        error: {
          code: 'FIRESTORE_ERROR',
          message: 'Failed to delete user profile',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username: string): AsyncServiceResult<boolean> {
    try {
      const result = await firestoreService.query<UserProfile>(
        this.collection,
        [{ field: 'displayName', operator: '==', value: username }],
        undefined,
        { limit: 1 }
      );

      if (result.success) {
        return { success: true, data: result.data?.length === 0 };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Search users by display name
   */
  async searchUsers(
    query: string,
    limit = 20
  ): AsyncServiceResult<UserProfile[]> {
    try {
      // Note: Firestore doesn't support full-text search
      // This is a prefix search workaround
      const endQuery = query + '\uf8ff';

      const result = await firestoreService.query<UserProfile>(
        this.collection,
        [
          { field: 'displayName', operator: '>=', value: query },
          { field: 'displayName', operator: '<=', value: endQuery },
        ],
        undefined,
        { limit }
      );

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }

      return { success: true, data: [] };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Get users by IDs
   */
  async getUsersByIds(userIds: string[]): AsyncServiceResult<UserProfile[]> {
    try {
      if (userIds.length === 0) {
        return { success: true, data: [] };
      }

      // Firestore 'in' query limited to 10 items
      const chunks: string[][] = [];
      for (let i = 0; i < userIds.length; i += 10) {
        chunks.push(userIds.slice(i, i + 10));
      }

      const profiles: UserProfile[] = [];

      for (const chunk of chunks) {
        const result = await firestoreService.query<UserProfile>(
          this.collection,
          [{ field: 'id', operator: 'in', value: chunk }]
        );

        if (result.success && result.data) {
          profiles.push(...result.data);
        }
      }

      return { success: true, data: profiles };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }
}

// ============================================================================
// User Settings Service
// ============================================================================

class UserSettingsService {
  private readonly collection = COLLECTIONS.USER_SETTINGS;

  /**
   * Create user settings
   */
  async createSettings(settings: UserSettings): AsyncServiceResult<UserSettings> {
    try {
      const result = await firestoreService.set<UserSettings>(
        this.collection,
        settings.userId,
        settings
      );

      if (result.success) {
        return { success: true, data: settings };
      }

      return {
        success: false,
        error: {
          code: 'FIRESTORE_ERROR',
          message: 'Failed to create user settings',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Get user settings
   */
  async getSettings(userId: string): AsyncServiceResult<UserSettings> {
    try {
      const result = await firestoreService.get<UserSettings>(
        this.collection,
        userId
      );

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }

      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User settings not found',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Update user settings
   */
  async updateSettings(
    userId: string,
    updates: SettingsUpdateData
  ): AsyncServiceResult<void> {
    try {
      const result = await firestoreService.update(
        this.collection,
        userId,
        updates
      );

      if (result.success) {
        return { success: true, data: undefined };
      }

      return {
        success: false,
        error: {
          code: 'FIRESTORE_ERROR',
          message: 'Failed to update user settings',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(
    userId: string,
    notifications: Partial<UserSettings['notifications']>
  ): AsyncServiceResult<void> {
    try {
      // Get current settings first
      const currentResult = await this.getSettings(userId);

      if (!currentResult.success || !currentResult.data) {
        return {
          success: false,
          error: currentResult.error ?? {
            code: 'NOT_FOUND',
            message: 'Settings not found',
          },
        };
      }

      const updatedNotifications = {
        ...currentResult.data.notifications,
        ...notifications,
      };

      return this.updateSettings(userId, {
        notifications: updatedNotifications,
      });
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    userId: string,
    privacy: Partial<UserSettings['privacy']>
  ): AsyncServiceResult<void> {
    try {
      const currentResult = await this.getSettings(userId);

      if (!currentResult.success || !currentResult.data) {
        return {
          success: false,
          error: currentResult.error ?? {
            code: 'NOT_FOUND',
            message: 'Settings not found',
          },
        };
      }

      const updatedPrivacy = {
        ...currentResult.data.privacy,
        ...privacy,
      };

      return this.updateSettings(userId, { privacy: updatedPrivacy });
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Update screen time settings
   */
  async updateScreenTimeSettings(
    userId: string,
    screenTime: Partial<UserSettings['goals']>
  ): AsyncServiceResult<void> {
    try {
      const currentResult = await this.getSettings(userId);

      if (!currentResult.success || !currentResult.data) {
        return {
          success: false,
          error: currentResult.error ?? {
            code: 'NOT_FOUND',
            message: 'Settings not found',
          },
        };
      }

      const updatedScreenTime = {
        ...currentResult.data.goals,
        ...screenTime,
      };

      return this.updateSettings(userId, { goals: updatedScreenTime });
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * Subscribe to settings changes
   */
  subscribeToSettings(
    userId: string,
    onUpdate: (settings: UserSettings | null) => void,
    onError?: (error: Error) => void
  ): () => void {
    return firestoreService.subscribeToDoc<UserSettings>(
      this.collection,
      userId,
      onUpdate,
      onError
    );
  }

  async deleteSettings(userId: string): AsyncServiceResult<void> {
    try {
      const result = await firestoreService.delete(
        this.collection,
        userId
      );

      if (result.success) {
        return { success: true, data: undefined };
      }

      return {
        success: false,
        error: {
          code: 'FIRESTORE_ERROR',
          message: 'Failed to delete user settings',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }
}

class UserService {
  readonly profiles = new UserProfileService();
  readonly settings = new UserSettingsService();

  async createUser(
    profile: UserProfile,
    settings: UserSettings
  ): AsyncServiceResult<UserData> {
    try {
      const profileResult = await this.profiles.createProfile(profile);
      if (!profileResult.success) {
        return {
          success: false,
          error: profileResult.error,
        };
      }

      const settingsResult = await this.settings.createSettings(settings);
      if (!settingsResult.success) {
        await this.profiles.deleteProfile(profile.id);
        return {
          success: false,
          error: settingsResult.error,
        };
      }

      return {
        success: true,
        data: {
          profile: profileResult.data!,
          settings: settingsResult.data!,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  async getUserData(userId: string): AsyncServiceResult<UserData> {
    try {
      const [profileResult, settingsResult] = await Promise.all([
        this.profiles.getProfile(userId),
        this.settings.getSettings(userId),
      ]);

      if (!profileResult.success || !profileResult.data) {
        return {
          success: false,
          error: profileResult.error ?? {
            code: 'NOT_FOUND',
            message: 'User profile not found',
          },
        };
      }

      if (!settingsResult.success || !settingsResult.data) {
        return {
          success: false,
          error: settingsResult.error ?? {
            code: 'NOT_FOUND',
            message: 'User settings not found',
          },
        };
      }

      return {
        success: true,
        data: {
          profile: profileResult.data,
          settings: settingsResult.data,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  async deleteUser(userId: string): AsyncServiceResult<void> {
    try {
      await Promise.all([
        this.profiles.deleteProfile(userId),
        this.settings.deleteSettings(userId),
      ]);

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }
}

export const userService = new UserService();
export const userProfileService = userService.profiles;
export const userSettingsService = userService.settings;

export default userService;
