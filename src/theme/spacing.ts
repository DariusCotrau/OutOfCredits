export const spacing = {
  none: 0,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 8,
  '2.5': 10,
  '3': 12,
  '3.5': 14,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
  '11': 44,
  '12': 48,
  '14': 56,
  '16': 64,
  '20': 80,
  '24': 96,
  '28': 112,
  '32': 128,
  '36': 144,
  '40': 160,
  '48': 192,
  '56': 224,
  '64': 256,
} as const;
export type Spacing = typeof spacing;
export type SpacingValue = keyof typeof spacing;
export const semanticSpacing = {
  buttonPaddingX: spacing['4'],
  buttonPaddingY: spacing['3'],
  buttonPaddingXSmall: spacing['3'],
  buttonPaddingYSmall: spacing['2'],
  buttonPaddingXLarge: spacing['6'],
  buttonPaddingYLarge: spacing['4'],
  inputPaddingX: spacing['4'],
  inputPaddingY: spacing['3'],
  cardPadding: spacing['4'],
  cardPaddingCompact: spacing['3'],
  cardGap: spacing['3'],
  listItemPaddingY: spacing['3'],
  listItemPaddingX: spacing['4'],
  listGap: spacing['2'],
  screenPaddingX: spacing['4'],
  screenPaddingY: spacing['4'],
  sectionGap: spacing['8'],
  contentMaxWidth: 600,
  headerHeight: spacing['14'],
  headerPaddingX: spacing['4'],
  tabBarHeight: spacing['16'],
  tabBarPaddingBottom: spacing['2'],
  modalPadding: spacing['6'],
  modalRadius: spacing['4'],
  iconTextGap: spacing['2'],
  iconButtonPadding: spacing['2'],
  formFieldGap: spacing['4'],
  formSectionGap: spacing['6'],
  labelMarginBottom: spacing['1'],
  helperTextMarginTop: spacing['1'],
  dividerMarginY: spacing['4'],
} as const;
export const getSpacing = (key: SpacingValue): number => spacing[key];
export const createSpacing = (
  ...values: SpacingValue[]
): { top: number; right: number; bottom: number; left: number } => {
  const getValue = (key: SpacingValue) => spacing[key];
  switch (values.length) {
    case 1:
      return {
        top: getValue(values[0]),
        right: getValue(values[0]),
        bottom: getValue(values[0]),
        left: getValue(values[0]),
      };
    case 2:
      return {
        top: getValue(values[0]),
        right: getValue(values[1]),
        bottom: getValue(values[0]),
        left: getValue(values[1]),
      };
    case 3:
      return {
        top: getValue(values[0]),
        right: getValue(values[1]),
        bottom: getValue(values[2]),
        left: getValue(values[1]),
      };
    case 4:
      return {
        top: getValue(values[0]),
        right: getValue(values[1]),
        bottom: getValue(values[2]),
        left: getValue(values[3]),
      };
    default:
      return { top: 0, right: 0, bottom: 0, left: 0 };
  }
};
