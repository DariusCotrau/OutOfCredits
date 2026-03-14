import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
import { useAuthStore } from '@stores/auth';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { Text } from '@shared/components';
import type { RootStackParamList } from '@shared/types';
const Stack = createNativeStackNavigator<RootStackParamList>();
function LoadingScreen() {
  const { theme } = useTheme();
  return (
    <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={styles.loadingContent}
      >
        <View
          style={[
            styles.logoContainer,
            { backgroundColor: theme.colors.primary + '15' },
          ]}
        >
          <Text style={styles.logoText}>🧘</Text>
        </View>
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={styles.spinner}
        />
        <Text variant="body" color="textSecondary">
          Loading...
        </Text>
      </Animated.View>
    </View>
  );
}
export function RootNavigator() {
  const { theme, isDark } = useTheme();
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();
  useEffect(() => {
    initialize();
  }, [initialize]);
  const navigationTheme = {
    dark: isDark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.error,
    },
  };
  if (!isInitialized) {
    return <LoadingScreen />;
  }
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen
            name="Main"
            component={MainNavigator}
            options={{
              animation: 'fade',
            }}
          />
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{
              animation: 'fade',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 48,
  },
  spinner: {
    marginBottom: 16,
  },
});
export default RootNavigator;
