import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@theme';
import { useUserProfile, useCurrentUser, useAuthActions } from '@stores/auth';
import { useActivityStreak } from '@stores/activity';
import {
  SafeArea,
  Container,
  Text,
  Card,
  Spacer,
  Icon,
  Divider,
  Avatar,
} from '@shared/components';
import { formatNumber } from '@shared/utils';
import type { SettingsStackParamList } from '@shared/types';

type ProfileNavigationProp = NativeStackNavigationProp<
  SettingsStackParamList,
  'Profile'
>;

interface StatItemProps {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

function StatItem({ icon, label, value, color }: StatItemProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.statItem}>
      <Icon name={icon} size="md" color={color ?? theme.colors.primary} />
      <Text variant="h3" style={{ marginTop: 8 }}>
        {value}
      </Text>
      <Text variant="caption" color="textSecondary">
        {label}
      </Text>
    </View>
  );
}

function MenuItem({ icon, label, onPress, showChevron = true, danger = false }: MenuItemProps) {
  const { theme } = useTheme();
  const textColor = danger ? theme.colors.error : theme.colors.text;
  const iconColor = danger ? theme.colors.error : theme.colors.textSecondary;
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <Icon name={icon} size="md" color={iconColor} />
        <Text variant="body" style={[styles.menuItemLabel, { color: textColor }]}>
          {label}
        </Text>
      </View>
      {showChevron && (
        <Icon name="forward" size="sm" color={theme.colors.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { theme } = useTheme();
  const profile = useUserProfile();
  const user = useCurrentUser();
  const streak = useActivityStreak();
  const { signOut } = useAuthActions();

  const goTo = (screen: keyof SettingsStackParamList) => () => navigation.navigate(screen as never);

  const onSignOut = async () => {
    await signOut();
  };

  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="lg">
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={styles.header}
          >
            <TouchableOpacity onPress={goTo('EditProfile')} activeOpacity={0.8}>
              <Avatar
                size="xl"
                source={profile?.photoURL ? { uri: profile.photoURL } : undefined}
                name={profile?.displayName}
              />
              <View
                style={[
                  styles.editBadge,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Icon name="edit" size="xs" color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Spacer size="md" />
            <Text variant="h2" align="center">
              {profile?.displayName ?? 'User'}
            </Text>
            <Text variant="body" color="textSecondary" align="center">
              {profile?.email}
            </Text>
            {user?.isAnonymous && (
              <View
                style={[
                  styles.anonymousBadge,
                  { backgroundColor: theme.colors.warning + '20' },
                ]}
              >
                <Text
                  variant="caption"
                  style={{ color: theme.colors.warning }}
                >
                  Anonymous Account
                </Text>
              </View>
            )}
          </Animated.View>

          <Spacer size="xl" />

          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Card variant="elevated">
              <View style={styles.statsContainer}>
                <StatItem
                  icon="trophy"
                  label="Level"
                  value={profile?.level ?? 1}
                  color={theme.colors.primary}
                />
                <View
                  style={[
                    styles.statDivider,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
                <StatItem
                  icon="star"
                  label="Total XP"
                  value={formatNumber(profile?.totalXP ?? 0)}
                  color={theme.colors.accent}
                />
                <View
                  style={[
                    styles.statDivider,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
                <StatItem
                  icon="timer"
                  label="Streak"
                  value={streak?.currentStreak ?? 0}
                  color={theme.colors.secondary}
                />
              </View>
            </Card>
          </Animated.View>

          <Spacer size="xl" />

          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Settings
            </Text>
            <Card variant="outlined" style={styles.menuCard}>
              <MenuItem
                icon="user"
                label="Edit Profile"
                onPress={goTo('EditProfile')}
              />
              <Divider />
              <MenuItem
                icon="notification"
                label="Notifications"
                onPress={goTo('NotificationSettings')}
              />
              <Divider />
              <MenuItem
                icon="lock"
                label="Privacy"
                onPress={goTo('PrivacySettings')}
              />
              <Divider />
              <MenuItem
                icon="timer"
                label="Screen Time"
                onPress={goTo('ScreenTimeSettings')}
              />
              <Divider />
              <MenuItem
                icon="settings"
                label="Appearance"
                onPress={goTo('AppearanceSettings')}
              />
              <Divider />
              <MenuItem
                icon="camera"
                label="Photo Verification"
                onPress={goTo('PhotoVerificationSettings')}
              />
            </Card>
          </Animated.View>

          <Spacer size="lg" />

          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Account
            </Text>
            <Card variant="outlined" style={styles.menuCard}>
              <MenuItem
                icon="user"
                label="Account Settings"
                onPress={goTo('AccountSettings')}
              />
              <Divider />
              <MenuItem
                icon="help"
                label="Help & Support"
                onPress={goTo('Help')}
              />
              <Divider />
              <MenuItem
                icon="info"
                label="About"
                onPress={goTo('About')}
              />
            </Card>
          </Animated.View>

          <Spacer size="lg" />

          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <Card variant="outlined" style={styles.menuCard}>
              <MenuItem
                icon="logout"
                label="Sign Out"
                onPress={onSignOut}
                showChevron={false}
                danger
              />
            </Card>
          </Animated.View>

          <Spacer size="xl" />
          <Text variant="caption" color="textTertiary" align="center">
            MindfulTime v1.0.0
          </Text>
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
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  anonymousBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    marginLeft: 12,
  },
});

export default ProfileScreen;
