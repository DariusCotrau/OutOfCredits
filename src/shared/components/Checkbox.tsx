import React, { memo, useCallback } from 'react';
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
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
import { Text } from './Text';
export type CheckboxSize = 'sm' | 'md' | 'lg';
export type CheckboxColor = 'primary' | 'secondary' | 'accent' | 'success';
export interface CheckboxProps extends Omit<PressableProps, 'style'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: CheckboxSize;
  color?: CheckboxColor;
  disabled?: boolean;
  indeterminate?: boolean;
  error?: boolean;
  errorMessage?: string;
  labelPosition?: 'left' | 'right';
  style?: ViewStyle;
  testID?: string;
}
const AnimatedView = Animated.createAnimatedComponent(View);
const getSizeConfig = (size: CheckboxSize): { box: number; check: number; radius: number } => {
  switch (size) {
    case 'sm':
      return { box: 18, check: 10, radius: 4 };
    case 'md':
      return { box: 22, check: 12, radius: 5 };
    case 'lg':
      return { box: 26, check: 14, radius: 6 };
    default:
      return { box: 22, check: 12, radius: 5 };
  }
};
export const Checkbox = memo<CheckboxProps>(function Checkbox({
  checked,
  onCheckedChange,
  label,
  description,
  size = 'md',
  color = 'primary',
  disabled = false,
  indeterminate = false,
  error = false,
  errorMessage,
  labelPosition = 'right',
  style,
  testID,
  ...props
}) {
  const { theme } = useTheme();
  const progress = useSharedValue(checked ? 1 : 0);
  const scale = useSharedValue(1);
  React.useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: 200 });
  }, [checked, progress]);
  const sizeConfig = getSizeConfig(size);
  const colorMap = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
    success: theme.colors.success,
  };
  const checkboxColor = error ? theme.colors.error : colorMap[color];
  const handlePress = useCallback(() => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  }, [checked, disabled, onCheckedChange]);
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  }, [scale]);
  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);
  const animatedBoxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['transparent', checkboxColor]
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [error ? theme.colors.error : theme.colors.border, checkboxColor]
    ),
    transform: [{ scale: scale.value }],
  }));
  const animatedCheckStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));
  const boxStyle: ViewStyle = {
    width: sizeConfig.box,
    height: sizeConfig.box,
    borderRadius: sizeConfig.radius,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  };
  const containerStyle: ViewStyle = {
    flexDirection: labelPosition === 'left' ? 'row-reverse' : 'row',
    alignItems: description ? 'flex-start' : 'center',
    opacity: disabled ? 0.5 : 1,
  };
  const renderCheckMark = () => {
    if (indeterminate) {
      return (
        <AnimatedView
          style={[
            styles.indeterminate,
            {
              width: sizeConfig.check,
              height: 2,
              backgroundColor: '#FFFFFF',
            },
            animatedCheckStyle,
          ]}
        />
      );
    }
    return (
      <AnimatedView
        style={[
          styles.checkContainer,
          {
            width: sizeConfig.check,
            height: sizeConfig.check,
          },
          animatedCheckStyle,
        ]}
      >
        {}
        <View
          style={[
            styles.checkLine1,
            {
              width: sizeConfig.check * 0.35,
              height: 2,
              backgroundColor: '#FFFFFF',
            },
          ]}
        />
        <View
          style={[
            styles.checkLine2,
            {
              width: sizeConfig.check * 0.7,
              height: 2,
              backgroundColor: '#FFFFFF',
            },
          ]}
        />
      </AnimatedView>
    );
  };
  return (
    <View style={style}>
      <Pressable
        style={containerStyle}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        accessibilityLabel={label}
        testID={testID}
        {...props}
      >
        <AnimatedView style={[boxStyle, animatedBoxStyle]}>
          {renderCheckMark()}
        </AnimatedView>
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
                color={error ? 'error' : disabled ? 'textTertiary' : 'text'}
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
      </Pressable>
      {errorMessage && (
        <Text variant="caption" color="error" style={styles.errorMessage}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
});
export interface CheckboxGroupProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  size?: CheckboxSize;
  color?: CheckboxColor;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  style?: ViewStyle;
  testID?: string;
}
export const CheckboxGroup = memo<CheckboxGroupProps>(function CheckboxGroup({
  value,
  onValueChange,
  options,
  size = 'md',
  color = 'primary',
  disabled = false,
  orientation = 'vertical',
  style,
  testID,
}) {
  const handleCheckedChange = useCallback(
    (optionValue: string, checked: boolean) => {
      if (checked) {
        onValueChange([...value, optionValue]);
      } else {
        onValueChange(value.filter((v) => v !== optionValue));
      }
    },
    [value, onValueChange]
  );
  return (
    <View
      style={[
        orientation === 'horizontal' ? styles.groupHorizontal : styles.groupVertical,
        style,
      ]}
      testID={testID}
    >
      {options.map((option, index) => (
        <Checkbox
          key={option.value}
          checked={value.includes(option.value)}
          onCheckedChange={(checked) => handleCheckedChange(option.value, checked)}
          label={option.label}
          description={option.description}
          size={size}
          color={color}
          disabled={disabled || option.disabled}
          style={
            index < options.length - 1
              ? orientation === 'horizontal'
                ? styles.groupItemHorizontal
                : styles.groupItemVertical
              : undefined
          }
        />
      ))}
    </View>
  );
});
const styles = StyleSheet.create({
  checkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  checkLine1: {
    position: 'absolute',
    borderRadius: 1,
    transform: [
      { rotate: '45deg' },
      { translateX: -2 },
      { translateY: 2 },
    ],
  },
  checkLine2: {
    position: 'absolute',
    borderRadius: 1,
    transform: [
      { rotate: '-45deg' },
      { translateX: 2 },
      { translateY: 0 },
    ],
  },
  indeterminate: {
    borderRadius: 1,
  },
  labelContainer: {
    flex: 1,
  },
  labelLeft: {
    marginRight: 12,
  },
  labelRight: {
    marginLeft: 12,
  },
  description: {
    marginTop: 2,
  },
  errorMessage: {
    marginTop: 4,
    marginLeft: 34,
  },
  groupVertical: {
    flexDirection: 'column',
  },
  groupHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  groupItemVertical: {
    marginBottom: 12,
  },
  groupItemHorizontal: {
    marginRight: 24,
    marginBottom: 8,
  },
});
export default Checkbox;
