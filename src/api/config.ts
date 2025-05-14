// src/api/config.ts
import axios from 'axios';
import Constants from 'expo-constants';

// Get API URL from app config or use default
export const API_URL = Constants.expoConfig?.extra?.apiUrl || "http://192.168.0.101:8080";

// Log configuration without making network requests
console.log('[CONFIG] API configuration loaded with URL:', API_URL);

export const ENDPOINTS = {
  VERIFY_PHONE: '/api/auth/verify-phone',
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout'
};

// Create axios instance but with deferred actual connection
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10-second timeout
});

// Add error handling to interceptors to prevent crashes
try {
  // Add request/response logging
  api.interceptors.request.use(request => {
    try {
      console.log('[API] Request:', request.method, request.url);
    } catch (e) {
      console.error('[API] Error logging request:', e);
    }
    return request;
  }, error => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  });

  api.interceptors.response.use(response => {
    try {
      console.log('[API] Response:', response.status, response.config.url);
    } catch (e) {
      console.error('[API] Error logging response:', e);
    }
    return response;
  }, error => {
    console.error('[API] Response error:', error?.message || 'Unknown error');
    return Promise.reject(error);
  });
} catch (e) {
  console.error('[API] Error setting up API interceptors:', e);
}

// Auth token setter with error handling
export const setAuthToken = (token: string | null) => {
  try {
    console.log('[API] Setting auth token:', token ? 'token-exists' : 'no-token');
    
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  } catch (e) {
    console.error('[API] Error setting auth token:', e);
  }
};