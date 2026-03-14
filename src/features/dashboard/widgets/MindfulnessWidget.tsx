import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { Card, Text, Icon, ProgressBar, Spacer } from '@shared/components';
import { formatDuration } from '@shared/utils';
import { useTodaySummary, useActivityStreak } from '@stores/activity';
export interface MindfulnessWidgetProps {
  onPress?: () => void;
}
export const MindfulnessWidget = memo<MindfulnessWidgetProps>(function MindfulnessWidget({
  onPress,
}) {
  const { theme } = useTheme();
  const todaySummary = useTodaySummary();
  const streak = useActivityStreak();
  const todayTimeMs = todaySummary?.totalTimeMs ?? 0;
  const sessionsToday = todaySummary?.completedSessions ?? 0;
  const dailyGoalMs = 15 * 60 * 1000;
  const goalProgress = Math.min(100, (todayTimeMs / dailyGoalMs) * 100);
  const currentStreak = streak?.currentStreak ?? 0;
  const progressColor = useMemo(() => {
    if (goalProgress >= 100) return theme.colors.success;
    if (goalProgress >= 50) return theme.colors.accent;
    return theme.colors.secondary;
  }, [goalProgress, theme.colors]);
  return (
    <Card onPress={onPress} style={styles.container}>
      {}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.accent + '20' }]}>
            <Icon name="meditation" size={20} color={theme.colors.accent} />
          </View>
          <Text variant="h5" style={styles.title} numberOfLines={1}>
            Mindfulness
          </Text>
        </View>
        <Icon name="chevron-right" size={20} color={theme.colors.textTertiary} />
      </View>
      <Spacer size="md" />
      {}
      <View style={styles.statsRow}>
        {}
        <View style={styles.statItem}>
          <Text variant="h2" color="accent">
            {formatDuration(todayTimeMs, { maxUnits: 2 })}
          </Text>
          <Text variant="caption" color="textSecondary">
            mindful time
          </Text>
        </View>
        {}
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        {}
        <View style={styles.statItem}>
          <Text variant="h2" color="text">
            {sessionsToday}
          </Text>
          <Text variant="caption" color="textSecondary">
            {sessionsToday === 1 ? 'session' : 'sessions'}
          </Text>
        </View>
      </View>
      <Spacer size="md" />
      {}
      <View style={styles.goalSection}>
        <View style={styles.goalHeader}>
          <Text variant="caption" color="textSecondary">
            Daily goal
          </Text>
          <Text variant="caption" color="textSecondary">
            {formatDuration(todayTimeMs)} / {formatDuration(dailyGoalMs)}
          </Text>
        </View>
        <Spacer size="xs" />
        <ProgressBar
          progress={goalProgress}
          size="sm"
          progressColor={progressColor}
        />
      </View>
      <Spacer size="sm" />
      {}
      {currentStreak > 0 && (
        <View style={styles.streakBadge}>
          <Icon name="fire" size={14} color={theme.colors.warning} />
          <Text variant="caption" color="warning" style={styles.streakText}>
            {currentStreak} day streak
          </Text>
        </View>
      )}
    </Card>
  );
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200,
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  goalSection: {
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  streakText: {
    marginLeft: 4,
  },
});
export default MindfulnessWidget;
