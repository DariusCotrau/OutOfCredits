import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '@theme';
import { useUsageStore, useUsageActions } from '@stores/usage';
import { usageStatsService, type AppUsageRecord } from '@services/usage';
import {
  SafeArea,
  Container,
  Text,
  Card,
  Button,
  Spacer,
  Icon,
  IconButton,
} from '@shared/components';
import { formatScreenTime } from '@shared/utils';
import type { UsageStackParamList } from '@shared/types';
type CreateLimitRouteProp = RouteProp<UsageStackParamList, 'CreateLimit'>;
type LimitType = 'app' | 'category';
type LimitAction = 'notify' | 'block' | 'both';
interface DayOption {
  key: number;
  label: string;
  shortLabel: string;
}
const DAYS_OF_WEEK: DayOption[] = [
  { key: 0, label: 'Sunday', shortLabel: 'S' },
  { key: 1, label: 'Monday', shortLabel: 'M' },
  { key: 2, label: 'Tuesday', shortLabel: 'T' },
  { key: 3, label: 'Wednesday', shortLabel: 'W' },
  { key: 4, label: 'Thursday', shortLabel: 'T' },
  { key: 5, label: 'Friday', shortLabel: 'F' },
  { key: 6, label: 'Saturday', shortLabel: 'S' },
];
const TIME_PRESETS = [
  { label: '15 min', ms: 15 * 60 * 1000 },
  { label: '30 min', ms: 30 * 60 * 1000 },
  { label: '45 min', ms: 45 * 60 * 1000 },
  { label: '1 hour', ms: 60 * 60 * 1000 },
  { label: '1.5 hours', ms: 90 * 60 * 1000 },
  { label: '2 hours', ms: 2 * 60 * 60 * 1000 },
  { label: '3 hours', ms: 3 * 60 * 60 * 1000 },
  { label: '4 hours', ms: 4 * 60 * 60 * 1000 },
];
const GRACE_PERIOD_OPTIONS = [
  { label: 'No grace period', minutes: 0 },
  { label: '5 minutes', minutes: 5 },
  { label: '10 minutes', minutes: 10 },
  { label: '15 minutes', minutes: 15 },
];
const CATEGORIES = [
  'social',
  'entertainment',
  'productivity',
  'games',
  'communication',
  'news',
  'other',
];
export function CreateLimitScreen() {
  const navigation = useNavigation();
  const route = useRoute<CreateLimitRouteProp>();
  const { theme } = useTheme();
  const todayUsage = useUsageStore(s => s.todayUsage);
  const { createLimit } = useUsageActions();
  const initialPackageName = route.params?.packageName;
  const initialCategory = route.params?.category;
  const [limitType, setLimitType] = useState<LimitType>(initialCategory ? 'category' : 'app');
  const [selectedApp, setSelectedApp] = useState<string | null>(initialPackageName ?? null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory ?? null);
  const [selectedTimePreset, setSelectedTimePreset] = useState<number>(3);
  const [activeDays, setActiveDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [action, setAction] = useState<LimitAction>('notify');
  const [gracePeriodIndex, setGracePeriodIndex] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAppPicker, setShowAppPicker] = useState(false);
  const [installedApps, setInstalledApps] = useState<AppUsageRecord[]>([]);
  const [isLoadingInstalledApps, setIsLoadingInstalledApps] = useState(false);
  useEffect(() => {
    let isMounted = true;
    const loadInstalledApps = async () => {
      setIsLoadingInstalledApps(true);
      try {
        const result = await usageStatsService.getInstalledApps(true);
        if (!isMounted) return;
        if (result.success && result.data) {
          const normalizedApps = result.data.map(app => ({
            ...app,
            totalTimeInForeground: app.totalTimeInForeground ?? 0,
            launchCount: app.launchCount ?? 0,
            lastTimeUsed: app.lastTimeUsed ?? 0,
            firstTimeUsed: app.firstTimeUsed ?? 0,
          }));
          setInstalledApps(normalizedApps);
        }
      } catch {
        if (isMounted) {
          setInstalledApps([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingInstalledApps(false);
        }
      }
    };
    loadInstalledApps();
    return () => {
      isMounted = false;
    };
  }, []);
  const availableApps = useMemo(() => {
    const mergedApps = new Map<string, AppUsageRecord>();
    installedApps.forEach(app => {
      mergedApps.set(app.packageName, app);
    });
    todayUsage.forEach(app => {
      const installedApp = mergedApps.get(app.packageName);
      if (installedApp) {
        mergedApps.set(app.packageName, {
          ...installedApp,
          ...app,
          appName: app.appName || installedApp.appName,
          category: app.category ?? installedApp.category,
        });
      } else {
        mergedApps.set(app.packageName, app);
      }
    });
    return Array.from(mergedApps.values()).sort((a, b) => {
      const usageDiff = b.totalTimeInForeground - a.totalTimeInForeground;
      if (usageDiff !== 0) return usageDiff;
      return a.appName.localeCompare(b.appName);
    });
  }, [installedApps, todayUsage]);
  const selectedAppDetails = useMemo(() => {
    if (!selectedApp) return null;
    return availableApps.find(a => a.packageName === selectedApp) ?? null;
  }, [selectedApp, availableApps]);
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const toggleDay = useCallback((day: number) => {
    setActiveDays(prev => {
      if (prev.includes(day)) {
        if (prev.length === 1) return prev;
        return prev.filter(d => d !== day);
      }
      return [...prev, day].sort();
    });
  }, []);
  const selectAllDays = useCallback(() => {
    setActiveDays([0, 1, 2, 3, 4, 5, 6]);
  }, []);
  const selectWeekdays = useCallback(() => {
    setActiveDays([1, 2, 3, 4, 5]);
  }, []);
  const selectWeekends = useCallback(() => {
    setActiveDays([0, 6]);
  }, []);
  const isFormValid = useMemo(() => {
    if (limitType === 'app' && !selectedApp) return false;
    if (limitType === 'category' && !selectedCategory) return false;
    if (activeDays.length === 0) return false;
    return true;
  }, [limitType, selectedApp, selectedCategory, activeDays]);
  const handleCreateLimit = useCallback(async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      const target = limitType === 'app' ? selectedApp! : selectedCategory!;
      const dailyLimitMs = TIME_PRESETS[selectedTimePreset].ms;
      const gracePeriodMinutes = GRACE_PERIOD_OPTIONS[gracePeriodIndex].minutes;
      await createLimit({
        target,
        type: limitType,
        dailyLimitMs,
        isActive: true,
        activeDays,
        action,
        gracePeriodMinutes,
      });
      Alert.alert(
        'Limit Created',
        `Your ${formatScreenTime(dailyLimitMs)} daily limit has been set.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create limit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isFormValid,
    limitType,
    selectedApp,
    selectedCategory,
    selectedTimePreset,
    gracePeriodIndex,
    activeDays,
    action,
    createLimit,
    navigation,
  ]);
  const renderAppSelector = () => (
    <Card variant="outlined">
      <Text variant="bodySmall" color="textSecondary">
        Select App
      </Text>
      <Spacer size="sm" />
      {selectedApp ? (
        <TouchableOpacity style={styles.selectedItem} onPress={() => setShowAppPicker(true)}>
          <View style={[styles.appIcon, { backgroundColor: theme.colors.primary + '15' }]}>
            <Icon name="apps" size="md" color={theme.colors.primary} />
          </View>
          <View style={styles.appInfo}>
            <Text variant="body">{selectedAppDetails?.appName ?? selectedApp}</Text>
            <Text variant="caption" color="textSecondary">
              {selectedAppDetails?.category ?? 'Tap to change'}
            </Text>
          </View>
          <Icon name="chevronRight" size="sm" color={theme.colors.textSecondary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.selectButton, { borderColor: theme.colors.border }]}
          onPress={() => setShowAppPicker(true)}>
          <Icon name="plus" size="sm" color={theme.colors.primary} />
          <Text variant="body" style={{ color: theme.colors.primary, marginLeft: 8 }}>
            Choose an app
          </Text>
        </TouchableOpacity>
      )}
      {showAppPicker && (
        <View style={styles.appList}>
          <Spacer size="sm" />
          {isLoadingInstalledApps ? (
            <Text variant="bodySmall" color="textSecondary">
              Loading apps...
            </Text>
          ) : availableApps.length === 0 ? (
            <Text variant="bodySmall" color="textSecondary">
              No apps available.
            </Text>
          ) : (
            availableApps.map(app => (
              <TouchableOpacity
                key={app.packageName}
                style={[
                  styles.appListItem,
                  selectedApp === app.packageName && {
                    backgroundColor: theme.colors.primary + '10',
                  },
                ]}
                onPress={() => {
                  setSelectedApp(app.packageName);
                  setShowAppPicker(false);
                }}>
                <View
                  style={[styles.appIconSmall, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Icon name="apps" size="sm" color={theme.colors.textSecondary} />
                </View>
                <Text variant="bodySmall" style={{ flex: 1 }}>
                  {app.appName}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {app.totalTimeInForeground > 0
                    ? formatScreenTime(app.totalTimeInForeground)
                    : 'No usage today'}
                </Text>
              </TouchableOpacity>
            ))
          )}
          <Spacer size="sm" />
          <Button variant="ghost" size="sm" onPress={() => setShowAppPicker(false)}>
            Cancel
          </Button>
        </View>
      )}
    </Card>
  );
  const renderCategorySelector = () => (
    <Card variant="outlined">
      <Text variant="bodySmall" color="textSecondary">
        Select Category
      </Text>
      <Spacer size="sm" />
      <View style={styles.categoryGrid}>
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  selectedCategory === category ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setSelectedCategory(category)}>
            <Text
              variant="bodySmall"
              style={{
                color: selectedCategory === category ? '#fff' : theme.colors.text,
                textTransform: 'capitalize',
              }}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <IconButton icon="back" onPress={handleBack} variant="ghost" size="md" />
        <Text variant="h4" style={styles.headerTitle}>
          Create Limit
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Container padding="lg">
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text variant="h4">Limit Type</Text>
            <Spacer size="sm" />
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  {
                    backgroundColor:
                      limitType === 'app' ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setLimitType('app')}>
                <Icon
                  name="apps"
                  size="md"
                  color={limitType === 'app' ? '#fff' : theme.colors.text}
                />
                <Spacer size="xs" />
                <Text
                  variant="body"
                  style={{ color: limitType === 'app' ? '#fff' : theme.colors.text }}>
                  Single App
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  {
                    backgroundColor:
                      limitType === 'category' ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setLimitType('category')}>
                <Icon
                  name="category"
                  size="md"
                  color={limitType === 'category' ? '#fff' : theme.colors.text}
                />
                <Spacer size="xs" />
                <Text
                  variant="body"
                  style={{
                    color: limitType === 'category' ? '#fff' : theme.colors.text,
                  }}>
                  Category
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            {limitType === 'app' ? renderAppSelector() : renderCategorySelector()}
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text variant="h4">Daily Limit</Text>
            <Spacer size="sm" />
            <Card variant="outlined">
              <View style={styles.timePresets}>
                {TIME_PRESETS.map((preset, index) => (
                  <TouchableOpacity
                    key={preset.label}
                    style={[
                      styles.timePreset,
                      {
                        backgroundColor:
                          selectedTimePreset === index
                            ? theme.colors.primary
                            : theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => setSelectedTimePreset(index)}>
                    <Text
                      variant="bodySmall"
                      style={{
                        color: selectedTimePreset === index ? '#fff' : theme.colors.text,
                      }}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Text variant="h4">Active Days</Text>
            <Spacer size="sm" />
            <Card variant="outlined">
              <View style={styles.quickDaySelectors}>
                <TouchableOpacity onPress={selectAllDays}>
                  <Text variant="bodySmall" color="primary">
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={selectWeekdays}>
                  <Text variant="bodySmall" color="primary">
                    Weekdays
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={selectWeekends}>
                  <Text variant="bodySmall" color="primary">
                    Weekends
                  </Text>
                </TouchableOpacity>
              </View>
              <Spacer size="sm" />
              <View style={styles.daysRow}>
                {DAYS_OF_WEEK.map(day => (
                  <TouchableOpacity
                    key={day.key}
                    style={[
                      styles.dayCircle,
                      {
                        backgroundColor: activeDays.includes(day.key)
                          ? theme.colors.primary
                          : theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => toggleDay(day.key)}>
                    <Text
                      variant="bodySmall"
                      style={{
                        color: activeDays.includes(day.key) ? '#fff' : theme.colors.text,
                        fontWeight: '600',
                      }}>
                      {day.shortLabel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <Text variant="h4">When Limit is Reached</Text>
            <Spacer size="sm" />
            <Card variant="outlined">
              <TouchableOpacity style={styles.actionOption} onPress={() => setAction('notify')}>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: action === 'notify' ? theme.colors.primary : theme.colors.border,
                    },
                  ]}>
                  {action === 'notify' && (
                    <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />
                  )}
                </View>
                <View style={styles.actionText}>
                  <Text variant="body">Send Notification</Text>
                  <Text variant="caption" color="textSecondary">
                    Remind you when limit is reached
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <TouchableOpacity style={styles.actionOption} onPress={() => setAction('both')}>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: action === 'both' ? theme.colors.primary : theme.colors.border,
                    },
                  ]}>
                  {action === 'both' && (
                    <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />
                  )}
                </View>
                <View style={styles.actionText}>
                  <Text variant="body">Block & Notify</Text>
                  <Text variant="caption" color="textSecondary">
                    Notify and block when limit is reached
                  </Text>
                </View>
              </TouchableOpacity>
            </Card>
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <Text variant="h4">Grace Period</Text>
            <Text variant="caption" color="textSecondary">
              Extra time after limit is reached
            </Text>
            <Spacer size="sm" />
            <Card variant="outlined">
              <View style={styles.gracePeriodOptions}>
                {GRACE_PERIOD_OPTIONS.map((option, index) => (
                  <TouchableOpacity
                    key={option.label}
                    style={[
                      styles.graceOption,
                      {
                        backgroundColor:
                          gracePeriodIndex === index ? theme.colors.primary : theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => setGracePeriodIndex(index)}>
                    <Text
                      variant="bodySmall"
                      style={{
                        color: gracePeriodIndex === index ? '#fff' : theme.colors.text,
                      }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </Animated.View>
          <Spacer size="xl" />
          <Animated.View entering={FadeInDown.delay(600).duration(400)}>
            <Button
              variant="primary"
              onPress={handleCreateLimit}
              disabled={!isFormValid || isSubmitting}
              loading={isSubmitting}>
              Create Limit
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
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  appList: {
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
    paddingTop: 12,
  },
  appListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  timePresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timePreset: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickDaySelectors: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  actionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  actionText: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  gracePeriodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  graceOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});
export default CreateLimitScreen;
