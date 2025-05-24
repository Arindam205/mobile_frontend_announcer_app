import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, setAuthToken } from '../api/config';

interface AuthState {
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  name: string | null;
  role: string | null;
  stationId: string | null;
  userId: number | null;
}

interface AuthContextType extends AuthState {
  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    token: null,
    isLoading: true,
    isAuthenticated: false,
    name: null,
    role: null,
    stationId: null,
    userId: null,
  });

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      console.log('[AuthContext] Loading stored token...');
      const token = await SecureStore.getItemAsync('token');
      const userData = await SecureStore.getItemAsync('userData');
      
      if (token) {
        setAuthToken(token);
        
        if (userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            setState(prev => ({
              ...prev,
              token,
              isAuthenticated: true,
              isLoading: false,
              name: parsedUserData.name || null,
              role: parsedUserData.role || null,
              stationId: parsedUserData.stationId || null,
              userId: parsedUserData.userId || null,
            }));
          } catch (parseError) {
            console.error('[AuthContext] Error parsing user data:', parseError);
            await SecureStore.deleteItemAsync('userData');
            setState(prev => ({
              ...prev,
              token,
              isAuthenticated: true,
              isLoading: false,
            }));
          }
        } else {
          setState(prev => ({
            ...prev,
            token,
            isAuthenticated: true,
            isLoading: false,
          }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('[AuthContext] Error loading token:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (phoneNumber: string, password: string) => {
    try {
      console.log('[AuthContext] Starting login process...');
      const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
      
      // Make API call - 400s won't throw errors with our new config
      const response = await api.post('/api/auth/login', {
        phoneNumber: formattedPhone,
        password,
      });
      
      console.log('[AuthContext] Login response status:', response.status);
      console.log('[AuthContext] Login response data:', response.data);
      
      // Handle response based on status code
      if (response.status === 200) {
        // Successful login
        const responseData = response.data;
        const token = responseData.token || responseData.accessToken || responseData.jwt;
        
        if (!token) {
          throw new Error('Login response missing authentication token');
        }
        
        const userData = {
          name: responseData.name || responseData.user?.name || null,
          role: responseData.role || responseData.user?.role || null,
          stationId: responseData.stationId || responseData.user?.stationId || null,
          userId: responseData.userId || responseData.user?.id || null,
          phoneNumber: formattedPhone,
        };
        
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));
        setAuthToken(token);
        
        setState(prev => ({
          ...prev,
          token,
          isAuthenticated: true,
          name: userData.name,
          role: userData.role,
          stationId: userData.stationId,
          userId: userData.userId,
        }));
        
        console.log('[AuthContext] Login successful');
        
      } else if (response.status >= 400 && response.status < 500) {
        // Client errors (400-499) - invalid credentials, validation errors, etc.
        const errorMessage = response.data?.message || response.data?.error || 'Login failed';
        console.log(`[AuthContext] Login failed with status ${response.status}: ${errorMessage}`);
        throw new Error(errorMessage);
        
      } else {
        // Unexpected status code
        throw new Error(`Unexpected response status: ${response.status}`);
      }
      
    } catch (error: any) {
      console.error('[AuthContext] Login error:', error.message);
      
      // Only log detailed error info for non-client errors
      if (!error.response || error.response.status >= 500) {
        console.error('[AuthContext] Error details:', {
          status: error.response?.status,
          data: error.response?.data
        });
      }
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Starting logout process...');
      
      // Try to call logout endpoint
      try {
        const response = await api.post('/api/auth/logout');
        console.log('[AuthContext] Server logout response:', response.status);
      } catch (logoutError: any) {
        console.warn('[AuthContext] Server logout failed, continuing with local logout');
      }
      
      // Clear stored data
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('userData');
      setAuthToken(null);
      
      // Reset state
      setState(prev => ({
        ...prev,
        token: null,
        isAuthenticated: false,
        name: null,
        role: null,
        stationId: null,
        userId: null,
      }));
      
      console.log('[AuthContext] Logout completed');
      
    } catch (error: any) {
      console.error('[AuthContext] Logout error:', error);
      // Force local logout even if server logout fails
      try {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('userData');
        setAuthToken(null);
        setState(prev => ({
          ...prev,
          token: null,
          isAuthenticated: false,
          name: null,
          role: null,
          stationId: null,
          userId: null,
        }));
      } catch (cleanupError) {
        console.error('[AuthContext] Failed to cleanup local data:', cleanupError);
      }
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      console.log('[AuthContext] Starting registration process...');
      
      let requestData = { ...userData };
      if (userData.phoneNumber) {
        const formattedPhone = userData.phoneNumber.startsWith('+91')
          ? userData.phoneNumber
          : `+91${userData.phoneNumber}`;
        requestData.phoneNumber = formattedPhone;
      }
      
      // Make API call - 400s won't throw errors with our new config
      const response = await api.post('/api/auth/register', requestData);
      
      console.log('[AuthContext] Registration response status:', response.status);
      console.log('[AuthContext] Registration response data:', response.data);
      
      // Handle response based on status code
      if (response.status >= 200 && response.status < 300) {
        // Successful registration
        console.log('[AuthContext] Registration successful');
        
      } else if (response.status >= 400 && response.status < 500) {
        // Client errors (400-499) - validation errors, duplicate phone, etc.
        const errorMessage = response.data?.message || response.data?.error || 'Registration failed';
        console.log(`[AuthContext] Registration failed with status ${response.status}: ${errorMessage}`);
        throw new Error(errorMessage);
        
      } else {
        // Unexpected status code
        throw new Error(`Unexpected response status: ${response.status}`);
      }
      
    } catch (error: any) {
      console.error('[AuthContext] Registration error:', error.message);
      
      // Only log detailed error info for non-client errors
      if (!error.response || error.response.status >= 500) {
        console.error('[AuthContext] Error details:', {
          status: error.response?.status,
          data: error.response?.data
        });
      }
      
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};