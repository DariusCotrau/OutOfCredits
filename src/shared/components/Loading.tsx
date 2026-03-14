import React, { memo, useEffect } from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  ActivityIndicator,
  DimensionValue,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
import { Text } from './Text';
export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'circular';
export interface LoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  color?: string;
  message?: string;
  visible?: boolean;
  style?: ViewStyle;
  testID?: string;
}
const getSizeValue = (size: LoadingSize): number => {
  switch (size) {
    case 'xs':
      return 16;
    case 'sm':
      return 24;
    case 'md':
      return 36;
    case 'lg':
      return 48;
    case 'xl':
      return 64;
    default:
      return 36;
  }
};
const getIndicatorSize = (size: LoadingSize): 'small' | 'large' => {
  return size === 'xs' || size === 'sm' ? 'small' : 'large';
};
const AnimatedView = Animated.createAnimatedComponent(View);
const Spinner = memo<{
  size: LoadingSize;
  color: string;
}>(function Spinner({ size, color }) {
  return (
    <ActivityIndicator size={getIndicatorSize(size)} color={color} />
  );
});
const Dots = memo<{
  size: LoadingSize;
  color: string;
}>(function Dots({ size, color }) {
  const dotSize = getSizeValue(size) / 4;
  const spacing = dotSize * 0.75;
  const dot1Scale = useSharedValue(1);
  const dot2Scale = useSharedValue(1);
  const dot3Scale = useSharedValue(1);
  useEffect(() => {
    const duration = 300;
    dot1Scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration }),
        withTiming(1, { duration })
      ),
      -1
    );
    dot2Scale.value = withDelay(
      100,
      withRepeat(
        withSequence(
          withTiming(1.4, { duration }),
          withTiming(1, { duration })
        ),
        -1
      )
    );
    dot3Scale.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1.4, { duration }),
          withTiming(1, { duration })
        ),
        -1
      )
    );
    return () => {
      cancelAnimation(dot1Scale);
      cancelAnimation(dot2Scale);
      cancelAnimation(dot3Scale);
    };
  }, [dot1Scale, dot2Scale, dot3Scale]);
  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot1Scale.value }],
  }));
  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot2Scale.value }],
  }));
  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot3Scale.value }],
  }));
  const dotBaseStyle: ViewStyle = {
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: color,
    marginHorizontal: spacing / 2,
  };
  return (
    <View style={styles.dotsContainer}>
      <AnimatedView style={[dotBaseStyle, dot1Style]} />
      <AnimatedView style={[dotBaseStyle, dot2Style]} />
      <AnimatedView style={[dotBaseStyle, dot3Style]} />
    </View>
  );
});
const Pulse = memo<{
  size: LoadingSize;
  color: string;
}>(function Pulse({ size, color }) {
  const sizeValue = getSizeValue(size);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [scale, opacity]);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  return (
    <AnimatedView
      style={[
        {
          width: sizeValue,
          height: sizeValue,
          borderRadius: sizeValue / 2,
          backgroundColor: color,
        },
        pulseStyle,
      ]}
    />
  );
});
const Circular = memo<{
  size: LoadingSize;
  color: string;
}>(function Circular({ size, color }) {
  const sizeValue = getSizeValue(size);
  const strokeWidth = Math.max(2, sizeValue / 12);
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
    return () => {
      cancelAnimation(rotation);
    };
  }, [rotation]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  return (
    <AnimatedView
      style={[
        {
          width: sizeValue,
          height: sizeValue,
          borderRadius: sizeValue / 2,
          borderWidth: strokeWidth,
          borderColor: `${color}30`,
          borderTopColor: color,
        },
        animatedStyle,
      ]}
    />
  );
});
export const Loading = memo<LoadingProps>(function Loading({
  size = 'md',
  variant = 'spinner',
  color,
  message,
  visible = true,
  style,
  testID,
}) {
  const { theme } = useTheme();
  if (!visible) {
    return null;
  }
  const indicatorColor = color ?? theme.colors.primary;
  const renderIndicator = () => {
    switch (variant) {
      case 'dots':
        return <Dots size={size} color={indicatorColor} />;
      case 'pulse':
        return <Pulse size={size} color={indicatorColor} />;
      case 'circular':
        return <Circular size={size} color={indicatorColor} />;
      case 'spinner':
      default:
        return <Spinner size={size} color={indicatorColor} />;
    }
  };
  return (
    <View style={[styles.container, style]} testID={testID}>
      {renderIndicator()}
      {message && (
        <Text
          variant="body"
          color="textSecondary"
          style={styles.message}
        >
          {message}
        </Text>
      )}
    </View>
  );
});
export interface FullScreenLoadingProps extends LoadingProps {
  backgroundColor?: string;
  overlay?: boolean;
}
export const FullScreenLoading = memo<FullScreenLoadingProps>(
  function FullScreenLoading({
    backgroundColor,
    overlay = false,
    visible = true,
    ...props
  }) {
    const { theme } = useTheme();
    if (!visible) {
      return null;
    }
    return (
      <View
        style={[
          styles.fullScreen,
          {
            backgroundColor: overlay
              ? 'rgba(0, 0, 0, 0.5)'
              : backgroundColor ?? theme.colors.background,
          },
        ]}
      >
        <Loading size="lg" {...props} />
      </View>
    );
  }
);
export interface InlineLoadingProps {
  loading: boolean;
  loadingText?: string;
  size?: LoadingSize;
  color?: string;
  style?: ViewStyle;
}
export const InlineLoading = memo<InlineLoadingProps>(function InlineLoading({
  loading,
  loadingText,
  size = 'sm',
  color,
  style,
}) {
  const { theme } = useTheme();
  if (!loading) {
    return null;
  }
  return (
    <View style={[styles.inline, style]}>
      <ActivityIndicator
        size={getIndicatorSize(size)}
        color={color ?? theme.colors.primary}
      />
      {loadingText && (
        <Text variant="caption" color="textSecondary" style={styles.inlineText}>
          {loadingText}
        </Text>
      )}
    </View>
  );
});
export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  circle?: boolean;
  style?: ViewStyle;
}
export const Skeleton = memo<SkeletonProps>(function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 4,
  circle = false,
  style,
}) {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.3);
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800 }),
      -1,
      true
    );
    return () => {
      cancelAnimation(opacity);
    };
  }, [opacity]);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  const skeletonStyle: ViewStyle = {
    width: circle ? height : width,
    height,
    borderRadius: circle ? height / 2 : borderRadius,
    backgroundColor: theme.colors.surfaceVariant,
  };
  return <AnimatedView style={[skeletonStyle, animatedStyle, style]} />;
});
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineText: {
    marginLeft: 8,
  },
});
export default Loading;
