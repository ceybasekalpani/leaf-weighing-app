import axios from 'axios';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get device name for PC_Name field
const getDeviceName = async () => {
  try {
    // Use expo-device instead of react-native-device-info
    const deviceName = await Device.deviceName;
    return deviceName || (Platform.OS === 'ios' ? 'iOS Device' : 'Android Device');
  } catch (error) {
    console.log('Error getting device name:', error);
    return Platform.OS === 'ios' ? 'iOS Device' : 'Android Device';
  }
};

export const leafCountApi = {
  // Get all distinct routes
  getRoutes: async () => {
    try {
      const response = await api.get('/leafcount/routes');
      return response.data;
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw error;
    }
  },

  // Get total weight for a specific route - FIXED VERSION with correct calculation
  getRouteTotalWeight: async (routeName, date) => {
    try {
      const url = date 
        ? `/leafcount/routes/${routeName}/total-weight?date=${date}`
        : `/leafcount/routes/${routeName}/total-weight`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching route total weight:', error);
      throw error;
    }
  },

  // NEW: Get detailed breakdown of weight calculation
  getRouteWeightBreakdown: async (routeName, date) => {
    try {
      const url = date 
        ? `/leafcount/routes/${routeName}/weight-breakdown?date=${date}`
        : `/leafcount/routes/${routeName}/weight-breakdown`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching route weight breakdown:', error);
      throw error;
    }
  },

  // Save leaf count
  saveLeafCount: async (leafCountData, user) => {
    try {
      const deviceName = await getDeviceName();
      
      const payload = {
        ...leafCountData,
        userName: user?.username || 'mobile_user',
        pcName: deviceName,
        timestamp: new Date().toISOString()
      };
      
      const response = await api.post('/leafcount/save', payload);
      return response.data;
    } catch (error) {
      console.error('Error saving leaf count:', error);
      throw error;
    }
  },

  // Get leaf count history
  getLeafCountHistory: async (filters = {}) => {
    try {
      const response = await api.get('/leafcount/history', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching leaf count history:', error);
      throw error;
    }
  }
};
