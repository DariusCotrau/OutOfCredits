import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@theme';
import {
  SafeArea,
  Container,
  Text,
  Card,
  Spacer,
  Icon,
  Divider,
  SwitchListItem,
  Button,
} from '@shared/components';
import { photoVerificationService } from '@services/verification';
import type { UserVerificationPreferences } from '@services/verification';
export function PhotoVerificationSettingsScreen() {
  const { theme } = useTheme();
  const [preferences, setPreferences] = useState<UserVerificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCamera, setHasCamera] = useState(true);
  const [stats, setStats] = useState<{
    totalVerified: number;
    totalSkipped: number;
    verificationRate: number;
  } | null>(null);
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const cameraAvailable = await photoVerificationService.hasCamera();
        setHasCamera(cameraAvailable);
        const prefsResult = await photoVerificationService.getUserPreferences();
        if (prefsResult.success && prefsResult.data) {
          setPreferences(prefsResult.data);
        }
        const statsResult = await photoVerificationService.getVerificationStats();
        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data);
        }
      } catch (error) {
        console.error('Failed to load verification settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  const handleToggleEnabled = useCallback(async (enabled: boolean) => {
    if (!preferences) return;
    const updated = { ...preferences, defaultEnabled: enabled };
    setPreferences(updated);
    const result = await photoVerificationService.updateUserPreferences({
      defaultEnabled: enabled,
    });
    if (!result.success) {
      setPreferences(preferences);
      Alert.alert('Eroare', 'Nu s-a putut actualiza setarea.');
    }
  }, [preferences]);
  const handleToggleRequired = useCallback(async (required: boolean) => {
    if (!preferences) return;
    const updated = { ...preferences, defaultRequired: required };
    setPreferences(updated);
    const result = await photoVerificationService.updateUserPreferences({
      defaultRequired: required,
    });
    if (!result.success) {
      setPreferences(preferences);
      Alert.alert('Eroare', 'Nu s-a putut actualiza setarea.');
    }
  }, [preferences]);
  const handleRequestPermission = useCallback(async () => {
    const granted = await photoVerificationService.requestCameraPermission();
    if (granted) {
      Alert.alert('Succes', 'Permisiunea pentru camera a fost acordata.');
    } else {
      Alert.alert(
        'Permisiune Refuzata',
        'Te rog sa activezi permisiunea pentru camera din setarile dispozitivului.'
      );
    }
  }, []);
  if (isLoading) {
    return (
      <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Container padding="lg" style={styles.loadingContainer}>
          <Text variant="body" color="textSecondary">
            Se incarca...
          </Text>
        </Container>
      </SafeArea>
    );
  }
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Container padding="lg">
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={[styles.infoCard, { backgroundColor: theme.colors.primary + '10' }]}>
              <Icon name="camera" size="lg" color={theme.colors.primary} />
              <Spacer size="md" />
              <Text variant="body" align="center">
                Verificarea prin fotografie confirma completarea activitatilor.
                Fotografiile nu sunt salvate si sunt sterse imediat dupa verificare.
              </Text>
            </View>
          </Animated.View>
          <Spacer size="xl" />
          {!hasCamera && (
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              <Card variant="outlined" style={styles.warningCard}>
                <View style={styles.warningContent}>
                  <Icon name="warning" size="md" color={theme.colors.warning} />
                  <View style={styles.warningText}>
                    <Text variant="body" style={{ color: theme.colors.warning }}>
                      Camera Indisponibila
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      Acest dispozitiv nu are camera sau permisiunea nu a fost acordata.
                    </Text>
                  </View>
                </View>
                <Spacer size="md" />
                <Button
                  variant="outline"
                  size="sm"
                  onPress={handleRequestPermission}
                >
                  Verifica Permisiuni
                </Button>
              </Card>
              <Spacer size="lg" />
            </Animated.View>
          )}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Setari Implicite
            </Text>
            <Card variant="outlined" style={styles.settingsCard}>
              <SwitchListItem
                label="Verificare foto activata"
                description="Cere o fotografie la completarea activitatilor"
                value={preferences?.defaultEnabled ?? false}
                onValueChange={handleToggleEnabled}
                disabled={!hasCamera}
              />
              <Divider />
              <SwitchListItem
                label="Verificare obligatorie"
                description="Nu permite omiterea verificarii foto"
                value={preferences?.defaultRequired ?? false}
                onValueChange={handleToggleRequired}
                disabled={!hasCamera || !preferences?.defaultEnabled}
              />
            </Card>
          </Animated.View>
          <Spacer size="xl" />
          {stats && (stats.totalVerified > 0 || stats.totalSkipped > 0) && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
                Statistici Verificare
              </Text>
              <Card variant="elevated">
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Icon name="check" size="md" color={theme.colors.success} />
                    <Text variant="h3" style={{ marginTop: 8 }}>
                      {stats.totalVerified}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      Verificate
                    </Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                  <View style={styles.statItem}>
                    <Icon name="forward" size="md" color={theme.colors.textSecondary} />
                    <Text variant="h3" style={{ marginTop: 8 }}>
                      {stats.totalSkipped}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      Omise
                    </Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                  <View style={styles.statItem}>
                    <Icon name="chart" size="md" color={theme.colors.primary} />
                    <Text variant="h3" style={{ marginTop: 8 }}>
                      {stats.verificationRate.toFixed(0)}%
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      Rata
                    </Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
          )}
          <Spacer size="xl" />
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Informatii
            </Text>
            <Card variant="outlined">
              <View style={styles.infoItem}>
                <Icon name="lock" size="sm" color={theme.colors.textSecondary} />
                <Text variant="caption" color="textSecondary" style={styles.infoItemText}>
                  Fotografiile nu sunt salvate si nu parasesc dispozitivul
                </Text>
              </View>
              <Divider />
              <View style={styles.infoItem}>
                <Icon name="timer" size="sm" color={theme.colors.textSecondary} />
                <Text variant="caption" color="textSecondary" style={styles.infoItemText}>
                  Poti configura verificarea individual pentru fiecare activitate
                </Text>
              </View>
              <Divider />
              <View style={styles.infoItem}>
                <Icon name="star" size="sm" color={theme.colors.textSecondary} />
                <Text variant="caption" color="textSecondary" style={styles.infoItemText}>
                  Activitatile verificate au un badge special in istoric
                </Text>
              </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  warningCard: {
    padding: 16,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningText: {
    marginLeft: 12,
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  infoItemText: {
    marginLeft: 12,
    flex: 1,
  },
});
export default PhotoVerificationSettingsScreen;
