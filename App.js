import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { LeafDataProvider } from './src/context/LeafDataContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

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
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading resources
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Add a small delay to ensure everything is rendered
      setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 100);
    }
  }, [appIsReady]);

  // Don't return empty view while splash is showing
  // Instead, return null and let the native splash screen handle it
  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.container} onLayout={onLayoutRootView}>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});