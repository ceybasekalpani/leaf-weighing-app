import axios from 'axios';

// Use your computer's IP address for physical device
// Your IP is: 192.168.8.108
const BASE_URL = 'http://192.168.8.108:5000/api'; // Updated with your actual IP

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('📤 Making request to:', config.url);
    console.log('📤 Full URL:', `${BASE_URL}${config.url}`);
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
    return Promise.reject(error);
  }
);

export const supplierApi = {
  getSupplierByRegNo: (regNo) => api.get(`/suppliers/${regNo}`),
  searchSuppliers: (query) => api.get(`/suppliers/search/all?query=${query}`),
};

export const deductionApi = {
  getSummary: (regNo, leafType) => api.get(`/deductions/summary/${regNo}/${leafType}`),
  saveDeduction: (data) => api.post('/deductions', data),
  getTodayTransactions: (regNo) => api.get(`/deductions/today/${regNo}`),
};

export default api;