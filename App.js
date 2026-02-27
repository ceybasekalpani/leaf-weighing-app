import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { LeafDataProvider } from './src/context/LeafDataContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Native splash may already be prevented.
});

const splashSource = require('./assets/images/splash-icon.png');
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

function LaunchSplash() {
  return (
    <View style={styles.splashWrap}>
      <Image
        source={splashSource}
        resizeMode="contain"
        style={styles.splashImage}
      />
    </View>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showLaunchScreen, setShowLaunchScreen] = useState(true);
  const nativeSplashHidden = useRef(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (!appIsReady || nativeSplashHidden.current) {
      return;
    }

    nativeSplashHidden.current = true;
    SplashScreen.hideAsync().catch(() => {});
  }, [appIsReady]);

  useEffect(() => {
    if (!appIsReady) {
      return;
    }

    const timer = setTimeout(() => {
      setShowLaunchScreen(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [appIsReady]);

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.container}>
        {!appIsReady || showLaunchScreen ? (
          <LaunchSplash />
        ) : (
          <ThemeProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </ThemeProvider>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashWrap: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'flex-end',
  },
  splashImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    width: '100%',
    height: '100%',
  },
});
