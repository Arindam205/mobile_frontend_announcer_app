// import React, { createContext, useContext, useState, useEffect } from 'react';
// import * as SecureStore from 'expo-secure-store';
// import { api, setAuthToken } from '../api/config';

// interface AuthState {
//   token: string | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
//   verifiedPhone: string | null; // Add this to store the verified phone number
//   verifiedStationId: string | null; // Add this to store the verified station ID
// }

// interface AuthContextType extends AuthState {
//   login: (phoneNumber: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
//   verifyPhone: (phoneNumber: string) => Promise<void>;
//   register: (userData: any) => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [state, setState] = useState<AuthState>({
//     token: null,
//     isLoading: true,
//     isAuthenticated: false,
//     verifiedPhone: null, // Initialize as null
//     verifiedStationId: null, // Initialize as null
//   });

//   useEffect(() => {
//     loadToken();
//   }, []);

//   const loadToken = async () => {
//     try {
//       const token = await SecureStore.getItemAsync('token');
//       if (token) {
//         setAuthToken(token);
//         setState(prev => ({
//           ...prev,
//           token,
//           isAuthenticated: true,
//           isLoading: false,
//         }));
//       } else {
//         setState(prev => ({ ...prev, isLoading: false }));
//       }
//     } catch (error) {
//       setState(prev => ({ ...prev, isLoading: false }));
//     }
//   };

//   const login = async (phoneNumber: string, password: string) => {
//     try {
//       const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
//       const response = await api.post('/api/auth/login', {
//         phoneNumber: formattedPhone,
//         password,
//       });
      
//       const { token } = response.data;
//       await SecureStore.setItemAsync('token', token);
//       setAuthToken(token);
//       setState(prev => ({
//         ...prev,
//         token,
//         isAuthenticated: true,
//       }));
//     } catch (error) {
//       throw error;
//     }
//   };

//   const logout = async () => {
//     try {
//       await api.post('/api/auth/logout');
//       await SecureStore.deleteItemAsync('token');
//       setAuthToken(null);
//       setState(prev => ({
//         ...prev,
//         token: null,
//         isAuthenticated: false,
//       }));
//     } catch (error) {
//       throw error;
//     }
//   };

//   const verifyPhone = async (phoneNumber: string) => {
//     try {
//       const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
//       const response = await api.post('/api/auth/verify-phone', {
//         phoneNumber: formattedPhone,
//       });
      
//       // Store the verified phone number and station ID from the response
//       if (response.data) {
//         setState(prev => ({
//           ...prev,
//           verifiedPhone: response.data.phoneNumber || null,
//           verifiedStationId: response.data.stationId || null,
//         }));
//       }
//     } catch (error) {
//       throw error;
//     }
//   };

//   const register = async (userData: any) => {
//     try {
//       // Use the verified phone and station ID from state if available
//       let requestData = { ...userData };
      
//       if (state.verifiedPhone) {
//         // Use the verified phone number directly
//         requestData.phoneNumber = state.verifiedPhone;
//       } else if (userData.phoneNumber) {
//         // Fallback to user provided phone if somehow verified one is missing
//         const formattedPhone = userData.phoneNumber.startsWith('+91')
//           ? userData.phoneNumber
//           : `+91${userData.phoneNumber}`;
//         requestData.phoneNumber = formattedPhone;
//       }
      
//       // Add station ID to request if available
//       if (state.verifiedStationId) {
//         requestData.stationId = state.verifiedStationId;
//       }
      
//       await api.post('/api/auth/register', requestData);
      
//       // Clear the verified data after successful registration
//       setState(prev => ({
//         ...prev,
//         verifiedPhone: null,
//         verifiedStationId: null,
//       }));
//     } catch (error) {
//       throw error;
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         ...state,
//         login,
//         logout,
//         verifyPhone,
//         register,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };


import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, setAuthToken } from '../api/config';

interface AuthState {
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  verifiedPhone: string | null; 
  verifiedStationId: string | null;
  name: string | null; // Add name to store the user's name
  role: string | null; // Add role to store the user's role
  stationId: string | null; // Add stationId to store the user's station ID
}

interface AuthContextType extends AuthState {
  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyPhone: (phoneNumber: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    token: null,
    isLoading: true,
    isAuthenticated: false,
    verifiedPhone: null,
    verifiedStationId: null,
    name: null, // Initialize as null
    role: null, // Initialize as null
    stationId: null, // Initialize as null
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
      const { token, name, role, stationId } = response.data;
      
      // Store the token in SecureStore
      await SecureStore.setItemAsync('token', token);
      
      // Store user data in SecureStore for persistence
      const userData = {
        name,
        role,
        stationId,
        phoneNumber: formattedPhone
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
      }));
    } catch (error) {
      throw error;
    }
  };

  const verifyPhone = async (phoneNumber: string) => {
    try {
      const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
      const response = await api.post('/api/auth/verify-phone', {
        phoneNumber: formattedPhone,
      });
      
      // Store the verified phone number and station ID from the response
      if (response.data) {
        setState(prev => ({
          ...prev,
          verifiedPhone: response.data.phoneNumber || null,
          verifiedStationId: response.data.stationId || null,
        }));
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      // Use the verified phone and station ID from state if available
      let requestData = { ...userData };
      
      if (state.verifiedPhone) {
        // Use the verified phone number directly
        requestData.phoneNumber = state.verifiedPhone;
      } else if (userData.phoneNumber) {
        // Fallback to user provided phone if somehow verified one is missing
        const formattedPhone = userData.phoneNumber.startsWith('+91')
          ? userData.phoneNumber
          : `+91${userData.phoneNumber}`;
        requestData.phoneNumber = formattedPhone;
      }
      
      // Add station ID to request if available
      if (state.verifiedStationId) {
        requestData.stationId = state.verifiedStationId;
      }
      
      await api.post('/api/auth/register', requestData);
      
      // Clear the verified data after successful registration
      setState(prev => ({
        ...prev,
        verifiedPhone: null,
        verifiedStationId: null,
      }));
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
        verifyPhone,
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