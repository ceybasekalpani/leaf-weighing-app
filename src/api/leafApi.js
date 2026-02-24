import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'http://192.168.8.107:5000/api'; // Make sure this IP is correct

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    console.log('📤 Making request to:', config.url);
    console.log('📤 Full URL:', `${BASE_URL}${config.url}`);
    console.log('📤 Method:', config.method?.toUpperCase());
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('📤 Token added to request');
      }
    } catch (error) {
      console.log('📤 No token found');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response received:', response.status);
    console.log('📥 Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to server. Make sure backend is running at:', BASE_URL);
    }
    if (error.response?.status === 404) {
      console.error('❌ Endpoint not found. Check if URL is correct:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

// Leaf Count API endpoints - UPDATED to match backend (leafcount NOT leaf-count)
export const leafCountApi = {
  // Get all routes
  getRoutes: () => api.get('/leafcount/routes'),
  
  // Get route total weight with date and month
  getRouteTotalWeight: (routeName, date, month) => {
    const encodedRoute = encodeURIComponent(routeName);
    return api.get(`/leafcount/routes/${encodedRoute}/total-weight`, {
      params: { date, month }
    });
  },
  
  
 // Save leaf count - SIMPLIFIED VERSION
  saveLeafCount: (data) => {
    console.log('📤 Preparing to save leaf count:', data);
    
    // Ensure userName is included in the payload
    const payload = {
      date: data.date,
      month: data.month,
      route: data.route,
      bestLeaf: data.bestLeaf,
      bellowBest: data.bellowBest,
      poor: data.poor,
      userName: data.userName, // This comes from the logged-in user
      pcName: data.pcName,
      mode: data.mode || 'App'
    };
  
console.log('📤 Sending payload to server:', payload);
    
    return api.post('/leafcount/save', payload);
  },
  
  // Get leaf count history
  getLeafCountHistory: (params) => api.get('/leafcount/history', { params }),
};

// Supplier API endpoints
export const supplierApi = {
  getSupplierByRegNo: (regNo) => api.get(`/suppliers/${regNo}`),
  searchSuppliers: (query) => api.get(`/suppliers/search/all?query=${query}`),
};

// Deduction API endpoints
export const deductionApi = {
  getSummary: (regNo, leafType) => {
    console.log(`🔍 Getting TODAY'S summary for RegNo: ${regNo}, LeafType: ${leafType}`);
    return api.get(`/deductions/summary/${regNo}`, {
      headers: { 'leaf-type': leafType }
    });
  },
  saveDeduction: (data) => api.post('/deductions', data),
  getTodayTransactions: (regNo) => api.get(`/deductions/today/${regNo}`),
};

// Collection View API endpoints
export const collectionViewApi = {
  getTodayCollections: () => api.get('/collections/today'),
  getCollectionsByDate: (date) => api.get(`/collections/date/${date}`),
};

export default api;