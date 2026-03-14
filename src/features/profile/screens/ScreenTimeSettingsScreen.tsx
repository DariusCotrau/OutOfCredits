import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import { useUserSettings, useAuthActions } from '@stores/auth';
import {
  SafeArea,
  Container,
  Text,
  Card,
  Spacer,
  Switch,
  Divider,
  IconButton,
  Button,
} from '@shared/components';
import { formatDuration } from '@shared/utils';
import type { GoalSettings } from '@shared/types';
export function ScreenTimeSettingsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const settings = useUserSettings();
  const { updateSettings } = useAuthActions();
  const [isUpdating, setIsUpdating] = useState(false);
  const goals: GoalSettings = settings?.goals ?? {
    defaultDailyGoal: 120,
    useAppLimits: true,
    weeklyGoal: 840,
    dailyMindfulMinutes: 15,
    adaptiveGoals: true,
  };
  type GoalToggleKey = keyof Pick<GoalSettings, 'useAppLimits' | 'adaptiveGoals'>;
  const handleToggle = useCallback(
    async (key: GoalToggleKey, value: boolean) => {
      setIsUpdating(true);
      try {
        await updateSettings({
          goals: { ...goals, [key]: value },
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to update settings');
      } finally {
        setIsUpdating(false);
      }
    },
    [goals, updateSettings]
  );
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const handleSetGoal = useCallback(() => {
    Alert.alert(
      'Set Daily Goal',
      'Choose your daily screen time goal',
      [
        { text: '1 hour', onPress: () => updateSettings({ goals: { ...goals, defaultDailyGoal: 60 } }) },
        { text: '2 hours', onPress: () => updateSettings({ goals: { ...goals, defaultDailyGoal: 120 } }) },
        { text: '3 hours', onPress: () => updateSettings({ goals: { ...goals, defaultDailyGoal: 180 } }) },
        { text: '4 hours', onPress: () => updateSettings({ goals: { ...goals, defaultDailyGoal: 240 } }) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [goals, updateSettings]);
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <IconButton icon="back" onPress={handleBack} variant="ghost" size="md" />
        <Text variant="h4">Screen Time</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Container padding="lg">
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Daily Goal
            </Text>
            <Card variant="elevated">
              <View style={styles.goalContainer}>
                <Text variant="h1" color="primary">
                  {formatDuration(goals.defaultDailyGoal * 60 * 1000)}
                </Text>
                <Text variant="body" color="textSecondary">
                  Daily screen time limit
                </Text>
                <Spacer size="md" />
                <Button variant="outline" size="sm" onPress={handleSetGoal}>
                  Change Goal
                </Button>
              </View>
            </Card>
          </Animated.View>
          <Spacer size="xl" />
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Limits
            </Text>
            <Card variant="outlined" style={styles.settingsCard}>
              <Switch
                value={goals.useAppLimits}
                onValueChange={(v) => handleToggle('useAppLimits', v)}
                label="Use App Limits"
                description="Enable per-app screen time limits"
                disabled={isUpdating}
              />
            </Card>
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Adaptive Goals
            </Text>
            <Card variant="outlined" style={styles.settingsCard}>
              <Switch
                value={goals.adaptiveGoals}
                onValueChange={(v) => handleToggle('adaptiveGoals', v)}
                label="Adaptive Goals"
                description="Automatically adjust goals based on your progress"
                disabled={isUpdating}
              />
            </Card>
            <Spacer size="sm" />
            <Text variant="caption" color="textTertiary">
              Adaptive goals will update your targets over time.
            </Text>
          </Animated.View>
        </Container>
      </ScrollView>
    </SafeArea>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSpacer: { width: 48 },
  scrollContent: { flexGrow: 1 },
  sectionTitle: { marginBottom: 8, marginLeft: 4 },
  goalContainer: { alignItems: 'center', paddingVertical: 16 },
  settingsCard: { padding: 0, overflow: 'hidden' },
});
export default ScreenTimeSettingsScreen;
