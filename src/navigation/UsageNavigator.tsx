import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  UsageDashboardScreen,
  AppDetailsScreen,
  AllAppsScreen,
  LimitsManagementScreen,
  CreateLimitScreen,
} from '@features/usage';
import type { UsageStackParamList } from '@shared/types';
const Stack = createNativeStackNavigator<UsageStackParamList>();
export function UsageNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="UsageDashboard"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="UsageDashboard" component={UsageDashboardScreen} />
      <Stack.Screen name="AppDetails" component={AppDetailsScreen} />
      <Stack.Screen name="AllApps" component={AllAppsScreen} />
      <Stack.Screen name="LimitsManagement" component={LimitsManagementScreen} />
      <Stack.Screen name="CreateLimit" component={CreateLimitScreen} />
    </Stack.Navigator>
  );
}
export default UsageNavigator;
