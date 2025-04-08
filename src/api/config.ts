import axios from 'axios';

// Use the computer's IP address when testing with a physical device
export const API_URL = "http://192.168.0.125:8080";

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
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};