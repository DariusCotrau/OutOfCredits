import firebase from '@react-native-firebase/app';
export { authService } from './auth';
export { firestoreService } from './firestore';
export { messagingService } from './messaging';
export type {
  FirebaseUser,
  AuthCredentials,
  AuthState,
  FirestoreDocument,
  FirestoreQuery,
  PushNotification,
  NotificationPayload,
} from './types';
export const isFirebaseInitialized = (): boolean => {
  try {
    return firebase.apps.length > 0;
  } catch (error) {
    console.error('[Firebase] Initialization check failed:', error);
    return false;
  }
};
export const getFirebaseApp = () => {
  if (!isFirebaseInitialized()) {
    throw new Error(
      '[Firebase] Not initialized. Please ensure google-services.json is configured.'
    );
  }
  return firebase.app();
};
export const getFirebaseStatus = () => {
  return {
    initialized: isFirebaseInitialized(),
    appName: isFirebaseInitialized() ? firebase.app().name : null,
    options: isFirebaseInitialized() ? firebase.app().options : null,
  };
};
export default {
  isFirebaseInitialized,
  getFirebaseApp,
  getFirebaseStatus,
};
