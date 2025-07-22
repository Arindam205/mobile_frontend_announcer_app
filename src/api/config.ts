import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// Detect development mode safely
const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

// API Base URL
// export const API_URL = "http://192.168.0.125:8080";

export const API_URL = Constants.expoConfig?.extra?.apiUrl || "http://117.247.79.184:8081";

// API Endpoints
export const ENDPOINTS = {
  VERIFY_PHONE: '/api/auth/verify-phone',
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  VERIFY_TOKEN: '/api/auth/verify-token',
};

// Track if logout is in progress to prevent multiple logout calls
let isLoggingOut = false;

// Function to handle automatic logout
const handleAutomaticLogout = async (reason: string = 'Session expired') => {
  if (isLoggingOut) {
    console.log('[API] Logout already in progress, skipping...');
    return;
  }

  try {
    isLoggingOut = true;
    console.log(`[API] Handling automatic logout: ${reason}`);

    // Clear the auth token
    setAuthToken(null);

    // Clear stored data
    try {
      await Promise.all([
        SecureStore.deleteItemAsync('token'),
        SecureStore.deleteItemAsync('userData'),
        SecureStore.deleteItemAsync('tokenExpiry')
      ]);
    } catch (storageError) {
      console.error('[API] Error clearing stored data:', storageError);
    }

    // Show user-friendly message
    Alert.alert(
      'Session Expired',
      'Your session has expired. Please log in again.',
      [
        {
          text: 'OK',
          onPress: () => {
            try {
              router.replace('/(auth)/login');
            } catch (navError) {
              console.error('[API] Navigation error during logout:', navError);
              // Fallback navigation
              setTimeout(() => {
                router.push('/(auth)/login');
              }, 100);
            }
          },
        },
      ],
      { cancelable: false }
    );

  } catch (error) {
    console.error('[API] Error during automatic logout:', error);
  } finally {
    // Reset the flag after a delay
    setTimeout(() => {
      isLoggingOut = false;
    }, 1000);
  }
};

// JWT Helper functions
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('[API] Error decoding JWT:', error);
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  const bufferTime = 60; // 1 minute buffer before actual expiry
  
  return decoded.exp <= (currentTime + bufferTime);
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

// Request Interceptor with enhanced JWT validation
api.interceptors.request.use(
  async (config) => {
    if (isDev) {
      console.log(`[API] Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }

    config.headers['Accept'] = 'application/json';
    config.headers['Content-Type'] = 'application/json';

    // Check token expiry before making requests (except auth endpoints)
    const authEndpoints = ['/api/auth/login', '/api/auth/register', '/api/auth/verify-phone'];
    const isAuthRequest = authEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (!isAuthRequest && config.headers['Authorization']) {
      const token = config.headers['Authorization'].toString().replace('Bearer ', '');
      
      if (token && isTokenExpired(token)) {
        console.log('[API] Token expired before request, triggering logout');
        
        // Don't send the request, handle logout instead
        await handleAutomaticLogout('Token expired');
        
        // Throw an error to prevent the request from proceeding
        throw new Error('Token expired - user logged out');
      }
    }

    return config;
  },
  (error) => {
    if (isDev) {
      console.error('[API] Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response Interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => {
    if (isDev) {
      console.log(`[API] Response: ${response.status} from ${response.config.url}`);
    }
    return response; // Let the app handle all status codes
  },
  async (error) => {
    // Handle token expiry responses from server
    if (error.response?.status === 401) {
      const errorMessage = error.response.data?.message || error.response.data?.error || '';
      const isTokenExpiredError = 
        errorMessage.toLowerCase().includes('token expired') ||
        errorMessage.toLowerCase().includes('session expired') ||
        errorMessage.toLowerCase().includes('jwt expired') ||
        errorMessage.toLowerCase().includes('token invalid') ||
        error.response.data?.code === 'TOKEN_EXPIRED';

      if (isTokenExpiredError) {
        console.log('[API] Server returned token expired error, triggering logout');
        await handleAutomaticLogout('Server session expired');
        
        // Return a specific error for token expiry
        return Promise.reject({
          ...error,
          isTokenExpired: true,
          message: 'Session expired. Please log in again.'
        });
      }
    }

    // Graceful message handling for other errors
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
        isTokenExpired: error.isTokenExpired || false,
      });
    }

    return Promise.reject(error);
  }
);

// Token Setter with expiry validation
export const setAuthToken = async (token: string | null) => {
  if (token) {
    // Validate token before setting
    if (isTokenExpired(token)) {
      console.log('[API] Attempted to set expired token, triggering logout');
      await handleAutomaticLogout('Attempted to set expired token');
      return;
    }
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('[API] Auth token set successfully');
  } else {
    delete api.defaults.headers.common['Authorization'];
    console.log('[API] Auth token cleared');
  }
};

// Function to check if current token is valid
export const validateCurrentToken = async (): Promise<boolean> => {
  return await validateStoredToken();
};

  // Simple token validation without refresh
  export const validateStoredToken = async (): Promise<boolean> => {
    try {
      const token = await SecureStore.getItemAsync('token');
      
      if (!token) {
        return false;
      }

      // Check if token is expired locally
      if (isTokenExpired(token)) {
        console.log('[API] Stored token is expired');
        await handleAutomaticLogout('Stored token expired');
        return false;
      }

      return true;
    } catch (error) {
      console.error('[API] Error validating stored token:', error);
      return false;
    }
  };

// Utility function to get token expiry info
export const getTokenExpiryInfo = async () => {
  try {
    const token = await SecureStore.getItemAsync('token');
    const storedExpiry = await SecureStore.getItemAsync('tokenExpiry');
    
    if (!token) {
      return null;
    }

    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    const expiryFromToken = decoded.exp * 1000;
    const expiryFromStorage = storedExpiry ? parseInt(storedExpiry) : null;
    
    // Use the stored expiry if available, otherwise decode from token
    const actualExpiry = expiryFromStorage || expiryFromToken;
    
    const currentTime = Date.now();
    const timeUntilExpiry = actualExpiry - currentTime;
    
    return {
      expiryTime: actualExpiry,
      expiryDate: new Date(actualExpiry),
      timeUntilExpiry: timeUntilExpiry,
      isExpired: timeUntilExpiry <= 0,
      willExpireSoon: timeUntilExpiry <= 5 * 60 * 1000, // 5 minutes
      daysUntilExpiry: Math.floor(timeUntilExpiry / (1000 * 60 * 60 * 24)),
      hoursUntilExpiry: Math.floor(timeUntilExpiry / (1000 * 60 * 60)),
      minutesUntilExpiry: Math.floor(timeUntilExpiry / (1000 * 60))
    };
  } catch (error) {
    console.error('[API] Error getting token expiry info:', error);
    return null;
  }
};
