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
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
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
  Divider,
} from '@shared/components';
import { useForm, required, email, minLength, compose } from '@shared/hooks';
import type { AuthStackParamList } from '@shared/types';
type LoginNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;
interface LoginFormValues {
  email: string;
  password: string;
}
export function LoginScreen() {
  const navigation = useNavigation<LoginNavigationProp>();
  const { theme } = useTheme();
  const { signIn, signInAnonymously, clearError } = useAuthActions();
  const { isLoading, error } = useAuthStore();
  const isHardcodedLogin = (value: unknown): boolean =>
    String(value ?? '').trim().toLowerCase() === 'dariusc';
  const emailOrHardcoded =
    (message = 'Please enter a valid email') =>
    (value: unknown): string | undefined => {
      if (!value) return undefined;
      if (isHardcodedLogin(value)) return undefined;
      return email(message)(value);
    };
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const form = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validationRules: {
      email: compose(
        required('Email is required'),
        emailOrHardcoded('Please enter a valid email')
      ),
      password: compose(
        required('Password is required'),
        minLength(6, 'Password must be at least 6 characters')
      ),
    },
    validateOnBlur: true,
  });
  useEffect(() => {
    clearError();
    logoOpacity.value = withDelay(200, withSpring(1));
    logoScale.value = withDelay(200, withSpring(1, { damping: 12 }));
  }, [clearError, logoOpacity, logoScale]);
  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const handleLogin = useCallback(async () => {
    const success = await signIn({
      email: form.values.email,
      password: form.values.password,
    });
    if (success) {
    }
  }, [signIn, form.values]);
  const handleAnonymousLogin = useCallback(async () => {
    await signInAnonymously();
  }, [signInAnonymously]);
  const handleForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword', {});
  }, [navigation]);
  const handleRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);
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
          <Container padding="lg" style={styles.content}>
            <Animated.View style={[styles.header, animatedLogoStyle]}>
              <View
                style={[
                  styles.logoContainer,
                  { backgroundColor: theme.colors.primary + '15' },
                ]}
              >
                <Text
                  style={[styles.logoText, { color: theme.colors.primary }]}
                >
                  🧘
                </Text>
              </View>
              <Spacer size="md" />
              <Text variant="h1" align="center">
                MindfulTime
              </Text>
              <Spacer size="xs" />
              <Text variant="body" color="textSecondary" align="center">
                Take control of your digital wellbeing
              </Text>
            </Animated.View>
            <Spacer size="xl" />
            <Animated.View entering={FadeInUp.delay(300).duration(400)}>
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
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                value={form.values.email}
                onChangeText={(text) => form.setValue('email', text)}
                onBlur={() => form.setTouched('email')}
                error={form.touched.email ? form.errors.email?.message : undefined}
                editable={!isLoading}
              />
              <Spacer size="md" />
              <Input
                label="Password"
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                returnKeyType="done"
                value={form.values.password}
                onChangeText={(text) => form.setValue('password', text)}
                onBlur={() => form.setTouched('password')}
                error={
                  form.touched.password ? form.errors.password?.message : undefined
                }
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPassword}
                disabled={isLoading}
              >
                <Text variant="bodySmall" color="primary">
                  Forgot password?
                </Text>
              </TouchableOpacity>
              <Spacer size="lg" />
              <Button
                onPress={form.handleSubmit(handleLogin)}
                disabled={isLoading || !form.isValid}
                loading={isLoading}
                fullWidth
              >
                Sign In
              </Button>
              <Spacer size="lg" />
              <Divider label="or" />
              <Spacer size="lg" />
              <Button
                variant="outline"
                onPress={handleAnonymousLogin}
                disabled={isLoading}
                fullWidth
              >
                Continue without account
              </Button>
            </Animated.View>
            <Spacer size="xl" />
            <Animated.View
              entering={FadeInUp.delay(500).duration(400)}
              style={styles.registerContainer}
            >
              <Text variant="body" color="textSecondary">
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
                <Text variant="body" color="primary" weight="semibold">
                  Sign Up
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
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    padding: 4,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default LoginScreen;
