import React, { useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@theme';
import {
  useGamificationStore,
  useGamificationActions,
  useLevelProgress,
  useUserBadges,
  useGamificationStats,
  useDailyRewards,
} from '@stores/gamification';
import { useAuthStore } from '@stores/auth';
import {
  SafeArea,
  Container,
  Text,
  Card,
  Button,
  Spacer,
  Icon,
} from '@shared/components';
import type { Badge, UserBadge } from '@services/gamification';
import type { GamificationStackParamList } from '@shared/types';
type NavigationProp = NativeStackNavigationProp<GamificationStackParamList, 'Rewards'>;
export function RewardsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const levelProgress = useLevelProgress();
  const userBadges = useUserBadges();
  const stats = useGamificationStats();
  const dailyRewards = useDailyRewards();
  const allBadges = useGamificationStore((s) => s.allBadges);
  const { refreshAll, claimDailyReward } = useGamificationActions();
  useEffect(() => {
    if (user?.uid) {
      refreshAll(user.uid);
    }
  }, []);
  const earnedBadges = userBadges.filter((ub) => ub.isEarned);
  const handleClaimReward = useCallback(async () => {
    if (user?.uid) {
      await claimDailyReward(user.uid);
    }
  }, [user, claimDailyReward]);
  const handleViewAllBadges = useCallback(() => {
    navigation.navigate('Badges');
  }, [navigation]);
  const handleViewLeaderboard = useCallback(() => {
    navigation.navigate('Leaderboard');
  }, [navigation]);
  const getBadgeDetails = (badgeId: string): Badge | undefined => {
    return allBadges.find((b) => b.id === badgeId);
  };
  const renderBadgeItem = ({ item, index }: { item: UserBadge; index: number }) => {
    const badge = getBadgeDetails(item.badgeId);
    if (!badge) return null;
    return (
      <Animated.View
        entering={FadeInRight.delay(index * 50).duration(300)}
        style={styles.badgeItem}
      >
        <View
          style={[
            styles.badgeIcon,
            { backgroundColor: badge.color + '20' },
          ]}
        >
          <Icon name={badge.icon} size="md" color={badge.color} />
        </View>
        <Text variant="caption" numberOfLines={1} style={styles.badgeName}>
          {badge.name}
        </Text>
      </Animated.View>
    );
  };
  const availableReward = dailyRewards.find((r) => r.isAvailable);
  const currentDay = dailyRewards.filter((r) => r.isClaimed).length + 1;
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Container padding="lg">
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text variant="h2">Rewards</Text>
            <Spacer size="xs" />
            <Text variant="body" color="textSecondary">
              Track your progress and earn badges
            </Text>
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Card variant="elevated" style={styles.levelCard}>
              <View style={styles.levelHeader}>
                <View
                  style={[
                    styles.levelIcon,
                    { backgroundColor: levelProgress?.currentLevel.color ?? theme.colors.primary },
                  ]}
                >
                  <Icon
                    name={levelProgress?.currentLevel.icon ?? 'star'}
                    size="lg"
                    color="#fff"
                  />
                </View>
                <View style={styles.levelInfo}>
                  <Text variant="h3">
                    Level {levelProgress?.currentLevel.level ?? 1}
                  </Text>
                  <Text variant="body" color="textSecondary">
                    {levelProgress?.currentLevel.name ?? 'Novice'}
                  </Text>
                </View>
                <View style={styles.xpBadge}>
                  <Text variant="h4" style={{ color: theme.colors.primary }}>
                    {levelProgress?.totalXP ?? 0}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    XP
                  </Text>
                </View>
              </View>
              {levelProgress?.nextLevel && (
                <>
                  <Spacer size="md" />
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                      <Text variant="caption" color="textSecondary">
                        Progress to Level {levelProgress.nextLevel.level}
                      </Text>
                      <Text variant="caption" color="textSecondary">
                        {levelProgress.xpToNextLevel} XP needed
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
                            width: `${levelProgress.progressPercent}%`,
                            backgroundColor: levelProgress.currentLevel.color,
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
            <View style={styles.sectionHeader}>
              <Text variant="h4">Daily Rewards</Text>
              <Text variant="caption" color="textSecondary">
                Day {currentDay} of 7
              </Text>
            </View>
            <Spacer size="sm" />
            <Card variant="outlined">
              <View style={styles.dailyRewardsRow}>
                {dailyRewards.map((reward) => (
                  <View
                    key={reward.day}
                    style={[
                      styles.dailyRewardItem,
                      {
                        backgroundColor: reward.isClaimed
                          ? theme.colors.success + '20'
                          : reward.isAvailable
                          ? theme.colors.primary + '20'
                          : theme.colors.surfaceVariant,
                      },
                    ]}
                  >
                    {reward.isClaimed ? (
                      <Icon name="check" size="sm" color={theme.colors.success} />
                    ) : (
                      <Text
                        variant="bodySmall"
                        style={{
                          color: reward.isAvailable
                            ? theme.colors.primary
                            : theme.colors.textSecondary,
                        }}
                      >
                        {reward.day}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
              {availableReward && (
                <>
                  <Spacer size="md" />
                  <Button variant="primary" onPress={handleClaimReward}>
                    {`Claim ${availableReward.reward.name}`}
                  </Button>
                </>
              )}
            </Card>
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Text variant="h4">Your Stats</Text>
            <Spacer size="sm" />
            <View style={styles.statsGrid}>
              <Card variant="filled" style={styles.statCard}>
                <Icon name="fire" size="md" color="#FF5722" />
                <Text variant="h3" style={{ marginTop: 8 }}>
                  {stats?.currentStreak ?? 0}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Day Streak
                </Text>
              </Card>
              <Card variant="filled" style={styles.statCard}>
                <Icon name="medal" size="md" color="#FFD700" />
                <Text variant="h3" style={{ marginTop: 8 }}>
                  {earnedBadges.length}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Badges
                </Text>
              </Card>
              <Card variant="filled" style={styles.statCard}>
                <Icon name="timer" size="md" color={theme.colors.primary} />
                <Text variant="h3" style={{ marginTop: 8 }}>
                  {stats?.sessionsCompleted ?? 0}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Sessions
                </Text>
              </Card>
              <Card variant="filled" style={styles.statCard}>
                <Icon name="trophy" size="md" color={theme.colors.accent} />
                <Text variant="h3" style={{ marginTop: 8 }}>
                  {stats?.challengesCompleted ?? 0}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Challenges
                </Text>
              </Card>
            </View>
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <View style={styles.sectionHeader}>
              <Text variant="h4">Recent Badges</Text>
              <TouchableOpacity onPress={handleViewAllBadges}>
                <Text variant="bodySmall" color="primary">
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <Spacer size="sm" />
            {earnedBadges.length > 0 ? (
              <FlatList
                horizontal
                data={earnedBadges.slice(0, 6)}
                keyExtractor={(item) => item.badgeId}
                renderItem={renderBadgeItem}
                contentContainerStyle={styles.badgesList}
                showsHorizontalScrollIndicator={false}
              />
            ) : (
              <Card variant="outlined" style={styles.emptyCard}>
                <Icon name="medal" size="lg" color={theme.colors.textSecondary} />
                <Spacer size="sm" />
                <Text variant="body" color="textSecondary" align="center">
                  Complete activities to earn badges!
                </Text>
              </Card>
            )}
          </Animated.View>
          <Spacer size="lg" />
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <View style={styles.sectionHeader}>
              <Text variant="h4">Leaderboard</Text>
              <TouchableOpacity onPress={handleViewLeaderboard}>
                <Text variant="bodySmall" color="primary">
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <Spacer size="sm" />
            <Card variant="outlined">
              <TouchableOpacity
                style={styles.leaderboardPreview}
                onPress={handleViewLeaderboard}
              >
                <View style={styles.leaderboardRank}>
                  <Icon name="trophy" size="md" color={theme.colors.accent} />
                  <Text variant="h4" style={{ marginLeft: 8 }}>
                    #{stats?.rankPercentile ? Math.round(stats.rankPercentile) : '--'}
                  </Text>
                </View>
                <View style={styles.leaderboardInfo}>
                  <Text variant="body">Your Rank</Text>
                  <Text variant="caption" color="textSecondary">
                    Top {stats?.rankPercentile ?? '--'}% of users
                  </Text>
                </View>
                <Icon name="chevronRight" size="md" color={theme.colors.textSecondary} />
              </TouchableOpacity>
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
  levelCard: {
    padding: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelInfo: {
    flex: 1,
    marginLeft: 16,
  },
  xpBadge: {
    alignItems: 'center',
  },
  progressContainer: {},
  progressHeader: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyRewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dailyRewardItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  badgesList: {
    gap: 12,
  },
  badgeItem: {
    alignItems: 'center',
    width: 80,
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeName: {
    marginTop: 4,
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  leaderboardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardRank: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardInfo: {
    flex: 1,
    marginLeft: 16,
  },
});
export default RewardsScreen;
