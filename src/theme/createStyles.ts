import { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useTheme } from './ThemeContext';
import { Theme } from './theme';
type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};
type StyleFactory<T extends NamedStyles<T>> = (theme: Theme) => T;

export function createStyles<T extends NamedStyles<T>>(
  styleFactory: StyleFactory<T>
): () => StyleSheet.NamedStyles<T> {
  return function useStyles(): StyleSheet.NamedStyles<T> {
    const { theme } = useTheme();
    return useMemo(() => {
      const styles = styleFactory(theme);
      return StyleSheet.create(styles);
    }, [theme]);
  };
}
export function useStyles<T extends NamedStyles<T>>(
  styleFactory: StyleFactory<T>
): StyleSheet.NamedStyles<T> {
  const { theme } = useTheme();
  return useMemo(() => {
    const styles = styleFactory(theme);
    return StyleSheet.create(styles);
  }, [theme, styleFactory]);
}
export function useStyledObject<T extends ViewStyle | TextStyle | ImageStyle>(
  styleFactory: (theme: Theme) => T
): T {
  const { theme } = useTheme();
  return useMemo(() => styleFactory(theme), [theme, styleFactory]);
}
export function conditionalStyles<T extends ViewStyle | TextStyle | ImageStyle>(
  condition: boolean,
  trueStyles: T,
  falseStyles?: T
): T | undefined {
  if (condition) {
    return trueStyles;
  }
  return falseStyles;
}
export function mergeStyles<T extends ViewStyle | TextStyle | ImageStyle>(
  ...styles: (T | undefined | null | false)[]
): T {
  return styles.reduce<T>((merged, style) => {
    if (style) {
      return { ...merged, ...style };
    }
    return merged;
  }, {} as T);
}
export function themedValue<T>(isDark: boolean, darkValue: T, lightValue: T): T {
  return isDark ? darkValue : lightValue;
}
export function useThemedValue<T>(lightValue: T, darkValue: T): T {
  const { isDark } = useTheme();
  return isDark ? darkValue : lightValue;
}
export function elevationStyle(
  theme: Theme,
  level: keyof typeof theme.shadows
): ViewStyle {
  return theme.shadows[level] as ViewStyle;
}
export function spacingStyle(
  theme: Theme,
  property: 'margin' | 'padding',
  value: keyof typeof theme.spacing
): ViewStyle {
  return {
    [property]: theme.spacing[value],
  };
}
export function horizontalSpacingStyle(
  theme: Theme,
  property: 'margin' | 'padding',
  value: keyof typeof theme.spacing
): ViewStyle {
  const spacing = theme.spacing[value];
  return {
    [`${property}Left`]: spacing,
    [`${property}Right`]: spacing,
  } as ViewStyle;
}
export function verticalSpacingStyle(
  theme: Theme,
  property: 'margin' | 'padding',
  value: keyof typeof theme.spacing
): ViewStyle {
  const spacing = theme.spacing[value];
  return {
    [`${property}Top`]: spacing,
    [`${property}Bottom`]: spacing,
  } as ViewStyle;
}
