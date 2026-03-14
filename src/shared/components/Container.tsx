import React, { memo, ReactNode } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  ScrollView,
  ScrollViewProps,
  KeyboardAvoidingView,
  Platform,
  StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@theme';
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export interface ContainerProps {
  children: ReactNode;
  safe?: boolean;
  safeEdges?: ('top' | 'bottom' | 'left' | 'right')[];
  padding?: ContainerPadding;
  paddingHorizontal?: ContainerPadding;
  paddingVertical?: ContainerPadding;
  scroll?: boolean;
  scrollViewProps?: ScrollViewProps;
  keyboardAvoiding?: boolean;
  keyboardAvoidingBehavior?: 'height' | 'position' | 'padding';
  backgroundColor?: string;
  center?: boolean;
  flex?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
const getPaddingValue = (
  padding: ContainerPadding,
  spacing: Record<string, number>
): number => {
  switch (padding) {
    case 'none':
      return 0;
    case 'sm':
      return spacing['2'];
    case 'md':
      return spacing['4'];
    case 'lg':
      return spacing['6'];
    case 'xl':
      return spacing['8'];
    default:
      return spacing['4'];
  }
};
export const Container = memo<ContainerProps>(function Container({
  children,
  safe = false,
  safeEdges = ['top', 'bottom'],
  padding,
  paddingHorizontal,
  paddingVertical,
  scroll = false,
  scrollViewProps,
  keyboardAvoiding = false,
  keyboardAvoidingBehavior = Platform.OS === 'ios' ? 'padding' : 'height',
  backgroundColor,
  center = false,
  flex = true,
  style,
  testID,
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const resolvedPaddingHorizontal = paddingHorizontal ?? padding ?? 'md';
  const resolvedPaddingVertical = paddingVertical ?? padding ?? 'none';
  const safeAreaStyle: ViewStyle = safe
    ? {
        paddingTop: safeEdges.includes('top') ? insets.top : 0,
        paddingBottom: safeEdges.includes('bottom') ? insets.bottom : 0,
        paddingLeft: safeEdges.includes('left') ? insets.left : 0,
        paddingRight: safeEdges.includes('right') ? insets.right : 0,
      }
    : {};
  const paddingStyle: ViewStyle = {
    paddingHorizontal: getPaddingValue(resolvedPaddingHorizontal, theme.spacing),
    paddingVertical: getPaddingValue(resolvedPaddingVertical, theme.spacing),
  };
  const containerStyle: StyleProp<ViewStyle> = [
    flex && styles.flex,
    { backgroundColor: backgroundColor ?? theme.colors.background },
    safeAreaStyle,
    paddingStyle,
    center && styles.center,
    style,
  ];
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        center && styles.centerContent,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );
  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={containerStyle}
        behavior={keyboardAvoidingBehavior}
        testID={testID}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }
  return (
    <View style={containerStyle} testID={testID}>
      {content}
    </View>
  );
});
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
});
export default Container;
