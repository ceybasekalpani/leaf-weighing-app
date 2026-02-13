import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Surface, Text, TextInput, useTheme as usePaperTheme } from 'react-native-paper';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const paperTheme = usePaperTheme();
  const { isDarkMode } = useTheme();

  const handleLogin = () => {
    // Add authentication logic here
    navigation.replace('MainTabs');
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
          />

          <TextInput
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
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            contentStyle={styles.buttonContent}
            buttonColor={paperTheme.colors.primary}
          >
            Login
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