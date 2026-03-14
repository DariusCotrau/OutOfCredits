import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@theme';
import { Icon } from '@shared/components';
import { DashboardScreen } from '@features/dashboard';
import { SettingsNavigator } from './SettingsNavigator';
import { UsageNavigator } from './UsageNavigator';
import { ActivityNavigator } from './ActivityNavigator';
import { GamificationNavigator } from './GamificationNavigator';
import type { MainTabParamList } from '@shared/types';
const Tab = createBottomTabNavigator<MainTabParamList>();
export function MainNavigator() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'home';
              break;
            case 'Usage':
              iconName = 'chart';
              break;
            case 'Activity':
              iconName = 'timer';
              break;
            case 'Gamification':
              iconName = 'trophy';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'home';
          }
          return (
            <Icon
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Usage"
        component={UsageNavigator}
        options={{
          tabBarLabel: 'Usage',
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityNavigator}
        options={{
          tabBarLabel: 'Activities',
        }}
      />
      <Tab.Screen
        name="Gamification"
        component={GamificationNavigator}
        options={{
          tabBarLabel: 'Rewards',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}
export default MainNavigator;
