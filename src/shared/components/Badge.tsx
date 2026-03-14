import React, { memo, ReactNode } from 'react';
import { View, ViewStyle, StyleSheet, StyleProp } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
import { Text } from './Text';
export type BadgeVariant = 'filled' | 'outlined' | 'soft';
export type BadgeColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';
export interface BadgeProps {
  content?: string | number;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  maxCount?: number;
  dot?: boolean;
  visible?: boolean;
  animated?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
export interface BadgeWrapperProps extends BadgeProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  offsetX?: number;
  offsetY?: number;
}
const AnimatedView = Animated.createAnimatedComponent(View);
const getSizeConfig = (
  size: BadgeSize,
  isDot: boolean
): { height: number; minWidth: number; fontSize: number; padding: number } => {
  if (isDot) {
    switch (size) {
      case 'sm':
        return { height: 6, minWidth: 6, fontSize: 0, padding: 0 };
      case 'md':
        return { height: 8, minWidth: 8, fontSize: 0, padding: 0 };
      case 'lg':
        return { height: 10, minWidth: 10, fontSize: 0, padding: 0 };
    }
  }
  switch (size) {
    case 'sm':
      return { height: 16, minWidth: 16, fontSize: 10, padding: 4 };
    case 'md':
      return { height: 20, minWidth: 20, fontSize: 12, padding: 6 };
    case 'lg':
      return { height: 24, minWidth: 24, fontSize: 14, padding: 8 };
  }
};
const formatContent = (
  content: string | number | undefined,
  maxCount: number
): string | undefined => {
  if (content === undefined) return undefined;
  if (typeof content === 'number') {
    return content > maxCount ? `${maxCount}+` : content.toString();
  }
  return content;
};
export const Badge = memo<BadgeProps>(function Badge({
  content,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  maxCount = 99,
  dot = false,
  visible = true,
  animated = true,
  icon,
  style,
  testID,
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(visible ? 1 : 0);
  React.useEffect(() => {
    if (animated) {
      scale.value = visible
        ? withSequence(
            withSpring(1.2, { damping: 10, stiffness: 300 }),
            withSpring(1, { damping: 15, stiffness: 200 })
          )
        : withTiming(0, { duration: 150 });
    } else {
      scale.value = visible ? 1 : 0;
    }
  }, [visible, animated, scale]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  if (!visible && !animated) {
    return null;
  }
  const colorMap = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
    neutral: theme.colors.textSecondary,
  };
  const baseColor = colorMap[color];
  const getVariantStyles = (): { bg: string; text: string; border?: string } => {
    switch (variant) {
      case 'outlined':
        return {
          bg: 'transparent',
          text: baseColor,
          border: baseColor,
        };
      case 'soft':
        return {
          bg: `${baseColor}20`,
          text: baseColor,
        };
      case 'filled':
      default:
        return {
          bg: baseColor,
          text: '#FFFFFF',
        };
    }
  };
  const variantStyles = getVariantStyles();
  const sizeConfig = getSizeConfig(size, dot);
  const formattedContent = formatContent(content, maxCount);
  const badgeStyle: ViewStyle = {
    height: sizeConfig.height,
    minWidth: sizeConfig.minWidth,
    borderRadius: sizeConfig.height / 2,
    backgroundColor: variantStyles.bg,
    borderWidth: variantStyles.border ? 1 : 0,
    borderColor: variantStyles.border,
    paddingHorizontal: dot ? 0 : sizeConfig.padding,
    justifyContent: 'center',
    alignItems: 'center',
  };
  return (
    <AnimatedView
      style={[badgeStyle, animatedStyle, style]}
      testID={testID}
    >
      {!dot && (icon || formattedContent) && (
        icon ?? (
          <Text
            style={{
              fontSize: sizeConfig.fontSize,
              fontWeight: '600',
              color: variantStyles.text,
              lineHeight: sizeConfig.fontSize * 1.2,
            }}
          >
            {formattedContent}
          </Text>
        )
      )}
    </AnimatedView>
  );
});
export const BadgeWrapper = memo<BadgeWrapperProps>(function BadgeWrapper({
  children,
  position = 'top-right',
  offsetX = 0,
  offsetY = 0,
  ...badgeProps
}) {
  const getPositionStyle = (): ViewStyle => {
    const baseOffset = badgeProps.dot ? 0 : -4;
    switch (position) {
      case 'top-right':
        return {
          top: baseOffset + offsetY,
          right: baseOffset + offsetX,
        };
      case 'top-left':
        return {
          top: baseOffset + offsetY,
          left: baseOffset + offsetX,
        };
      case 'bottom-right':
        return {
          bottom: baseOffset + offsetY,
          right: baseOffset + offsetX,
        };
      case 'bottom-left':
        return {
          bottom: baseOffset + offsetY,
          left: baseOffset + offsetX,
        };
    }
  };
  return (
    <View style={styles.wrapper}>
      {children}
      <Badge
        {...badgeProps}
        style={[styles.positioned, getPositionStyle(), badgeProps.style]}
      />
    </View>
  );
});
export interface StatusBadgeProps {
  status: 'online' | 'offline' | 'away' | 'busy' | 'dnd';
  size?: BadgeSize;
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
}
export const StatusBadge = memo<StatusBadgeProps>(function StatusBadge({
  status,
  size = 'md',
  showLabel = false,
  style,
}) {
  const statusConfig = {
    online: { color: 'success' as BadgeColor, label: 'Online' },
    offline: { color: 'neutral' as BadgeColor, label: 'Offline' },
    away: { color: 'warning' as BadgeColor, label: 'Away' },
    busy: { color: 'error' as BadgeColor, label: 'Busy' },
    dnd: { color: 'error' as BadgeColor, label: 'Do not disturb' },
  };
  const config = statusConfig[status];
  if (showLabel) {
    return (
      <View style={[styles.statusContainer, style]}>
        <Badge dot color={config.color} size={size} />
        <Text variant="caption" color="textSecondary" style={styles.statusLabel}>
          {config.label}
        </Text>
      </View>
    );
  }
  return <Badge dot color={config.color} size={size} style={style} />;
});
export interface LabelBadgeProps {
  label: string;
  color?: BadgeColor;
  variant?: BadgeVariant;
  icon?: ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  style?: StyleProp<ViewStyle>;
}
export const LabelBadge = memo<LabelBadgeProps>(function LabelBadge({
  label,
  color = 'primary',
  variant = 'soft',
  icon,
  removable = false,
  onRemove,
  style,
}) {
  const { theme } = useTheme();
  const colorMap = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
    neutral: theme.colors.textSecondary,
  };
  const baseColor = colorMap[color];
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return { bg: 'transparent', text: baseColor, border: baseColor };
      case 'filled':
        return { bg: baseColor, text: '#FFFFFF', border: undefined };
      case 'soft':
      default:
        return { bg: `${baseColor}20`, text: baseColor, border: undefined };
    }
  };
  const variantStyles = getVariantStyles();
  return (
    <View
      style={[
        styles.labelBadge,
        {
          backgroundColor: variantStyles.bg,
          borderWidth: variantStyles.border ? 1 : 0,
          borderColor: variantStyles.border,
        },
        style,
      ]}
    >
      {icon && <View style={styles.labelIcon}>{icon}</View>}
      <Text
        variant="caption"
        style={{ color: variantStyles.text, fontWeight: '500' }}
      >
        {label}
      </Text>
      {removable && (
        <Text
          variant="caption"
          style={[styles.removeButton, { color: variantStyles.text }]}
          onPress={onRemove}
        >
          ✕
        </Text>
      )}
    </View>
  );
});
const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  positioned: {
    position: 'absolute',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    marginLeft: 6,
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  labelIcon: {
    marginRight: 4,
  },
  removeButton: {
    marginLeft: 6,
    opacity: 0.7,
  },
});
export default Badge;
