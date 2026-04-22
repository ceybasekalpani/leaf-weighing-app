import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { createContext, useContext, useEffect, useState } from 'react';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
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
      if (userStr) setUser(JSON.parse(userStr));
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      if (!API_URL) {
        return { success: false, error: 'API URL not configured. Check app.config.js' };
      }

      const response = await axios.post(
        `${API_URL}/auth/login`,
        { username: username.trim(), password: password.trim() },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      // Backend returns ApiResponse<LoginResponseDto>:
      // { success, message, data: { token, user } }
      const apiResponse = response.data;
      const loginData = apiResponse?.data;

      if (!apiResponse?.success || !loginData?.user) {
        return { success: false, error: apiResponse?.message || 'Invalid credentials' };
      }

      const userData = {
        username: loginData.user.userName,
        name: loginData.user.fullName,
        id: loginData.user.ind,
        fullName: loginData.user.fullName,
        admin: loginData.user.admin,
        adminLevel: loginData.user.adminLevel,
        permissions: loginData.user.permissions,
        active: loginData.user.active,
        tempWorker: loginData.user.tempWorker,
        role: loginData.user.admin ? 'admin' : 'user',
        loggedInAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('@user', JSON.stringify(userData));
      if (loginData.token) {
        await AsyncStorage.setItem('userToken', loginData.token);
      }

      setUser(userData);
      return { success: true, user: userData };

    } catch (error) {
      const status = error?.response?.status;

      if (status === 401) {
        return { success: false, error: error?.response?.data?.message || 'Invalid username or password.' };
      }
      if (status === 403) {
        return { success: false, error: error?.response?.data?.message || 'Access denied for this account.' };
      }
      if (error?.code === 'ECONNABORTED') {
        return { success: false, error: 'Request timeout. Please try again.' };
      }
      if (!error?.response) {
        return { success: false, error: `Cannot connect to server at ${API_URL}. Check your network.` };
      }

      console.error('Unexpected login error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@user');
      await AsyncStorage.removeItem('userToken');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};