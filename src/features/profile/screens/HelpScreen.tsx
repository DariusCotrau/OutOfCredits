import React, { useCallback, useState } from 'react';
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
interface FAQItem {
  question: string;
  answer: string;
}
const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How does screen time tracking work?',
    answer:
      'MindfulTime uses Android\'s UsageStats API to track how much time you spend in each app. This data is stored locally and never shared.',
  },
  {
    question: 'What are mindfulness activities?',
    answer:
      'Mindfulness activities are short exercises designed to help you take a break from your screen. They include breathing exercises, meditation, and physical activities.',
  },
  {
    question: 'How do streaks work?',
    answer:
      'You maintain a streak by meeting your daily goals each day. Complete at least one mindfulness activity and stay under your screen time limit to keep your streak going.',
  },
  {
    question: 'Can I export my data?',
    answer:
      'Yes! Go to Settings > Privacy > Export Data to download all your usage statistics and activity history.',
  },
  {
    question: 'How do I earn badges?',
    answer:
      'Badges are earned by completing various achievements like maintaining streaks, completing activities, and reaching milestones.',
  },
];
function FAQItemComponent({ item, isExpanded, onToggle }: {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={styles.faqItem}
    >
      <View style={styles.faqHeader}>
        <Text variant="body" style={styles.faqQuestion}>
          {item.question}
        </Text>
        <Icon
          name={isExpanded ? 'remove' : 'add'}
          size="sm"
          color={theme.colors.textSecondary}
        />
      </View>
      {isExpanded && (
        <Animated.View entering={FadeInDown.duration(200)}>
          <Text variant="bodySmall" color="textSecondary" style={styles.faqAnswer}>
            {item.answer}
          </Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}
function ContactOption({ icon, label, description, onPress }: {
  icon: string;
  label: string;
  description: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={styles.contactOption}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.contactIcon,
          { backgroundColor: theme.colors.primary + '15' },
        ]}
      >
        <Icon name={icon} size="md" color={theme.colors.primary} />
      </View>
      <View style={styles.contactText}>
        <Text variant="body">{label}</Text>
        <Text variant="caption" color="textSecondary">
          {description}
        </Text>
      </View>
      <Icon name="forward" size="sm" color={theme.colors.textTertiary} />
    </TouchableOpacity>
  );
}
export function HelpScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const handleEmail = useCallback(() => {
    Linking.openURL('mailto:support@mindfultime.app');
  }, []);
  const handleWebsite = useCallback(() => {
    Linking.openURL('https://mindfultime.app/help');
  }, []);
  const toggleFAQ = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }, []);
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <IconButton icon="back" onPress={handleBack} variant="ghost" size="md" />
        <Text variant="h4">Help & Support</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Container padding="lg">
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Contact Us
            </Text>
            <Card variant="outlined" style={styles.contactCard}>
              <ContactOption
                icon="email"
                label="Email Support"
                description="Get help via email"
                onPress={handleEmail}
              />
              <Divider />
              <ContactOption
                icon="help"
                label="Help Center"
                description="Browse help articles"
                onPress={handleWebsite}
              />
            </Card>
          </Animated.View>
          <Spacer size="xl" />
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text variant="label" color="textSecondary" style={styles.sectionTitle}>
              Frequently Asked Questions
            </Text>
            <Card variant="outlined" style={styles.faqCard}>
              {FAQ_ITEMS.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <Divider />}
                  <FAQItemComponent
                    item={item}
                    isExpanded={expandedIndex === index}
                    onToggle={() => toggleFAQ(index)}
                  />
                </React.Fragment>
              ))}
            </Card>
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
  sectionTitle: { marginBottom: 8, marginLeft: 4 },
  contactCard: { padding: 0, overflow: 'hidden' },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactText: {
    flex: 1,
    marginLeft: 12,
  },
  faqCard: { padding: 0, overflow: 'hidden' },
  faqItem: {
    padding: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    marginTop: 12,
    lineHeight: 20,
  },
});
export default HelpScreen;
