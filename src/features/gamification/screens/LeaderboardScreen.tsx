import React, { useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import {
  useGamificationStore,
  useGamificationActions,
  useLeaderboard,
} from '@stores/gamification';
import { useAuthStore } from '@stores/auth';
import {
  SafeArea,
  Container,
  Text,
  Card,
  Spacer,
  Icon,
  IconButton,
} from '@shared/components';
import type {
  LeaderboardEntry,
  LeaderboardType,
  LeaderboardPeriod,
} from '@services/gamification';
interface TypeOption {
  key: LeaderboardType;
  label: string;
  icon: string;
}
interface PeriodOption {
  key: LeaderboardPeriod;
  label: string;
}
const TYPE_OPTIONS: TypeOption[] = [
  { key: 'total_xp', label: 'XP', icon: 'star' },
  { key: 'mindfulness_time', label: 'Time', icon: 'timer' },
  { key: 'streak', label: 'Streak', icon: 'fire' },
  { key: 'badges', label: 'Badges', icon: 'medal' },
];
const PERIOD_OPTIONS: PeriodOption[] = [
  { key: 'weekly', label: 'This Week' },
  { key: 'monthly', label: 'This Month' },
  { key: 'all_time', label: 'All Time' },
];
const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
export function LeaderboardScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const leaderboard = useLeaderboard();
  const selectedType = useGamificationStore((s) => s.selectedLeaderboardType);
  const selectedPeriod = useGamificationStore((s) => s.selectedLeaderboardPeriod);
  const isLoading = useGamificationStore((s) => s.isLeaderboardLoading);
  const { fetchLeaderboard, setLeaderboardType, setLeaderboardPeriod } =
    useGamificationActions();
  useEffect(() => {
    if (user?.uid) {
      fetchLeaderboard(user.uid);
    }
  }, [selectedType, selectedPeriod]);
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const handleTypeChange = useCallback(
    (type: LeaderboardType) => {
      setLeaderboardType(type);
    },
    [setLeaderboardType]
  );
  const handlePeriodChange = useCallback(
    (period: LeaderboardPeriod) => {
      setLeaderboardPeriod(period);
    },
    [setLeaderboardPeriod]
  );
  const formatScore = useCallback(
    (score: number): string => {
      switch (selectedType) {
        case 'mindfulness_time':
          const hours = Math.floor(score / 3600000);
          const minutes = Math.floor((score % 3600000) / 60000);
          return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        case 'streak':
          return `${score} days`;
        case 'badges':
          return `${score}`;
        default:
          return `${score} XP`;
      }
    },
    [selectedType]
  );
  const renderTypeOption = (option: TypeOption) => {
    const isSelected = selectedType === option.key;
    return (
      <TouchableOpacity
        key={option.key}
        style={[
          styles.typeOption,
          {
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => handleTypeChange(option.key)}
      >
        <Icon
          name={option.icon}
          size="sm"
          color={isSelected ? '#fff' : theme.colors.text}
        />
        <Text
          variant="caption"
          style={{
            color: isSelected ? '#fff' : theme.colors.text,
            marginTop: 2,
          }}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };
  const renderPeriodOption = (option: PeriodOption) => {
    const isSelected = selectedPeriod === option.key;
    return (
      <TouchableOpacity
        key={option.key}
        style={[
          styles.periodOption,
          {
            backgroundColor: isSelected
              ? theme.colors.accent + '20'
              : 'transparent',
          },
        ]}
        onPress={() => handlePeriodChange(option.key)}
      >
        <Text
          variant="bodySmall"
          style={{
            color: isSelected ? theme.colors.accent : theme.colors.textSecondary,
            fontWeight: isSelected ? '600' : '400',
          }}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };
  const renderEntry = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isTopThree = item.rank <= 3;
    const rankColor = isTopThree ? RANK_COLORS[item.rank - 1] : theme.colors.textSecondary;
    return (
      <Animated.View entering={FadeInRight.delay(index * 30).duration(300)}>
        <Card
          variant={item.isCurrentUser ? 'elevated' : 'outlined'}
          style={[
            styles.entryCard,
            item.isCurrentUser && {
              borderColor: theme.colors.primary,
              borderWidth: 2,
            },
          ]}
        >
          <View style={styles.entryContent}>
            <View
              style={[
                styles.rankContainer,
                isTopThree && { backgroundColor: rankColor + '20' },
              ]}
            >
              {isTopThree ? (
                <Icon name="trophy" size="sm" color={rankColor} />
              ) : (
                <Text variant="body" style={{ color: rankColor, fontWeight: '600' }}>
                  {item.rank}
                </Text>
              )}
            </View>
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.colors.primary + '20' },
              ]}
            >
              <Text variant="body" style={{ fontWeight: '600' }}>
                {item.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text
                variant="body"
                style={{ fontWeight: item.isCurrentUser ? '600' : '400' }}
              >
                {item.isCurrentUser ? 'You' : item.displayName}
              </Text>
              <Text variant="caption" color="textSecondary">
                Level {item.level}
              </Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text variant="body" style={{ fontWeight: '600' }}>
                {formatScore(item.score)}
              </Text>
              {item.change !== 0 && (
                <View style={styles.changeContainer}>
                  <Icon
                    name={item.change > 0 ? 'arrowUp' : 'arrowDown'}
                    size="xs"
                    color={item.change > 0 ? theme.colors.success : theme.colors.error}
                  />
                  <Text
                    variant="caption"
                    style={{
                      color: item.change > 0 ? theme.colors.success : theme.colors.error,
                      marginLeft: 2,
                    }}
                  >
                    {Math.abs(item.change)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  };
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <IconButton icon="back" onPress={handleBack} variant="ghost" size="md" />
        <Text variant="h4" style={styles.headerTitle}>
          Leaderboard
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <Animated.View entering={FadeInDown.duration(400)}>
        <Container padding="md">
          <View style={styles.typeSelector}>
            {TYPE_OPTIONS.map(renderTypeOption)}
          </View>
        </Container>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={styles.periodSelector}>
          {PERIOD_OPTIONS.map(renderPeriodOption)}
        </View>
      </Animated.View>
      {leaderboard?.currentUserEntry && (
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Container padding="md">
            <Card variant="filled" style={styles.userRankCard}>
              <View style={styles.userRankContent}>
                <View>
                  <Text variant="caption" color="textSecondary">
                    Your Rank
                  </Text>
                  <Text variant="h2" color="primary">
                    #{leaderboard.currentUserEntry.rank}
                  </Text>
                </View>
                <View style={styles.userRankDivider} />
                <View>
                  <Text variant="caption" color="textSecondary">
                    Your Score
                  </Text>
                  <Text variant="h3">
                    {formatScore(leaderboard.currentUserEntry.score)}
                  </Text>
                </View>
                <View style={styles.userRankDivider} />
                <View>
                  <Text variant="caption" color="textSecondary">
                    Total Users
                  </Text>
                  <Text variant="h3" color="textSecondary">
                    {leaderboard.totalParticipants}
                  </Text>
                </View>
              </View>
            </Card>
          </Container>
        </Animated.View>
      )}
      <FlatList
        data={leaderboard?.entries ?? []}
        keyExtractor={(item) => `${item.userId}-${item.rank}`}
        renderItem={renderEntry}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="trophy" size="xl" color={theme.colors.textSecondary} />
            <Spacer size="md" />
            <Text variant="body" color="textSecondary" align="center">
              {isLoading ? 'Loading leaderboard...' : 'No rankings available'}
            </Text>
          </View>
        }
      />
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
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  periodOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userRankCard: {
    padding: 20,
  },
  userRankContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  userRankDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E5',
  },
  listContent: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  entryCard: {
    marginBottom: 12,
  },
  entryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
});
export default LeaderboardScreen;
