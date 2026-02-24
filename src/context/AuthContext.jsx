import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on app start
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('@user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      // Simple validation - you can add more logic here
      if (!username.trim() || !password.trim()) {
        return { 
          success: false, 
          error: 'Username and password are required' 
        };
      }

      // For now, just store the username as entered by user
      // You can add validation against a list of allowed users if needed
      const userData = {
        username: username.trim(),
        name: username.trim(),
        id: Date.now(), // Simple unique ID
        role: 'user',
        loggedInAt: new Date().toISOString()
      };
      
      // Store user data
      await AsyncStorage.setItem('@user', JSON.stringify(userData));
      await AsyncStorage.setItem('userToken', 'simple-token-' + Date.now());
      
      setUser(userData);
      
      console.log('✅ User logged in:', username);
      
      return { 
        success: true, 
        user: userData 
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Login failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@user');
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      console.log('✅ User logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};