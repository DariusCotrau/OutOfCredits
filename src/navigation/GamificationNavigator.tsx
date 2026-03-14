import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  RewardsScreen,
  BadgesScreen,
  LeaderboardScreen,
} from '@features/gamification';
import type { GamificationStackParamList } from '@shared/types';
const Stack = createNativeStackNavigator<GamificationStackParamList>();
export function GamificationNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Rewards"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Rewards" component={RewardsScreen} />
      <Stack.Screen name="Badges" component={BadgesScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
    </Stack.Navigator>
  );
}
export default GamificationNavigator;
