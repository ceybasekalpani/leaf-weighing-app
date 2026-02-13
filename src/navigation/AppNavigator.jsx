import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from '../pages/LoginPage';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
    </Stack.Navigator>
  );
}