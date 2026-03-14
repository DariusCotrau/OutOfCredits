export const ACTIVITY_CATEGORIES = {
  BREATHING: 'breathing',
  MEDITATION: 'meditation',
  MOVEMENT: 'movement',
  RELAXATION: 'relaxation',
  FOCUS: 'focus',
  GRATITUDE: 'gratitude',
  JOURNALING: 'journaling',
  NATURE: 'nature',
  SOCIAL: 'social',
  CREATIVE: 'creative',
} as const;
export type ActivityCategory =
  (typeof ACTIVITY_CATEGORIES)[keyof typeof ACTIVITY_CATEGORIES];
export const CATEGORY_INFO: Record<
  ActivityCategory,
  {
    label: string;
    description: string;
    icon: string;
    color: string;
  }
> = {
  [ACTIVITY_CATEGORIES.BREATHING]: {
    label: 'Breathing',
    description: 'Breathing exercises and techniques',
    icon: 'wind',
    color: '#4ECDC4',
  },
  [ACTIVITY_CATEGORIES.MEDITATION]: {
    label: 'Meditation',
    description: 'Guided and silent meditation',
    icon: 'lotus',
    color: '#7B68EE',
  },
  [ACTIVITY_CATEGORIES.MOVEMENT]: {
    label: 'Movement',
    description: 'Mindful movement and stretching',
    icon: 'person-walking',
    color: '#FF6B6B',
  },
  [ACTIVITY_CATEGORIES.RELAXATION]: {
    label: 'Relaxation',
    description: 'Relaxation and stress relief',
    icon: 'spa',
    color: '#45B7D1',
  },
  [ACTIVITY_CATEGORIES.FOCUS]: {
    label: 'Focus',
    description: 'Concentration and attention exercises',
    icon: 'target',
    color: '#FFA07A',
  },
  [ACTIVITY_CATEGORIES.GRATITUDE]: {
    label: 'Gratitude',
    description: 'Gratitude practices and reflection',
    icon: 'heart',
    color: '#FF69B4',
  },
  [ACTIVITY_CATEGORIES.JOURNALING]: {
    label: 'Journaling',
    description: 'Writing and self-reflection',
    icon: 'book',
    color: '#DDA0DD',
  },
  [ACTIVITY_CATEGORIES.NATURE]: {
    label: 'Nature',
    description: 'Outdoor and nature activities',
    icon: 'tree',
    color: '#32CD32',
  },
  [ACTIVITY_CATEGORIES.SOCIAL]: {
    label: 'Social',
    description: 'Social connection activities',
    icon: 'users',
    color: '#FFD700',
  },
  [ACTIVITY_CATEGORIES.CREATIVE]: {
    label: 'Creative',
    description: 'Creative and artistic activities',
    icon: 'palette',
    color: '#FF8C00',
  },
};
export const DEFAULT_ACTIVITIES = [
  {
    id: 'breathing-box',
    name: 'Box Breathing',
    category: ACTIVITY_CATEGORIES.BREATHING,
    description: 'Inhale, hold, exhale, hold - each for 4 counts',
    defaultDuration: 5 * 60 * 1000,
    instructions: [
      'Breathe in slowly for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale slowly for 4 counts',
      'Hold empty for 4 counts',
      'Repeat',
    ],
    detectable: true,
    xpReward: 50,
  },
  {
    id: 'breathing-478',
    name: '4-7-8 Breathing',
    category: ACTIVITY_CATEGORIES.BREATHING,
    description: 'Relaxing breath technique for stress relief',
    defaultDuration: 3 * 60 * 1000,
    instructions: [
      'Inhale through nose for 4 counts',
      'Hold breath for 7 counts',
      'Exhale through mouth for 8 counts',
      'Repeat 3-4 times',
    ],
    detectable: true,
    xpReward: 40,
  },
  {
    id: 'meditation-mindfulness',
    name: 'Mindful Meditation',
    category: ACTIVITY_CATEGORIES.MEDITATION,
    description: 'Focus on the present moment',
    defaultDuration: 10 * 60 * 1000,
    instructions: [
      'Find a comfortable position',
      'Close your eyes',
      'Focus on your breath',
      'Notice thoughts without judgment',
      'Return focus to breath',
    ],
    detectable: false,
    xpReward: 100,
  },
  {
    id: 'meditation-body-scan',
    name: 'Body Scan',
    category: ACTIVITY_CATEGORIES.MEDITATION,
    description: 'Progressive relaxation through body awareness',
    defaultDuration: 15 * 60 * 1000,
    instructions: [
      'Lie down comfortably',
      'Start at your toes',
      'Notice sensations in each body part',
      'Move slowly up through your body',
      'Release tension as you go',
    ],
    detectable: false,
    xpReward: 150,
  },
  {
    id: 'movement-walking',
    name: 'Mindful Walking',
    category: ACTIVITY_CATEGORIES.MOVEMENT,
    description: 'Walk slowly with full awareness',
    defaultDuration: 10 * 60 * 1000,
    instructions: [
      'Walk slowly and deliberately',
      'Feel each step',
      'Notice your surroundings',
      'Breathe naturally',
      'Stay present',
    ],
    detectable: true,
    xpReward: 100,
  },
  {
    id: 'movement-stretching',
    name: 'Gentle Stretching',
    category: ACTIVITY_CATEGORIES.MOVEMENT,
    description: 'Simple stretches for relaxation',
    defaultDuration: 5 * 60 * 1000,
    instructions: [
      'Stand or sit comfortably',
      'Stretch neck gently',
      'Roll shoulders',
      'Stretch arms and back',
      'Hold each stretch for 15-30 seconds',
    ],
    detectable: true,
    xpReward: 50,
  },
  {
    id: 'relaxation-pmr',
    name: 'Progressive Muscle Relaxation',
    category: ACTIVITY_CATEGORIES.RELAXATION,
    description: 'Tense and release muscle groups',
    defaultDuration: 10 * 60 * 1000,
    instructions: [
      'Start with your feet',
      'Tense muscles for 5 seconds',
      'Release and relax for 30 seconds',
      'Move to next muscle group',
      'Work through entire body',
    ],
    detectable: false,
    xpReward: 100,
  },
  {
    id: 'focus-pomodoro',
    name: 'Focus Session',
    category: ACTIVITY_CATEGORIES.FOCUS,
    description: 'Focused work without distractions',
    defaultDuration: 25 * 60 * 1000,
    instructions: [
      'Choose a single task',
      'Remove distractions',
      'Work with full focus',
      'Take a short break after',
    ],
    detectable: false,
    xpReward: 200,
  },
  {
    id: 'gratitude-three',
    name: 'Three Good Things',
    category: ACTIVITY_CATEGORIES.GRATITUDE,
    description: 'Reflect on three positive things',
    defaultDuration: 5 * 60 * 1000,
    instructions: [
      'Think of three good things today',
      'Write them down if possible',
      'Reflect on why they happened',
      'Feel gratitude for each',
    ],
    detectable: false,
    xpReward: 50,
  },
  {
    id: 'nature-outdoor',
    name: 'Outdoor Break',
    category: ACTIVITY_CATEGORIES.NATURE,
    description: 'Spend time outside in nature',
    defaultDuration: 15 * 60 * 1000,
    instructions: [
      'Step outside',
      'Find a natural setting',
      'Observe your surroundings',
      'Listen to natural sounds',
      'Breathe fresh air',
    ],
    detectable: false,
    xpReward: 150,
  },
] as const;
export const ACTIVITY_DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;
export type ActivityDifficulty =
  (typeof ACTIVITY_DIFFICULTY)[keyof typeof ACTIVITY_DIFFICULTY];
