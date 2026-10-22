import useKeyboardAutoScroll from '../../hooks/useKeyboardAutoScroll';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Surface, Text, TextInput, useTheme as usePaperTheme } from 'react-native-paper';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage() {
  const { inputFocusProps, scrollViewProps } = useKeyboardAutoScroll();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const paperTheme = usePaperTheme();
  const { isDarkMode } = useTheme();
  const { login } = useAuth();
  
  // Create ref for password input
  const passwordRef = useRef(null);

  const handleLogin = async () => {
    // Trim and validate inputs
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      Alert.alert('Error', 'Please enter username');
      return;
    }
    
    if (!password) {
      Alert.alert('Error', 'Please enter password');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔐 Attempting login for user:', trimmedUsername);
      
      // Call login from AuthContext with trimmed values
      const result = await login(trimmedUsername, password);
      
      if (result.success) {
        console.log('✅ Login successful for user:', trimmedUsername);
        // AppNavigator switches to MainTabs when AuthContext updates.
      } else {
        // Show error message
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert('Error', 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: paperTheme.colors.background }]}
    >
      <ScrollView {...scrollViewProps} contentContainerStyle={styles.scrollContent}>
      <Surface style={[styles.surface, { backgroundColor: paperTheme.colors.surface, elevation: 4 }]}>
        <View style={styles.themeToggleContainer}>
          <ThemeToggle />
        </View>
        
        <View style={styles.logoContainer}>
          <Text variant="displaySmall" style={[styles.title, { color: paperTheme.colors.primary }]}>
            🌿 Tea Factory
          </Text>
          <Text variant="headlineSmall" style={[styles.subtitle, { color: paperTheme.colors.secondary }]}>
            Leaf Weighing System
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            {...inputFocusProps}
            label="Username"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
            theme={{ colors: { primary: paperTheme.colors.primary } }}
            disabled={loading}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            ref={passwordRef}
            {...inputFocusProps}
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            textContentType="password"
            mode="outlined"
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon 
                icon={showPassword ? 'eye-off' : 'eye'} 
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
            theme={{ colors: { primary: paperTheme.colors.primary } }}
            disabled={loading}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            contentStyle={styles.buttonContent}
            buttonColor={paperTheme.colors.primary}
            icon={loading
              ? ({ color, size }) => <ActivityIndicator color={color} size={size} />
              : undefined}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </View>
      </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 30,
    borderRadius: 20,
  },
  themeToggleContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 15,
  },
  loginButton: {
    marginTop: 20,
    borderRadius: 30,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
