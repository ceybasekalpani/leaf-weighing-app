import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation, useTheme as usePaperTheme } from 'react-native-paper';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import AddLeafCountPage from '../pages/AddLeafCountPage';
import AddLeafDeductionPage from '../pages/AddLeafDeductionPage';
import ViewLeafCollectionPage from '../pages/ViewLeafCollectionPage';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const paperTheme = usePaperTheme();
  const { user } = useAuth();
  const canAddDeduction = user?.permissions?.isCanAddDeduction === true;
  const canAddCount = user?.permissions?.isCanAddCount === true;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: paperTheme.colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerRight: () => <ThemeToggle />,
      }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.navigate(route.name);
            }
          }}
          renderIcon={({ route, focused, color }) => {
            let iconName;
            switch (route.name) {
              case 'Add Deduction':
                iconName = 'scale-bathroom';
                break;
              case 'View Collection':
                iconName = 'format-list-text';
                break;
              case 'Add Count':
                iconName = 'counter';
                break;
            }
            return <MaterialCommunityIcons name={iconName} size={24} color={color} />;
          }}
          getLabelText={({ route }) => route.name}
          activeColor={paperTheme.colors.primary}
          inactiveColor={paperTheme.colors.textSecondary}
          style={{ backgroundColor: paperTheme.colors.surface }}
        />
      )}
    >
      {canAddDeduction && (
      <Tab.Screen 
        name="Add Deduction" 
        component={AddLeafDeductionPage}
        options={{
          title: '🍃 Leaf Deduction',
        }}
      />
      )}
      <Tab.Screen 
        name="View Collection" 
        component={ViewLeafCollectionPage}
        options={{
          title: '📋 Leaf Collections',
        }}
      />
      {canAddCount && (
      <Tab.Screen 
        name="Add Count" 
        component={AddLeafCountPage}
        options={{
          title: '📊 Leaf Count',
        }}
      />
      )}
    </Tab.Navigator>
  );
}
