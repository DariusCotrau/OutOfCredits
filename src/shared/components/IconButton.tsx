import React, { memo, useCallback } from 'react';
import {
  Pressable,
  PressableProps,
  ViewStyle,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
import { Icon } from './Icon';
export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconButtonVariant =
  | 'filled'
  | 'tonal'
  | 'outlined'
  | 'ghost'
  | 'standard';
export type IconButtonColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'error'
  | 'success'
  | 'warning'
  | 'neutral';
export interface IconButtonProps extends Omit<PressableProps, 'style'> {
  icon: React.ReactNode;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  color?: IconButtonColor;
  disabled?: boolean;
  loading?: boolean;
  backgroundColor?: string;
  iconColor?: string;
  ripple?: boolean;
  style?: ViewStyle;
  testID?: string;
}
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const getSizeConfig = (
  size: IconButtonSize
): { container: number; icon: number } => {
  switch (size) {
    case 'xs':
      return { container: 28, icon: 16 };
    case 'sm':
      return { container: 36, icon: 20 };
    case 'md':
      return { container: 44, icon: 24 };
    case 'lg':
      return { container: 52, icon: 28 };
    case 'xl':
      return { container: 64, icon: 32 };
    default:
      return { container: 44, icon: 24 };
  }
};
export const IconButton = memo<IconButtonProps>(function IconButton({
  icon,
  size = 'md',
  variant = 'standard',
  color = 'primary',
  disabled = false,
  loading = false,
  backgroundColor: customBackgroundColor,
  iconColor: customIconColor,
  ripple = true,
  style,
  onPressIn,
  onPressOut,
  testID,
  ...props
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const sizeConfig = getSizeConfig(size);
  const getColors = (): { bg: string; icon: string; border?: string } => {
    const colorMap = {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      accent: theme.colors.accent,
      error: theme.colors.error,
      success: theme.colors.success,
      warning: theme.colors.warning,
      neutral: theme.colors.textSecondary,
    };
    const baseColor = colorMap[color];
    switch (variant) {
      case 'filled':
        return {
          bg: customBackgroundColor ?? baseColor,
          icon: customIconColor ?? '#FFFFFF',
        };
      case 'tonal':
        return {
          bg: customBackgroundColor ?? `${baseColor}20`,
          icon: customIconColor ?? baseColor,
        };
      case 'outlined':
        return {
          bg: customBackgroundColor ?? 'transparent',
          icon: customIconColor ?? baseColor,
          border: baseColor,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          icon: customIconColor ?? baseColor,
        };
      case 'standard':
      default:
        return {
          bg: customBackgroundColor ?? 'transparent',
          icon: customIconColor ?? theme.colors.text,
        };
    }
  };
  const colors = getColors();
  const handlePressIn = useCallback(
    (e: any) => {
      scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
      onPressIn?.(e);
    },
    [scale, onPressIn]
  );
  const handlePressOut = useCallback(
    (e: any) => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      onPressOut?.(e);
    },
    [scale, onPressOut]
  );
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const containerStyle: ViewStyle = {
    width: sizeConfig.container,
    height: sizeConfig.container,
    borderRadius: sizeConfig.container / 2,
    backgroundColor: colors.bg,
    borderWidth: colors.border ? 1.5 : 0,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: disabled ? 0.5 : 1,
  };
  const renderIcon = () => {
    if (typeof icon === 'string') {
      return <Icon name={icon} size={sizeConfig.icon} color={colors.icon} />;
    }
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement<any>, {
        size: sizeConfig.icon,
        color: colors.icon,
      });
    }
    return icon;
  };
  return (
    <AnimatedPressable
      style={[containerStyle, animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      android_ripple={
        ripple
          ? {
              color: `${colors.icon}30`,
              borderless: true,
              radius: sizeConfig.container / 2,
            }
          : undefined
      }
      hitSlop={8}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      {...props}
    >
      {loading ? (
        <View style={styles.loading}>
          {}
          <View
            style={[
              styles.loadingDot,
              { backgroundColor: colors.icon },
            ]}
          />
        </View>
      ) : (
        renderIcon()
      )}
    </AnimatedPressable>
  );
});
export const CloseButton = memo<
  Omit<IconButtonProps, 'icon'> & { iconElement?: React.ReactNode }
>(function CloseButton({ iconElement, ...props }) {
  const { theme } = useTheme();
  const defaultIcon = (
    <View style={styles.closeIcon}>
      <View
        style={[
          styles.closeIconLine,
          styles.closeIconLine1,
          { backgroundColor: theme.colors.text },
        ]}
      />
      <View
        style={[
          styles.closeIconLine,
          styles.closeIconLine2,
          { backgroundColor: theme.colors.text },
        ]}
      />
    </View>
  );
  return (
    <IconButton
      icon={iconElement ?? defaultIcon}
      variant="ghost"
      color="neutral"
      {...props}
    />
  );
});
export const BackButton = memo<
  Omit<IconButtonProps, 'icon'> & { iconElement?: React.ReactNode }
>(function BackButton({ iconElement, ...props }) {
  const { theme } = useTheme();
  const defaultIcon = (
    <View style={styles.backIcon}>
      <View
        style={[
          styles.backIconLine,
          styles.backIconLine1,
          { backgroundColor: theme.colors.text },
        ]}
      />
      <View
        style={[
          styles.backIconLine,
          styles.backIconLine2,
          { backgroundColor: theme.colors.text },
        ]}
      />
    </View>
  );
  return (
    <IconButton
      icon={iconElement ?? defaultIcon}
      variant="ghost"
      color="neutral"
      {...props}
    />
  );
});
const styles = StyleSheet.create({
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  closeIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconLine: {
    position: 'absolute',
    width: 16,
    height: 2,
    borderRadius: 1,
  },
  closeIconLine1: {
    transform: [{ rotate: '45deg' }],
  },
  closeIconLine2: {
    transform: [{ rotate: '-45deg' }],
  },
  backIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backIconLine: {
    position: 'absolute',
    width: 10,
    height: 2,
    borderRadius: 1,
    left: 0,
  },
  backIconLine1: {
    transform: [{ rotate: '-45deg' }, { translateY: -3 }],
  },
  backIconLine2: {
    transform: [{ rotate: '45deg' }, { translateY: 3 }],
  },
});
export default IconButton;
