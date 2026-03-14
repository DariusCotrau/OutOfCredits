import React, { memo, useEffect } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
import { Text } from './Text';
export type ProgressBarSize = 'xs' | 'sm' | 'md' | 'lg';
export type ProgressBarColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error';
export interface ProgressBarProps {
  progress: number;
  size?: ProgressBarSize;
  color?: ProgressBarColor;
  showLabel?: boolean;
  formatLabel?: (progress: number) => string;
  labelPosition?: 'top' | 'right' | 'inside';
  animated?: boolean;
  animationDuration?: number;
  indeterminate?: boolean;
  trackColor?: string;
  progressColor?: string;
  rounded?: boolean;
  style?: ViewStyle;
  testID?: string;
}
const AnimatedView = Animated.createAnimatedComponent(View);
const getHeight = (size: ProgressBarSize): number => {
  switch (size) {
    case 'xs':
      return 4;
    case 'sm':
      return 6;
    case 'md':
      return 8;
    case 'lg':
      return 12;
    default:
      return 8;
  }
};
const defaultFormatLabel = (progress: number): string => `${Math.round(progress)}%`;
export const ProgressBar = memo<ProgressBarProps>(function ProgressBar({
  progress,
  size = 'md',
  color = 'primary',
  showLabel = false,
  formatLabel = defaultFormatLabel,
  labelPosition = 'right',
  animated = true,
  animationDuration = 300,
  indeterminate = false,
  trackColor,
  progressColor,
  rounded = true,
  style,
  testID,
}) {
  const { theme } = useTheme();
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const animatedProgress = useSharedValue(animated ? 0 : clampedProgress);
  const indeterminatePosition = useSharedValue(0);
  useEffect(() => {
    if (!indeterminate) {
      animatedProgress.value = animated
        ? withTiming(clampedProgress, {
            duration: animationDuration,
            easing: Easing.out(Easing.ease),
          })
        : clampedProgress;
    }
  }, [clampedProgress, animated, animationDuration, animatedProgress, indeterminate]);
  useEffect(() => {
    if (indeterminate) {
      indeterminatePosition.value = withTiming(1, {
        duration: 1000,
        easing: Easing.linear,
      });
      const interval = setInterval(() => {
        indeterminatePosition.value = 0;
        indeterminatePosition.value = withTiming(1, {
          duration: 1000,
          easing: Easing.linear,
        });
      }, 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [indeterminate, indeterminatePosition]);
  const colorMap = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
  };
  const height = getHeight(size);
  const borderRadius = rounded ? height / 2 : 0;
  const barColor = progressColor ?? colorMap[color];
  const bgColor = trackColor ?? theme.colors.surfaceVariant;
  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }));
  const indeterminateStyle = useAnimatedStyle(() => ({
    width: '30%',
    transform: [
      {
        translateX: indeterminatePosition.value * 300,
      },
    ],
  }));
  const trackStyle: ViewStyle = {
    height,
    borderRadius,
    backgroundColor: bgColor,
    overflow: 'hidden',
  };
  const fillStyle: ViewStyle = {
    height: '100%',
    borderRadius,
    backgroundColor: barColor,
  };
  const renderProgressBar = () => (
    <View style={trackStyle}>
      {indeterminate ? (
        <AnimatedView style={[fillStyle, indeterminateStyle]} />
      ) : (
        <AnimatedView style={[fillStyle, animatedProgressStyle]} />
      )}
    </View>
  );
  const renderLabel = () => {
    if (!showLabel || indeterminate) return null;
    return (
      <Text
        variant="caption"
        color="textSecondary"
        style={
          labelPosition === 'top'
            ? styles.labelTop
            : labelPosition === 'right'
            ? styles.labelRight
            : styles.labelInside
        }
      >
        {formatLabel(clampedProgress)}
      </Text>
    );
  };
  if (labelPosition === 'top') {
    return (
      <View style={style} testID={testID}>
        {renderLabel()}
        {renderProgressBar()}
      </View>
    );
  }
  if (labelPosition === 'right') {
    return (
      <View style={[styles.rowContainer, style]} testID={testID}>
        <View style={styles.flexTrack}>{renderProgressBar()}</View>
        {renderLabel()}
      </View>
    );
  }
  if (labelPosition === 'inside' && size === 'lg') {
    return (
      <View style={[trackStyle, style]} testID={testID}>
        <AnimatedView style={[fillStyle, animatedProgressStyle]} />
        {showLabel && (
          <View style={styles.insideLabelContainer}>
            <Text variant="caption" color="text" style={styles.insideLabel}>
              {formatLabel(clampedProgress)}
            </Text>
          </View>
        )}
      </View>
    );
  }
  return (
    <View style={style} testID={testID}>
      {renderProgressBar()}
    </View>
  );
});
export interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: ProgressBarColor;
  trackColor?: string;
  progressColor?: string;
  showLabel?: boolean;
  formatLabel?: (progress: number) => string;
  children?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}