export const DIFFICULTY_CONFIG: Record<
  ActivityDifficulty,
  {
    label: string;
    xpMultiplier: number;
    color: string;
  }
> = {
  [ACTIVITY_DIFFICULTY.BEGINNER]: {
    label: 'Beginner',
    xpMultiplier: 1.0,
    color: '#4CAF50',
  },
  [ACTIVITY_DIFFICULTY.INTERMEDIATE]: {
    label: 'Intermediate',
    xpMultiplier: 1.5,
    color: '#FF9800',
  },
  [ACTIVITY_DIFFICULTY.ADVANCED]: {
    label: 'Advanced',
    xpMultiplier: 2.0,
    color: '#F44336',
  },
};
export const DETECTION_TYPES = {
  SITTING: 'sitting',
  STANDING: 'standing',
  WALKING: 'walking',
  BREATHING: 'breathing',
  STRETCHING: 'stretching',
  UNKNOWN: 'unknown',
} as const;
export type DetectionType =
  (typeof DETECTION_TYPES)[keyof typeof DETECTION_TYPES];
export const DETECTION_ACTIVITY_MAP: Record<DetectionType, ActivityCategory[]> = {
  [DETECTION_TYPES.SITTING]: [
    ACTIVITY_CATEGORIES.MEDITATION,
    ACTIVITY_CATEGORIES.BREATHING,
    ACTIVITY_CATEGORIES.FOCUS,
    ACTIVITY_CATEGORIES.GRATITUDE,
    ACTIVITY_CATEGORIES.JOURNALING,
  ],
  [DETECTION_TYPES.STANDING]: [
    ACTIVITY_CATEGORIES.BREATHING,
    ACTIVITY_CATEGORIES.MOVEMENT,
  ],
  [DETECTION_TYPES.WALKING]: [
    ACTIVITY_CATEGORIES.MOVEMENT,
    ACTIVITY_CATEGORIES.NATURE,
  ],
  [DETECTION_TYPES.BREATHING]: [
    ACTIVITY_CATEGORIES.BREATHING,
    ACTIVITY_CATEGORIES.RELAXATION,
  ],
  [DETECTION_TYPES.STRETCHING]: [
    ACTIVITY_CATEGORIES.MOVEMENT,
    ACTIVITY_CATEGORIES.RELAXATION,
  ],
  [DETECTION_TYPES.UNKNOWN]: [],
};
export const ACTIVITY_DURATION_PRESETS = [
  { value: 1, label: '1 min' },
  { value: 2, label: '2 min' },
  { value: 3, label: '3 min' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 25, label: '25 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
] as const;
export const MIN_ACTIVITY_DURATION = 30 * 1000;
export const MAX_ACTIVITY_DURATION = 60 * 60 * 1000;
