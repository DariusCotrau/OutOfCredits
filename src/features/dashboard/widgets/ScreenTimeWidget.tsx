import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { Card, Text, Icon, ProgressBar, Spacer } from '@shared/components';
import { formatScreenTime, formatPercentage } from '@shared/utils';
import { useTodayUsage, useWeeklyUsage } from '@stores/usage';
export interface ScreenTimeWidgetProps {
  onPress?: () => void;
}
export const ScreenTimeWidget = memo<ScreenTimeWidgetProps>(function ScreenTimeWidget({
  onPress,
}) {
  const { theme } = useTheme();
  const { summary: todaySummary } = useTodayUsage();
  const { summary: weeklySummary } = useWeeklyUsage();
  const todayScreenTime = todaySummary?.totalScreenTime ?? 0;
  const dailyGoal = 4 * 60 * 60 * 1000;
  const goalProgress = Math.min(100, (todayScreenTime / dailyGoal) * 100);
  const yesterdayScreenTime = useMemo(() => {
    if (!weeklySummary?.dailySummaries || weeklySummary.dailySummaries.length < 2) {
      return 0;
    }
    const yesterday = weeklySummary.dailySummaries[weeklySummary.dailySummaries.length - 2];
    return yesterday?.totalScreenTime ?? 0;
  }, [weeklySummary]);
  const comparison = useMemo(() => {
    if (yesterdayScreenTime === 0) return null;
    const diff = todayScreenTime - yesterdayScreenTime;
    const percentage = Math.abs(diff / yesterdayScreenTime);
    return {
      isLess: diff < 0,
      percentage,
      diff: Math.abs(diff),
    };
  }, [todayScreenTime, yesterdayScreenTime]);
  const progressColor = useMemo(() => {
    if (goalProgress >= 100) return theme.colors.error;
    if (goalProgress >= 75) return theme.colors.warning;
    return theme.colors.primary;
  }, [goalProgress, theme.colors]);
  return (
    <Card onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Icon name="phone" size={20} color={theme.colors.primary} />
          </View>
          <Text variant="h5" style={styles.title} numberOfLines={1}>
            Screen Time
          </Text>
        </View>
        <Icon name="chevron-right" size={20} color={theme.colors.textTertiary} />
      </View>
      <Spacer size="md" />
      <View style={styles.mainStat}>
        <Text variant="h1" color="text">
          {formatScreenTime(todayScreenTime)}
        </Text>
        <Text variant="caption" color="textSecondary">
          today
        </Text>
      </View>
      <Spacer size="sm" />
      {comparison && (
        <View style={styles.comparison}>
          <Icon
            name={comparison.isLess ? 'trending-down' : 'trending-up'}
            size={16}
            color={comparison.isLess ? theme.colors.success : theme.colors.error}
          />
          <Text
            variant="bodySmall"
            style={{
              color: comparison.isLess ? theme.colors.success : theme.colors.error,
              marginLeft: 4,
            }}
          >
            {formatPercentage(comparison.percentage, { decimals: 0 })}
            {comparison.isLess ? ' less' : ' more'} than yesterday
          </Text>
        </View>
      )}
      <Spacer size="md" />
      <View style={styles.goalSection}>
        <View style={styles.goalHeader}>
          <Text variant="caption" color="textSecondary">
            Daily goal
          </Text>
          <Text variant="caption" color="textSecondary">
            {formatScreenTime(todayScreenTime)} / {formatScreenTime(dailyGoal)}
          </Text>
        </View>
        <Spacer size="xs" />
        <ProgressBar
          progress={goalProgress}
          size="sm"
          progressColor={progressColor}
        />
      </View>
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
  mainStat: {
    alignItems: 'center',
  },
  comparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalSection: {
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
export default ScreenTimeWidget;
