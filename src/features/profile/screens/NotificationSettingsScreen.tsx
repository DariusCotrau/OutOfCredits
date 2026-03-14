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
} from '@shared/components';
import type { NotificationSettings } from '@shared/types';
export function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const settings = useUserSettings();
  const { updateSettings } = useAuthActions();
  const [isUpdating, setIsUpdating] = useState(false);
  const notifications: NotificationSettings = settings?.notifications ?? {
    enabled: true,
    usageAlerts: true,
    usageAlertThreshold: 80,
    activityReminders: true,
    badgeUnlocks: true,
    socialUpdates: true,
    dailySummary: true,
    dailySummaryTime: '09:00',
    weeklyReport: true,
    weeklyReportDay: 'monday',
    streakReminders: true,
    doNotDisturb: {
      enabled: false,
      startTime: '22:00',
      endTime: '07:00',
      activeDays: [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ],
    },
  };
  type NotificationToggleKey = keyof Pick<
    NotificationSettings,
    | 'enabled'
    | 'usageAlerts'
    | 'activityReminders'
    | 'badgeUnlocks'
    | 'socialUpdates'
    | 'dailySummary'
    | 'weeklyReport'
    | 'streakReminders'
  >;
  const handleToggle = useCallback(
    async (key: NotificationToggleKey, value: boolean) => {
      setIsUpdating(true);
      try {
        await updateSettings({
          notifications: {
            ...notifications,
            [key]: value,
          },
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to update settings');
      } finally {
        setIsUpdating(false);
      }
    },
    [notifications, updateSettings]
  );
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <IconButton
          icon="back"
          onPress={handleBack}
          variant="ghost"
          size="md"
        />
        <Text variant="h4">Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="lg">
          <Animated.View entering={FadeInDown.duration(400)}>
            <Card variant="elevated">
              <Switch
                value={notifications.enabled}
                onValueChange={(value) => handleToggle('enabled', value)}
                label="Enable Notifications"
                description="Receive push notifications from MindfulTime"
                disabled={isUpdating}
              />
            </Card>
          </Animated.View>
          <Spacer size="xl" />
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Reminders
            </Text>
            <Card variant="outlined" style={styles.settingsCard}>
              <Switch
                value={notifications.activityReminders}
                onValueChange={(value) => handleToggle('activityReminders', value)}
                label="Daily Reminder"
                description="Remind me to practice mindfulness"
                disabled={isUpdating || !notifications.enabled}
              />
              <Divider insetStart={16} />
              <Switch
                value={notifications.streakReminders}
                onValueChange={(value) => handleToggle('streakReminders', value)}
                label="Streak Reminder"
                description="Remind me to maintain my streak"
                disabled={isUpdating || !notifications.enabled}
              />
              <Divider insetStart={16} />
              <Switch
                value={notifications.usageAlerts}
                onValueChange={(value) => handleToggle('usageAlerts', value)}
                label="Usage Limit Warnings"
                description="Notify when approaching app limits"
                disabled={isUpdating || !notifications.enabled}
              />
            </Card>
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Activity
            </Text>
            <Card variant="outlined" style={styles.settingsCard}>
              <Switch
                value={notifications.badgeUnlocks}
                onValueChange={(value) => handleToggle('badgeUnlocks', value)}
                label="Achievements"
                description="Notify when I earn badges or level up"
                disabled={isUpdating || !notifications.enabled}
              />
              <Divider insetStart={16} />
              <Switch
                value={notifications.socialUpdates}
                onValueChange={(value) => handleToggle('socialUpdates', value)}
                label="Friend Activity"
                description="Notify about friend requests and updates"
                disabled={isUpdating || !notifications.enabled}
              />
              <Divider insetStart={16} />
              <Switch
                value={notifications.weeklyReport}
                onValueChange={(value) => handleToggle('weeklyReport', value)}
                label="Weekly Report"
                description="Receive weekly screen time summary"
                disabled={isUpdating || !notifications.enabled}
              />
            </Card>
          </Animated.View>
          <Spacer size="xl" />
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Text variant="caption" color="textTertiary" align="center">
              You can also manage notifications in your device settings.
            </Text>
          </Animated.View>
          <Spacer size="lg" />
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
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSpacer: {
    width: 48,
  },
  scrollContent: {
    flexGrow: 1,
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
});
export default NotificationSettingsScreen;
