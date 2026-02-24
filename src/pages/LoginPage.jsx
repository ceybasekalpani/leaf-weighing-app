import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Surface, Text, TextInput, useTheme as usePaperTheme } from 'react-native-paper';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage({ navigation }) {
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
    const trimmedPassword = password.trim();
    
    if (!trimmedUsername) {
      Alert.alert('Error', 'Please enter username');
      return;
    }
    
    if (!trimmedPassword) {
      Alert.alert('Error', 'Please enter password');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔐 Attempting login for user:', trimmedUsername);
      
      // Call login from AuthContext with trimmed values
      const result = await login(trimmedUsername, trimmedPassword);
      
      if (result.success) {
        console.log('✅ Login successful for user:', trimmedUsername);
        // Navigate to main tabs on successful login
        navigation.replace('MainTabs');
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
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
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
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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