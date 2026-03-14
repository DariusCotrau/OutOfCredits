import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Activity,
  ActivityCategory,
  ActivitySession,
  ActivityPreset,
  DailyActivitySummary,
  WeeklyActivitySummary,
  ActivityStreak,
  ActivityServiceResult,
  BackgroundMusic,
} from './types';
const SESSIONS_STORAGE_KEY = '@mindfultime/activity_sessions';
const PRESETS_STORAGE_KEY = '@mindfultime/activity_presets';
const STREAK_STORAGE_KEY = '@mindfultime/activity_streak';
const DEFAULT_ACTIVITIES: Activity[] = [
  {
    id: 'meditation-basic',
    name: 'Basic Meditation',
    description: 'A simple guided meditation for beginners',
    instructions: 'Find a comfortable position, close your eyes, and focus on your breath. When your mind wanders, gently bring your attention back to your breathing.',
    category: 'meditation',
    difficulty: 'beginner',
    defaultDurationMinutes: 10,
    minDurationMinutes: 5,
    maxDurationMinutes: 60,
    icon: 'meditation',
    color: '#6B4EE6',
    hasAudio: true,
    hasBackgroundMusic: true,
    tags: ['calm', 'focus', 'beginner', 'guided'],
    xpReward: 50,
    isPremium: false,
    isFeatured: true,
    sortOrder: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'meditation-body-scan',
    name: 'Body Scan',
    description: 'A relaxing full-body awareness meditation',
    instructions: 'Lie down comfortably. Starting from your toes, slowly bring awareness to each part of your body, noticing any sensations without judgment.',
    category: 'meditation',
    difficulty: 'beginner',
    defaultDurationMinutes: 15,
    minDurationMinutes: 10,
    maxDurationMinutes: 45,
    icon: 'body',
    color: '#4ECDC4',
    hasAudio: true,
    hasBackgroundMusic: true,
    tags: ['relaxation', 'body', 'awareness', 'sleep'],
    xpReward: 60,
    isPremium: false,
    isFeatured: false,
    sortOrder: 2,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'meditation-loving-kindness',
    name: 'Loving Kindness',
    description: 'Cultivate compassion for yourself and others',
    instructions: 'Focus on generating feelings of love and kindness, first towards yourself, then expanding to loved ones, neutral people, and all beings.',
    category: 'meditation',
    difficulty: 'intermediate',
    defaultDurationMinutes: 15,
    minDurationMinutes: 10,
    maxDurationMinutes: 30,
    icon: 'heart',
    color: '#FF6B6B',
    hasAudio: true,
    hasBackgroundMusic: true,
    tags: ['compassion', 'love', 'emotional', 'healing'],
    xpReward: 70,
    isPremium: false,
    isFeatured: true,
    sortOrder: 3,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'breathing-box',
    name: 'Box Breathing',
    description: '4-4-4-4 breathing technique for calm and focus',
    instructions: 'Breathe in for 4 seconds, hold for 4 seconds, breathe out for 4 seconds, hold for 4 seconds. Repeat.',
    category: 'breathing',
    difficulty: 'beginner',
    defaultDurationMinutes: 5,
    minDurationMinutes: 2,
    maxDurationMinutes: 20,
    icon: 'breathing',
    color: '#45B7D1',
    hasAudio: true,
    hasBackgroundMusic: false,
    tags: ['calm', 'focus', 'stress', 'quick'],
    xpReward: 30,
    isPremium: false,
    isFeatured: true,
    sortOrder: 4,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'breathing-478',
    name: '4-7-8 Breathing',
    description: 'Relaxing breath pattern for sleep and anxiety',
    instructions: 'Breathe in through your nose for 4 seconds, hold for 7 seconds, exhale through your mouth for 8 seconds.',
    category: 'breathing',
    difficulty: 'beginner',
    defaultDurationMinutes: 5,
    minDurationMinutes: 3,
    maxDurationMinutes: 15,
    icon: 'breathing',
    color: '#96CEB4',
    hasAudio: true,
    hasBackgroundMusic: false,
    tags: ['sleep', 'anxiety', 'relaxation', 'evening'],
    xpReward: 30,
    isPremium: false,
    isFeatured: false,
    sortOrder: 5,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'focus-pomodoro',
    name: 'Focus Session',
    description: 'Deep work session with mindful breaks',
    instructions: 'Set your intention for the session. Focus deeply on your task. Take mindful breaks to reset.',
    category: 'focus',
    difficulty: 'beginner',
    defaultDurationMinutes: 25,
    minDurationMinutes: 15,
    maxDurationMinutes: 90,
    icon: 'focus',
    color: '#F7DC6F',
    hasAudio: false,
    hasBackgroundMusic: true,
    tags: ['work', 'productivity', 'concentration', 'deep work'],
    xpReward: 80,
    isPremium: false,
    isFeatured: true,
    sortOrder: 6,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'relaxation-progressive',
    name: 'Progressive Relaxation',
    description: 'Tension release through muscle relaxation',
    instructions: 'Systematically tense and release each muscle group, starting from your feet and moving up to your head.',
    category: 'relaxation',
    difficulty: 'beginner',
    defaultDurationMinutes: 15,
    minDurationMinutes: 10,
    maxDurationMinutes: 30,
    icon: 'relax',
    color: '#BB8FCE',
    hasAudio: true,
    hasBackgroundMusic: true,
    tags: ['stress', 'tension', 'body', 'evening'],
    xpReward: 50,
    isPremium: false,
    isFeatured: false,
    sortOrder: 7,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sleep-wind-down',
    name: 'Sleep Wind Down',
    description: 'Gentle transition to restful sleep',
    instructions: 'Follow the guided relaxation to calm your mind and body, preparing for deep, restorative sleep.',
    category: 'sleep',
    difficulty: 'beginner',
    defaultDurationMinutes: 20,
    minDurationMinutes: 10,
    maxDurationMinutes: 45,
    icon: 'moon',
    color: '#5D6D7E',
    hasAudio: true,
    hasBackgroundMusic: true,
    tags: ['sleep', 'evening', 'relaxation', 'insomnia'],
    xpReward: 60,
    isPremium: false,
    isFeatured: true,
    sortOrder: 8,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'movement-mindful-walking',
    name: 'Mindful Walking',
    description: 'Walking meditation for body awareness',
    instructions: 'Walk slowly and deliberately, paying attention to each step, the sensations in your feet, and your surroundings.',
    category: 'movement',
    difficulty: 'beginner',
    defaultDurationMinutes: 10,
    minDurationMinutes: 5,
    maxDurationMinutes: 30,
    icon: 'walk',
    color: '#58D68D',
    hasAudio: true,
    hasBackgroundMusic: false,
    tags: ['walking', 'outdoors', 'movement', 'awareness'],
    xpReward: 40,
    isPremium: false,
    isFeatured: false,
    sortOrder: 9,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'gratitude-reflection',
    name: 'Gratitude Reflection',
    description: 'Cultivate appreciation for life\'s blessings',
    instructions: 'Reflect on three things you are grateful for today. Feel the appreciation deeply in your heart.',
    category: 'gratitude',
    difficulty: 'beginner',
    defaultDurationMinutes: 5,
    minDurationMinutes: 3,
    maxDurationMinutes: 15,
    icon: 'heart',
    color: '#F5B041',
    hasAudio: false,
    hasBackgroundMusic: true,
    tags: ['gratitude', 'positivity', 'reflection', 'morning'],
    xpReward: 25,
    isPremium: false,
    isFeatured: false,
    sortOrder: 10,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'journaling-reflection',
    name: 'Mindful Journaling',
    description: 'Express your thoughts and feelings',
    instructions: 'Write freely about your thoughts, feelings, and experiences. Don\'t judge, just express.',
    category: 'journaling',
    difficulty: 'beginner',
    defaultDurationMinutes: 10,
    minDurationMinutes: 5,
    maxDurationMinutes: 30,
    icon: 'journal',
    color: '#85929E',
    hasAudio: false,
    hasBackgroundMusic: true,
    tags: ['writing', 'reflection', 'emotional', 'processing'],
    xpReward: 35,
    isPremium: false,
    isFeatured: false,
    sortOrder: 11,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];
const DEFAULT_BACKGROUND_MUSIC: BackgroundMusic[] = [
  {
    id: 'nature-rain',
    name: 'Gentle Rain',
    category: 'nature',
    durationSeconds: 3600,
    audioUrl: '',
    isPremium: false,
  },
  {
    id: 'nature-forest',
    name: 'Forest Ambience',
    category: 'nature',
    durationSeconds: 3600,
    audioUrl: '',
    isPremium: false,
  },
  {
    id: 'nature-ocean',
    name: 'Ocean Waves',
    category: 'nature',
    durationSeconds: 3600,
    audioUrl: '',
    isPremium: false,
  },
  {
    id: 'ambient-space',
    name: 'Space Ambient',
    category: 'ambient',
    durationSeconds: 3600,
    audioUrl: '',
    isPremium: false,
  },
  {
    id: 'instrumental-piano',
    name: 'Soft Piano',
    category: 'instrumental',
    durationSeconds: 3600,
    audioUrl: '',
    isPremium: true,
  },
];
class ActivityService {
  private activities: Activity[] = DEFAULT_ACTIVITIES;
  private backgroundMusic: BackgroundMusic[] = DEFAULT_BACKGROUND_MUSIC;
  async getAllActivities(): Promise<ActivityServiceResult<Activity[]>> {
    return { success: true, data: this.activities };
  }
  async getActivitiesByCategory(
    category: ActivityCategory
  ): Promise<ActivityServiceResult<Activity[]>> {
    const filtered = this.activities.filter((a) => a.category === category);
    return { success: true, data: filtered };
  }
  async getFeaturedActivities(): Promise<ActivityServiceResult<Activity[]>> {
    const featured = this.activities.filter((a) => a.isFeatured);
    return { success: true, data: featured };
  }
  async getActivityById(id: string): Promise<ActivityServiceResult<Activity>> {
    const activity = this.activities.find((a) => a.id === id);
    if (!activity) {
      return { success: false, error: 'Activity not found' };
    }
    return { success: true, data: activity };
  }
  async searchActivities(query: string): Promise<ActivityServiceResult<Activity[]>> {
    const lowerQuery = query.toLowerCase();
    const results = this.activities.filter(
      (a) =>
        a.name.toLowerCase().includes(lowerQuery) ||
        a.description.toLowerCase().includes(lowerQuery) ||
        a.tags.some((t) => t.toLowerCase().includes(lowerQuery))
    );
    return { success: true, data: results };
  }
  async createSession(
    userId: string,
    activityId: string,
    durationMs: number,
    presetId?: string
  ): Promise<ActivityServiceResult<ActivitySession>> {
    try {
      const activityResult = await this.getActivityById(activityId);
      if (!activityResult.success || !activityResult.data) {
        return { success: false, error: 'Activity not found' };
      }
      const activity = activityResult.data;
      const session: ActivitySession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        activityId,
        activityName: activity.name,
        category: activity.category,
        presetId,
        plannedDurationMs: durationMs,
        actualDurationMs: 0,
        status: 'active',
        startedAt: Date.now(),
        pausedIntervals: [],
        totalPausedMs: 0,
        xpEarned: 0,
        isSynced: false,
      };
      const sessions = await this.loadSessions();
      sessions.push(session);
      await this.saveSessions(sessions);
      return { success: true, data: session };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create session',
      };
    }
  }
  async updateSession(
    sessionId: string,
    updates: Partial<ActivitySession>
  ): Promise<ActivityServiceResult<ActivitySession>> {
    try {
      const sessions = await this.loadSessions();
      const index = sessions.findIndex((s) => s.id === sessionId);
      if (index === -1) {
        return { success: false, error: 'Session not found' };
      }
      sessions[index] = { ...sessions[index], ...updates };
      await this.saveSessions(sessions);
      return { success: true, data: sessions[index] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update session',
      };
    }
  }
  async completeSession(
    sessionId: string,
    moodAfter?: number,
    notes?: string
  ): Promise<ActivityServiceResult<ActivitySession>> {
    try {
      const sessions = await this.loadSessions();
      const index = sessions.findIndex((s) => s.id === sessionId);
      if (index === -1) {
        return { success: false, error: 'Session not found' };
      }
      const session = sessions[index];
      const endedAt = Date.now();
      const actualDurationMs = endedAt - session.startedAt - session.totalPausedMs;
      const activityResult = await this.getActivityById(session.activityId);
      const baseXP = activityResult.data?.xpReward ?? 50;
      const completionRatio = Math.min(1, actualDurationMs / session.plannedDurationMs);
      const xpEarned = Math.round(baseXP * completionRatio);
      sessions[index] = {
        ...session,
        status: 'completed',
        endedAt,
        actualDurationMs,
        xpEarned,
        moodAfter,
        notes,
      };
      await this.saveSessions(sessions);
      await this.updateStreak();
      return { success: true, data: sessions[index] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete session',
      };
    }
  }
  async cancelSession(sessionId: string): Promise<ActivityServiceResult<void>> {
    try {
      const sessions = await this.loadSessions();
      const index = sessions.findIndex((s) => s.id === sessionId);
      if (index === -1) {
        return { success: false, error: 'Session not found' };
      }
      sessions[index] = {
        ...sessions[index],
        status: 'cancelled',
        endedAt: Date.now(),
      };
      await this.saveSessions(sessions);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel session',
      };
    }
  }
  async getSessionHistory(
    userId: string,
    limit?: number
  ): Promise<ActivityServiceResult<ActivitySession[]>> {
    try {
      const sessions = await this.loadSessions();
      const userSessions = sessions
        .filter((s) => s.userId === userId && s.status === 'completed')
        .sort((a, b) => b.startedAt - a.startedAt);
      const result = limit ? userSessions.slice(0, limit) : userSessions;
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get session history',
      };
    }
  }
  async getDailySummary(
    userId: string,
    date?: Date
  ): Promise<ActivityServiceResult<DailyActivitySummary>> {
    try {
      const targetDate = date ?? new Date();
      const dateStr = targetDate.toISOString().split('T')[0];
      const sessions = await this.loadSessions();
      const daySessions = sessions.filter((s) => {
        if (s.userId !== userId || s.status !== 'completed') return false;
        const sessionDate = new Date(s.startedAt).toISOString().split('T')[0];
        return sessionDate === dateStr;
      });
      const sessionsByCategory: Record<ActivityCategory, number> = {
        meditation: 0,
        breathing: 0,
        focus: 0,
        relaxation: 0,
        sleep: 0,
        movement: 0,
        gratitude: 0,
        journaling: 0,
      };
      const timeByCategory: Record<ActivityCategory, number> = {
        meditation: 0,
        breathing: 0,
        focus: 0,
        relaxation: 0,
        sleep: 0,
        movement: 0,
        gratitude: 0,
        journaling: 0,
      };
      let totalTimeMs = 0;
      let xpEarned = 0;
      daySessions.forEach((s) => {
        sessionsByCategory[s.category]++;
        timeByCategory[s.category] += s.actualDurationMs;
        totalTimeMs += s.actualDurationMs;
        xpEarned += s.xpEarned;
      });
      const streak = await this.getStreak(userId);
      const summary: DailyActivitySummary = {
        date: dateStr,
        totalSessions: daySessions.length,
        completedSessions: daySessions.length,
        totalTimeMs,
        sessionsByCategory,
        timeByCategory,
        xpEarned,
        streakDay: streak.data?.currentStreak ?? 0,
      };
      return { success: true, data: summary };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get daily summary',
      };
    }
  }
  async getWeeklySummary(
    userId: string,
    weekStart?: Date
  ): Promise<ActivityServiceResult<WeeklyActivitySummary>> {
    try {
      const start = weekStart ?? this.getStartOfWeek(new Date());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const dailySummaries: DailyActivitySummary[] = [];
      let totalSessions = 0;
      let totalTimeMs = 0;
      let xpEarned = 0;
      let activeDays = 0;
      const categoryCount: Record<ActivityCategory, number> = {
        meditation: 0,
        breathing: 0,
        focus: 0,
        relaxation: 0,
        sleep: 0,
        movement: 0,
        gratitude: 0,
        journaling: 0,
      };
      for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(day.getDate() + i);
        const summaryResult = await this.getDailySummary(userId, day);
        if (summaryResult.success && summaryResult.data) {
          dailySummaries.push(summaryResult.data);
          totalSessions += summaryResult.data.totalSessions;
          totalTimeMs += summaryResult.data.totalTimeMs;
          xpEarned += summaryResult.data.xpEarned;
          if (summaryResult.data.totalSessions > 0) activeDays++;
          Object.entries(summaryResult.data.sessionsByCategory).forEach(
            ([cat, count]) => {
              categoryCount[cat as ActivityCategory] += count;
            }
          );
        }
      }
      let topCategory: ActivityCategory | null = null;
      let maxCount = 0;
      Object.entries(categoryCount).forEach(([cat, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topCategory = cat as ActivityCategory;
        }
      });
      const summary: WeeklyActivitySummary = {
        weekStart: start.toISOString().split('T')[0],
        weekEnd: end.toISOString().split('T')[0],
        dailySummaries,
        totalSessions,
        totalTimeMs,
        avgSessionDurationMs: totalSessions > 0 ? totalTimeMs / totalSessions : 0,
        topCategory,
        activeDays,
        xpEarned,
      };
      return { success: true, data: summary };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get weekly summary',
      };
    }
  }
  async getStreak(userId: string): Promise<ActivityServiceResult<ActivityStreak>> {
    try {
      void userId;
      const stored = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
      if (stored) {
        return { success: true, data: JSON.parse(stored) };
      }
      const defaultStreak: ActivityStreak = {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakStartDate: null,
        isActiveToday: false,
      };
      return { success: true, data: defaultStreak };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get streak',
      };
    }
  }
  private async updateStreak(): Promise<void> {
    try {
      const streakResult = await this.getStreak('');
      const streak = streakResult.data ?? {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakStartDate: null,
        isActiveToday: false,
      };
      const today = new Date().toISOString().split('T')[0];
      if (streak.lastActivityDate === today) {
        streak.isActiveToday = true;
        return;
      }
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (streak.lastActivityDate === yesterdayStr) {
        streak.currentStreak++;
      } else {
        streak.currentStreak = 1;
        streak.streakStartDate = today;
      }
      streak.lastActivityDate = today;
      streak.isActiveToday = true;
      streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
      await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));
    } catch (error) {
      console.error('Failed to update streak:', error);
    }
  }
  async getBackgroundMusic(): Promise<ActivityServiceResult<BackgroundMusic[]>> {
    return { success: true, data: this.backgroundMusic };
  }
  async getUserPresets(userId: string): Promise<ActivityServiceResult<ActivityPreset[]>> {
    try {
      const stored = await AsyncStorage.getItem(PRESETS_STORAGE_KEY);
      const presets: ActivityPreset[] = stored ? JSON.parse(stored) : [];
      const userPresets = presets.filter((p) => p.userId === userId);
      return { success: true, data: userPresets };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get presets',
      };
    }
  }
  async createPreset(
    preset: Omit<ActivityPreset, 'id' | 'createdAt'>
  ): Promise<ActivityServiceResult<ActivityPreset>> {
    try {
      const stored = await AsyncStorage.getItem(PRESETS_STORAGE_KEY);
      const presets: ActivityPreset[] = stored ? JSON.parse(stored) : [];
      const newPreset: ActivityPreset = {
        ...preset,
        id: `preset_${Date.now()}`,
        createdAt: Date.now(),
      };
      presets.push(newPreset);
      await AsyncStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
      return { success: true, data: newPreset };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create preset',
      };
    }
  }
  async deletePreset(presetId: string): Promise<ActivityServiceResult<void>> {
    try {
      const stored = await AsyncStorage.getItem(PRESETS_STORAGE_KEY);
      const presets: ActivityPreset[] = stored ? JSON.parse(stored) : [];
      const filtered = presets.filter((p) => p.id !== presetId);
      await AsyncStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete preset',
      };
    }
  }
  private async loadSessions(): Promise<ActivitySession[]> {
    const stored = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  private async saveSessions(sessions: ActivitySession[]): Promise<void> {
    await AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  }
  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
export const activityService = new ActivityService();
export default activityService;
