import axios from 'axios';

const BASE_URL = 'http://192.168.8.108:5000/api'; 

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
    console.log('📤 Headers:', config.headers);
    console.log('📤 Method:', config.method);
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
  // Get today's summary for a supplier with leaf type header
  getSummary: (regNo, leafType) => {
    console.log(`🔍 Getting TODAY'S summary for RegNo: ${regNo}, LeafType: ${leafType} (sending in header)`);
    return api.get(`/deductions/summary/${regNo}`, {
      headers: {
        'leaf-type': leafType
      }
    });
  },
  saveDeduction: (data) => api.post('/deductions', data),
  getTodayTransactions: (regNo) => api.get(`/deductions/today/${regNo}`),
};

export default api;