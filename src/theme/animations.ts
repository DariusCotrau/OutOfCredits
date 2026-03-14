import { Easing } from 'react-native-reanimated';
export const durations = {
  instant: 0,
  ultraFast: 50,
  fast: 100,
  normal: 200,
  moderate: 300,
  slow: 400,
  slower: 500,
  verySlow: 700,
  ultraSlow: 1000,
} as const;
export type Duration = keyof typeof durations;
export const easings = {
  linear: Easing.linear,
  ease: Easing.ease,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0.0, 1, 1),
  sharp: Easing.bezier(0.4, 0.0, 0.6, 1),
  bounce: Easing.bounce,
  elastic: Easing.elastic(1),
  back: Easing.back(1.5),
  spring: Easing.bezier(0.175, 0.885, 0.32, 1.275),
} as const;
export type EasingType = keyof typeof easings;
export const springConfigs = {
  gentle: {
    damping: 20,
    mass: 1,
    stiffness: 100,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  default: {
    damping: 15,
    mass: 1,
    stiffness: 150,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  bouncy: {
    damping: 10,
    mass: 1,
    stiffness: 180,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  stiff: {
    damping: 20,
    mass: 1,
    stiffness: 300,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  quick: {
    damping: 20,
    mass: 0.8,
    stiffness: 250,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  slow: {
    damping: 25,
    mass: 1.2,
    stiffness: 80,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
} as const;
export type SpringConfig = keyof typeof springConfigs;
export interface AnimationConfig {
  duration: number;
  easing: (typeof easings)[keyof typeof easings];
}
export const animationPresets = {
  fade: {
    duration: durations.normal,
    easing: easings.easeOut,
  },
  scale: {
    duration: durations.normal,
    easing: easings.spring,
  },
  slideUp: {
    duration: durations.moderate,
    easing: easings.decelerate,
  },
  slideDown: {
    duration: durations.moderate,
    easing: easings.decelerate,
  },
  slideLeft: {
    duration: durations.moderate,
    easing: easings.decelerate,
  },
  slideRight: {
    duration: durations.moderate,
    easing: easings.decelerate,
  },
  buttonPress: {
    duration: durations.fast,
    easing: easings.easeOut,
  },
  modalEnter: {
    duration: durations.moderate,
    easing: easings.decelerate,
  },
  modalExit: {
    duration: durations.normal,
    easing: easings.accelerate,
  },
  tabSwitch: {
    duration: durations.normal,
    easing: easings.standard,
  },
  cardInteraction: {
    duration: durations.fast,
    easing: easings.easeOut,
  },
  progress: {
    duration: durations.slow,
    easing: easings.easeInOut,
  },
  celebration: {
    duration: durations.verySlow,
    easing: easings.bounce,
  },
} as const;
export type AnimationPreset = keyof typeof animationPresets;
export const animations = {
  durations,
  easings,
  springConfigs,
  presets: animationPresets,
} as const;
export type Animations = typeof animations;
export const getAnimationConfig = (preset: AnimationPreset): AnimationConfig =>
  animationPresets[preset];
export const getDuration = (duration: Duration): number => durations[duration];
export const getSpringConfig = (config: SpringConfig) => springConfigs[config];
