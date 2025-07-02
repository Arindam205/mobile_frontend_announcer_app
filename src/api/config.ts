import axios from 'axios';
import Constants from 'expo-constants';

// Detect development mode safely
const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

// API Base URL
export const API_URL = Constants.expoConfig?.extra?.apiUrl || "http://117.247.79.184:8081";

// export const API_URL = "http://192.168.0.125:8080";

// API Endpoints
export const ENDPOINTS = {
  VERIFY_PHONE: '/api/auth/verify-phone',
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
};

// Axios Instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'User-Agent': 'ReactNative-Android-App',
  },
  timeout: 30000, // 30 seconds
  maxRedirects: 5,
  validateStatus: () => true, // Accept all status codes
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    if (isDev) {
      console.log(`[API] Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }

    config.headers['Accept'] = 'application/json';
    config.headers['Content-Type'] = 'application/json';

    return config;
  },
  (error) => {
    if (isDev) {
      console.error('[API] Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    if (isDev) {
      console.log(`[API] Response: ${response.status} from ${response.config.url}`);
    }
    return response; // Let the app handle all status codes
  },
  (error) => {
    // Graceful message handling
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      error.message = 'Unable to connect. Please check your internet connection.';
    } else if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.';
    } else if (!error.response) {
      error.message = 'Unexpected error occurred. Please try again.';
    }

    if (isDev) {
      console.error('[API] Response Error:', {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
      });
    }

    return Promise.reject(error);
  }
);

// Token Setter
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
