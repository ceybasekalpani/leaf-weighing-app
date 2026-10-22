import { StyleSheet, View } from 'react-native';
import LogoutButton from '../../components/LogoutButton';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { useTheme as usePaperTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import AddLeafCountPage from '../pages/AddLeafCountPage';
import AddLeafDeductionPage from '../pages/AddLeafDeductionPage';
import ViewLeafCollectionPage from '../pages/ViewLeafCollectionPage';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const paperTheme = usePaperTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const canAddDeduction = user?.permissions?.isCanAddDeduction === true;
  const canAddCount = user?.permissions?.isCanAddCount === true;

  return (
    <Tab.Navigator
      screenListeners={({ navigation, route }) => ({
        tabPress: (event) => {
          if (event.defaultPrevented || navigation.isFocused()) {
            return;
          }

          // Avoid bottom-tabs' deprecated navigate(route) call for inactive tabs.
          event.preventDefault();
          navigation.dispatch({
            ...CommonActions.navigate(route.name, route.params),
            target: navigation.getState().key,
          });
        },
      })}
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: paperTheme.colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ThemeToggle />
            <LogoutButton />
          </View>
        ),
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarLabel: route.name,
        tabBarLabelStyle: paperTheme.fonts.labelMedium,
        tabBarActiveTintColor: paperTheme.colors.primary,
        tabBarInactiveTintColor: paperTheme.colors.textSecondary || paperTheme.colors.onSurfaceVariant,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 64 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8),
            backgroundColor: paperTheme.colors.surface,
            borderTopColor: paperTheme.colors.outlineVariant,
          },
        ],
        tabBarIcon: ({ color }) => {
          const icons = {
            'Add Deduction': 'scale-bathroom',
            'View Collection': 'format-list-text',
            'Add Count': 'counter',
          };

          return <MaterialCommunityIcons name={icons[route.name]} size={24} color={color} />;
        },
      })}
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

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
});
