import React, { useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@theme';
import {
  useActivityStore,
  useActivityActions,
  useFeaturedActivities,
  useTodaySummary,
  useActivityStreak,
} from '@stores/activity';
import { useAuthStore } from '@stores/auth';
import {
  SafeArea,
  Container,
  Text,
  Card,
  Spacer,
  Icon,
} from '@shared/components';
import { formatDuration } from '@shared/utils';
import type { Activity, ActivityCategory } from '@services/activity';
import type { ActivityStackParamList } from '@shared/types';
type NavigationProp = NativeStackNavigationProp<ActivityStackParamList, 'ActivityList'>;
interface CategoryChip {
  key: ActivityCategory | 'all';
  label: string;
  icon: string;
  color: string;
}
const CATEGORIES: CategoryChip[] = [
  { key: 'all', label: 'All', icon: 'apps', color: '#6B4EE6' },
  { key: 'meditation', label: 'Meditation', icon: 'meditation', color: '#6B4EE6' },
  { key: 'breathing', label: 'Breathing', icon: 'breathing', color: '#45B7D1' },
  { key: 'focus', label: 'Focus', icon: 'focus', color: '#F7DC6F' },
  { key: 'relaxation', label: 'Relaxation', icon: 'relax', color: '#BB8FCE' },
  { key: 'sleep', label: 'Sleep', icon: 'moon', color: '#5D6D7E' },
  { key: 'movement', label: 'Movement', icon: 'walk', color: '#58D68D' },
  { key: 'gratitude', label: 'Gratitude', icon: 'heart', color: '#F5B041' },
  { key: 'journaling', label: 'Journal', icon: 'journal', color: '#85929E' },
];
export function ActivityListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const activities = useActivityStore((s) => s.activities);
  const selectedCategory = useActivityStore((s) => s.selectedCategory);
  const featuredActivities = useFeaturedActivities();
  const todaySummary = useTodaySummary();
  const streak = useActivityStreak();
  const { fetchActivities, fetchFeaturedActivities, setSelectedCategory, refreshAll } =
    useActivityActions();
  useEffect(() => {
    fetchActivities();
    fetchFeaturedActivities();
    if (user?.uid) {
      refreshAll(user.uid);
    }
  }, []);
  const filteredActivities = useMemo(() => {
    if (!selectedCategory) return activities;
    return activities.filter((a) => a.category === selectedCategory);
  }, [activities, selectedCategory]);
  const handleCategoryPress = useCallback(
    (category: ActivityCategory | 'all') => {
      setSelectedCategory(category === 'all' ? null : category);
    },
    [setSelectedCategory]
  );
  const handleActivityPress = useCallback(
    (activityId: string) => {
      navigation.navigate('ActivityDetail', { activityId });
    },
    [navigation]
  );
  const renderCategoryChip = (category: CategoryChip) => {
    const isSelected =
      category.key === 'all'
        ? selectedCategory === null
        : selectedCategory === category.key;
    return (
      <TouchableOpacity
        key={category.key}
        style={[
          styles.categoryChip,
          {
            backgroundColor: isSelected ? category.color : theme.colors.surface,
            borderColor: category.color,
          },
        ]}
        onPress={() => handleCategoryPress(category.key)}
      >
        <Icon
          name={category.icon}
          size="sm"
          color={isSelected ? '#fff' : category.color}
        />
        <Text
          variant="bodySmall"
          style={{
            color: isSelected ? '#fff' : theme.colors.text,
            marginLeft: 4,
          }}
        >
          {category.label}
        </Text>
      </TouchableOpacity>
    );
  };
  const renderFeaturedActivity = ({ item, index }: { item: Activity; index: number }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 100).duration(400)}
      style={styles.featuredCard}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleActivityPress(item.id)}
      >
        <Card
          variant="elevated"
          style={[styles.featuredCardInner, { backgroundColor: item.color + '15' }]}
        >
          <View style={[styles.featuredIcon, { backgroundColor: item.color }]}>
            <Icon name={item.icon} size="lg" color="#fff" />
          </View>
          <Spacer size="sm" />
          <Text variant="body" style={{ fontWeight: '600' }}>
            {item.name}
          </Text>
          <Text variant="caption" color="textSecondary" numberOfLines={2}>
            {item.description}
          </Text>
          <Spacer size="xs" />
          <View style={styles.featuredMeta}>
            <Text variant="caption" style={{ color: item.color }}>
              {item.defaultDurationMinutes} min
            </Text>
            <Text variant="caption" color="textSecondary">
              {item.difficulty}
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
  const renderActivityItem = ({ item, index }: { item: Activity; index: number }) => (
    <Animated.View key={item.id} entering={FadeInDown.delay(index * 50).duration(300)}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleActivityPress(item.id)}
      >
        <Card variant="outlined" style={styles.activityCard}>
          <View style={styles.activityRow}>
            <View style={[styles.activityIcon, { backgroundColor: item.color + '20' }]}>
              <Icon name={item.icon} size="md" color={item.color} />
            </View>
            <View style={styles.activityInfo}>
              <Text variant="body" style={{ fontWeight: '500' }}>
                {item.name}
              </Text>
              <Text variant="caption" color="textSecondary" numberOfLines={1}>
                {item.description}
              </Text>
              <View style={styles.activityMeta}>
                <View style={styles.metaItem}>
                  <Icon name="timer" size="xs" color={theme.colors.textSecondary} />
                  <Text
                    variant="caption"
                    color="textSecondary"
                    style={{ marginLeft: 4 }}
                  >
                    {item.defaultDurationMinutes} min
                  </Text>
                </View>
                {item.hasAudio && (
                  <View style={styles.metaItem}>
                    <Icon name="audio" size="xs" color={theme.colors.textSecondary} />
                    <Text
                      variant="caption"
                      color="textSecondary"
                      style={{ marginLeft: 4 }}
                    >
                      Guided
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Icon name="chevronRight" size="sm" color={theme.colors.textSecondary} />
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[2]}
      >
        <Container padding="lg">
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text variant="h2">Mindfulness</Text>
            <Spacer size="xs" />
            <Text variant="body" color="textSecondary">
              Choose an activity to start your practice
            </Text>
          </Animated.View>
        </Container>
        <Container padding="md">
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <View style={styles.statsRow}>
              <Card variant="filled" style={styles.statCard}>
                <Icon name="timer" size="md" color={theme.colors.primary} />
                <Spacer size="xs" />
                <Text variant="h4" color="primary">
                  {formatDuration(todaySummary?.totalTimeMs ?? 0)}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Today
                </Text>
              </Card>
              <Card variant="filled" style={styles.statCard}>
                <Icon name="fire" size="md" color={theme.colors.accent} />
                <Spacer size="xs" />
                <Text variant="h4" color="accent">
                  {streak?.currentStreak ?? 0}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Day Streak
                </Text>
              </Card>
              <Card variant="filled" style={styles.statCard}>
                <Icon name="check" size="md" color={theme.colors.success} />
                <Spacer size="xs" />
                <Text variant="h4" style={{ color: theme.colors.success }}>
                  {todaySummary?.completedSessions ?? 0}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Sessions
                </Text>
              </Card>
            </View>
          </Animated.View>
        </Container>
        <View style={[styles.categoriesContainer, { backgroundColor: theme.colors.background }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIES.map(renderCategoryChip)}
          </ScrollView>
        </View>
        {!selectedCategory && featuredActivities.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Container padding="md">
              <Text variant="h4">Featured</Text>
            </Container>
            <FlatList
              horizontal
              data={featuredActivities}
              keyExtractor={(item) => item.id}
              renderItem={renderFeaturedActivity}
              contentContainerStyle={styles.featuredList}
              showsHorizontalScrollIndicator={false}
            />
            <Spacer size="md" />
          </Animated.View>
        )}
        <Container padding="md">
          <Text variant="h4">
            {selectedCategory
              ? CATEGORIES.find((c) => c.key === selectedCategory)?.label
              : 'All Activities'}
          </Text>
          <Spacer size="sm" />
        </Container>
        <View style={styles.activityList}>
          {filteredActivities.map((activity, index) =>
            renderActivityItem({ item: activity, index })
          )}
        </View>
        <Spacer size="xl" />
      </ScrollView>
    </SafeArea>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  categoriesContainer: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  featuredList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  featuredCard: {
    width: 180,
  },
  featuredCardInner: {
    padding: 16,
  },
  featuredIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityList: {
    paddingHorizontal: 16,
  },
  activityCard: {
    marginBottom: 8,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
export default ActivityListScreen;
