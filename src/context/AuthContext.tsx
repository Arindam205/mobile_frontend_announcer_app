import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, setAuthToken } from '../api/config';

interface AuthState {
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  name: string | null; // Add name to store the user's name
  role: string | null; // Add role to store the user's role
  stationId: string | null; // Add stationId to store the user's station ID
  userId: number | null; // Add userId to store the user's ID
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
    name: null, // Initialize as null
    role: null, // Initialize as null
    stationId: null, // Initialize as null
    userId: null, // Initialize userId as null
  });

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userData = await SecureStore.getItemAsync('userData');
      
      if (token) {
        setAuthToken(token);
        
        // If we have stored user data, parse and use it
        if (userData) {
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
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (phoneNumber: string, password: string) => {
    try {
      const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
      const response = await api.post('/api/auth/login', {
        phoneNumber: formattedPhone,
        password,
      });
      
      // Extract all relevant user data from the response
      const { token, name, role, stationId, userId } = response.data;
      
      // Store the token in SecureStore
      await SecureStore.setItemAsync('token', token);
      
      // Store user data in SecureStore for persistence
      const userData = {
        name,
        role,
        stationId,
        phoneNumber: formattedPhone,
        userId
      };
      await SecureStore.setItemAsync('userData', JSON.stringify(userData));
      
      // Set the auth token for API requests
      setAuthToken(token);
      
      // Update the state with all user data
      setState(prev => ({
        ...prev,
        token,
        isAuthenticated: true,
        name,
        role,
        stationId,
        userId,
      }));
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
      
      // Clear stored tokens and user data
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('userData');
      
      setAuthToken(null);
      
      // Reset the auth state
      setState(prev => ({
        ...prev,
        token: null,
        isAuthenticated: false,
        name: null,
        role: null,
        stationId: null,
        userId: null,
      }));
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      // Format phone number if needed
      let requestData = { ...userData };
      
      if (userData.phoneNumber) {
        const formattedPhone = userData.phoneNumber.startsWith('+91')
          ? userData.phoneNumber
          : `+91${userData.phoneNumber}`;
        requestData.phoneNumber = formattedPhone;
      }
      
      await api.post('/api/auth/register', requestData);
    } catch (error) {
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