import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@theme';
import { useAuthStore, useAuthActions } from '@stores/auth';
import {
  SafeArea,
  Container,
  Text,
  Button,
  Input,
  Spacer,
  IconButton,
  Icon,
} from '@shared/components';
import { useForm, required, email, compose } from '@shared/hooks';
import type { AuthStackParamList } from '@shared/types';
type ForgotPasswordNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;
interface ForgotPasswordFormValues {
  email: string;
}
export function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const { theme } = useTheme();
  const { resetPassword, clearError } = useAuthActions();
  const { isLoading, error } = useAuthStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const form = useForm<ForgotPasswordFormValues>({
    initialValues: {
      email: '',
    },
    validationRules: {
      email: compose(
        required('Email is required'),
        email('Please enter a valid email')
      ),
    },
    validateOnBlur: true,
  });
  useEffect(() => {
    clearError();
  }, [clearError]);
  const handleResetPassword = useCallback(async () => {
    const success = await resetPassword(form.values.email);
    if (success) {
      setIsSuccess(true);
    }
  }, [resetPassword, form.values.email]);
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const handleTryAgain = useCallback(() => {
    setIsSuccess(false);
    form.reset();
    clearError();
  }, [form, clearError]);
  if (isSuccess) {
    return (
      <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <IconButton
            icon="back"
            onPress={handleBack}
            variant="ghost"
            size="md"
          />
        </View>
        <Container padding="lg" style={styles.successContent}>
          <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.successContainer}
          >
            <View
              style={[
                styles.successIconContainer,
                { backgroundColor: theme.colors.success + '15' },
              ]}
            >
              <Icon name="check" size="xl" color={theme.colors.success} />
            </View>
            <Spacer size="lg" />
            <Text variant="h2" align="center">
              Check Your Email
            </Text>
            <Spacer size="sm" />
            <Text variant="body" color="textSecondary" align="center">
              We've sent a password reset link to:
            </Text>
            <Spacer size="xs" />
            <Text variant="body" weight="semibold" align="center">
              {form.values.email}
            </Text>
            <Spacer size="lg" />
            <Text
              variant="bodySmall"
              color="textTertiary"
              align="center"
              style={styles.instructionText}
            >
              Click the link in your email to reset your password. If you don't see the email, check your spam folder.
            </Text>
            <Spacer size="xl" />
            <Button onPress={handleBack} fullWidth>
              Back to Sign In
            </Button>
            <Spacer size="md" />
            <Button variant="ghost" onPress={handleTryAgain} fullWidth>
              Didn't receive email? Try again
            </Button>
          </Animated.View>
        </Container>
      </SafeArea>
    );
  }
  return (
    <SafeArea style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <IconButton
              icon="back"
              onPress={handleBack}
              variant="ghost"
              size="md"
            />
          </View>
          <Container padding="lg" style={styles.content}>
            <Animated.View entering={FadeInUp.duration(400)}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.primary + '15' },
                ]}
              >
                <Icon name="lock" size="xl" color={theme.colors.primary} />
              </View>
              <Spacer size="lg" />
              <Text variant="h2" align="center">
                Forgot Password?
              </Text>
              <Spacer size="sm" />
              <Text variant="body" color="textSecondary" align="center">
                No worries! Enter your email address and we'll send you a link to reset your password.
              </Text>
            </Animated.View>
            <Spacer size="xl" />
            <Animated.View entering={FadeInUp.delay(200).duration(400)}>
              {error && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  style={[
                    styles.errorContainer,
                    { backgroundColor: theme.colors.error + '15' },
                  ]}
                >
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.error }}
                    align="center"
                  >
                    {error.message}
                  </Text>
                </Animated.View>
              )}
              <Input
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus
                returnKeyType="done"
                value={form.values.email}
                onChangeText={(text) => form.setValue('email', text)}
                onBlur={() => form.setTouched('email')}
                error={
                  form.touched.email ? form.errors.email?.message : undefined
                }
                editable={!isLoading}
              />
              <Spacer size="xl" />
              <Button
                onPress={form.handleSubmit(handleResetPassword)}
                disabled={isLoading || !form.isValid}
                loading={isLoading}
                fullWidth
              >
                Send Reset Link
              </Button>
              <Spacer size="lg" />
              <Button variant="ghost" onPress={handleBack} fullWidth>
                Back to Sign In
              </Button>
            </Animated.View>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeArea>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
  },
  successContainer: {
    alignItems: 'center',
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    paddingHorizontal: 24,
  },
});
export default ForgotPasswordScreen;
