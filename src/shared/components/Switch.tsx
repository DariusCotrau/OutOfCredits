import React, { memo, useCallback, useEffect } from 'react';
import {
  Pressable,
  PressableProps,
  View,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
import { Text } from './Text';
export type SwitchSize = 'sm' | 'md' | 'lg';
export type SwitchColor = 'primary' | 'secondary' | 'accent' | 'success';
export interface SwitchProps extends Omit<PressableProps, 'style'> {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  description?: string;
  size?: SwitchSize;
  color?: SwitchColor;
  disabled?: boolean;
  labelPosition?: 'left' | 'right';
  style?: ViewStyle;
  testID?: string;
}
const AnimatedView = Animated.createAnimatedComponent(View);
const getSizeConfig = (
  size: SwitchSize
): { track: { width: number; height: number }; thumb: number; padding: number } => {
  switch (size) {
    case 'sm':
      return {
        track: { width: 40, height: 22 },
        thumb: 18,
        padding: 2,
      };
    case 'md':
      return {
        track: { width: 50, height: 28 },
        thumb: 24,
        padding: 2,
      };
    case 'lg':
      return {
        track: { width: 60, height: 34 },
        thumb: 30,
        padding: 2,
      };
    default:
      return {
        track: { width: 50, height: 28 },
        thumb: 24,
        padding: 2,
      };
  }
};
export const Switch = memo<SwitchProps>(function Switch({
  value,
  onValueChange,
  label,
  description,
  size = 'md',
  color = 'primary',
  disabled = false,
  labelPosition = 'right',
  style,
  testID,
  ...props
}) {
  const { theme } = useTheme();
  const progress = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [value, progress]);
  const sizeConfig = getSizeConfig(size);
  const colorMap = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
    success: theme.colors.success,
  };
  const activeColor = colorMap[color];
  const handleToggle = useCallback(() => {
    if (!disabled) {
      onValueChange(!value);
    }
  }, [value, disabled, onValueChange]);
  const thumbTravel =
    sizeConfig.track.width - sizeConfig.thumb - sizeConfig.padding * 2;
  const animatedTrackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.surfaceVariant, activeColor]
    ),
  }));
  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [0, thumbTravel]),
      },
      {
        scale: interpolate(progress.value, [0, 0.5, 1], [1, 1.1, 1]),
      },
    ],
  }));
  const trackStyle: ViewStyle = {
    width: sizeConfig.track.width,
    height: sizeConfig.track.height,
    borderRadius: sizeConfig.track.height / 2,
    padding: sizeConfig.padding,
    justifyContent: 'center',
  };
  const thumbStyle: ViewStyle = {
    width: sizeConfig.thumb,
    height: sizeConfig.thumb,
    borderRadius: sizeConfig.thumb / 2,
    backgroundColor: '#FFFFFF',
    ...theme.shadows.sm,
  };
  const containerStyle: ViewStyle = {
    flexDirection: labelPosition === 'left' ? 'row-reverse' : 'row',
    alignItems: description ? 'flex-start' : 'center',
    justifyContent: 'space-between',
    opacity: disabled ? 0.5 : 1,
  };
  return (
    <Pressable
      style={[containerStyle, style]}
      onPress={handleToggle}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={label}
      testID={testID}
      {...props}
    >
      {(label || description) && (
        <View
          style={[
            styles.labelContainer,
            labelPosition === 'left' ? styles.labelLeft : styles.labelRight,
          ]}
        >
          {label && (
            <Text
              variant="body"
              color={disabled ? 'textTertiary' : 'text'}
            >
              {label}
            </Text>
          )}
          {description && (
            <Text
              variant="caption"
              color="textTertiary"
              style={styles.description}
            >
              {description}
            </Text>
          )}
        </View>
      )}
      <AnimatedView style={[trackStyle, animatedTrackStyle]}>
        <AnimatedView style={[thumbStyle, animatedThumbStyle]} />
      </AnimatedView>
    </Pressable>
  );
});
export interface SwitchListItemProps extends SwitchProps {
  icon?: React.ReactNode;
  showDivider?: boolean;
}
export const SwitchListItem = memo<SwitchListItemProps>(function SwitchListItem({
  icon,
  showDivider = false,
  style,
  ...props
}) {
  const { theme } = useTheme();
  return (
    <View style={style}>
      <View style={styles.listItemContainer}>
        {icon && <View style={styles.listItemIcon}>{icon}</View>}
        <Switch {...props} style={styles.listItemSwitch} />
      </View>
      {showDivider && (
        <View
          style={[
            styles.divider,
            {
              backgroundColor: theme.colors.border,
              marginLeft: icon ? 56 : 16,
            },
          ]}
        />
      )}
    </View>
  );
});
const styles = StyleSheet.create({
  labelContainer: {
    flex: 1,
  },
  labelLeft: {
    marginLeft: 12,
  },
  labelRight: {
    marginRight: 12,
  },
  description: {
    marginTop: 2,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listItemIcon: {
    marginRight: 16,
  },
  listItemSwitch: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
export default Switch;
