import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme';
import {
  SafeArea,
  Container,
  Text,
  Card,
  Spacer,
  Icon,
  IconButton,
  Divider,
} from '@shared/components';
import { APP_VERSION, APP_BUILD, PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@shared/constants';
export function AboutScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const handlePrivacyPolicy = useCallback(() => {
    Linking.openURL(PRIVACY_POLICY_URL);
  }, []);
  const handleTerms = useCallback(() => {
    Linking.openURL(TERMS_OF_SERVICE_URL);
  }, []);
  const handleOpenSource = useCallback(() => {
    Linking.openURL('https://github.com/mindfultime/app');
  }, []);
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <IconButton icon="back" onPress={handleBack} variant="ghost" size="md" />
        <Text variant="h4">About</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Container padding="lg">
          <Animated.View entering={FadeInDown.duration(400)} style={styles.appInfo}>
            <View
              style={[
                styles.logoContainer,
                { backgroundColor: theme.colors.primary + '15' },
              ]}
            >
              <Text style={styles.logoEmoji}>🧘</Text>
            </View>
            <Spacer size="md" />
            <Text variant="h2" align="center">
              MindfulTime
            </Text>
            <Text variant="body" color="textSecondary" align="center">
              Digital Wellness for a Balanced Life
            </Text>
            <Spacer size="sm" />
            <Text variant="caption" color="textTertiary" align="center">
              Version {APP_VERSION} ({APP_BUILD})
            </Text>
          </Animated.View>
          <Spacer size="xl" />
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Card variant="outlined">
              <Text variant="body" color="textSecondary" align="center">
                MindfulTime helps you build healthier relationships with technology through mindfulness activities, screen time awareness, and gamified progress tracking.
              </Text>
            </Card>
          </Animated.View>
          <Spacer size="xl" />
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Legal
            </Text>
            <Card variant="outlined" style={styles.linksCard}>
              <TouchableOpacity
                style={styles.linkItem}
                onPress={handlePrivacyPolicy}
                activeOpacity={0.7}
              >
                <Text variant="body">Privacy Policy</Text>
                <Icon name="forward" size="sm" color={theme.colors.textTertiary} />
              </TouchableOpacity>
              <Divider />
              <TouchableOpacity
                style={styles.linkItem}
                onPress={handleTerms}
                activeOpacity={0.7}
              >
                <Text variant="body">Terms of Service</Text>
                <Icon name="forward" size="sm" color={theme.colors.textTertiary} />
              </TouchableOpacity>
              <Divider />
              <TouchableOpacity
                style={styles.linkItem}
                onPress={handleOpenSource}
                activeOpacity={0.7}
              >
                <Text variant="body">Open Source Licenses</Text>
                <Icon name="forward" size="sm" color={theme.colors.textTertiary} />
              </TouchableOpacity>
            </Card>
          </Animated.View>
          <Spacer size="xl" />
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Credits
            </Text>
            <Card variant="outlined">
              <Text variant="bodySmall" color="textSecondary" align="center">
                Built with React Native, TypeScript, and Firebase.
              </Text>
              <Spacer size="sm" />
              <Text variant="bodySmall" color="textSecondary" align="center">
                Icons by Feather Icons and Material Design.
              </Text>
              <Spacer size="sm" />
              <Text variant="bodySmall" color="textSecondary" align="center">
                Animations powered by React Native Reanimated.
              </Text>
            </Card>
          </Animated.View>
          <Spacer size="xl" />
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <Text variant="caption" color="textTertiary" align="center">
              © 2024 MindfulTime. All rights reserved.
            </Text>
            <Spacer size="xs" />
            <Text variant="caption" color="textTertiary" align="center">
              Made with ❤️ for digital wellness
            </Text>
          </Animated.View>
          <Spacer size="lg" />
        </Container>
      </ScrollView>
    </SafeArea>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSpacer: { width: 48 },
  scrollContent: { flexGrow: 1 },
  appInfo: {
    alignItems: 'center',
    paddingTop: 24,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 48,
  },
  sectionTitle: { marginBottom: 8, marginLeft: 4 },
  linksCard: { padding: 0, overflow: 'hidden' },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
});
export default AboutScreen;
