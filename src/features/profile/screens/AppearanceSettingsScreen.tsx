import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme, ThemeMode } from '@theme';
import { useUserSettings, useAuthActions } from '@stores/auth';
import {
  SafeArea,
  Container,
  Text,
  Card,
  Spacer,
  Icon,
  IconButton,
  Switch,
} from '@shared/components';
type ThemeOptionMode = ThemeMode | 'system';
interface ThemeOptionProps {
  label: string;
  description: string;
  icon: string;
  isSelected: boolean;
  onSelect: () => void;
}
function ThemeOption({
  label,
  description,
  icon,
  isSelected,
  onSelect,
}: ThemeOptionProps) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.themeOption,
        {
          backgroundColor: isSelected
            ? theme.colors.primary + '15'
            : 'transparent',
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
        },
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.themeOptionContent}>
        <View
          style={[
            styles.themeIconContainer,
            {
              backgroundColor: isSelected
                ? theme.colors.primary + '20'
                : theme.colors.surfaceVariant,
            },
          ]}
        >
          <Icon
            name={icon}
            size="lg"
            color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
          />
        </View>
        <View style={styles.themeTextContainer}>
          <Text
            variant="body"
            weight={isSelected ? 'semibold' : 'normal'}
            color={isSelected ? 'primary' : 'text'}
          >
            {label}
          </Text>
          <Text variant="caption" color="textSecondary">
            {description}
          </Text>
        </View>
      </View>
      {isSelected && (
        <Icon name="check" size="md" color={theme.colors.primary} />
      )}
    </TouchableOpacity>
  );
}
function ThemePreview() {
  const { theme, isDark } = useTheme();
  return (
    <View style={styles.previewContainer}>
      <View
        style={[
          styles.previewCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.previewHeader}>
          <View
            style={[
              styles.previewAvatar,
              { backgroundColor: theme.colors.primary },
            ]}
          />
          <View style={styles.previewHeaderText}>
            <View
              style={[
                styles.previewLine,
                { backgroundColor: theme.colors.text, width: '60%' },
              ]}
            />
            <View
              style={[
                styles.previewLineSmall,
                { backgroundColor: theme.colors.textSecondary, width: '40%' },
              ]}
            />
          </View>
        </View>
        <View style={styles.previewBody}>
          <View
            style={[
              styles.previewLine,
              { backgroundColor: theme.colors.textSecondary, width: '100%' },
            ]}
          />
          <View
            style={[
              styles.previewLine,
              { backgroundColor: theme.colors.textSecondary, width: '80%' },
            ]}
          />
          <View
            style={[
              styles.previewLine,
              { backgroundColor: theme.colors.textSecondary, width: '90%' },
            ]}
          />
        </View>
        <View
          style={[
            styles.previewButton,
            { backgroundColor: theme.colors.primary },
          ]}
        />
      </View>
      <Text variant="caption" color="textTertiary" align="center" style={styles.previewLabel}>
        {isDark ? 'Dark Mode' : 'Light Mode'} Preview
      </Text>
    </View>
  );
}
export function AppearanceSettingsScreen() {
  const navigation = useNavigation();
  const { theme, mode, isSystemTheme, setMode, setFollowSystem } = useTheme();
  const settings = useUserSettings();
  const { updateSettings } = useAuthActions();
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const appearance = settings?.appearance ?? {
    theme: mode,
    useSystemTheme: isSystemTheme,
    accentColor: theme.colors.primary,
    fontScale: 1,
    animationsEnabled: true,
    reduceMotion: false,
    hapticFeedback: true,
  };
  const handleThemeSelect = useCallback(
    async (selectedMode: ThemeOptionMode) => {
      if (selectedMode === 'system') {
        setFollowSystem(true);
        await updateSettings({
          appearance: {
            ...appearance,
            useSystemTheme: true,
          },
        });
        return;
      }
      setFollowSystem(false);
      setMode(selectedMode);
      await updateSettings({
        appearance: {
          ...appearance,
          theme: selectedMode,
          useSystemTheme: false,
        },
      });
    },
    [setFollowSystem, setMode, updateSettings, appearance]
  );
  const handleAppearanceToggle = useCallback(
    async (updates: Partial<typeof appearance>) => {
      await updateSettings({
        appearance: {
          ...appearance,
          ...updates,
        },
      });
    },
    [appearance, updateSettings]
  );
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <IconButton
          icon="back"
          onPress={handleBack}
          variant="ghost"
          size="md"
        />
        <Text variant="h4">Appearance</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="lg">
          <Animated.View entering={FadeInDown.duration(400)}>
            <ThemePreview />
          </Animated.View>
          <Spacer size="xl" />
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Theme
            </Text>
            <ThemeOption
              label="Light"
              description="Always use light theme"
              icon="star"
              isSelected={!isSystemTheme && mode === 'light'}
              onSelect={() => handleThemeSelect('light')}
            />
            <Spacer size="sm" />
            <ThemeOption
              label="Dark"
              description="Always use dark theme"
              icon="moon"
              isSelected={!isSystemTheme && mode === 'dark'}
              onSelect={() => handleThemeSelect('dark')}
            />
            <Spacer size="sm" />
            <ThemeOption
              label="System"
              description="Follow system settings"
              icon="settings"
              isSelected={isSystemTheme}
              onSelect={() => handleThemeSelect('system')}
            />
          </Animated.View>
          <Spacer size="xl" />
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Accessibility
            </Text>
            <Card variant="outlined" style={styles.settingsCard}>
              <Switch
                value={appearance.reduceMotion}
                onValueChange={(value) =>
                  handleAppearanceToggle({ reduceMotion: value })
                }
                label="Reduce Motion"
                description="Minimize animations throughout the app"
              />
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Switch
                value={appearance.fontScale > 1}
                onValueChange={(value) =>
                  handleAppearanceToggle({ fontScale: value ? 1.15 : 1 })
                }
                label="Large Text"
                description="Increase the base text size"
              />
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Switch
                value={appearance.hapticFeedback}
                onValueChange={(value) =>
                  handleAppearanceToggle({ hapticFeedback: value })
                }
                label="Haptic Feedback"
                description="Vibrate on important interactions"
              />
            </Card>
          </Animated.View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSpacer: {
    width: 48,
  },
  scrollContent: {
    flexGrow: 1,
  },
  sectionTitle: {
    marginBottom: 12,
    marginLeft: 4,
  },
  previewContainer: {
    alignItems: 'center',
  },
  previewCard: {
    width: 200,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  previewHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  previewLine: {
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  previewLineSmall: {
    height: 6,
    borderRadius: 3,
  },
  previewBody: {
    marginBottom: 16,
  },
  previewButton: {
    height: 32,
    borderRadius: 8,
  },
  previewLabel: {
    marginTop: 12,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
});
export default AppearanceSettingsScreen;
