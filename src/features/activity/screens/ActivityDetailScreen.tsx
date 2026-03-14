import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@theme';
import { useActivityStore, useActivityActions } from '@stores/activity';
import { useAuthStore } from '@stores/auth';
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
import type { ActivityStackParamList } from '@shared/types';
type NavigationProp = NativeStackNavigationProp<ActivityStackParamList, 'ActivityDetail'>;
type ScreenRouteProp = RouteProp<ActivityStackParamList, 'ActivityDetail'>;
const DURATION_PRESETS = [5, 10, 15, 20, 25, 30, 45, 60];

export function ActivityDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { theme } = useTheme();
  const { activityId } = route.params;
  const user = useAuthStore((s) => s.user);
  const activities = useActivityStore((s) => s.activities);
  const isSessionLoading = useActivityStore((s) => s.isSessionLoading);
  const { startSession } = useActivityActions();
  const activity = useMemo(() => {
    return activities.find((a) => a.id === activityId);
  }, [activities, activityId]);
  const [selectedDuration, setSelectedDuration] = useState(
    activity?.defaultDurationMinutes ?? 10
  );
  const [playAudio, setPlayAudio] = useState(activity?.hasAudio ?? true);
  const [playMusic, setPlayMusic] = useState(activity?.hasBackgroundMusic ?? false);
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const handleStartSession = useCallback(async () => {
    if (!activity || !user?.uid) return;
    await startSession(user.uid, activity.id, selectedDuration);
    navigation.navigate('ActivitySession', { activityId: activity.id });
  }, [activity, user, selectedDuration, startSession, navigation]);
  const availableDurations = useMemo(() => {
    if (!activity) return DURATION_PRESETS;
    return DURATION_PRESETS.filter(
      (d) => d >= activity.minDurationMinutes && d <= activity.maxDurationMinutes
    );
  }, [activity]);
  if (!activity) {
    return (
      <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Container padding="lg">
          <Text variant="body">Activity not found</Text>
          <Button variant="ghost" onPress={handleBack}>
            Go Back
          </Button>
        </Container>
      </SafeArea>
    );
  }
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <IconButton icon="back" onPress={handleBack} variant="ghost" size="md" />
        <Text variant="h4" style={styles.headerTitle}>
          {activity.category}
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <View
            style={[
              styles.heroSection,
              { backgroundColor: activity.color + '15' },
            ]}
          >
            <View style={[styles.heroIcon, { backgroundColor: activity.color }]}>
              <Icon name={activity.icon} size="xl" color="#fff" />
            </View>
            <Spacer size="md" />
            <Text variant="h2" align="center">
              {activity.name}
            </Text>
            <Spacer size="xs" />
            <Text variant="body" color="textSecondary" align="center">
              {activity.description}
            </Text>
            <Spacer size="md" />
            <View style={styles.metaTags}>
              <View style={[styles.metaTag, { backgroundColor: theme.colors.surface }]}>
                <Text variant="caption">{activity.difficulty}</Text>
              </View>
              <View style={[styles.metaTag, { backgroundColor: theme.colors.surface }]}>
                <Text variant="caption">{activity.xpReward} XP</Text>
              </View>
              {activity.hasAudio && (
                <View style={[styles.metaTag, { backgroundColor: theme.colors.surface }]}>
                  <Text variant="caption">Guided</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
        <Container padding="lg">
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text variant="h4">How It Works</Text>
            <Spacer size="sm" />
            <Card variant="outlined">
              <Text variant="body" color="textSecondary">
                {activity.instructions}
              </Text>
            </Card>
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text variant="h4">Duration</Text>
            <Spacer size="sm" />
            <View style={styles.durationGrid}>
              {availableDurations.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    {
                      backgroundColor:
                        selectedDuration === duration
                          ? activity.color
                          : theme.colors.surface,
                      borderColor: activity.color,
                    },
                  ]}
                  onPress={() => setSelectedDuration(duration)}
                >
                  <Text
                    variant="body"
                    style={{
                      color: selectedDuration === duration ? '#fff' : theme.colors.text,
                      fontWeight: '600',
                    }}
                  >
                    {duration}
                  </Text>
                  <Text
                    variant="caption"
                    style={{
                      color:
                        selectedDuration === duration ? '#fff' : theme.colors.textSecondary,
                    }}
                  >
                    min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Text variant="h4">Options</Text>
            <Spacer size="sm" />
            {activity.hasAudio && (
              <Card variant="outlined" style={styles.optionCard}>
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => setPlayAudio(!playAudio)}
                >
                  <View style={styles.optionInfo}>
                    <Icon name="audio" size="md" color={theme.colors.primary} />
                    <View style={styles.optionText}>
                      <Text variant="body">Guided Audio</Text>
                      <Text variant="caption" color="textSecondary">
                        Follow along with voice guidance
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: playAudio
                          ? theme.colors.primary
                          : theme.colors.surface,
                        borderColor: theme.colors.primary,
                      },
                    ]}
                  >
                    {playAudio && <Icon name="check" size="xs" color="#fff" />}
                  </View>
                </TouchableOpacity>
              </Card>
            )}
            {activity.hasBackgroundMusic && (
              <>
                <Spacer size="sm" />
                <Card variant="outlined" style={styles.optionCard}>
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => setPlayMusic(!playMusic)}
                  >
                    <View style={styles.optionInfo}>
                      <Icon name="music" size="md" color={theme.colors.accent} />
                      <View style={styles.optionText}>
                        <Text variant="body">Background Music</Text>
                        <Text variant="caption" color="textSecondary">
                          Ambient sounds for focus
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: playMusic
                            ? theme.colors.accent
                            : theme.colors.surface,
                          borderColor: theme.colors.accent,
                        },
                      ]}
                    >
                      {playMusic && <Icon name="check" size="xs" color="#fff" />}
                    </View>
                  </TouchableOpacity>
                </Card>
              </>
            )}
          </Animated.View>
          <Spacer size="xl" />
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <Text variant="h4">Benefits</Text>
            <Spacer size="sm" />
            <Card variant="filled">
              <View style={styles.benefitRow}>
                <Icon name="check" size="sm" color={theme.colors.success} />
                <Text variant="body" style={styles.benefitText}>
                  Reduces stress and anxiety
                </Text>
              </View>
              <View style={styles.benefitRow}>
                <Icon name="check" size="sm" color={theme.colors.success} />
                <Text variant="body" style={styles.benefitText}>
                  Improves focus and concentration
                </Text>
              </View>
              <View style={styles.benefitRow}>
                <Icon name="check" size="sm" color={theme.colors.success} />
                <Text variant="body" style={styles.benefitText}>
                  Builds mindfulness habits
                </Text>
              </View>
            </Card>
          </Animated.View>
          <Spacer size="xl" />
        </Container>
      </ScrollView>
      <Animated.View
        entering={FadeInUp.delay(500).duration(400)}
        style={[styles.bottomBar, { backgroundColor: theme.colors.background }]}
      >
        <Container padding="md">
          <Button
            variant="primary"
            onPress={handleStartSession}
            loading={isSessionLoading}
            disabled={isSessionLoading}
            style={{ backgroundColor: activity.color }}
          >
            {`Start ${selectedDuration} Minute Session`}
          </Button>
        </Container>
      </Animated.View>
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
    textTransform: 'capitalize',
  },
  headerSpacer: {
    width: 48,
  },
  heroSection: {
    padding: 32,
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaTags: {
    flexDirection: 'row',
    gap: 8,
  },
  metaTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 70,
  },
  optionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    marginLeft: 12,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    marginLeft: 12,
  },
  bottomBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
    paddingTop: 8,
    paddingBottom: 24,
  },
});
export default ActivityDetailScreen;
