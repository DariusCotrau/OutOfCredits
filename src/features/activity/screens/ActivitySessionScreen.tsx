import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@theme';
import { useActiveSession, useActivityActions } from '@stores/activity';
import {
  SafeArea,
  Container,
  Text,
  Button,
  Spacer,
  Icon,
  IconButton,
} from '@shared/components';
import { PhotoVerification } from '@shared/components/Camera';
import { photoVerificationService } from '@services/verification';
import { formatDuration } from '@shared/utils';
import type { ActivityStackParamList } from '@shared/types';
type NavigationProp = NativeStackNavigationProp<ActivityStackParamList, 'ActivitySession'>;
export function ActivitySessionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const activeSession = useActiveSession();
  const {
    pauseSession,
    resumeSession,
    completeSession,
    cancelSession,
    updateSessionProgress,
  } = useActivityActions();
  const TICK_INTERVAL_MS = 250;
  const STORE_UPDATE_INTERVAL_MS = 1000;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);
  const elapsedMsRef = useRef<number>(0);
  const lastStoreUpdateRef = useRef<number>(0);
  const completionTriggeredRef = useRef<boolean>(false);
  const breathScale = useSharedValue(1);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showPhotoVerification, setShowPhotoVerification] = useState(false);
  const [isPhotoVerified, setIsPhotoVerified] = useState(false);
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [photoVerificationEnabled, setPhotoVerificationEnabled] = useState(false);
  const [photoVerificationRequired, setPhotoVerificationRequired] = useState(false);
  const handleSessionComplete = useCallback(() => {
    if (completionTriggeredRef.current) return;
    completionTriggeredRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    Vibration.vibrate([0, 200, 100, 200]);
    if (photoVerificationEnabled) {
      setShowPhotoVerification(true);
    } else {
      setShowCompletionModal(true);
    }
  }, [photoVerificationEnabled]);
  useEffect(() => {
    if (activeSession) {
      const loadVerificationSettings = async () => {
        const result = await photoVerificationService.getActivityVerificationSettings(
          activeSession.activity.id
        );
        if (result.success && result.data) {
          setPhotoVerificationEnabled(result.data.enabled);
          setPhotoVerificationRequired(result.data.required);
        }
      };
      loadVerificationSettings();
    }
  }, [activeSession?.activity.id]);
  useEffect(() => {
    if (!activeSession) {
      navigation.goBack();
      return;
    }
    if (!activeSession.isPaused && !showPhotoVerification && !showCompletionModal) {
      startTimeRef.current = Date.now() - elapsedMsRef.current;
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        elapsedMsRef.current = elapsed;
        setElapsedMs(elapsed);
        const now = Date.now();
        if (now - lastStoreUpdateRef.current >= STORE_UPDATE_INTERVAL_MS) {
          updateSessionProgress(elapsed);
          lastStoreUpdateRef.current = now;
        }
        if (elapsed >= activeSession.session.plannedDurationMs) {
          handleSessionComplete();
        }
      }, TICK_INTERVAL_MS);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [
    activeSession?.isPaused,
    activeSession?.session.plannedDurationMs,
    handleSessionComplete,
    navigation,
    showCompletionModal,
    showPhotoVerification,
    updateSessionProgress,
  ]);
  useEffect(() => {
    if (activeSession) {
      elapsedMsRef.current = activeSession.elapsedMs ?? 0;
      setElapsedMs(activeSession.elapsedMs ?? 0);
      completionTriggeredRef.current = false;
      lastStoreUpdateRef.current = 0;
    }
  }, [activeSession?.session.id]);
  useEffect(() => {
    if (activeSession && !activeSession.isPaused) {
      breathScale.value = withRepeat(
        withTiming(1.2, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      breathScale.value = withTiming(1, { duration: 500 });
    }
  }, [activeSession?.isPaused]);
  const breathingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));
  const handlePause = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    elapsedMsRef.current = elapsed;
    setElapsedMs(elapsed);
    updateSessionProgress(elapsed);
    pauseSession();
    pausedTimeRef.current = Date.now();
    Vibration.vibrate(50);
  }, [pauseSession, updateSessionProgress]);
  const handleResume = useCallback(() => {
    const pauseDuration = Date.now() - pausedTimeRef.current;
    pausedTimeRef.current = 0;
    startTimeRef.current += pauseDuration;
    resumeSession();
    Vibration.vibrate(50);
  }, [resumeSession]);
  const handlePhotoVerified = useCallback(async () => {
    if (activeSession) {
      await photoVerificationService.recordVerification(activeSession.session.id);
    }
    setIsPhotoVerified(true);
    setShowPhotoVerification(false);
    setShowCompletionModal(true);
  }, [activeSession]);
  const handlePhotoSkipped = useCallback(async () => {
    if (activeSession) {
      await photoVerificationService.recordSkippedVerification(activeSession.session.id);
    }
    setIsPhotoVerified(false);
    setShowPhotoVerification(false);
    setShowCompletionModal(true);
  }, [activeSession]);
  const handlePhotoCancelled = useCallback(() => {
    completionTriggeredRef.current = false;
    setShowPhotoVerification(false);
  }, []);
  const handleFinish = useCallback(async () => {
    await completeSession(moodRating ?? undefined);
    navigation.goBack();
  }, [completeSession, moodRating, navigation]);
  const handleCancel = useCallback(() => {
    Alert.alert(
      'End Session?',
      'Are you sure you want to end this session? Your progress will be lost.',
      [
        { text: 'Continue', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            await cancelSession();
            navigation.goBack();
          },
        },
      ]
    );
  }, [cancelSession, navigation]);
  if (!activeSession) {
    return null;
  }
  const { activity, isPaused } = activeSession;
  const plannedMs = activeSession.session.plannedDurationMs;
  const clampedElapsedMs = Math.max(0, Math.min(elapsedMs, plannedMs));
  const remainingMs = Math.max(0, plannedMs - clampedElapsedMs);
  const progressPercent =
    plannedMs > 0 ? Math.min(100, (clampedElapsedMs / plannedMs) * 100) : 0;
  if (showPhotoVerification) {
    return (
      <PhotoVerification
        activityName={activity.name}
        activityColor={activity.color}
        isRequired={photoVerificationRequired}
        onPhotoConfirmed={handlePhotoVerified}
        onSkip={handlePhotoSkipped}
        onCancel={handlePhotoCancelled}
      />
    );
  }
  if (showCompletionModal) {
    return (
      <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Container padding="lg" style={styles.completionContainer}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.completionContent}>
            <View style={[styles.completionIcon, { backgroundColor: activity.color + '20' }]}>
              <Icon name="check" size="xl" color={activity.color} />
            </View>
            <Spacer size="lg" />
            <Text variant="h2" align="center">
              Well Done!
            </Text>
            <Spacer size="xs" />
            <Text variant="body" color="textSecondary" align="center">
              You completed your {activity.name} session
            </Text>
            {isPhotoVerified && (
              <>
                <Spacer size="md" />
                <View style={[styles.verificationBadge, { backgroundColor: activity.color + '20' }]}>
                  <Icon name="camera" size="sm" color={activity.color} />
                  <Text
                    variant="caption"
                    style={{ color: activity.color, marginLeft: 6 }}
                  >
                    Verificat cu foto
                  </Text>
                </View>
              </>
            )}
            <Spacer size="xl" />
            <View style={styles.completionStats}>
              <View style={styles.completionStat}>
                <Text variant="h3" color="primary">
                  {formatDuration(elapsedMs)}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Duration
                </Text>
              </View>
              <View style={styles.completionDivider} />
              <View style={styles.completionStat}>
                <Text variant="h3" style={{ color: activity.color }}>
                  +{activity.xpReward}
                </Text>
                <Text variant="caption" color="textSecondary">
                  XP Earned
                </Text>
              </View>
            </View>
            <Spacer size="xl" />
            <Text variant="body" align="center">
              How do you feel now?
            </Text>
            <Spacer size="md" />
            <View style={styles.moodRow}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.moodButton,
                    {
                      backgroundColor:
                        moodRating === rating ? activity.color : theme.colors.surface,
                      borderColor: activity.color,
                    },
                  ]}
                  onPress={() => setMoodRating(rating)}
                >
                  <Text
                    style={{
                      fontSize: 24,
                    }}
                  >
                    {rating === 1 ? '😔' : rating === 2 ? '😕' : rating === 3 ? '😐' : rating === 4 ? '🙂' : '😊'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Spacer size="xl" />
            <Button
              variant="primary"
              onPress={handleFinish}
              style={{ backgroundColor: activity.color }}
            >
              Finish
            </Button>
          </Animated.View>
        </Container>
      </SafeArea>
    );
  }
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <IconButton icon="close" onPress={handleCancel} variant="ghost" size="md" />
        <Text variant="body" color="textSecondary">
          {activity.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <Container padding="lg" style={styles.content}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.timerContainer}>
          <Animated.View
            style={[
              styles.timerCircle,
              { backgroundColor: activity.color + '15' },
              breathingStyle,
            ]}
          >
            <View
              style={[
                styles.timerInner,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Text variant="h1" style={styles.timerText}>
                {formatDuration(remainingMs)}
              </Text>
              <Text variant="caption" color="textSecondary">
                remaining
              </Text>
            </View>
            <View
              style={[
                styles.progressRing,
                { borderColor: activity.color + '30' },
              ]}
            >
              <View
                style={[
                  styles.progressArc,
                  {
                    borderColor: activity.color,
                    transform: [{ rotate: `${(progressPercent / 100) * 360}deg` }],
                  },
                ]}
              />
            </View>
          </Animated.View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          {isPaused ? (
            <View style={styles.statusBadge}>
              <Icon name="pause" size="sm" color={theme.colors.warning} />
              <Text variant="body" style={{ color: theme.colors.warning, marginLeft: 8 }}>
                Paused
              </Text>
            </View>
          ) : (
            <View style={styles.statusBadge}>
              <View style={[styles.pulsingDot, { backgroundColor: activity.color }]} />
              <Text variant="body" color="textSecondary" style={{ marginLeft: 8 }}>
                In Progress
              </Text>
            </View>
          )}
        </Animated.View>
        <Spacer size="xl" />
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text variant="body" color="textSecondary" align="center" style={styles.instructions}>
            {activity.category === 'breathing'
              ? isPaused
                ? 'Take your time. Resume when ready.'
                : 'Follow your breath. Inhale... Exhale...'
              : isPaused
              ? 'Session paused. Resume when ready.'
              : 'Focus on the present moment.'}
          </Text>
        </Animated.View>
        <View style={styles.spacer} />
        <Animated.View
          entering={FadeInUp.delay(400).duration(400)}
          style={styles.controls}
        >
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleCancel}
          >
            <Icon name="close" size="md" color={theme.colors.error} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.mainControl,
              { backgroundColor: activity.color },
            ]}
            onPress={isPaused ? handleResume : handlePause}
          >
            <Icon
              name={isPaused ? 'play' : 'pause'}
              size="lg"
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleSessionComplete}
          >
            <Icon name="check" size="md" color={theme.colors.success} />
          </TouchableOpacity>
        </Animated.View>
        <Spacer size="lg" />
        <Button variant="ghost" onPress={handleSessionComplete}>
          Finish Early
        </Button>
      </Container>
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
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerInner: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '200',
  },
  progressRing: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 4,
  },
  progressArc: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 135,
    borderWidth: 4,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  instructions: {
    maxWidth: 280,
  },
  spacer: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainControl: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  completionContent: {
    alignItems: 'center',
  },
  completionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completionStat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  completionDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E5',
  },
  moodRow: {
    flexDirection: 'row',
    gap: 12,
  },
  moodButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});
export default ActivitySessionScreen;
