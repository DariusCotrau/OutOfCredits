import { colors, lightColors, darkColors, SemanticColors, ColorPalette } from './colors';
import { typography, fontFamilies, fontSizes, fontWeights, lineHeights, Typography } from './typography';
import { spacing, semanticSpacing, Spacing as SpacingScale } from './spacing';
import { borderRadius, semanticBorderRadius, BorderRadius } from './borderRadius';
import { shadows, semanticShadows, Shadows } from './shadows';
import { animations, Animations } from './animations';
export type ThemeMode = 'light' | 'dark';
export interface Theme {
  mode: ThemeMode;
  colors: SemanticColors & { palette: ColorPalette };
  typography: Typography;
  fonts: {
    families: typeof fontFamilies;
    sizes: typeof fontSizes;
    weights: typeof fontWeights;
    lineHeights: typeof lineHeights;
  };
  spacing: SpacingScale;
  semanticSpacing: typeof semanticSpacing;
  borderRadius: BorderRadius;
  semanticBorderRadius: typeof semanticBorderRadius;
  shadows: Shadows;
  semanticShadows: typeof semanticShadows;
  animations: Animations;
}
export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    ...lightColors,
    palette: colors,
  },
  typography,
  fonts: {
    families: fontFamilies,
    sizes: fontSizes,
    weights: fontWeights,
    lineHeights,
  },
  spacing,
  semanticSpacing,
  borderRadius,
  semanticBorderRadius,
  shadows,
  semanticShadows,
  animations,
};
export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    ...darkColors,
    palette: colors,
  },
  typography,
  fonts: {
    families: fontFamilies,
    sizes: fontSizes,
    weights: fontWeights,
    lineHeights,
  },
  spacing,
  semanticSpacing,
  borderRadius,
  semanticBorderRadius,
  shadows,
  semanticShadows,
  animations,
};
export const createTheme = (
  mode: ThemeMode,
  overrides?: Partial<Theme>
): Theme => {
  const baseTheme = mode === 'light' ? lightTheme : darkTheme;
  if (!overrides) {
    return baseTheme;
  }
  return {
    ...baseTheme,
    ...overrides,
    colors: {
      ...baseTheme.colors,
      ...overrides.colors,
    },
    typography: {
      ...baseTheme.typography,
      ...overrides.typography,
    },
    spacing: {
      ...baseTheme.spacing,
      ...overrides.spacing,
    },
    borderRadius: {
      ...baseTheme.borderRadius,
      ...overrides.borderRadius,
    },
    shadows: {
      ...baseTheme.shadows,
      ...overrides.shadows,
    },
    animations: {
      ...baseTheme.animations,
      ...overrides.animations,
    },
  };
};
export const getTheme = (mode: ThemeMode): Theme =>
  mode === 'light' ? lightTheme : darkTheme;
