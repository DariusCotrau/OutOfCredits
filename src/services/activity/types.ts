export type ActivityCategory =
  | 'meditation'
  | 'breathing'
  | 'focus'
  | 'relaxation'
  | 'sleep'
  | 'movement'
  | 'gratitude'
  | 'journaling';
export type ActivityDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type SessionStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export interface Activity {
  id: string;
  name: string;
  description: string;
  instructions: string;
  category: ActivityCategory;
  difficulty: ActivityDifficulty;
  defaultDurationMinutes: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  icon: string;
  color: string;
  hasAudio: boolean;
  audioUrl?: string;
  hasBackgroundMusic: boolean;
  tags: string[];
  xpReward: number;
  isPremium: boolean;
  isFeatured: boolean;
  sortOrder: number;
  photoVerificationEnabled?: boolean;
  photoVerificationRequired?: boolean;
  createdAt: number;
  updatedAt: number;
}
export interface ActivityPreset {
  id: string;
  activityId: string;
  userId: string;
  name: string;
  durationMinutes: number;
  playAudio: boolean;
  playBackgroundMusic: boolean;
  backgroundMusicId?: string;
  showTimer: boolean;
  intervalBells?: number[];
  createdAt: number;
}
export interface ActivitySession {
  id: string;
  userId: string;
  activityId: string;
  activityName: string;
  category: ActivityCategory;
  presetId?: string;
  plannedDurationMs: number;
  actualDurationMs: number;
  status: SessionStatus;
  startedAt: number;
  endedAt?: number;
  pausedIntervals: PausedInterval[];
  totalPausedMs: number;
  xpEarned: number;
  moodBefore?: number;
  moodAfter?: number;
  notes?: string;
  isSynced: boolean;
  isPhotoVerified?: boolean;
  photoVerifiedAt?: number;
}
export interface PausedInterval {
  startedAt: number;
  endedAt: number;
}
export interface ActiveSessionState {
  session: ActivitySession;
  activity: Activity;
  elapsedMs: number;
  isPaused: boolean;
  pauseStartedAt?: number;
  progressPercent: number;
  remainingMs: number;
}
export interface DailyActivitySummary {
  date: string;
  totalSessions: number;
  completedSessions: number;
  totalTimeMs: number;
  sessionsByCategory: Record<ActivityCategory, number>;
  timeByCategory: Record<ActivityCategory, number>;
  xpEarned: number;
  streakDay: number;
}
export interface WeeklyActivitySummary {
  weekStart: string;
  weekEnd: string;
  dailySummaries: DailyActivitySummary[];
  totalSessions: number;
  totalTimeMs: number;
  avgSessionDurationMs: number;
  topCategory: ActivityCategory | null;
  activeDays: number;
  xpEarned: number;
}
export interface ActivityStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakStartDate: string | null;
  isActiveToday: boolean;
}
export interface ActivityGoal {
  id: string;
  userId: string;
  type: 'daily_sessions' | 'daily_minutes' | 'weekly_sessions' | 'weekly_minutes' | 'streak';
  targetValue: number;
  currentValue: number;
  isActive: boolean;
  category?: ActivityCategory;
  createdAt: number;
  lastResetAt: number;
}
export interface ActivityReminder {
  id: string;
  userId: string;
  time: string;
  activeDays: number[];
  suggestedActivityId?: string;
  message: string;
  isEnabled: boolean;
  createdAt: number;
}
export interface ActivityServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface BackgroundMusic {
  id: string;
  name: string;
  category: 'nature' | 'ambient' | 'instrumental' | 'binaural';
  durationSeconds: number;
  audioUrl: string;
  isPremium: boolean;
}
