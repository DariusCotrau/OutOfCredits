import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ActivityListScreen,
  ActivityDetailScreen,
  ActivitySessionScreen,
} from '@features/activity';
import type { ActivityStackParamList } from '@shared/types';
const Stack = createNativeStackNavigator<ActivityStackParamList>();
export function ActivityNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ActivityList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ActivityList" component={ActivityListScreen} />
      <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
      <Stack.Screen
        name="ActivitySession"
        component={ActivitySessionScreen}
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
export default ActivityNavigator;
