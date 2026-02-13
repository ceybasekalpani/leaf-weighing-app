import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LeafDataProvider } from './src/context/LeafDataContext';
import AppNavigator from './src/navigation/AppNavigator';
import { getThemeColors } from './assets/colors/globalColors';

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
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}