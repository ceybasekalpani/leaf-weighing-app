// src/utils/directTest.js

/**
 * Direct test utility for debugging API connections
 * This file is imported to test connectivity directly
 */

console.log('🧪 Direct test utility loaded');

// Test function to check API connectivity
export const testAPIConnection = async (apiUrl) => {
  console.log('🔍 Testing API connection to:', apiUrl);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      signal: controller.signal
    }).catch(err => {
      if (err.name === 'AbortError') {
        throw new Error('Connection timeout');
      }
      throw err;
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API connection successful:', data);
      return { success: true, data };
    } else {
      console.log('❌ API returned error:', response.status);
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.log('❌ API connection failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Auto-run test if in development
if (__DEV__) {
  // You can add auto-test logic here if needed
  console.log('🧪 Direct test running in development mode');
  
  // Uncomment to test a specific URL
  // testAPIConnection('http://192.168.8.108:5000/api');
}