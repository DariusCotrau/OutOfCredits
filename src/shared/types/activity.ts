import type {
  UserId,
  DocumentId,
  ActivityId,
  Timestamp,
  DateString,
  DurationMinutes,
  DurationMs,
} from './common';
export interface Activity {
  id: ActivityId;
  name: string;
  description: string;
  instructions: string;
  category: ActivityCategory;
  type: ActivityType;
  defaultDuration: DurationMinutes;
  minimumDuration: DurationMinutes;
  maximumDuration: DurationMinutes;
  xpReward: number;
  bonusXpPerMinute: number;
  difficulty: DifficultyLevel;
  icon: string;
  color: string;
  backgroundImage: string | null;
  requiresCamera: boolean;
  hasAudio: boolean;
  audioUrl: string | null;
  isPremium: boolean;
  requiredLevel: number;
  tags: string[];
  recommendedTimes: RecommendedTime[];
  isActive: boolean;
  sortOrder: number;
}
export type ActivityCategory =
  | 'meditation'
  | 'breathing'
  | 'exercise'
  | 'nature'
  | 'creative'
  | 'social'
  | 'mindfulness'
  | 'relaxation';
export const ActivityCategoryInfo: Record<
  ActivityCategory,
  { label: string; icon: string; color: string }
> = {
  meditation: { label: 'Meditation', icon: 'meditation', color: '#9C27B0' },
  breathing: { label: 'Breathing', icon: 'air', color: '#03A9F4' },
  exercise: { label: 'Exercise', icon: 'fitness', color: '#FF5722' },
  nature: { label: 'Nature', icon: 'nature', color: '#4CAF50' },
  creative: { label: 'Creative', icon: 'palette', color: '#E91E63' },
  social: { label: 'Social', icon: 'people', color: '#FF9800' },
  mindfulness: { label: 'Mindfulness', icon: 'psychology', color: '#673AB7' },
  relaxation: { label: 'Relaxation', icon: 'spa', color: '#00BCD4' },
};
export type ActivityType =
  | 'timed'
  | 'guided'
  | 'camera'
  | 'interactive'
  | 'logging';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type RecommendedTime = 'morning' | 'afternoon' | 'evening' | 'anytime';
export interface ActivitySession {
  id: DocumentId;
  userId: UserId;
  activityId: ActivityId;
  activityName: string;
  category: ActivityCategory;
  status: SessionStatus;
  targetDuration: DurationMinutes;
  actualDuration: DurationMs;
  startedAt: Timestamp;
  endedAt: Timestamp | null;
  pauses: SessionPause[];
  totalPausedTime: DurationMs;
  xpEarned: number;
  minimumMet: boolean;
  detectionData: DetectionData | null;
  rating: number | null;
  notes: string | null;
  deviceInfo: DeviceInfo;
  syncedAt: Timestamp | null;
}
export type SessionStatus =
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'expired';
export interface SessionPause {
  pausedAt: Timestamp;
  resumedAt: Timestamp | null;
  reason: PauseReason | null;
}
export type PauseReason =
  | 'user_requested'
  | 'phone_call'
  | 'notification'
  | 'app_background'
  | 'other';
export interface DetectionData {
  detectedActivity: string;
  confidence: number;
  detectionPoints: DetectionPoint[];
  averageConfidence: number;
  detectionCoverage: number;
}
export interface DetectionPoint {
  timestamp: Timestamp;
  confidence: number;
  detection: string;
}
export interface DeviceInfo {
  model: string;
  osVersion: string;
  appVersion: string;
  focusModeActive: boolean;
}
export interface CompletedActivity {
  id: DocumentId;
  userId: UserId;
  activityId: ActivityId;
  activityName: string;
  category: ActivityCategory;
  date: DateString;
  duration: DurationMinutes;
  xpEarned: number;
  rating: number | null;
  completedAt: Timestamp;
  mlVerified: boolean;
  confidence: number | null;
}
export interface ActivitySuggestion {
  activityId: ActivityId;
  activity: Activity;
  reason: SuggestionReason;
  relevanceScore: number;
  timePriority: number;
  isPersonalized: boolean;
}
export type SuggestionReason =
  | 'time_of_day'
  | 'streak_risk'
  | 'category_balance'
  | 'level_appropriate'
  | 'trending'
  | 'new_unlock'
  | 'favorite'
  | 'goal_progress'
  | 'weather_appropriate';
export interface ActivityStats {
  userId: UserId;
  totalCompleted: number;
  totalMinutes: DurationMinutes;
  averageDuration: DurationMinutes;
  favoriteCategory: ActivityCategory | null;
  categoryBreakdown: ActivityCategoryStats[];
  weeklyTrend: WeeklyActivityTrend[];
  longestSession: DurationMinutes;
  mostCompletedActivity: string | null;
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: DateString | null;
}
export interface ActivityCategoryStats {
  category: ActivityCategory;
  completions: number;
  minutes: DurationMinutes;
  percentage: number;
  averageRating: number | null;
}
export interface WeeklyActivityTrend {
  weekStart: DateString;
  completions: number;
  minutes: DurationMinutes;
  activeDays: number;
}
export interface ActivityPreset {
  id: DocumentId;
  userId: UserId;
  name: string;
  activityId: ActivityId;
  duration: DurationMinutes;
  settings: PresetSettings;
  isFavorite: boolean;
  usageCount: number;
  createdAt: Timestamp;
}
export interface PresetSettings {
  backgroundSound: string | null;
  volume: number;
  intervalBell: boolean;
  intervalBellFrequency: DurationMinutes | null;
  endBell: boolean;
  showTimer: boolean;
  autoStartNext: boolean;
}
export interface ScheduledActivity {
  id: DocumentId;
  userId: UserId;
  activityId: ActivityId;
  name: string;
  time: string;
  days: number[];
  duration: DurationMinutes;
  isActive: boolean;
  reminderMinutes: number;
  createdAt: Timestamp;
  lastTriggered: Timestamp | null;
}
