import { Platform, ViewStyle } from 'react-native';
export interface Shadow {
  shadowColor: string;
  shadowOffset: {
    width: number;
    height: number;
  };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}
export interface Shadows {
  none: Shadow;
  xs: Shadow;
  sm: Shadow;
  md: Shadow;
  lg: Shadow;
  xl: Shadow;
  '2xl': Shadow;
  inner: ViewStyle;
}
const shadowColor = '#000000';
export const shadows: Shadows = {
  none: {
    shadowColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  xl: {
    shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  '2xl': {
    shadowColor,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  inner: Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    android: {
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    default: {},
  }) as ViewStyle,
};
export type ShadowValue = keyof Omit<Shadows, 'inner'>;
export const getShadow = (key: ShadowValue): Shadow => shadows[key];
export const createShadow = (options: {
  color?: string;
  offsetX?: number;
  offsetY?: number;
  opacity?: number;
  radius?: number;
  elevation?: number;
}): Shadow => ({
  shadowColor: options.color ?? shadowColor,
  shadowOffset: {
    width: options.offsetX ?? 0,
    height: options.offsetY ?? 2,
  },
  shadowOpacity: options.opacity ?? 0.1,
  shadowRadius: options.radius ?? 4,
  elevation: options.elevation ?? 2,
});
export const createColoredShadow = (
  base: ShadowValue,
  color: string,
  opacityMultiplier = 1
): Shadow => {
  const baseShadow = shadows[base];
  return {
    ...baseShadow,
    shadowColor: color,
    shadowOpacity: baseShadow.shadowOpacity * opacityMultiplier,
  };
};
export const semanticShadows = {
  card: shadows.sm,
  cardElevated: shadows.md,
  button: shadows.sm,
  buttonPressed: shadows.xs,
  fab: shadows.lg,
  header: shadows.sm,
  tabBar: shadows.sm,
  bottomSheet: shadows.xl,
  modal: shadows['2xl'],
  dropdown: shadows.md,
  toast: shadows.md,
  tooltip: shadows.sm,
  inputFocus: shadows.xs,
} as const;
