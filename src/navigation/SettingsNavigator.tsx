import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@theme';
import {
  ProfileScreen,
  EditProfileScreen,
  NotificationSettingsScreen,
  PrivacySettingsScreen,
  ScreenTimeSettingsScreen,
  AppearanceSettingsScreen,
  AccountSettingsScreen,
  HelpScreen,
  AboutScreen,
  PhotoVerificationSettingsScreen,
} from '@features/profile';
import type { SettingsStackParamList } from '@shared/types';
const Stack = createNativeStackNavigator<SettingsStackParamList>();
export function SettingsNavigator() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="Profile"
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
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
      />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen
        name="ScreenTimeSettings"
        component={ScreenTimeSettingsScreen}
      />
      <Stack.Screen
        name="AppearanceSettings"
        component={AppearanceSettingsScreen}
      />
      <Stack.Screen
        name="PhotoVerificationSettings"
        component={PhotoVerificationSettingsScreen}
      />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}
export default SettingsNavigator;
