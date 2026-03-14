import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@theme';
import { useUsageStore } from '@stores/usage';
import {
  SafeArea,
  Container,
  Text,
  Card,
  Spacer,
  Icon,
  IconButton,
} from '@shared/components';
import { formatScreenTime } from '@shared/utils';
import type { AppUsageRecord } from '@services/usage';
import type { UsageStackParamList } from '@shared/types';
type NavigationProp = NativeStackNavigationProp<UsageStackParamList, 'AllApps'>;
type SortOption = 'time' | 'name' | 'opens';
type FilterOption = 'all' | 'social' | 'entertainment' | 'productivity' | 'other';
export function AllAppsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const todayUsage = useUsageStore((s) => s.todayUsage);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('time');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const handleAppPress = useCallback(
    (packageName: string) => {
      navigation.navigate('AppDetails', { packageName });
    },
    [navigation]
  );
  const filteredApps = useMemo(() => {
    let apps = [...todayUsage];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      apps = apps.filter(
        (app) =>
          app.appName.toLowerCase().includes(query) ||
          app.packageName.toLowerCase().includes(query)
      );
    }
    if (filterBy !== 'all') {
      apps = apps.filter((app) => app.category === filterBy);
    }
    switch (sortBy) {
      case 'time':
        apps.sort((a, b) => b.totalTimeInForeground - a.totalTimeInForeground);
        break;
      case 'name':
        apps.sort((a, b) => a.appName.localeCompare(b.appName));
        break;
      case 'opens':
        apps.sort((a, b) => b.launchCount - a.launchCount);
        break;
    }
    return apps;
  }, [todayUsage, searchQuery, sortBy, filterBy]);
  const renderAppItem = useCallback(
    ({ item, index }: { item: AppUsageRecord; index: number }) => {
      const maxTime = Math.max(...todayUsage.map((a) => a.totalTimeInForeground), 1);
      const percentage = (item.totalTimeInForeground / maxTime) * 100;
      return (
        <Animated.View entering={FadeInRight.delay(index * 30).duration(300)}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleAppPress(item.packageName)}
          >
            <Card variant="outlined" style={styles.appCard}>
              <View style={styles.appRow}>
                <View
                  style={[
                    styles.appIcon,
                    { backgroundColor: theme.colors.primary + '15' },
                  ]}
                >
                  <Text style={{ fontSize: 24 }}>📱</Text>
                </View>
                <View style={styles.appInfo}>
                  <Text variant="body" numberOfLines={1}>
                    {item.appName}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    {item.category ?? 'Other'} • {item.launchCount} opens
                  </Text>
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
                            width: `${percentage}%`,
                            backgroundColor: theme.colors.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.appTime}>
                  <Text variant="bodySmall" style={{ fontWeight: '600' }}>
                    {formatScreenTime(item.totalTimeInForeground)}
                  </Text>
                  <Icon name="chevronRight" size="sm" color={theme.colors.textSecondary} />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [todayUsage, theme, handleAppPress]
  );
  const renderSortButton = (option: SortOption, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor:
            sortBy === option ? theme.colors.primary : theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() => setSortBy(option)}
    >
      <Text
        variant="bodySmall"
        style={{ color: sortBy === option ? '#fff' : theme.colors.text }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  const renderFilterButton = (option: FilterOption, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor:
            filterBy === option ? theme.colors.accent : theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() => setFilterBy(option)}
    >
      <Text
        variant="bodySmall"
        style={{ color: filterBy === option ? '#fff' : theme.colors.text }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <IconButton icon="back" onPress={handleBack} variant="ghost" size="md" />
        <Text variant="h4" style={styles.headerTitle}>
          All Apps
        </Text>
        <IconButton
          icon="filter"
          onPress={() => setShowFilters(!showFilters)}
          variant={showFilters ? 'filled' : 'ghost'}
          color="primary"
          size="md"
        />
      </View>
      <Container padding="md">
        <Animated.View entering={FadeInDown.duration(400)}>
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Icon name="search" size="sm" color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search apps..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close" size="sm" color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
        {showFilters && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <Spacer size="md" />
            <Text variant="bodySmall" color="textSecondary">
              Sort by
            </Text>
            <Spacer size="xs" />
            <View style={styles.filterRow}>
              {renderSortButton('time', 'Time')}
              {renderSortButton('name', 'Name')}
              {renderSortButton('opens', 'Opens')}
            </View>
            <Spacer size="sm" />
            <Text variant="bodySmall" color="textSecondary">
              Category
            </Text>
            <Spacer size="xs" />
            <View style={styles.filterRow}>
              {renderFilterButton('all', 'All')}
              {renderFilterButton('social', 'Social')}
              {renderFilterButton('entertainment', 'Entertainment')}
              {renderFilterButton('productivity', 'Productivity')}
            </View>
          </Animated.View>
        )}
        <Spacer size="md" />
        <Text variant="bodySmall" color="textSecondary">
          {filteredApps.length} app{filteredApps.length !== 1 ? 's' : ''}
        </Text>
        <Spacer size="sm" />
      </Container>
      <FlatList
        data={filteredApps}
        keyExtractor={(item) => item.packageName}
        renderItem={renderAppItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="search" size="xl" color={theme.colors.textSecondary} />
            <Spacer size="md" />
            <Text variant="body" color="textSecondary" align="center">
              No apps found
            </Text>
            <Text variant="caption" color="textSecondary" align="center">
              Try adjusting your search or filters
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
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  appCard: {
    marginBottom: 8,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfo: {
    flex: 1,
    marginLeft: 12,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  appTime: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
});
export default AllAppsScreen;
