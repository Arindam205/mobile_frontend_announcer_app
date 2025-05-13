// import axios from 'axios';

// // Use the computer's IP address when testing with a physical device
// export const API_URL = "http://192.168.0.101:8080";

// export const ENDPOINTS = {
//   VERIFY_PHONE: '/api/auth/verify-phone',
//   REGISTER: '/api/auth/register',
//   LOGIN: '/api/auth/login',
//   LOGOUT: '/api/auth/logout'
// };

// export const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// export const setAuthToken = (token: string | null) => {
//   if (token) {
//     api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   } else {
//     delete api.defaults.headers.common['Authorization'];
//   }
// };

// src/api/config.ts
import axios from 'axios';

// Use your local development server IP
export const API_URL = "http://192.168.0.101:8080";

console.log('[CONFIG] API_URL set to:', API_URL);

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
  },
  timeout: 10000, // 10-second timeout
});

// Add request/response logging
api.interceptors.request.use(request => {
  console.log('[API] Request:', request.method, request.url);
  return request;
}, error => {
  console.error('[API] Request error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(response => {
  console.log('[API] Response:', response.status, response.config.url);
  return response;
}, error => {
  console.error('[API] Response error:', error.message);
  if (error.response) {
    console.log('[API] Error status:', error.response.status);
    console.log('[API] Error data:', error.response.data);
  }
  return Promise.reject(error);
});

export const setAuthToken = (token: string | null) => {
  console.log('[API] Setting auth token:', token ? 'token-exists' : 'no-token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};