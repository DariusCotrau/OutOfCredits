import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { Card, Text, Icon, Spacer, ProgressBar } from '@shared/components';
import { formatScreenTime, formatDuration } from '@shared/utils';
import { useTodayUsage } from '@stores/usage';
import { useTodaySummary } from '@stores/activity';
import { useDailyRewards } from '@stores/gamification';
export interface DailyGoalWidgetProps {
  onPress?: () => void;
}
interface GoalItemProps {
  icon: string;
  label: string;
  current: number;
  goal: number;
  formatter: (value: number) => string;
  color: string;
  isCompleted: boolean;
}
const GoalItem = memo<GoalItemProps>(function GoalItem({
  icon,
  label,
  current,
  goal,
  formatter,
  color,
  isCompleted,
}) {
  const { theme } = useTheme();
  const progress = Math.min(100, (current / goal) * 100);
  return (
    <View style={styles.goalItem}>
      <View style={styles.goalHeader}>
        <View style={styles.goalLeft}>
          <View style={[styles.goalIcon, { backgroundColor: color + '20' }]}>
            <Icon
              name={isCompleted ? 'check' : icon}
              size={16}
              color={isCompleted ? theme.colors.success : color}
            />
          </View>
          <Text variant="body" color="text" style={styles.goalLabel}>
            {label}
          </Text>
        </View>
        <Text variant="bodySmall" color="textSecondary">
          {formatter(current)} / {formatter(goal)}
        </Text>
      </View>
      <Spacer size="xs" />
      <ProgressBar
        progress={progress}
        size="xs"
        progressColor={isCompleted ? theme.colors.success : color}
      />
    </View>
  );
});
export const DailyGoalWidget = memo<DailyGoalWidgetProps>(function DailyGoalWidget({
  onPress,
}) {
  const { theme } = useTheme();
  const { summary: usageSummary } = useTodayUsage();
  const activitySummary = useTodaySummary();
  const dailyRewards = useDailyRewards();
  const screenTimeGoal = 4 * 60 * 60 * 1000;
  const mindfulnessGoal = 15 * 60 * 1000;
  const sessionsGoal = 2;
  const currentScreenTime = usageSummary?.totalScreenTime ?? 0;
  const currentMindfulness = activitySummary?.totalTimeMs ?? 0;
  const currentSessions = activitySummary?.completedSessions ?? 0;
  const isScreenTimeGoalMet = currentScreenTime <= screenTimeGoal;
  const isMindfulnessGoalMet = currentMindfulness >= mindfulnessGoal;
  const isSessionsGoalMet = currentSessions >= sessionsGoal;
  const completedGoals = [isScreenTimeGoalMet, isMindfulnessGoalMet, isSessionsGoalMet].filter(Boolean).length;
  const totalGoals = 3;
  const rewardAvailable = dailyRewards.some((r) => r.isAvailable && !r.isClaimed);
  const overallProgress = (completedGoals / totalGoals) * 100;
  return (
    <Card onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
            <Icon name="target" size={20} color={theme.colors.success} />
          </View>
          <View style={styles.headerText}>
            <Text variant="h4">Daily Goals</Text>
            <Text variant="caption" color="textSecondary">
              {completedGoals}/{totalGoals} completed
            </Text>
          </View>
        </View>
        {rewardAvailable && (
          <View style={[styles.rewardBadge, { backgroundColor: theme.colors.warning }]}>
            <Icon name="gift" size={14} color="#FFFFFF" />
          </View>
        )}
      </View>
      <Spacer size="md" />
      <ProgressBar
        progress={overallProgress}
        size="md"
        color={completedGoals === totalGoals ? 'success' : 'primary'}
      />
      <Spacer size="lg" />
      <View style={styles.goalsContainer}>
        <GoalItem
          icon="phone"
          label="Screen time limit"
          current={Math.min(currentScreenTime, screenTimeGoal)}
          goal={screenTimeGoal}
          formatter={(v) => formatScreenTime(v)}
          color={theme.colors.primary}
          isCompleted={isScreenTimeGoalMet}
        />
        <Spacer size="sm" />
        <GoalItem
          icon="meditation"
          label="Mindfulness"
          current={currentMindfulness}
          goal={mindfulnessGoal}
          formatter={(v) => formatDuration(v, { maxUnits: 2 })}
          color={theme.colors.accent}
          isCompleted={isMindfulnessGoalMet}
        />
        <Spacer size="sm" />
        <GoalItem
          icon="check-circle"
          label="Sessions"
          current={currentSessions}
          goal={sessionsGoal}
          formatter={(v) => `${v}`}
          color={theme.colors.secondary}
          isCompleted={isSessionsGoalMet}
        />
      </View>
      {completedGoals === totalGoals && (
        <>
          <Spacer size="md" />
          <View style={[styles.completedBanner, { backgroundColor: theme.colors.success + '10' }]}>
            <Icon name="trophy" size={18} color={theme.colors.success} />
            <Text variant="body" color="success" style={styles.completedText}>
              All goals completed! Great job!
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
  headerText: {
    marginLeft: 10,
  },
  rewardBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalsContainer: {
  },
  goalItem: {
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalLabel: {
    marginLeft: 8,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  completedText: {
    marginLeft: 8,
    fontWeight: '600',
  },
});
export default DailyGoalWidget;
