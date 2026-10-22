import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" accessibilityLabel="Loading session" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginPage} />
      )}
    </Stack.Navigator>
  );
}
