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
import type { PrivacySettings } from '@shared/types';
export function PrivacySettingsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const settings = useUserSettings();
  const { updateSettings } = useAuthActions();
  const [isUpdating, setIsUpdating] = useState(false);
  const privacy: PrivacySettings = settings?.privacy ?? {
    showOnLeaderboard: true,
    useRealName: true,
    friendRequests: 'everyone',
    activityVisibility: 'friends',
    shareUsageStats: true,
    analyticsEnabled: true,
  };
  type PrivacyToggleKey = keyof Pick<
    PrivacySettings,
    'showOnLeaderboard' | 'useRealName' | 'shareUsageStats' | 'analyticsEnabled'
  >;
  const handleToggle = useCallback(
    async (key: PrivacyToggleKey, value: boolean) => {
      setIsUpdating(true);
      try {
        await updateSettings({
          privacy: { ...privacy, [key]: value },
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to update settings');
      } finally {
        setIsUpdating(false);
      }
    },
    [privacy, updateSettings]
  );
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <IconButton icon="back" onPress={handleBack} variant="ghost" size="md" />
        <Text variant="h4">Privacy</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Container padding="lg">
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Profile
            </Text>
            <Card variant="outlined" style={styles.settingsCard}>
              <Switch
                value={privacy.showOnLeaderboard}
                onValueChange={(v) => handleToggle('showOnLeaderboard', v)}
                label="Show on Leaderboard"
                description="Allow your profile to appear in rankings"
                disabled={isUpdating}
              />
              <Divider insetStart={16} />
              <Switch
                value={privacy.useRealName}
                onValueChange={(v) => handleToggle('useRealName', v)}
                label="Show Real Name"
                description="Display your real name in your profile"
                disabled={isUpdating}
              />
              <Divider insetStart={16} />
              <Switch
                value={privacy.shareUsageStats}
                onValueChange={(v) => handleToggle('shareUsageStats', v)}
                label="Share Usage Stats"
                description="Allow friends to see your usage stats"
                disabled={isUpdating}
              />
              <Divider insetStart={16} />
              <Switch
                value={privacy.analyticsEnabled}
                onValueChange={(v) => handleToggle('analyticsEnabled', v)}
                label="Analytics"
                description="Allow anonymous analytics collection"
                disabled={isUpdating}
              />
            </Card>
          </Animated.View>
          <Spacer size="xl" />
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text variant="caption" color="textTertiary" align="center">
              Your data is stored securely and never shared with third parties.
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
  settingsCard: { padding: 0, overflow: 'hidden' },
});
export default PrivacySettingsScreen;
