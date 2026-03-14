import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { Card, Text, Icon, ProgressBar, Spacer } from '@shared/components';
import { formatNumber, formatCompactNumber } from '@shared/utils';
import { useLevelProgress } from '@stores/gamification';
import { useTodaySummary } from '@stores/activity';
export interface LevelWidgetProps {
  onPress?: () => void;
}
const LEVEL_COLORS = [
  '#6B7280',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#EF4444',
  '#14B8A6',
  '#F97316',
  '#FFD700',
];
export const LevelWidget = memo<LevelWidgetProps>(function LevelWidget({
  onPress,
}) {
  const { theme } = useTheme();
  const levelProgress = useLevelProgress();
  const todaySummary = useTodaySummary();
  const currentLevel = levelProgress?.currentLevel.level ?? 1;
  const levelName = levelProgress?.currentLevel.name ?? 'Novice';
  const totalXP = levelProgress?.totalXP ?? 0;
  const currentLevelXP = levelProgress?.currentLevelXP ?? 0;
  const xpForNextLevel = levelProgress?.xpToNextLevel ?? 100;
  const progress = levelProgress?.progressPercent ?? 0;
  const nextLevel = levelProgress?.nextLevel;
  const levelColor = LEVEL_COLORS[(currentLevel - 1) % LEVEL_COLORS.length];
  const xpToday = todaySummary?.xpEarned ?? 0;
  return (
    <Card onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: levelColor + '20' }]}>
            <Icon name="star" size={20} color={levelColor} />
          </View>
          <Text variant="h4" style={styles.title}>Level Progress</Text>
        </View>
        <Icon name="chevron-right" size={20} color={theme.colors.textTertiary} />
      </View>
      <Spacer size="md" />
      <View style={styles.levelContainer}>
        <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
          <Text variant="h2" style={styles.levelNumber}>
            {currentLevel}
          </Text>
        </View>
        <Spacer size="sm" />
        <Text variant="h3" color="text">{levelName}</Text>
        <Text variant="caption" color="textSecondary">
          {formatCompactNumber(totalXP)} XP total
        </Text>
      </View>
      <Spacer size="md" />
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text variant="caption" color="textSecondary">
            Next level
          </Text>
          <Text variant="caption" color="textSecondary">
            {formatNumber(currentLevelXP)} / {formatNumber(xpForNextLevel)} XP
          </Text>
        </View>
        <Spacer size="xs" />
        <ProgressBar
          progress={progress}
          size="md"
          progressColor={levelColor}
        />
      </View>
      <Spacer size="sm" />
      <View style={styles.todayXP}>
        <Icon name="zap" size={14} color={theme.colors.warning} />
        <Text variant="bodySmall" color="textSecondary" style={styles.todayXPText}>
          +{formatNumber(xpToday)} XP earned today
        </Text>
      </View>
      {nextLevel && (
        <>
          <Spacer size="xs" />
          <Text variant="caption" color="textTertiary" style={styles.nextLevelText}>
            {formatNumber(xpForNextLevel - currentLevelXP)} XP until {nextLevel.name}
          </Text>
        </>
      )}
    </Card>
  );
});
const styles = StyleSheet.create({
  container: {
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginLeft: 10,
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  progressSection: {
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  todayXP: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayXPText: {
    marginLeft: 4,
  },
  nextLevelText: {
    textAlign: 'center',
  },
});
export default LevelWidget;
