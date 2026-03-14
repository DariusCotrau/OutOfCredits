import React, { useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
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
  Checkbox,
} from '@shared/components';
import {
  useForm,
  required,
  email,
  minLength,
  maxLength,
  matchField,
  compose,
} from '@shared/hooks';
import type { AuthStackParamList } from '@shared/types';
type RegisterNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;
interface RegisterFormValues {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}
const PASSWORD_REQUIREMENTS = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
];
export function RegisterScreen() {
  const navigation = useNavigation<RegisterNavigationProp>();
  const { theme } = useTheme();
  const { signUp, clearError } = useAuthActions();
  const { isLoading, error } = useAuthStore();
  const form = useForm<RegisterFormValues>({
    initialValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    validationRules: {
      displayName: compose(
        required('Name is required'),
        minLength(2, 'Name must be at least 2 characters'),
        maxLength(50, 'Name must be at most 50 characters')
      ),
      email: compose(
        required('Email is required'),
        email('Please enter a valid email')
      ),
      password: compose(
        required('Password is required'),
        minLength(8, 'Password must be at least 8 characters')
      ),
      confirmPassword: compose(
        required('Please confirm your password'),
        matchField<RegisterFormValues>('password', 'Passwords do not match')
      ),
      acceptTerms: (value) => {
        if (!value) return 'You must accept the terms and conditions';
        return undefined;
      },
    },
    validateOnBlur: true,
  });
  useEffect(() => {
    clearError();
  }, [clearError]);
  const handleRegister = useCallback(async () => {
    const success = await signUp({
      email: form.values.email,
      password: form.values.password,
      displayName: form.values.displayName,
    });
    if (success) {
    }
  }, [signUp, form.values]);
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const handleTermsPress = useCallback(() => {
  }, []);
  const passwordStrength = PASSWORD_REQUIREMENTS.filter((req) =>
    req.test(form.values.password)
  ).length;
  const getStrengthColor = () => {
    if (passwordStrength <= 1) return theme.colors.error;
    if (passwordStrength <= 2) return theme.colors.warning;
    if (passwordStrength <= 3) return theme.colors.accent;
    return theme.colors.success;
  };
  const getStrengthLabel = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };
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
              <Text variant="h2">Create Account</Text>
              <Spacer size="xs" />
              <Text variant="body" color="textSecondary">
                Join MindfulTime and start your digital wellness journey
              </Text>
            </Animated.View>
            <Spacer size="xl" />
            <Animated.View entering={FadeInUp.delay(200).duration(400)}>
              {error && (
                <Animated.View
                  entering={FadeIn.duration(200)}
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
                label="Display Name"
                placeholder="Enter your name"
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
                value={form.values.displayName}
                onChangeText={(text) => form.setValue('displayName', text)}
                onBlur={() => form.setTouched('displayName')}
                error={
                  form.touched.displayName
                    ? form.errors.displayName?.message
                    : undefined
                }
                editable={!isLoading}
              />
              <Spacer size="md" />
              <Input
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                value={form.values.email}
                onChangeText={(text) => form.setValue('email', text)}
                onBlur={() => form.setTouched('email')}
                error={
                  form.touched.email ? form.errors.email?.message : undefined
                }
                editable={!isLoading}
              />
              <Spacer size="md" />
              <Input
                label="Password"
                placeholder="Create a password"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                returnKeyType="next"
                value={form.values.password}
                onChangeText={(text) => form.setValue('password', text)}
                onBlur={() => form.setTouched('password')}
                error={
                  form.touched.password
                    ? form.errors.password?.message
                    : undefined
                }
                editable={!isLoading}
              />
              {form.values.password.length > 0 && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={styles.strengthContainer}
                >
                  <View style={styles.strengthBar}>
                    {[1, 2, 3, 4].map((level) => (
                      <View
                        key={level}
                        style={[
                          styles.strengthSegment,
                          {
                            backgroundColor:
                              level <= passwordStrength
                                ? getStrengthColor()
                                : theme.colors.border,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text
                    variant="caption"
                    style={{ color: getStrengthColor(), marginLeft: 8 }}
                  >
                    {getStrengthLabel()}
                  </Text>
                </Animated.View>
              )}
              <Spacer size="md" />
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password-new"
                returnKeyType="done"
                value={form.values.confirmPassword}
                onChangeText={(text) => form.setValue('confirmPassword', text)}
                onBlur={() => form.setTouched('confirmPassword')}
                error={
                  form.touched.confirmPassword
                    ? form.errors.confirmPassword?.message
                    : undefined
                }
                editable={!isLoading}
              />
              <Spacer size="lg" />
              <View style={styles.termsContainer}>
                <Checkbox
                  checked={form.values.acceptTerms}
                  onCheckedChange={(checked: boolean) =>
                    form.setValue('acceptTerms', checked)
                  }
                  disabled={isLoading}
                />
                <View style={styles.termsText}>
                  <Text variant="bodySmall" color="textSecondary">
                    I agree to the{' '}
                  </Text>
                  <TouchableOpacity onPress={handleTermsPress}>
                    <Text variant="bodySmall" color="primary">
                      Terms of Service
                    </Text>
                  </TouchableOpacity>
                  <Text variant="bodySmall" color="textSecondary">
                    {' '}and{' '}
                  </Text>
                  <TouchableOpacity onPress={handleTermsPress}>
                    <Text variant="bodySmall" color="primary">
                      Privacy Policy
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {form.touched.acceptTerms && form.errors.acceptTerms && (
                <Text
                  variant="caption"
                  style={{ color: theme.colors.error, marginTop: 4 }}
                >
                  {form.errors.acceptTerms.message}
                </Text>
              )}
              <Spacer size="xl" />
              <Button
                onPress={form.handleSubmit(handleRegister)}
                disabled={isLoading || !form.isValid}
                loading={isLoading}
                fullWidth
              >
                Create Account
              </Button>
            </Animated.View>
            <Spacer size="xl" />
            <Animated.View
              entering={FadeInUp.delay(400).duration(400)}
              style={styles.loginContainer}
            >
              <Text variant="body" color="textSecondary">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={handleBack} disabled={isLoading}>
                <Text variant="body" color="primary" weight="semibold">
                  Sign In
                </Text>
              </TouchableOpacity>
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
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  strengthBar: {
    flexDirection: 'row',
    flex: 1,
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  termsText: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default RegisterScreen;
