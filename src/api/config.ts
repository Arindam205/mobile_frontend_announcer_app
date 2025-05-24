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
  timeout: 15000, // 15 seconds timeout for production
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    if (__DEV__) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      console.log('[API] Base URL:', config.baseURL);
    }
    return config;
  },
  (error) => {
    if (__DEV__) {
      console.error('[API] Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`[API] Response: ${response.status} from ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error('[API] Response Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    
    // Handle specific error types for production
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('[API] Network Error - Check server connectivity');
    }
    
    if (error.response?.status === 401) {
      console.error('[API] Authentication Error - Token may be expired');
    }
    
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};