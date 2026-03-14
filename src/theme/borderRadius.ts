export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;
export type BorderRadius = typeof borderRadius;
export type BorderRadiusValue = keyof typeof borderRadius;
export const semanticBorderRadius = {
  button: borderRadius.md,
  buttonSmall: borderRadius.sm,
  buttonLarge: borderRadius.lg,
  input: borderRadius.md,
  card: borderRadius.lg,
  modal: borderRadius.xl,
  bottomSheet: borderRadius['2xl'],
  avatar: borderRadius.full,
  badge: borderRadius.full,
  chip: borderRadius.full,
  toast: borderRadius.md,
  tooltip: borderRadius.sm,
  progressBar: borderRadius.full,
  tabIndicator: borderRadius.full,
  image: borderRadius.md,
  thumbnail: borderRadius.sm,
} as const;
export const getBorderRadius = (key: BorderRadiusValue): number =>
  borderRadius[key];
export const createBorderRadius = (options: {
  topLeft?: BorderRadiusValue;
  topRight?: BorderRadiusValue;
  bottomLeft?: BorderRadiusValue;
  bottomRight?: BorderRadiusValue;
  top?: BorderRadiusValue;
  bottom?: BorderRadiusValue;
  left?: BorderRadiusValue;
  right?: BorderRadiusValue;
  all?: BorderRadiusValue;
}): {
  borderTopLeftRadius: number;
  borderTopRightRadius: number;
  borderBottomLeftRadius: number;
  borderBottomRightRadius: number;
} => {
  const getValue = (key?: BorderRadiusValue) =>
    key ? borderRadius[key] : borderRadius.none;
  const topValue = options.top ? getValue(options.top) : undefined;
  const bottomValue = options.bottom ? getValue(options.bottom) : undefined;
  const leftValue = options.left ? getValue(options.left) : undefined;
  const rightValue = options.right ? getValue(options.right) : undefined;
  const allValue = options.all ? getValue(options.all) : borderRadius.none;
  return {
    borderTopLeftRadius:
      getValue(options.topLeft) ?? topValue ?? leftValue ?? allValue,
    borderTopRightRadius:
      getValue(options.topRight) ?? topValue ?? rightValue ?? allValue,
    borderBottomLeftRadius:
      getValue(options.bottomLeft) ?? bottomValue ?? leftValue ?? allValue,
    borderBottomRightRadius:
      getValue(options.bottomRight) ?? bottomValue ?? rightValue ?? allValue,
  };
};
