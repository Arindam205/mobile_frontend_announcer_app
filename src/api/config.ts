import axios from 'axios';
import Constants from 'expo-constants';

// Get API URL from environment variables or use production default
export const API_URL = "http://117.247.79.184:8081";

export const ENDPOINTS = {
  VERIFY_PHONE: '/api/auth/verify-phone',
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout'
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
  },
  timeout: 30000,
  maxRedirects: 5,
  // CRITICAL FIX: Only treat server errors (500+) as axios errors
  // All client errors (400-499) are valid responses that should be handled by the app
  validateStatus: function (status) {
    return status < 500;
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    if (config.data) {
      console.log('[API] Request Data:', JSON.stringify(config.data, null, 2));
    }
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor - handle ALL responses consistently
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response: ${response.status} from ${response.config.url}`);
    console.log('[API] Response Data:', JSON.stringify(response.data, null, 2));
    
    // IMPORTANT: Never throw errors for 2xx, 3xx, or 4xx responses
    // Let the calling code handle all responses based on status and data
    return response;
  },
  (error) => {
    // Only server errors (500+) and network errors reach here
    console.error('[API] Server/Network Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data
    });
    
    if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.';
    } else if (error.request) {
      error.message = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('[API] Auth token set for requests');
  } else {
    delete api.defaults.headers.common['Authorization'];
    console.log('[API] Auth token removed from requests');
  }
};