import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  createdAt: Date | null;
  lastSignInAt: Date | null;
  idToken?: string;
}
export interface FirebaseAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: {
    creationTime?: string | null;
    lastSignInTime?: string | null;
  };
  updateProfile: (profile: { displayName?: string; photoURL?: string }) => Promise<void>;
  reload: () => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  delete: () => Promise<void>;
  reauthenticateWithCredential: (credential: unknown) => Promise<unknown>;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
  linkWithCredential: (credential: unknown) => Promise<{ user: FirebaseAuthUser }>;
}
export interface AuthCredentials {
  email: string;
  password: string;
}
export interface AuthState {
  user: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}
export enum AuthErrorCode {
  INVALID_EMAIL = 'auth/invalid-email',
  USER_DISABLED = 'auth/user-disabled',
  USER_NOT_FOUND = 'auth/user-not-found',
  WRONG_PASSWORD = 'auth/wrong-password',
  EMAIL_IN_USE = 'auth/email-already-in-use',
  WEAK_PASSWORD = 'auth/weak-password',
  NETWORK_ERROR = 'auth/network-request-failed',
  TOO_MANY_REQUESTS = 'auth/too-many-requests',
  REQUIRES_RECENT_LOGIN = 'auth/requires-recent-login',
}
export const AuthErrorMessages: Record<AuthErrorCode, string> = {
  [AuthErrorCode.INVALID_EMAIL]: 'The email address is not valid.',
  [AuthErrorCode.USER_DISABLED]: 'This account has been disabled.',
  [AuthErrorCode.USER_NOT_FOUND]: 'No account found with this email.',
  [AuthErrorCode.WRONG_PASSWORD]: 'Incorrect password.',
  [AuthErrorCode.EMAIL_IN_USE]: 'An account already exists with this email.',
  [AuthErrorCode.WEAK_PASSWORD]: 'Password must be at least 6 characters.',
  [AuthErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [AuthErrorCode.TOO_MANY_REQUESTS]: 'Too many attempts. Please try again later.',
  [AuthErrorCode.REQUIRES_RECENT_LOGIN]: 'Please sign in again to continue.',
};
export interface FirestoreDocument {
  id: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}
export interface FirestoreQuery {
  field: string;
  operator: FirebaseFirestoreTypes.WhereFilterOp;
  value: unknown;
}
export interface FirestoreOrder {
  field: string;
  direction: 'asc' | 'desc';
}
export interface FirestorePagination {
  limit: number;
  startAfter?: FirebaseFirestoreTypes.DocumentSnapshot;
}
export interface FirestoreBatchOperation {
  type: 'set' | 'update' | 'delete';
  path: string;
  data?: Record<string, unknown>;
  merge?: boolean;
}
export interface PushNotification {
  messageId: string;
  title: string | null;
  body: string | null;
  data: Record<string, string>;
  sentTime: number;
  category?: string;
}
export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  android?: {
    channelId: string;
    smallIcon?: string;
    color?: string;
    priority?: 'default' | 'high' | 'low' | 'max' | 'min';
  };
}
export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: 'default' | 'high' | 'low' | 'max' | 'min' | 'none';
  vibration?: boolean;
  sound?: boolean;
  badge?: boolean;
}
export interface FCMTokenResult {
  token: string;
  timestamp: Date;
  isRefresh: boolean;
}
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string | { code: string; message: string };
  errorCode?: string;
}
export type AsyncServiceResult<T> = Promise<ServiceResult<T>>;
export type FirebaseTimestamp = FirebaseFirestoreTypes.Timestamp;
export type FirebaseDocumentSnapshot = FirebaseFirestoreTypes.DocumentSnapshot;
export type FirebaseQuerySnapshot = FirebaseFirestoreTypes.QuerySnapshot;
export type FirebaseRemoteMessage = FirebaseMessagingTypes.RemoteMessage;
