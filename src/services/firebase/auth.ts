import authModule from '@react-native-firebase/auth';
import {
  FirebaseAuthUser,
  FirebaseUser,
  AuthCredentials,
  AuthErrorCode,
  AuthErrorMessages,
  AsyncServiceResult,
} from './types';
type AuthModuleWithStatics = {
  (): {
    currentUser: FirebaseAuthUser | null;
    createUserWithEmailAndPassword: (
      email: string,
      password: string
    ) => Promise<{ user: FirebaseAuthUser }>;
    signInWithEmailAndPassword: (
      email: string,
      password: string
    ) => Promise<{ user: FirebaseAuthUser }>;
    signInAnonymously: () => Promise<{ user: FirebaseAuthUser }>;
    signOut: () => Promise<void>;
    sendPasswordResetEmail: (email: string) => Promise<void>;
    onAuthStateChanged: (
      callback: (user: FirebaseAuthUser | null) => void
    ) => () => void;
    onIdTokenChanged: (
      callback: (user: FirebaseAuthUser | null) => void
    ) => () => void;
  };
  EmailAuthProvider: {
    credential: (email: string, password: string) => unknown;
  };
};
const auth = authModule as unknown as AuthModuleWithStatics;
const normalizeUser = (user: FirebaseAuthUser): FirebaseUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  emailVerified: user.emailVerified,
  isAnonymous: user.isAnonymous,
  createdAt: user.metadata.creationTime
    ? new Date(user.metadata.creationTime)
    : null,
  lastSignInAt: user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime)
    : null,
});
const parseAuthError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code as AuthErrorCode;
    return AuthErrorMessages[code] || 'An unexpected error occurred.';
  }
  return 'An unexpected error occurred.';
};
class AuthService {
  getCurrentUser(): FirebaseUser | null {
    const user = auth().currentUser;
    return user ? normalizeUser(user) : null;
  }
  isAuthenticated(): boolean {
    return auth().currentUser !== null;
  }
  async signUpWithEmail(
    credentials: AuthCredentials
  ): AsyncServiceResult<FirebaseUser> {
    try {
      const { email, password } = credentials;
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      return {
        success: true,
        data: normalizeUser(userCredential.user),
      };
    } catch (error) {
      console.error('[AuthService] Sign up error:', error);
      return {
        success: false,
        error: parseAuthError(error),
        errorCode: (error as { code?: string })?.code,
      };
    }
  }
  async signInWithEmail(
    credentials: AuthCredentials
  ): AsyncServiceResult<FirebaseUser> {
    try {
      const { email, password } = credentials;
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password
      );
      return {
        success: true,
        data: normalizeUser(userCredential.user),
      };
    } catch (error) {
      console.error('[AuthService] Sign in error:', error);
      return {
        success: false,
        error: parseAuthError(error),
        errorCode: (error as { code?: string })?.code,
      };
    }
  }
  async signInAnonymously(): AsyncServiceResult<FirebaseUser> {
    try {
      const userCredential = await auth().signInAnonymously();
      return {
        success: true,
        data: normalizeUser(userCredential.user),
      };
    } catch (error) {
      console.error('[AuthService] Anonymous sign in error:', error);
      return {
        success: false,
        error: parseAuthError(error),
        errorCode: (error as { code?: string })?.code,
      };
    }
  }
  async signOut(): AsyncServiceResult<void> {
    try {
      await auth().signOut();
      return {
        success: true,
      };
    } catch (error) {
      console.error('[AuthService] Sign out error:', error);
      return {
        success: false,
        error: parseAuthError(error),
        errorCode: (error as { code?: string })?.code,
      };
    }
  }
  async sendPasswordResetEmail(email: string): AsyncServiceResult<void> {
    try {
      await auth().sendPasswordResetEmail(email);
      return {
        success: true,
      };
    } catch (error) {
      console.error('[AuthService] Password reset error:', error);
      return {
        success: false,
        error: parseAuthError(error),
        errorCode: (error as { code?: string })?.code,
      };
    }
  }
  async updateProfile(profile: {
    displayName?: string;
    photoURL?: string;
  }): AsyncServiceResult<FirebaseUser> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return {
          success: false,
          error: 'No user is currently signed in.',
        };
      }
      await currentUser.updateProfile(profile);
      await currentUser.reload();
      return {
        success: true,
        data: normalizeUser(auth().currentUser!),
      };
    } catch (error) {
      console.error('[AuthService] Update profile error:', error);
      return {
        success: false,
        error: parseAuthError(error),
        errorCode: (error as { code?: string })?.code,
      };
    }
  }
  async updateEmail(newEmail: string): AsyncServiceResult<void> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return {
          success: false,
          error: 'No user is currently signed in.',
        };
      }
      await currentUser.updateEmail(newEmail);
      return {
        success: true,
      };
    } catch (error) {
      console.error('[AuthService] Update email error:', error);
      return {
        success: false,
        error: parseAuthError(error),
        errorCode: (error as { code?: string })?.code,
      };
    }
  }
  async updatePassword(newPassword: string): AsyncServiceResult<void> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return {
          success: false,
          error: 'No user is currently signed in.',
        };
      }
      await currentUser.updatePassword(newPassword);
      return {
        success: true,
      };
    } catch (error) {
      console.error('[AuthService] Update password error:', error);
      return {
        success: false,
        error: parseAuthError(error),
        errorCode: (error as { code?: string })?.code,
      };
    }
  }
  async deleteAccount(): AsyncServiceResult<void> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return {
          success: false,
          error: 'No user is currently signed in.',
        };
      }
      await currentUser.delete();
      return {
        success: true,
      };
    } catch (error) {
      console.error('[AuthService] Delete account error:', error);
      return {
        success: false,
        error: parseAuthError(error),
        errorCode: (error as { code?: string })?.code,
      };
    }
  }
  async reauthenticate(password: string): AsyncServiceResult<void> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser || !currentUser.email) {
        return {
          success: false,
          error: 'No user is currently signed in.',
        };
      }
      const credential = auth.EmailAuthProvider.credential(
        currentUser.email,
        password
      );
      await currentUser.reauthenticateWithCredential(credential);
      return {
        success: true,
      };
    } catch (error) {
      console.error('[AuthService] Reauthenticate error:', error);
      return {
        success: false,
        error: parseAuthError(error),
        errorCode: (error as { code?: string })?.code,
      };
    }
  }
  async getIdToken(forceRefresh = false): AsyncServiceResult<string> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        return {
          success: false,
          error: 'No user is currently signed in.',
        };
      }
      const token = await currentUser.getIdToken(forceRefresh);
      return {
        success: true,
        data: token,
      };
    } catch (error) {
      console.error('[AuthService] Get ID token error:', error);
      return {
        success: false,
        error: parseAuthError(error),
        errorCode: (error as { code?: string })?.code,
      };
    }
  }
  onAuthStateChanged(
    callback: (user: FirebaseUser | null) => void
  ): () => void {
    return auth().onAuthStateChanged((user: FirebaseAuthUser | null) => {
      callback(user ? normalizeUser(user) : null);
    });
  }
  onIdTokenChanged(
    callback: (user: FirebaseUser | null) => void
  ): () => void {
    return auth().onIdTokenChanged((user: FirebaseAuthUser | null) => {
      callback(user ? normalizeUser(user) : null);
    });
  }
  async linkAnonymousAccount(
    credentials: AuthCredentials
  ): AsyncServiceResult<FirebaseUser> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser || !currentUser.isAnonymous) {
        return {
          success: false,
          error: 'No anonymous user is currently signed in.',
        };
      }
      const credential = auth.EmailAuthProvider.credential(
        credentials.email,
        credentials.password
      );
      const userCredential = await currentUser.linkWithCredential(credential);
      return {
        success: true,
        data: normalizeUser(userCredential.user),
      };
    } catch (error) {
      console.error('[AuthService] Link account error:', error);
      return {
        success: false,
        error: parseAuthError(error),
        errorCode: (error as { code?: string })?.code,
      };
    }
  }
}
export const authService = new AuthService();
