import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeOut } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@theme';
import { useUsageStore, useUsageActions } from '@stores/usage';
import {
  SafeArea,
  Text,
  Card,
  Button,
  Spacer,
  Icon,
  IconButton,
  Switch,
} from '@shared/components';
import { formatScreenTime } from '@shared/utils';
import type { AppLimit, LimitStatus } from '@services/usage';
import type { UsageStackParamList } from '@shared/types';
type NavigationProp = NativeStackNavigationProp<UsageStackParamList, 'LimitsManagement'>;
export function LimitsManagementScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const limits = useUsageStore((s) => s.limits);
  const limitStatuses = useUsageStore((s) => s.limitStatuses);
  const todayUsage = useUsageStore((s) => s.todayUsage);
  const { toggleLimit, deleteLimit } = useUsageActions();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const handleToggle = useCallback(
    async (id: string) => {
      await toggleLimit(id);
    },
    [toggleLimit]
  );
  const handleDelete = useCallback(
    (id: string, target: string) => {
      Alert.alert(
        'Remove Limit',
        `Are you sure you want to remove the limit for "${target}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              setDeletingId(id);
              await deleteLimit(id);
              setDeletingId(null);
            },
          },
        ]
      );
    },
    [deleteLimit]
  );
  const handleEdit = useCallback(
    (limit: AppLimit) => {
      if (limit.type === 'app') {
        navigation.navigate('AppDetails', { packageName: limit.target });
      }
    },
    [navigation]
  );
  const handleAddLimit = useCallback(() => {
    navigation.navigate('AllApps');
  }, [navigation]);
  const getLimitStatus = useCallback(
    (limitId: string): LimitStatus | undefined => {
      return limitStatuses.find((s) => s.limitId === limitId);
    },
    [limitStatuses]
  );
  const getAppName = useCallback(
    (packageName: string): string => {
      const app = todayUsage.find((a) => a.packageName === packageName);
      return app?.appName ?? packageName;
    },
    [todayUsage]
  );
  const { activeLimits, inactiveLimits } = useMemo(() => {
    const active: AppLimit[] = [];
    const inactive: AppLimit[] = [];
    limits.forEach((limit) => {
      if (limit.isActive) {
        active.push(limit);
      } else {
        inactive.push(limit);
      }
    });
    return { activeLimits: active, inactiveLimits: inactive };
  }, [limits]);
  const renderLimitItem = useCallback(
    ({ item, index }: { item: AppLimit; index: number }) => {
      const status = getLimitStatus(item.id);
      const isDeleting = deletingId === item.id;
      const displayName =
        item.type === 'app' ? getAppName(item.target) : item.target;
      return (
        <Animated.View
          entering={FadeInRight.delay(index * 50).duration(300)}
          exiting={FadeOut.duration(200)}
        >
          <Card
            variant="outlined"
            style={[
              styles.limitCard,
              isDeleting && { opacity: 0.5 },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleEdit(item)}
              disabled={isDeleting}
            >
              <View style={styles.limitHeader}>
                <View style={styles.limitInfo}>
                  <View style={styles.limitTitleRow}>
                    <View
                      style={[
                        styles.limitIcon,
                        { backgroundColor: theme.colors.primary + '15' },
                      ]}
                    >
                      <Icon
                        name={item.type === 'app' ? 'apps' : 'category'}
                        size="sm"
                        color={theme.colors.primary}
                      />
                    </View>
                    <View style={styles.limitTitleText}>
                      <Text variant="body" numberOfLines={1}>
                        {displayName}
                      </Text>
                      <Text variant="caption" color="textSecondary">
                        {item.type === 'app' ? 'App' : 'Category'} •{' '}
                        {formatScreenTime(item.dailyLimitMs)} daily
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={item.isActive}
                    onValueChange={() => handleToggle(item.id)}
                    disabled={isDeleting}
                  />
                </View>
              </View>
              {item.isActive && status && (
                <>
                  <Spacer size="sm" />
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text variant="caption" color="textSecondary">
                        {formatScreenTime(status.usedTodayMs)} used
                      </Text>
                      <Text
                        variant="caption"
                        style={{
                          color:
                            status.isExceeded
                              ? theme.colors.error
                              : theme.colors.textSecondary,
                        }}
                      >
                        {status.isExceeded
                          ? 'Limit exceeded'
                          : `${formatScreenTime(status.remainingMs)} left`}
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
                            width: `${Math.min(100, status.percentageUsed)}%`,
                            backgroundColor:
                              status.isExceeded
                                ? theme.colors.error
                                : status.percentageUsed >= 80
                                ? theme.colors.warning
                                : theme.colors.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </>
              )}
              <Spacer size="sm" />
              <View style={styles.limitActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEdit(item)}
                  disabled={isDeleting}
                >
                  <Icon name="edit" size="sm" color={theme.colors.primary} />
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.primary, marginLeft: 4 }}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(item.id, displayName)}
                  disabled={isDeleting}
                >
                  <Icon name="delete" size="sm" color={theme.colors.error} />
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.error, marginLeft: 4 }}
                  >
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Card>
        </Animated.View>
      );
    },
    [
      theme,
      deletingId,
      getLimitStatus,
      getAppName,
      handleToggle,
      handleEdit,
      handleDelete,
    ]
  );
  const renderSectionHeader = (title: string, count: number) => (
    <View style={styles.sectionHeader}>
      <Text variant="h4">{title}</Text>
      <View
        style={[
          styles.badge,
          { backgroundColor: theme.colors.primary + '20' },
        ]}
      >
        <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
          {count}
        </Text>
      </View>
    </View>
  );
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <IconButton icon="back" onPress={handleBack} variant="ghost" size="md" />
        <Text variant="h4" style={styles.headerTitle}>
          App Limits
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      {limits.length === 0 ? (
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.emptyContainer}
        >
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: theme.colors.primary + '15' },
            ]}
          >
            <Icon name="timer" size="xl" color={theme.colors.primary} />
          </View>
          <Spacer size="lg" />
          <Text variant="h4" align="center">
            No Limits Set
          </Text>
          <Spacer size="xs" />
          <Text variant="body" color="textSecondary" align="center">
            Set daily limits for apps to help manage your screen time
          </Text>
          <Spacer size="lg" />
          <Button variant="primary" onPress={handleAddLimit}>
            Add Your First Limit
          </Button>
        </Animated.View>
      ) : (
        <FlatList
          data={[...activeLimits, ...inactiveLimits]}
          keyExtractor={(item) => item.id}
          renderItem={renderLimitItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Animated.View entering={FadeInDown.duration(400)}>
              <Card variant="filled" style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text variant="h3" style={{ color: theme.colors.primary }}>
                      {activeLimits.length}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      Active Limits
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.summaryDivider,
                      { backgroundColor: theme.colors.border },
                    ]}
                  />
                  <View style={styles.summaryItem}>
                    <Text variant="h3" style={{ color: theme.colors.error }}>
                      {limitStatuses.filter((s) => s.isExceeded).length}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      Exceeded Today
                    </Text>
                  </View>
                </View>
              </Card>
              <Spacer size="lg" />
              <Button
                variant="outline"
                onPress={handleAddLimit}
                style={styles.addButton}
              >
                Add New Limit
              </Button>
              <Spacer size="lg" />
              {activeLimits.length > 0 && (
                <>
                  {renderSectionHeader('Active', activeLimits.length)}
                  <Spacer size="sm" />
                </>
              )}
            </Animated.View>
          }
          ListFooterComponent={
            inactiveLimits.length > 0 ? (
              <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                <Spacer size="lg" />
                {renderSectionHeader('Inactive', inactiveLimits.length)}
                <Spacer size="sm" />
              </Animated.View>
            ) : null
          }
        />
      )}
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
  },
  headerSpacer: {
    width: 48,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
  },
  addButton: {
    borderStyle: 'dashed',
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  limitCard: {
    marginBottom: 12,
  },
  limitHeader: {},
  limitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  limitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  limitIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  limitTitleText: {
    marginLeft: 12,
    flex: 1,
  },
  progressSection: {},
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  limitActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default LimitsManagementScreen;
