import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@theme';
import {
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
} from '@features/auth';
import type { AuthStackParamList } from '@shared/types';
const Stack = createNativeStackNavigator<AuthStackParamList>();
export function AuthNavigator() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}
export default AuthNavigator;
