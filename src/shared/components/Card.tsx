import React, { memo, useCallback } from 'react';
import {
  Pressable,
  PressableProps,
  View,
  ViewProps,
  ViewStyle,
  StyleSheet,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
export type CardVariant = 'elevated' | 'outlined' | 'filled';
export interface CardProps extends Omit<ViewProps, 'style'> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg' | number;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  testID?: string;
}
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export const Card = memo<CardProps>(function Card({
  variant = 'elevated',
  padding = 'md',
  onPress,
  disabled = false,
  style,
  children,
  testID,
  ...props
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const handlePressIn = useCallback(() => {
    if (onPress && !disabled) {
      scale.value = withTiming(0.98, { duration: 100 });
    }
  }, [onPress, disabled, scale]);
  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 150 });
  }, [scale]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.colors.card,
          ...theme.shadows.sm,
        };
      case 'outlined':
        return {
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'filled':
        return {
          backgroundColor: theme.colors.surfaceVariant,
        };
      default:
        return {};
    }
  };
  const getPaddingValue = (): number => {
    if (typeof padding === 'number') {
      return padding;
    }
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return theme.spacing['3'];
      case 'lg':
        return theme.spacing['6'];
      case 'md':
      default:
        return theme.spacing['4'];
    }
  };
  const variantStyles = getVariantStyles();
  const paddingValue = getPaddingValue();
  const cardStyle: ViewStyle = {
    borderRadius: theme.borderRadius.lg,
    padding: paddingValue,
    ...variantStyles,
  };
  if (onPress) {
    return (
      <AnimatedPressable
        style={[cardStyle, animatedStyle, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        testID={testID}
        accessibilityRole="button"
        {...props}
      >
        {children}
      </AnimatedPressable>
    );
  }
  return (
    <View style={[cardStyle, style]} testID={testID} {...props}>
      {children}
    </View>
  );
});
export interface CardSectionProps extends ViewProps {
  withBorder?: boolean;
  padding?: 'none' | 'sm' | 'md' | number;
  children?: React.ReactNode;
}
export const CardSection = memo<CardSectionProps>(function CardSection({
  withBorder = false,
  padding = 'md',
  style,
  children,
  ...props
}) {
  const { theme } = useTheme();
  const getPaddingValue = (): number => {
    if (typeof padding === 'number') {
      return padding;
    }
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return theme.spacing['2'];
      case 'md':
      default:
        return theme.spacing['4'];
    }
  };
  const sectionStyle: ViewStyle = {
    paddingVertical: getPaddingValue(),
    ...(withBorder && {
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    }),
  };
  return (
    <View style={[sectionStyle, style]} {...props}>
      {children}
    </View>
  );
});
export interface CardHeaderProps extends ViewProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}
export const CardHeader = memo<CardHeaderProps>(function CardHeader({
  title,
  subtitle,
  action,
  style,
  children,
  ...props
}) {
  const { theme } = useTheme();
  if (children) {
    return (
      <View style={[styles.header, style]} {...props}>
        {children}
      </View>
    );
  }
  return (
    <View style={[styles.header, style]} {...props}>
      <View style={styles.headerContent}>
        {title && (
          <Animated.Text
            style={[theme.typography.h4, { color: theme.colors.text }]}
          >
            {title}
          </Animated.Text>
        )}
        {subtitle && (
          <Animated.Text
            style={[
              theme.typography.bodySmall,
              { color: theme.colors.textSecondary, marginTop: 2 },
            ]}
          >
            {subtitle}
          </Animated.Text>
        )}
      </View>
      {action && <View style={styles.headerAction}>{action}</View>}
    </View>
  );
});
export interface CardFooterProps extends ViewProps {
  children?: React.ReactNode;
}
export const CardFooter = memo<CardFooterProps>(function CardFooter({
  style,
  children,
  ...props
}) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.footer,
        { borderTopColor: theme.colors.divider },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
});
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerAction: {
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
export default Card;
