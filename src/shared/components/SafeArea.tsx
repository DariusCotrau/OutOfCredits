import React, { memo, ReactNode } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  StatusBar,
  Platform,
  StyleProp,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
  Edge,
} from 'react-native-safe-area-context';
import { useTheme } from '@theme';
export type SafeAreaMode = 'padding' | 'margin';
export interface SafeAreaProps {
  children: ReactNode;
  edges?: Edge[];
  mode?: SafeAreaMode;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
  hideStatusBar?: boolean;
  flex?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
export const SafeArea = memo<SafeAreaProps>(function SafeArea({
  children,
  edges = ['top', 'bottom', 'left', 'right'],
  mode = 'padding',
  backgroundColor,
  statusBarStyle,
  hideStatusBar = false,
  flex = true,
  style,
  testID,
}) {
  const { theme, isDark } = useTheme();
  const computedStatusBarStyle =
    statusBarStyle ?? (isDark ? 'light-content' : 'dark-content');
  const containerStyle: StyleProp<ViewStyle> = [
    flex && styles.flex,
    { backgroundColor: backgroundColor ?? theme.colors.background },
    style,
  ];
  return (
    <>
      <StatusBar
        barStyle={computedStatusBarStyle}
        backgroundColor={backgroundColor ?? theme.colors.background}
        hidden={hideStatusBar}
        translucent={Platform.OS === 'android'}
      />
      <SafeAreaView
        edges={edges}
        mode={mode}
        style={containerStyle}
        testID={testID}
      >
        {children}
      </SafeAreaView>
    </>
  );
});
export interface SafeAreaTopProps {
  backgroundColor?: string;
  showStatusBar?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
}
export const SafeAreaTop = memo<SafeAreaTopProps>(function SafeAreaTop({
  backgroundColor,
  showStatusBar = true,
  statusBarStyle,
}) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const computedStatusBarStyle =
    statusBarStyle ?? (isDark ? 'light-content' : 'dark-content');
  return (
    <>
      {showStatusBar && (
        <StatusBar
          barStyle={computedStatusBarStyle}
          backgroundColor={backgroundColor ?? theme.colors.background}
        />
      )}
      <View
        style={{
          height: insets.top,
          backgroundColor: backgroundColor ?? theme.colors.background,
        }}
      />
    </>
  );
});
export interface SafeAreaBottomProps {
  backgroundColor?: string;
  minHeight?: number;
}
export const SafeAreaBottom = memo<SafeAreaBottomProps>(function SafeAreaBottom({
  backgroundColor,
  minHeight = 0,
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        height: Math.max(insets.bottom, minHeight),
        backgroundColor: backgroundColor ?? theme.colors.background,
      }}
    />
  );
});
export interface SafeAreaSpacerProps {
  edge: 'top' | 'bottom' | 'left' | 'right';
  additionalSpace?: number;
  backgroundColor?: string;
}
export const SafeAreaSpacer = memo<SafeAreaSpacerProps>(function SafeAreaSpacer({
  edge,
  additionalSpace = 0,
  backgroundColor,
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const isHorizontal = edge === 'left' || edge === 'right';
  const size = insets[edge] + additionalSpace;
  return (
    <View
      style={{
        width: isHorizontal ? size : undefined,
        height: isHorizontal ? undefined : size,
        backgroundColor: backgroundColor ?? theme.colors.background,
      }}
    />
  );
});
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
export default SafeArea;
