import React, { memo, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
import { Card, Text, Icon, Spacer } from '@shared/components';
export interface QuickActionsWidgetProps {
  onStartMeditation?: () => void;
  onStartBreathing?: () => void;
  onViewUsage?: () => void;
  onStartFocus?: () => void;
}
interface ActionButtonProps {
  icon: string;
  label: string;
  color: string;
  backgroundColor: string;
  onPress?: () => void;
}
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const ActionButton = memo<ActionButtonProps>(function ActionButton({
  icon,
  label,
  color,
  backgroundColor,
  onPress,
}) {
  const scale = useSharedValue(1);
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95);
  }, [scale]);
  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <AnimatedPressable
      style={[styles.actionButton, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={[styles.actionIconContainer, { backgroundColor }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Spacer size="xs" />
      <Text variant="caption" color="text" numberOfLines={1}>
        {label}
      </Text>
    </AnimatedPressable>
  );
});
export const QuickActionsWidget = memo<QuickActionsWidgetProps>(function QuickActionsWidget({
  onStartMeditation,
  onStartBreathing,
  onViewUsage,
  onStartFocus,
}) {
  const { theme } = useTheme();
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text variant="h4">Quick Actions</Text>
      </View>
      <Spacer size="md" />
      <View style={styles.actionsGrid}>
        <ActionButton
          icon="meditation"
          label="Meditate"
          color={theme.colors.accent}
          backgroundColor={theme.colors.accent + '20'}
          onPress={onStartMeditation}
        />
        <ActionButton
          icon="wind"
          label="Breathe"
          color={theme.colors.secondary}
          backgroundColor={theme.colors.secondary + '20'}
          onPress={onStartBreathing}
        />
        <ActionButton
          icon="chart"
          label="Usage"
          color={theme.colors.primary}
          backgroundColor={theme.colors.primary + '20'}
          onPress={onViewUsage}
        />
        <ActionButton
          icon="target"
          label="Focus"
          color={theme.colors.warning}
          backgroundColor={theme.colors.warning + '20'}
          onPress={onStartFocus}
        />
      </View>
    </Card>
  );
});
const styles = StyleSheet.create({
  container: {
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default QuickActionsWidget;
