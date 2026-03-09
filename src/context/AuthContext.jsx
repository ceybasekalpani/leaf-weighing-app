import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { createContext, useContext, useEffect, useState } from 'react';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

console.log('[AuthContext] API URL:', API_URL);

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
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      if (!trimmedUsername || !trimmedPassword) {
        return {
          success: false,
          error: 'Username and password are required',
        };
      }

      if (!API_URL) {
        console.error('API_URL is not defined in app.config.js');
        return {
          success: false,
          error: 'API URL configuration error. Please check app.config.js',
        };
      }

      const loginUrl = `${API_URL}/users/login`;
      const requestConfig = {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      };

      const loginPayloads = [
        { username: trimmedUsername, password: trimmedPassword },
        { userName: trimmedUsername, password: trimmedPassword },
      ];

      let response;
      let lastError;

      for (let i = 0; i < loginPayloads.length; i += 1) {
        try {
          response = await axios.post(loginUrl, loginPayloads[i], requestConfig);
          break;
        } catch (requestError) {
          lastError = requestError;
          const status = requestError?.response?.status;
          const canRetry =
            (status === 400 || status === 401) && i < loginPayloads.length - 1;

          if (canRetry) {
            console.warn('Login failed with primary payload; retrying alternate payload.');
            continue;
          }

          throw requestError;
        }
      }

      if (!response) {
        throw lastError || new Error('Login request failed');
      }

      const data = response.data;
      if (!(data?.success && data?.user)) {
        return {
          success: false,
          error: data?.message || 'Invalid username or password.',
        };
      }

      const userData = {
        username: data.user.userName || data.user.username || trimmedUsername,
        name: data.user.fullName || data.user.name || trimmedUsername,
        id: data.user.ind,
        role: data.user.admin ? 'admin' : 'user',
        loggedInAt: new Date().toISOString(),
        fullName: data.user.fullName,
        admin: data.user.admin,
        adminLevel: data.user.adminLevel,
        permissions: data.user.permissions,
        active: data.user.active,
        tempWorker: data.user.tempWorker,
      };

      await AsyncStorage.setItem('@user', JSON.stringify(userData));
      if (data.token) {
        await AsyncStorage.setItem('userToken', data.token);
      }

      setUser(userData);
      console.log('[AuthContext] Login success for:', trimmedUsername);

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401) {
        console.warn('Login rejected (401 Unauthorized).');
        return {
          success: false,
          error: error?.response?.data?.message || 'Invalid username or password.',
        };
      }

      if (status === 403) {
        console.warn('Login blocked (403 Forbidden).');
        return {
          success: false,
          error: error?.response?.data?.message || 'Access denied for this account.',
        };
      }

      if (error?.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'Request timeout. Please try again.',
        };
      }

      if (error?.request || error?.message === 'Network Error') {
        return {
          success: false,
          error: `Cannot connect to server at ${API_URL}. Please check your network.`,
        };
      }

      console.error('Unexpected login API error:', error);
      return {
        success: false,
        error: 'Login failed due to an unexpected error. Please try again.',
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
      console.log('[AuthContext] User logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
