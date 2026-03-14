import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTheme } from '@theme';
import { Text, Spacer, Icon } from '@shared/components';
import { useCurrentUser, useUserProfile } from '@stores/auth';
import { useUsageActions } from '@stores/usage';
import { useActivityActions } from '@stores/activity';
import { useGamificationActions } from '@stores/gamification';
import {
  ScreenTimeWidget,
  MindfulnessWidget,
  DailyGoalWidget,
} from '../widgets';
import type { MainTabParamList, UsageStackParamList, ActivityStackParamList, GamificationStackParamList } from '@shared/types/navigation';

type DashboardNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<UsageStackParamList & ActivityStackParamList & GamificationStackParamList>
>;

export function DashboardScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DashboardNavigationProp>();
  const user = useCurrentUser();
  const profile = useUserProfile();
  const { refreshAllData: refreshUsage } = useUsageActions();
  const { refreshAll: refreshActivity } = useActivityActions();
  const { refreshAll: refreshGamification } = useGamificationActions();
  const firstName = (profile?.displayName ?? user?.displayName ?? '').split(' ')[0] || 'User';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    if (user?.uid) {
      refreshUsage();
      refreshActivity(user.uid);
      refreshGamification(user.uid);
    }
  }, [user?.uid, refreshUsage, refreshActivity, refreshGamification]);

  const goToUsage = () => navigation.navigate('Usage', { screen: 'UsageDashboard' });
  const goToRewards = () => navigation.navigate('Gamification', { screen: 'Rewards' });
  const goToActivity = () => navigation.navigate('Activity', { screen: 'ActivityList' });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text variant="h2" color="text">
            {getGreeting()},
          </Text>
          <Text variant="h1" color="primary">
            {firstName}
          </Text>
        </View>
        <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary + '20' }]}>
          <Icon name="user" size={24} color={theme.colors.primary} />
        </View>
      </View>
      <Spacer size="lg" />
      <DailyGoalWidget onPress={goToRewards} />
      <Spacer size="md" />
      <View style={styles.widgetsRow}>
        <View style={styles.halfWidget}>
          <ScreenTimeWidget onPress={goToUsage} />
        </View>
        <View style={styles.halfWidget}>
          <MindfulnessWidget onPress={goToActivity} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidget: {
    flex: 1,
  },
});

export default DashboardScreen;
