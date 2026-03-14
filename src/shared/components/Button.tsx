import React, { memo, useCallback } from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
import { Text } from './Text';
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export interface ButtonProps extends Omit<PressableProps, 'style'> {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export const Button = memo<ButtonProps>(function Button({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  onPressIn,
  onPressOut,
  testID,
  ...props
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const handlePressIn = useCallback(
    (event: any) => {
      scale.value = withTiming(0.97, { duration: 100 });
      opacity.value = withTiming(0.9, { duration: 100 });
      onPressIn?.(event);
    },
    [onPressIn, scale, opacity]
  );
  const handlePressOut = useCallback(
    (event: any) => {
      scale.value = withTiming(1, { duration: 150 });
      opacity.value = withTiming(1, { duration: 150 });
      onPressOut?.(event);
    },
    [onPressOut, scale, opacity]
  );
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    const isDisabled = disabled || loading;
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled
              ? theme.colors.palette.neutral[300]
              : theme.colors.primary,
          },
          text: {
            color: isDisabled
              ? theme.colors.palette.neutral[500]
              : theme.colors.textOnPrimary,
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: isDisabled
              ? theme.colors.palette.neutral[300]
              : theme.colors.secondary,
          },
          text: {
            color: isDisabled
              ? theme.colors.palette.neutral[500]
              : theme.colors.textOnSecondary,
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: isDisabled
              ? theme.colors.palette.neutral[300]
              : theme.colors.primary,
          },
          text: {
            color: isDisabled
              ? theme.colors.palette.neutral[400]
              : theme.colors.primary,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: isDisabled
              ? theme.colors.palette.neutral[400]
              : theme.colors.primary,
          },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: isDisabled
              ? theme.colors.palette.neutral[300]
              : theme.colors.error,
          },
          text: {
            color: isDisabled
              ? theme.colors.palette.neutral[500]
              : theme.colors.textInverse,
          },
        };
      default:
        return {
          container: {},
          text: {},
        };
    }
  };
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: theme.spacing['2'],
            paddingHorizontal: theme.spacing['3'],
            borderRadius: theme.borderRadius.sm,
            minHeight: 36,
          },
          text: {
            ...theme.typography.buttonSmall,
          },
        };
      case 'lg':
        return {
          container: {
            paddingVertical: theme.spacing['4'],
            paddingHorizontal: theme.spacing['6'],
            borderRadius: theme.borderRadius.lg,
            minHeight: 56,
          },
          text: {
            ...theme.typography.buttonLarge,
          },
        };
      case 'md':
      default:
        return {
          container: {
            paddingVertical: theme.spacing['3'],
            paddingHorizontal: theme.spacing['4'],
            borderRadius: theme.borderRadius.md,
            minHeight: 48,
          },
          text: {
            ...theme.typography.button,
          },
        };
    }
  };
  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const loadingColor =
    variant === 'outline' || variant === 'ghost'
      ? theme.colors.primary
      : theme.colors.textOnPrimary;
  return (
    <AnimatedPressable
      style={[
        styles.container,
        sizeStyles.container,
        variantStyles.container,
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
      disabled={disabled || loading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={loadingColor}
          testID={`${testID}-loading`}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            style={[sizeStyles.text, variantStyles.text, textStyle]}
            numberOfLines={1}
          >
            {children}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </AnimatedPressable>
  );
});
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
export default Button;
