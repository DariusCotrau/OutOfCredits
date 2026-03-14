import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@theme';
import {
  useUsageStore,
  useUsageActions,
  useTodayUsage,
  useWeeklyUsage,
  selectHasUsageAccess,
} from '@stores/usage';
import {
  SafeArea,
  Container,
  Text,
  Card,
  Button,
  Spacer,
  Icon,
  Loading,
} from '@shared/components';
import { formatScreenTime, formatPercentage } from '@shared/utils';
import type { AppUsageRecord, AppCategory } from '@services/usage';
import type { UsageStackParamList } from '@shared/types';
type UsageNavigationProp = NativeStackNavigationProp<UsageStackParamList, 'UsageDashboard'>;
const CATEGORY_COLORS: Record<AppCategory, string> = {
  social: '#E91E63',
  entertainment: '#9C27B0',
  communication: '#2196F3',
  productivity: '#4CAF50',
  games: '#FF9800',
  education: '#00BCD4',
  health: '#8BC34A',
  news: '#607D8B',
  shopping: '#795548',
  travel: '#3F51B5',
  finance: '#009688',
  utilities: '#9E9E9E',
  other: '#757575',
};
function ScreenTimeCircle({
  totalMs,
  goalMs,
}: {
  totalMs: number;
  goalMs: number;
}) {
  const { theme } = useTheme();
  const percentage = Math.min(100, (totalMs / goalMs) * 100);
  const isOverLimit = totalMs > goalMs;
  return (
    <View style={styles.circleContainer}>
      <View
        style={[
          styles.circleOuter,
          {
            borderColor: isOverLimit ? theme.colors.error : theme.colors.primary,
          },
        ]}
      >
        <View style={[styles.circleInner, { backgroundColor: theme.colors.surface }]}>
          <Text variant="h1" style={{ fontSize: 32 }}>
            {formatScreenTime(totalMs)}
          </Text>
          <Text variant="caption" color="textSecondary">
            of {formatScreenTime(goalMs)} goal
          </Text>
          <Spacer size="xs" />
          <View
            style={[
              styles.percentageBadge,
              {
                backgroundColor: isOverLimit
                  ? theme.colors.error + '20'
                  : theme.colors.primary + '20',
              },
            ]}
          >
            <Text
              variant="caption"
              style={{
                color: isOverLimit ? theme.colors.error : theme.colors.primary,
              }}
            >
              {formatPercentage(percentage / 100, { decimals: 0 })}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
function AppUsageItem({
  app,
  maxTime,
  onPress,
}: {
  app: AppUsageRecord;
  maxTime: number;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const percentage = (app.totalTimeInForeground / maxTime) * 100;
  const categoryColor = CATEGORY_COLORS[app.category ?? 'other'];
  return (
    <TouchableOpacity
      style={styles.appItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.appItemLeft}>
        <View
          style={[styles.appIcon, { backgroundColor: categoryColor + '20' }]}
        >
          <Text style={{ fontSize: 20 }}>📱</Text>
        </View>
        <View style={styles.appInfo}>
          <Text variant="body" numberOfLines={1}>
            {app.appName}
          </Text>
          <Text variant="caption" color="textSecondary">
            {formatScreenTime(app.totalTimeInForeground)}
          </Text>
        </View>
      </View>
      <View style={styles.appItemRight}>
        <View style={styles.appProgress}>
          <View
            style={[
              styles.appProgressFill,
              {
                width: `${percentage}%`,
                backgroundColor: categoryColor,
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}
function CategoryUsageBar({
  category,
  timeMs,
  totalMs,
}: {
  category: AppCategory;
  timeMs: number;
  totalMs: number;
}) {
  const percentage = (timeMs / totalMs) * 100;
  const color = CATEGORY_COLORS[category];
  return (
    <View style={styles.categoryItem}>
      <View style={styles.categoryLeft}>
        <View style={[styles.categoryDot, { backgroundColor: color }]} />
        <Text variant="bodySmall" style={styles.categoryLabel}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Text>
      </View>
      <Text variant="bodySmall" color="textSecondary">
        {formatScreenTime(timeMs)} ({formatPercentage(percentage / 100, { decimals: 0 })})
      </Text>
    </View>
  );
}
function PermissionRequired({ onRequest }: { onRequest: () => void }) {
  const { theme } = useTheme();
  return (
    <Container padding="lg" style={styles.permissionContainer}>
      <View style={[styles.permissionIcon, { backgroundColor: theme.colors.primary + '15' }]}>
        <Icon name="chart" size="xl" color={theme.colors.primary} />
      </View>
      <Spacer size="lg" />
      <Text variant="h3" align="center">
        Usage Access Required
      </Text>
      <Spacer size="sm" />
      <Text variant="body" color="textSecondary" align="center">
        To track your screen time, MindfulTime needs permission to access app usage data.
      </Text>
      <Spacer size="xl" />
      <Button onPress={onRequest} fullWidth>
        Grant Permission
      </Button>
    </Container>
  );
}
export function UsageDashboardScreen() {
  const navigation = useNavigation<UsageNavigationProp>();
  const { theme } = useTheme();
  const hasAccess = useUsageStore(selectHasUsageAccess);
  const hasCheckedPermission = useUsageStore((s) => s.hasCheckedPermission);
  const { usage, summary } = useTodayUsage();
  const { summary: weeklySummary } = useWeeklyUsage();
  const {
    checkPermission,
    requestPermission,
    fetchTodayUsage,
    fetchTodaySummary,
    fetchWeeklySummary,
  } = useUsageActions();
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);
  useEffect(() => {
    if (hasAccess) {
      fetchTodayUsage();
      fetchTodaySummary();
      fetchWeeklySummary();
    }
  }, [hasAccess, fetchTodayUsage, fetchTodaySummary, fetchWeeklySummary]);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchTodayUsage(),
      fetchTodaySummary(),
      fetchWeeklySummary(),
    ]);
    setRefreshing(false);
  }, [fetchTodayUsage, fetchTodaySummary, fetchWeeklySummary]);
  const handleAppPress = useCallback(
    (app: AppUsageRecord) => {
      navigation.navigate('AppDetails', { packageName: app.packageName });
    },
    [navigation]
  );
  const handleViewAllApps = useCallback(() => {
    navigation.navigate('AllApps');
  }, [navigation]);
  const handleManageLimits = useCallback(() => {
    navigation.navigate('LimitsManagement');
  }, [navigation]);
  if (!hasCheckedPermission) {
    return (
      <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Loading size="lg" />
      </SafeArea>
    );
  }
  if (!hasAccess) {
    return (
      <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <PermissionRequired onRequest={requestPermission} />
      </SafeArea>
    );
  }
  const totalScreenTime = summary?.totalScreenTime ?? 0;
  const dailyGoal = 2 * 60 * 60 * 1000;
  const topApps = usage.slice(0, 5);
  const maxAppTime = topApps[0]?.totalTimeInForeground ?? 1;
  const categoryUsage = (summary?.categoryUsage ?? {}) as Record<string, number>;
  const sortedCategories = Object.entries(categoryUsage)
    .filter(([, time]) => time > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        <Container padding="lg">
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text variant="h2">Screen Time</Text>
            <Text variant="body" color="textSecondary">
              Today, {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </Text>
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Card variant="elevated">
              <ScreenTimeCircle totalMs={totalScreenTime} goalMs={dailyGoal} />
              <Spacer size="md" />
              <View style={styles.quickStats}>
                <View style={styles.quickStatItem}>
                  <Text variant="h4">{summary?.unlockCount ?? 0}</Text>
                  <Text variant="caption" color="textSecondary">
                    Unlocks
                  </Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.quickStatItem}>
                  <Text variant="h4">{summary?.notificationCount ?? 0}</Text>
                  <Text variant="caption" color="textSecondary">
                    Notifications
                  </Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.quickStatItem}>
                  <Text variant="h4">{usage.length}</Text>
                  <Text variant="caption" color="textSecondary">
                    Apps Used
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <View style={styles.sectionHeader}>
              <Text variant="h4">Most Used Apps</Text>
              <TouchableOpacity onPress={handleViewAllApps}>
                <Text variant="bodySmall" color="primary">
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <Spacer size="sm" />
            <Card variant="outlined" style={styles.appListCard}>
              {topApps.length > 0 ? (
                topApps.map((app, index) => (
                  <React.Fragment key={app.packageName}>
                    {index > 0 && (
                      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                    )}
                    <AppUsageItem
                      app={app}
                      maxTime={maxAppTime}
                      onPress={() => handleAppPress(app)}
                    />
                  </React.Fragment>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text variant="body" color="textSecondary" align="center">
                    No app usage data yet
                  </Text>
                </View>
              )}
            </Card>
          </Animated.View>
          <Spacer size="lg" />
          {sortedCategories.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Text variant="h4">By Category</Text>
              <Spacer size="sm" />
              <Card variant="outlined">
                {sortedCategories.map(([category, time], index) => (
                  <React.Fragment key={category}>
                    {index > 0 && (
                      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                    )}
                    <CategoryUsageBar
                      category={category as AppCategory}
                      timeMs={time as number}
                      totalMs={totalScreenTime}
                    />
                  </React.Fragment>
                ))}
              </Card>
            </Animated.View>
          )}
          <Spacer size="lg" />
          {weeklySummary && (
            <Animated.View entering={FadeInDown.delay(400).duration(400)}>
              <Text variant="h4">This Week</Text>
              <Spacer size="sm" />
              <Card variant="filled">
                <View style={styles.weeklyStats}>
                  <View style={styles.weeklyStatItem}>
                    <Text variant="caption" color="textSecondary">
                      Average Daily
                    </Text>
                    <Text variant="h4">
                      {formatScreenTime(weeklySummary.averageDailyScreenTime)}
                    </Text>
                  </View>
                  <View style={styles.weeklyStatItem}>
                    <Text variant="caption" color="textSecondary">
                      vs Last Week
                    </Text>
                    <Text
                      variant="h4"
                      style={{
                        color:
                          weeklySummary.weekOverWeekChange > 0
                            ? theme.colors.error
                            : theme.colors.success,
                      }}
                    >
                      {weeklySummary.weekOverWeekChange > 0 ? '+' : ''}
                      {weeklySummary.weekOverWeekChange}%
                    </Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
          )}
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <Button variant="outline" onPress={handleManageLimits} fullWidth>
              Manage App Limits
            </Button>
          </Animated.View>
          <Spacer size="xl" />
        </Container>
      </ScrollView>
    </SafeArea>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  circleOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleInner: {
    width: 156,
    height: 156,
    borderRadius: 78,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appListCard: {
    padding: 0,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  appItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfo: {
    marginLeft: 12,
    flex: 1,
  },
  appItemRight: {
    width: 80,
  },
  appProgress: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  appProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 64,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryLabel: {
    textTransform: 'capitalize',
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weeklyStatItem: {
    alignItems: 'center',
  },
  emptyState: {
    padding: 24,
  },
});
export default UsageDashboardScreen;
