import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
import { Card, Text, Icon, Spacer } from '@shared/components';
import { useActivityStreak } from '@stores/activity';
import { useGamificationStats } from '@stores/gamification';
export interface StreakWidgetProps {
  onPress?: () => void;
}
interface StreakItemProps {
  icon: string;
  label: string;
  value: number;
  color: string;
  best?: number;
}
const StreakItem = memo<StreakItemProps>(function StreakItem({
  icon,
  label,
  value,
  color,
  best,
}) {
  const scale = useSharedValue(1);
  React.useEffect(() => {
    if (value > 0) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    }
  }, [value, scale]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <View style={styles.streakItem}>
      <Animated.View style={[styles.streakIconContainer, { backgroundColor: color + '20' }, animatedStyle]}>
        <Icon name={icon} size={24} color={color} />
      </Animated.View>
      <Spacer size="xs" />
      <Text variant="h3" color="text">{value}</Text>
      <Text variant="caption" color="textSecondary">{label}</Text>
      {best !== undefined && best > value && (
        <Text variant="caption" color="textTertiary" style={styles.bestText}>
          Best: {best}
        </Text>
      )}
    </View>
  );
});
export const StreakWidget = memo<StreakWidgetProps>(function StreakWidget({
  onPress,
}) {
  const { theme } = useTheme();
  const activityStreak = useActivityStreak();
  const stats = useGamificationStats();
  const mindfulnessStreak = activityStreak?.currentStreak ?? 0;
  const bestMindfulnessStreak = activityStreak?.longestStreak ?? 0;
  const loginStreak = stats?.currentStreak ?? 0;
  const bestLoginStreak = stats?.longestStreak ?? 0;
  const sessionsCompleted = stats?.sessionsCompleted ?? 0;
  return (
    <Card onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.warning + '20' }]}>
            <Icon name="fire" size={20} color={theme.colors.warning} />
          </View>
          <Text variant="h4" style={styles.title}>Streaks</Text>
        </View>
        <Icon name="chevron-right" size={20} color={theme.colors.textTertiary} />
      </View>
      <Spacer size="lg" />
      <View style={styles.streaksContainer}>
        <StreakItem
          icon="fire"
          label="days"
          value={mindfulnessStreak}
          color={theme.colors.warning}
          best={bestMindfulnessStreak}
        />
        <View style={[styles.streakDivider, { backgroundColor: theme.colors.border }]} />
        <StreakItem
          icon="calendar"
          label="login"
          value={loginStreak}
          color={theme.colors.primary}
          best={bestLoginStreak}
        />
        <View style={[styles.streakDivider, { backgroundColor: theme.colors.border }]} />
        <StreakItem
          icon="check-circle"
          label="sessions"
          value={sessionsCompleted}
          color={theme.colors.success}
        />
      </View>
      {mindfulnessStreak > 0 && (
        <>
          <Spacer size="md" />
          <View style={[styles.motivationBanner, { backgroundColor: theme.colors.warning + '10' }]}>
            <Icon name="sparkles" size={16} color={theme.colors.warning} />
            <Text variant="bodySmall" color="warning" style={styles.motivationText}>
              {mindfulnessStreak >= 7
                ? 'Amazing! Keep the momentum going!'
                : mindfulnessStreak >= 3
                ? "You're building a great habit!"
                : "Great start! Don't break the chain!"}
            </Text>
          </View>
        </>
      )}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginLeft: 10,
  },
  streaksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  streakIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakDivider: {
    width: 1,
    height: 80,
    marginHorizontal: 8,
  },
  bestText: {
    marginTop: 2,
  },
  motivationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  motivationText: {
    marginLeft: 6,
  },
});
export default StreakWidget;
