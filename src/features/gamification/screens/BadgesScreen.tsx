import React, { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import {
  useGamificationStore,
  useGamificationActions,
  useUserBadges,
  selectFilteredBadges,
} from '@stores/gamification';
import {
  SafeArea,
  Container,
  Text,
  Card,
  Spacer,
  Icon,
  IconButton,
} from '@shared/components';
import type { Badge, BadgeCategory, BadgeRarity, UserBadge } from '@services/gamification';
interface CategoryChip {
  key: BadgeCategory | 'all';
  label: string;
}
const CATEGORIES: CategoryChip[] = [
  { key: 'all', label: 'All' },
  { key: 'beginner', label: 'Beginner' },
  { key: 'consistency', label: 'Consistency' },
  { key: 'milestone', label: 'Milestone' },
  { key: 'mastery', label: 'Mastery' },
  { key: 'special', label: 'Special' },
];
const RARITY_COLORS: Record<BadgeRarity, string> = {
  common: '#8BC34A',
  uncommon: '#03A9F4',
  rare: '#9C27B0',
  epic: '#FF9800',
  legendary: '#FFD700',
};
export function BadgesScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const allBadges = useGamificationStore((s) => s.allBadges);
  const selectedCategory = useGamificationStore((s) => s.selectedBadgeCategory);
  const userBadges = useUserBadges();
  const { setSelectedBadgeCategory } = useGamificationActions();
  const filteredBadges = useMemo(() => {
    if (selectedCategory === 'all') return allBadges;
    return allBadges.filter((b) => b.category === selectedCategory);
  }, [allBadges, selectedCategory]);
  const getUserBadgeProgress = (badgeId: string): UserBadge | undefined => {
    return userBadges.find((ub) => ub.badgeId === badgeId);
  };
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const handleCategoryPress = useCallback(
    (category: BadgeCategory | 'all') => {
      setSelectedBadgeCategory(category);
    },
    [setSelectedBadgeCategory]
  );
  const earnedCount = userBadges.filter((ub) => ub.isEarned).length;
  const totalCount = allBadges.length;
  const renderCategoryChip = (category: CategoryChip) => {
    const isSelected = selectedCategory === category.key;
    return (
      <TouchableOpacity
        key={category.key}
        style={[
          styles.categoryChip,
          {
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => handleCategoryPress(category.key)}
      >
        <Text
          variant="bodySmall"
          style={{ color: isSelected ? '#fff' : theme.colors.text }}
        >
          {category.label}
        </Text>
      </TouchableOpacity>
    );
  };
  const renderBadgeItem = ({ item, index }: { item: Badge; index: number }) => {
    const userBadge = getUserBadgeProgress(item.id);
    const isEarned = userBadge?.isEarned ?? false;
    const progress = userBadge?.progress ?? 0;
    const isSecret = item.isSecret && !isEarned;
    return (
      <Animated.View
        entering={FadeInRight.delay(index * 30).duration(300)}
        style={styles.badgeItemContainer}
      >
        <Card
          variant="outlined"
          style={[
            styles.badgeCard,
            !isEarned && { opacity: 0.7 },
          ]}
        >
          <View
            style={[
              styles.rarityBar,
              { backgroundColor: RARITY_COLORS[item.rarity] },
            ]}
          />
          <View style={styles.badgeContent}>
            <View
              style={[
                styles.badgeIcon,
                {
                  backgroundColor: isEarned
                    ? item.color + '20'
                    : theme.colors.surfaceVariant,
                },
              ]}
            >
              {isSecret ? (
                <Icon name="lock" size="md" color={theme.colors.textSecondary} />
              ) : (
                <Icon
                  name={item.icon}
                  size="md"
                  color={isEarned ? item.color : theme.colors.textSecondary}
                />
              )}
            </View>
            <View style={styles.badgeInfo}>
              <Text variant="body" style={{ fontWeight: '600' }}>
                {isSecret ? '???' : item.name}
              </Text>
              <Text variant="caption" color="textSecondary" numberOfLines={2}>
                {isSecret ? 'Complete a secret requirement' : item.description}
              </Text>
              {isEarned ? (
                <View style={styles.earnedBadge}>
                  <Icon name="check" size="xs" color={theme.colors.success} />
                  <Text
                    variant="caption"
                    style={{ color: theme.colors.success, marginLeft: 4 }}
                  >
                    Earned
                  </Text>
                </View>
              ) : !isSecret && progress > 0 ? (
                <View style={styles.progressContainer}>
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
                          width: `${progress}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                  <Text variant="caption" color="textSecondary" style={{ marginLeft: 8 }}>
                    {Math.round(progress)}%
                  </Text>
                </View>
              ) : (
                <Text variant="caption" color="textSecondary">
                  +{item.xpReward} XP
                </Text>
              )}
            </View>
            <View
              style={[
                styles.rarityBadge,
                { backgroundColor: RARITY_COLORS[item.rarity] + '20' },
              ]}
            >
              <Text
                variant="caption"
                style={{
                  color: RARITY_COLORS[item.rarity],
                  textTransform: 'capitalize',
                  fontSize: 10,
                }}
              >
                {item.rarity}
              </Text>
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
          Badges
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <Animated.View entering={FadeInDown.duration(400)}>
        <Container padding="md">
          <Card variant="filled" style={styles.statsCard}>
            <View style={styles.statsContent}>
              <View style={styles.statItem}>
                <Text variant="h3" color="primary">
                  {earnedCount}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Earned
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.statItem}>
                <Text variant="h3" color="textSecondary">
                  {totalCount}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Total
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
              <View style={styles.statItem}>
                <Text variant="h3" style={{ color: theme.colors.success }}>
                  {Math.round((earnedCount / totalCount) * 100)}%
                </Text>
                <Text variant="caption" color="textSecondary">
                  Complete
                </Text>
              </View>
            </View>
          </Card>
        </Container>
      </Animated.View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
        style={[styles.categoriesContainer, { borderBottomColor: theme.colors.border }]}
      >
        {CATEGORIES.map(renderCategoryChip)}
      </ScrollView>
      <FlatList
        data={filteredBadges}
        keyExtractor={(item) => item.id}
        renderItem={renderBadgeItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        numColumns={1}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="medal" size="xl" color={theme.colors.textSecondary} />
            <Spacer size="md" />
            <Text variant="body" color="textSecondary" align="center">
              No badges in this category
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
  statsCard: {
    padding: 20,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  categoriesContainer: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  badgeItemContainer: {
    marginBottom: 16,
  },
  badgeCard: {
    overflow: 'hidden',
    padding: 0,
  },
  rarityBar: {
    height: 3,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeInfo: {
    flex: 1,
    marginLeft: 16,
  },
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
});
export default BadgesScreen;
