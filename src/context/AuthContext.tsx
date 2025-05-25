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
      
      const response = await api.post('/api/auth/login', {
        phoneNumber: formattedPhone,
        password,
      });
      
      console.log('[AuthContext] Login response status:', response.status);
      console.log('[AuthContext] Login response data:', response.data);
      
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
        // Client errors (400-499) - Extract the actual error message from server
        let errorMessage = 'Login failed';
        
        if (response.data) {
          if (typeof response.data === 'string') {
            errorMessage = response.data;
          } else if (typeof response.data === 'object') {
            // Try different common error message fields
            errorMessage = response.data.message || 
                          response.data.error || 
                          response.data.details || 
                          response.data.errorMessage ||
                          response.data.msg ||
                          'Invalid credentials';
          }
        }
        
        // Provide user-friendly messages for common status codes
        if (response.status === 400) {
          // Keep the server message for 400 errors (like invalid credentials)
            errorMessage = response.data?.message || response.data?.error || 'Login failed';
            console.log(`[AuthContext] Login failed with status ${response.status}: ${errorMessage}`);
        } else if (response.status === 401) {
          errorMessage = 'Invalid phone number or password';
        } else if (response.status === 403) {
          errorMessage = 'Account access denied';
        } else if (response.status === 404) {
          errorMessage = 'Login service not available';
        }
        
        throw new Error(errorMessage);
        
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
      
    } catch (error: any) {
      console.error('[AuthContext] Login error:', error.message);
      
      // Enhanced error handling for network issues
      if (error.message === 'Network Error' || error.code === 'NETWORK_ERROR') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Connection timeout. Please try again.');
      } else if (error.message.includes('ECONNREFUSED')) {
        throw new Error('Server is not available. Please try again later.');
      }
      
      // If it's already a formatted error message, just pass it through
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Starting logout process...');
      
      try {
        const response = await api.post('/api/auth/logout');
        console.log('[AuthContext] Server logout response:', response.status);
      } catch (logoutError: any) {
        console.warn('[AuthContext] Server logout failed, continuing with local logout');
      }
      
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
      
      const response = await api.post('/api/auth/register', requestData);
      
      console.log('[AuthContext] Registration response status:', response.status);
      console.log('[AuthContext] Registration response data:', response.data);
      
      if (response.status >= 200 && response.status < 300) {
        console.log('[AuthContext] Registration successful');
        
      } else if (response.status >= 400 && response.status < 500) {
        // Extract detailed error message for registration
        let errorMessage = 'Registration failed';
        
        if (response.data) {
          if (typeof response.data === 'string') {
            errorMessage = response.data;
          } else if (typeof response.data === 'object') {
            errorMessage = response.data.message || 
                          response.data.error || 
                          response.data.details || 
                          response.data.errorMessage ||
                          'Registration failed';
          }
        }
        
        // Common registration error messages
        if (response.status === 400) {
          // Keep server message for validation errors
        } else if (response.status === 409) {
          errorMessage = 'Phone number already registered';
        }
        
        console.log(`[AuthContext] Registration failed with status ${response.status}: ${errorMessage}`);
        throw new Error(errorMessage);
        
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
      
    } catch (error: any) {
      console.error('[AuthContext] Registration error:', error.message);
      
      // Handle network errors for registration
      if (error.message === 'Network Error' || error.code === 'NETWORK_ERROR') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
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