export const CircularProgress = memo<CircularProgressProps>(
  function CircularProgress({
    progress,
    size = 64,
    strokeWidth = 6,
    color = 'primary',
    trackColor,
    progressColor,
    showLabel = false,
    formatLabel = defaultFormatLabel,
    children,
    style,
    testID,
  }) {
    const { theme } = useTheme();
    const clampedProgress = Math.min(100, Math.max(0, progress));
    const colorMap = {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      accent: theme.colors.accent,
      success: theme.colors.success,
      warning: theme.colors.warning,
      error: theme.colors.error,
    };
    const barColor = progressColor ?? colorMap[color];
    const bgColor = trackColor ?? theme.colors.surfaceVariant;
    return (
      <View
        style={[{ width: size, height: size }, style]}
        testID={testID}
      >
        {}
        {}
        <View
          style={[
            styles.circularTrack,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: bgColor,
              borderTopColor: barColor,
            },
          ]}
        />
        <View style={styles.circularCenter}>
          {children ?? (
            showLabel && (
              <Text variant="h4" color="text">
                {formatLabel(clampedProgress)}
              </Text>
            )
          )}
        </View>
      </View>
    );
  }
);
export interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  color?: ProgressBarColor;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  testID?: string;
}
export const StepProgress = memo<StepProgressProps>(function StepProgress({
  currentStep,
  totalSteps,
  labels,
  color = 'primary',
  size = 'md',
  style,
  testID,
}) {
  const { theme } = useTheme();
  const colorMap = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
  };
  const activeColor = colorMap[color];
  const dotSizes = {
    sm: 8,
    md: 12,
    lg: 16,
  };
  const dotSize = dotSizes[size];
  return (
    <View style={[styles.stepContainer, style]} testID={testID}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isActive = isCompleted || isCurrent;
        return (
          <React.Fragment key={index}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  {
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    backgroundColor: isActive
                      ? activeColor
                      : theme.colors.surfaceVariant,
                    borderWidth: isCurrent ? 2 : 0,
                    borderColor: activeColor,
                  },
                ]}
              >
                {isCompleted && (
                  <View
                    style={[
                      styles.checkMark,
                      { backgroundColor: '#FFFFFF' },
                    ]}
                  />
                )}
              </View>
              {labels && labels[index] && (
                <Text
                  variant="caption"
                  color={isActive ? 'text' : 'textTertiary'}
                  style={styles.stepLabel}
                >
                  {labels[index]}
                </Text>
              )}
            </View>
            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.stepLine,
                  {
                    backgroundColor: isCompleted
                      ? activeColor
                      : theme.colors.surfaceVariant,
                  },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
});
const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexTrack: {
    flex: 1,
  },
  labelTop: {
    marginBottom: 4,
  },
  labelRight: {
    marginLeft: 12,
    minWidth: 40,
  },
  labelInside: {
  },
  insideLabelContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insideLabel: {
    fontWeight: '600',
  },
  circularTrack: {
    position: 'absolute',
  },
  circularCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepDot: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginTop: 5,
    marginHorizontal: 4,
  },
  stepLabel: {
    marginTop: 4,
    textAlign: 'center',
  },
  checkMark: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
export default ProgressBar;
