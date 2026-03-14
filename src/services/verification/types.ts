export type VerificationStatus =
  | 'pending'
  | 'verified'
  | 'skipped'
  | 'failed';
export interface PhotoVerificationResult {
  success: boolean;
  status: VerificationStatus;
  verifiedAt: number | null;
  error?: string;
}
export interface VerificationSettings {
  enabled: boolean;
  required: boolean;
}
export interface SessionVerificationData {
  sessionId: string;
  isPhotoVerified: boolean;
  status: VerificationStatus;
  verifiedAt: number | null;
}
export interface UserVerificationPreferences {
  defaultEnabled: boolean;
  defaultRequired: boolean;
  activityOverrides: Record<string, VerificationSettings>;
}
export interface VerificationServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
