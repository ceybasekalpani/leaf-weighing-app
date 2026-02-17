import { NavigationContainer } from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext'; // Add this import
import { LeafDataProvider } from './src/context/LeafDataContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: MD3LightTheme,
  reactNavigationDark: MD3DarkTheme,
});

function AppContent() {
  const { isDarkMode, theme: customTheme } = useTheme();
  
  const paperTheme = {
    ...(isDarkMode ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDarkMode ? MD3DarkTheme.colors : MD3LightTheme.colors),
      ...customTheme,
    },
  };

  const navigationTheme = {
    ...(isDarkMode ? DarkTheme : LightTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : LightTheme.colors),
      primary: customTheme.primary,
      background: customTheme.background,
      card: customTheme.surface,
      text: customTheme.text,
      border: customTheme.border,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <LeafDataProvider>
        <NavigationContainer theme={navigationTheme}>
          <AppNavigator />
        </NavigationContainer>
      </LeafDataProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider> {/* Add AuthProvider here, wrapping AppContent */}
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}