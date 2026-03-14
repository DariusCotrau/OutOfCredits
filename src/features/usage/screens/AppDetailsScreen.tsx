import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '@theme';
import { useUsageStore, useUsageActions } from '@stores/usage';
import {
  SafeArea,
  Container,
  Text,
  Card,
  Button,
  Spacer,
  Icon,
  IconButton,
  Switch,
} from '@shared/components';
import { formatScreenTime } from '@shared/utils';
import type { AppUsageRecord, AppLimit } from '@services/usage';
import type { UsageStackParamList } from '@shared/types';
type AppDetailsRouteProp = RouteProp<UsageStackParamList, 'AppDetails'>;
const LIMIT_PRESETS = [
  { label: '15 min', ms: 15 * 60 * 1000 },
  { label: '30 min', ms: 30 * 60 * 1000 },
  { label: '1 hour', ms: 60 * 60 * 1000 },
  { label: '2 hours', ms: 2 * 60 * 60 * 1000 },
  { label: '3 hours', ms: 3 * 60 * 60 * 1000 },
];
export function AppDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<AppDetailsRouteProp>();
  const { theme } = useTheme();
  const { packageName } = route.params;
  const { createLimit, updateLimit, deleteLimit, toggleLimit } = useUsageActions();
  const todayUsage = useUsageStore((s) => s.todayUsage);
  const limits = useUsageStore((s) => s.limits);
  const [app, setApp] = useState<AppUsageRecord | undefined>();
  const [limit, setLimit] = useState<AppLimit | undefined>();
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    const appData = todayUsage.find((u) => u.packageName === packageName);
    setApp(appData);
    const appLimit = limits.find(
      (l) => l.type === 'app' && l.target === packageName
    );
    setLimit(appLimit);
    if (appLimit) {
      const presetIndex = LIMIT_PRESETS.findIndex(
        (p) => p.ms === appLimit.dailyLimitMs
      );
      setSelectedPreset(presetIndex >= 0 ? presetIndex : null);
    }
  }, [packageName, todayUsage, limits]);
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const handlePresetSelect = useCallback(
    async (index: number) => {
      setSelectedPreset(index);
      setIsSaving(true);
      const preset = LIMIT_PRESETS[index];
      try {
        if (limit) {
          await updateLimit(limit.id, { dailyLimitMs: preset.ms });
        } else {
          await createLimit({
            target: packageName,
            type: 'app',
            dailyLimitMs: preset.ms,
            isActive: true,
            activeDays: [0, 1, 2, 3, 4, 5, 6],
            action: 'notify',
            gracePeriodMinutes: 5,
          });
        }
      } catch (error) {
      } finally {
        setIsSaving(false);
      }
    },
    [limit, packageName, updateLimit, createLimit]
  );
  const handleToggleLimit = useCallback(async () => {
    if (limit) {
      await toggleLimit(limit.id);
    }
  }, [limit, toggleLimit]);
  const handleRemoveLimit = useCallback(async () => {
    if (limit) {
      await deleteLimit(limit.id);
      setSelectedPreset(null);
    }
  }, [limit, deleteLimit]);
  const usagePercentage = limit && app
    ? Math.min(100, (app.totalTimeInForeground / limit.dailyLimitMs) * 100)
    : 0;
  const remainingTime = limit && app
    ? Math.max(0, limit.dailyLimitMs - app.totalTimeInForeground)
    : 0;
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <IconButton icon="back" onPress={handleBack} variant="ghost" size="md" />
        <Text variant="h4" numberOfLines={1} style={styles.headerTitle}>
          {app?.appName ?? 'App Details'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="lg">
          <Animated.View entering={FadeInDown.duration(400)}>
            <Card variant="elevated">
              <View style={styles.appHeader}>
                <View
                  style={[
                    styles.appIconLarge,
                    { backgroundColor: theme.colors.primary + '15' },
                  ]}
                >
                  <Text style={{ fontSize: 40 }}>📱</Text>
                </View>
                <Spacer size="md" />
                <Text variant="h3" align="center">
                  {app?.appName ?? packageName}
                </Text>
                <Text variant="caption" color="textSecondary" align="center">
                  {app?.category ?? 'Unknown category'}
                </Text>
              </View>
            </Card>
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text variant="h4">Today's Usage</Text>
            <Spacer size="sm" />
            <Card variant="outlined">
              <View style={styles.usageStats}>
                <View style={styles.usageStatItem}>
                  <Icon name="timer" size="md" color={theme.colors.primary} />
                  <Spacer size="xs" />
                  <Text variant="h3">
                    {formatScreenTime(app?.totalTimeInForeground ?? 0)}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    Time Used
                  </Text>
                </View>
                <View
                  style={[styles.usageStatDivider, { backgroundColor: theme.colors.border }]}
                />
                <View style={styles.usageStatItem}>
                  <Icon name="refresh" size="md" color={theme.colors.accent} />
                  <Spacer size="xs" />
                  <Text variant="h3">{app?.launchCount ?? 0}</Text>
                  <Text variant="caption" color="textSecondary">
                    Opens
                  </Text>
                </View>
              </View>
              {limit && limit.isActive && (
                <>
                  <Spacer size="md" />
                  <View style={styles.limitProgress}>
                    <View style={styles.limitProgressHeader}>
                      <Text variant="bodySmall" color="textSecondary">
                        Daily Limit: {formatScreenTime(limit.dailyLimitMs)}
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={{
                          color:
                            usagePercentage >= 100
                              ? theme.colors.error
                              : theme.colors.textSecondary,
                        }}
                      >
                        {formatScreenTime(remainingTime)} left
                      </Text>
                    </View>
                    <Spacer size="xs" />
                    <View
                      style={[
                        styles.progressBar,
                        { backgroundColor: theme.colors.surfaceVariant },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${usagePercentage}%`,
                            backgroundColor:
                              usagePercentage >= 100
                                ? theme.colors.error
                                : usagePercentage >= 80
                                ? theme.colors.warning
                                : theme.colors.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </>
              )}
            </Card>
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text variant="h4">Daily Limit</Text>
            <Spacer size="sm" />
            <Card variant="outlined">
              {limit && (
                <>
                  <Switch
                    value={limit.isActive}
                    onValueChange={handleToggleLimit}
                    label="Enable Limit"
                    description="Notify when limit is reached"
                  />
                  <Spacer size="md" />
                </>
              )}
              <Text variant="bodySmall" color="textSecondary">
                Choose a daily limit:
              </Text>
              <Spacer size="sm" />
              <View style={styles.presetGrid}>
                {LIMIT_PRESETS.map((preset, index) => (
                  <Animated.View
                    key={preset.label}
                    entering={FadeInDown.delay(250 + index * 50).duration(300)}
                  >
                    <Button
                      variant={selectedPreset === index ? 'primary' : 'outline'}
                      size="sm"
                      onPress={() => handlePresetSelect(index)}
                      disabled={isSaving}
                      style={styles.presetButton}
                    >
                      {preset.label}
                    </Button>
                  </Animated.View>
                ))}
              </View>
              {limit && (
                <>
                  <Spacer size="md" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={handleRemoveLimit}
                    style={{ alignSelf: 'center' }}
                  >
                    Remove Limit
                  </Button>
                </>
              )}
            </Card>
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Text variant="h4">Details</Text>
            <Spacer size="sm" />
            <Card variant="filled">
              <View style={styles.detailRow}>
                <Text variant="body" color="textSecondary">
                  Package
                </Text>
                <Text variant="bodySmall" numberOfLines={1} style={styles.detailValue}>
                  {packageName}
                </Text>
              </View>
              <View style={[styles.detailDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.detailRow}>
                <Text variant="body" color="textSecondary">
                  Last Used
                </Text>
                <Text variant="body">
                  {app?.lastTimeUsed
                    ? new Date(app.lastTimeUsed).toLocaleTimeString()
                    : 'N/A'}
                </Text>
              </View>
              <View style={[styles.detailDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.detailRow}>
                <Text variant="body" color="textSecondary">
                  System App
                </Text>
                <Text variant="body">{app?.isSystemApp ? 'Yes' : 'No'}</Text>
              </View>
            </Card>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  scrollContent: {
    flexGrow: 1,
  },
  appHeader: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  appIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  usageStatItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  usageStatDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: 8,
  },
  limitProgress: {},
  limitProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    minWidth: 80,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
  },
});
export default AppDetailsScreen;
