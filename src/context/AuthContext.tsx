// import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
// import * as SecureStore from 'expo-secure-store';
// import { AppState, AppStateStatus } from 'react-native';
// import { api, setAuthToken } from '../api/config';

// interface AuthState {
//   token: string | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
//   name: string | null;
//   role: string | null;
//   stationId: string | null;
//   userId: number | null;
// }

// interface AuthContextType extends AuthState {
//   login: (phoneNumber: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
//   register: (userData: any) => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [state, setState] = useState<AuthState>({
//     token: null,
//     isLoading: true,
//     isAuthenticated: false,
//     name: null,
//     role: null,
//     stationId: null,
//     userId: null,
//   });

//   // Use ref to track if token has been loaded to prevent multiple loads
//   const hasLoadedToken = useRef(false);
//   const isLoadingToken = useRef(false);

//   // Load token only once on app start
//   useEffect(() => {
//     if (!hasLoadedToken.current && !isLoadingToken.current) {
//       loadToken();
//     }
//   }, []);

//   // Handle app state changes - only reload token if app was backgrounded for a significant time
//   useEffect(() => {
//     let appStateTimeout: NodeJS.Timeout;
//     let wasInBackground = false;
    
//     const handleAppStateChange = (nextAppState: AppStateStatus) => {
//       console.log('[AuthContext] App state changed to:', nextAppState);
      
//       if (nextAppState === 'background') {
//         wasInBackground = true;
//         // Set a timer to mark when app has been in background for a while
//         appStateTimeout = setTimeout(() => {
//           console.log('[AuthContext] App has been in background for 30 seconds');
//         }, 30000); // 30 seconds
//       } else if (nextAppState === 'active' && wasInBackground) {
//         clearTimeout(appStateTimeout);
        
//         // Only reload token if app was in background AND we have an authenticated user
//         if (state.isAuthenticated && hasLoadedToken.current) {
//           console.log('[AuthContext] App became active after being backgrounded, checking token validity');
//           // You could add a token validation check here if needed
//           // For now, we trust the stored token until it expires
//         }
//         wasInBackground = false;
//       }
//     };

//     const subscription = AppState.addEventListener('change', handleAppStateChange);
//     return () => {
//       clearTimeout(appStateTimeout);
//       subscription?.remove();
//     };
//   }, [state.isAuthenticated]);

//   const loadToken = async () => {
//     if (isLoadingToken.current) {
//       console.log('[AuthContext] Token loading already in progress, skipping...');
//       return;
//     }

//     try {
//       isLoadingToken.current = true;
//       console.log('[AuthContext] Loading stored token...');
      
//       const [token, userData] = await Promise.all([
//         SecureStore.getItemAsync('token'),
//         SecureStore.getItemAsync('userData')
//       ]);
      
//       console.log('[AuthContext] Token exists:', !!token);
//       console.log('[AuthContext] UserData exists:', !!userData);
      
//       if (token) {
//         setAuthToken(token);
        
//         let parsedUserData = null;
//         if (userData) {
//           try {
//             parsedUserData = JSON.parse(userData);
//             console.log('[AuthContext] User data parsed successfully');
//           } catch (parseError) {
//             console.error('[AuthContext] Error parsing user data:', parseError);
//             parsedUserData = null;
//           }
//         }
        
//         setState(prev => ({
//           ...prev,
//           token,
//           isAuthenticated: true,
//           isLoading: false,
//           name: parsedUserData?.name || null,
//           role: parsedUserData?.role || null,
//           stationId: parsedUserData?.stationId || null,
//           userId: parsedUserData?.userId || null,
//         }));
        
//         console.log('[AuthContext] Authentication state restored successfully');
//       } else {
//         console.log('[AuthContext] No token found, user needs to login');
//         setAuthToken(null);
        
//         setState(prev => ({
//           ...prev,
//           token: null,
//           isAuthenticated: false,
//           isLoading: false,
//           name: null,
//           role: null,
//           stationId: null,
//           userId: null,
//         }));
//       }
//     } catch (error) {
//       console.error('[AuthContext] Error loading token:', error);
      
//       setAuthToken(null);
//       setState(prev => ({
//         ...prev,
//         token: null,
//         isAuthenticated: false,
//         isLoading: false,
//         name: null,
//         role: null,
//         stationId: null,
//         userId: null,
//       }));
//     } finally {
//       hasLoadedToken.current = true;
//       isLoadingToken.current = false;
//     }
//   };

//   const login = async (phoneNumber: string, password: string) => {
//     try {
//       console.log('[AuthContext] Starting login process...');
//       const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
      
//       const response = await api.post('/api/auth/login', {
//         phoneNumber: formattedPhone,
//         password,
//       });
      
//       console.log('[AuthContext] Login response status:', response.status);
      
//       if (response.status === 200) {
//         const responseData = response.data;
//         const token = responseData.token || responseData.accessToken || responseData.jwt;
        
//         if (!token) {
//           throw new Error('Login response missing authentication token');
//         }
        
//         const userData = {
//           name: responseData.name || responseData.user?.name || null,
//           role: responseData.role || responseData.user?.role || null,
//           stationId: responseData.stationId || responseData.user?.stationId || null,
//           userId: responseData.userId || responseData.user?.id || null,
//           phoneNumber: formattedPhone,
//         };
        
//         await Promise.all([
//           SecureStore.setItemAsync('token', token),
//           SecureStore.setItemAsync('userData', JSON.stringify(userData))
//         ]);
        
//         setAuthToken(token);
        
//         setState(prev => ({
//           ...prev,
//           token,
//           isAuthenticated: true,
//           isLoading: false,
//           name: userData.name,
//           role: userData.role,
//           stationId: userData.stationId,
//           userId: userData.userId,
//         }));
        
//         console.log('[AuthContext] Login successful');
        
//       } else if (response.status >= 400 && response.status < 500) {
//         let errorMessage = 'Login failed';
        
//         if (response.data) {
//           if (typeof response.data === 'string') {
//             errorMessage = response.data;
//           } else if (typeof response.data === 'object') {
//             errorMessage = response.data.message || 
//                           response.data.error || 
//                           response.data.details || 
//                           response.data.errorMessage ||
//                           response.data.msg ||
//                           'Invalid credentials';
//           }
//         }
        
//         if (response.status === 401) {
//           errorMessage = 'Invalid phone number or password';
//         } else if (response.status === 403) {
//           errorMessage = 'Account access denied';
//         } else if (response.status === 404) {
//           errorMessage = 'Login service not available';
//         }
        
//         throw new Error(errorMessage);
        
//       } else {
//         throw new Error(`Unexpected response status: ${response.status}`);
//       }
      
//     } catch (error: any) {
//       console.error('[AuthContext] Login error:', error.message);
      
//       if (error.message === 'Network Error' || error.code === 'NETWORK_ERROR') {
//         throw new Error('Unable to connect to server. Please check your internet connection.');
//       } else if (error.message.includes('timeout')) {
//         throw new Error('Connection timeout. Please try again.');
//       } else if (error.message.includes('ECONNREFUSED')) {
//         throw new Error('Server is not available. Please try again later.');
//       }
      
//       throw error;
//     }
//   };

//   const logout = async () => {
//     try {
//       console.log('[AuthContext] Starting logout process...');
      
//       setAuthToken(null);
      
//       try {
//         const response = await api.post('/api/auth/logout');
//         console.log('[AuthContext] Server logout response:', response.status);
//       } catch (logoutError: any) {
//         console.warn('[AuthContext] Server logout failed, continuing with local logout');
//       }
      
//       await Promise.all([
//         SecureStore.deleteItemAsync('token'),
//         SecureStore.deleteItemAsync('userData')
//       ]);
      
//       setState(prev => ({
//         ...prev,
//         token: null,
//         isAuthenticated: false,
//         isLoading: false,
//         name: null,
//         role: null,
//         stationId: null,
//         userId: null,
//       }));
      
//       // Reset the loaded flag so token can be loaded again after next login
//       hasLoadedToken.current = false;
      
//       console.log('[AuthContext] Logout completed');
      
//     } catch (error: any) {
//       console.error('[AuthContext] Logout error:', error);
      
//       try {
//         setAuthToken(null);
//         await Promise.all([
//           SecureStore.deleteItemAsync('token'),
//           SecureStore.deleteItemAsync('userData')
//         ]);
//         setState(prev => ({
//           ...prev,
//           token: null,
//           isAuthenticated: false,
//           isLoading: false,
//           name: null,
//           role: null,
//           stationId: null,
//           userId: null,
//         }));
//         hasLoadedToken.current = false;
//       } catch (cleanupError) {
//         console.error('[AuthContext] Failed to cleanup local data:', cleanupError);
//       }
//       throw error;
//     }
//   };

//   const register = async (userData: any) => {
//     try {
//       console.log('[AuthContext] Starting registration process...');
      
//       let requestData = { ...userData };
//       if (userData.phoneNumber) {
//         const formattedPhone = userData.phoneNumber.startsWith('+91')
//           ? userData.phoneNumber
//           : `+91${userData.phoneNumber}`;
//         requestData.phoneNumber = formattedPhone;
//       }
      
//       const response = await api.post('/api/auth/register', requestData);
      
//       console.log('[AuthContext] Registration response status:', response.status);
      
//       if (response.status >= 200 && response.status < 300) {
//         console.log('[AuthContext] Registration successful');
        
//       } else if (response.status >= 400 && response.status < 500) {
//         let errorMessage = 'Registration failed';
        
//         if (response.data) {
//           if (typeof response.data === 'string') {
//             errorMessage = response.data;
//           } else if (typeof response.data === 'object') {
//             errorMessage = response.data.message || 
//                           response.data.error || 
//                           response.data.details || 
//                           response.data.errorMessage ||
//                           'Registration failed';
//           }
//         }
        
//         if (response.status === 409) {
//           errorMessage = 'Phone number already registered';
//         }
        
//         throw new Error(errorMessage);
        
//       } else {
//         throw new Error(`Unexpected response status: ${response.status}`);
//       }
      
//     } catch (error: any) {
//       console.error('[AuthContext] Registration error:', error.message);
      
//       if (error.message === 'Network Error' || error.code === 'NETWORK_ERROR') {
//         throw new Error('Unable to connect to server. Please check your internet connection.');
//       }
      
//       throw error;
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         ...state,
//         login,
//         logout,
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

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AppState, AppStateStatus, Alert } from 'react-native';
import { api, setAuthToken } from '../api/config';
import { router } from 'expo-router';

interface AuthState {
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  name: string | null;
  role: string | null;
  stationId: string | null;
  userId: number | null;
  tokenExpiry: number | null; // Add token expiry timestamp
}

interface AuthContextType extends AuthState {
  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  checkTokenValidity: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    console.error('[AuthContext] Error decoding JWT:', error);
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

const getTokenExpiryTime = (token: string): number | null => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  return decoded.exp * 1000; // Convert to milliseconds
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    token: null,
    isLoading: true,
    isAuthenticated: false,
    name: null,
    role: null,
    stationId: null,
    userId: null,
    tokenExpiry: null,
  });

  // Use refs to track loading and token checking
  const hasLoadedToken = useRef(false);
  const isLoadingToken = useRef(false);
  const tokenCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Load token only once on app start
  useEffect(() => {
    if (!hasLoadedToken.current && !isLoadingToken.current) {
      loadToken();
    }
  }, []);

  // Set up token expiry monitoring when authenticated
  useEffect(() => {
    if (state.isAuthenticated && state.token && state.tokenExpiry) {
      startTokenExpiryMonitoring();
    } else {
      stopTokenExpiryMonitoring();
    }

    return () => {
      stopTokenExpiryMonitoring();
    };
  }, [state.isAuthenticated, state.token, state.tokenExpiry]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('[AuthContext] App state changed to:', nextAppState);
      
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to foreground, check token validity
        if (state.isAuthenticated && state.token) {
          checkTokenValidity();
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription?.remove();
    };
  }, [state.isAuthenticated, state.token]);

  const startTokenExpiryMonitoring = () => {
    stopTokenExpiryMonitoring(); // Clear any existing interval
    
    if (!state.tokenExpiry) return;
    
    const checkInterval = 60000; // Check every minute
    
    tokenCheckInterval.current = setInterval(() => {
      const timeUntilExpiry = state.tokenExpiry! - Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      console.log(`[AuthContext] Token expires in: ${Math.floor(timeUntilExpiry / 1000 / 60)} minutes`);
      
      // Show warning 5 minutes before expiry
      if (timeUntilExpiry <= fiveMinutes && timeUntilExpiry > 0) {
        showExpiryWarning(Math.floor(timeUntilExpiry / 1000 / 60));
      }
      
      // Auto logout when expired
      if (timeUntilExpiry <= 0) {
        console.log('[AuthContext] Token expired, logging out automatically');
        handleTokenExpiry();
      }
    }, checkInterval);
  };

  const stopTokenExpiryMonitoring = () => {
    if (tokenCheckInterval.current) {
      clearInterval(tokenCheckInterval.current);
      tokenCheckInterval.current = null;
    }
  };

  const showExpiryWarning = (minutesLeft: number) => {
    Alert.alert(
      'Session Expiring Soon',
      `Your session will expire in ${minutesLeft} minute(s). Please save any important work.`,
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  };

  const handleTokenExpiry = async () => {
    try {
      console.log('[AuthContext] Handling token expiry - auto logout');
      
      // Stop monitoring
      stopTokenExpiryMonitoring();
      
      // Clear auth state
      setAuthToken(null);
      
      // Clear stored data
      await Promise.all([
        SecureStore.deleteItemAsync('token'),
        SecureStore.deleteItemAsync('userData'),
        SecureStore.deleteItemAsync('tokenExpiry')
      ]);
      
      // Update state
      setState(prev => ({
        ...prev,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        name: null,
        role: null,
        stationId: null,
        userId: null,
        tokenExpiry: null,
      }));
      
      // Reset flags
      hasLoadedToken.current = false;
      
      // Show expiry alert and redirect
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please log in again.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Force navigate to login
              try {
                router.replace('/(auth)/login');
              } catch (navError) {
                console.error('[AuthContext] Navigation error:', navError);
                // Fallback navigation
                router.push('/(auth)/login');
              }
            },
          },
        ],
        { cancelable: false }
      );
      
    } catch (error) {
      console.error('[AuthContext] Error handling token expiry:', error);
      
      // Force logout even if there's an error
      setAuthToken(null);
      setState(prev => ({
        ...prev,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        name: null,
        role: null,
        stationId: null,
        userId: null,
        tokenExpiry: null,
      }));
      hasLoadedToken.current = false;
      
      router.replace('/(auth)/login');
    }
  };

  const checkTokenValidity = async (): Promise<boolean> => {
    if (!state.token) {
      return false;
    }

    try {
      // First check if token is expired locally
      if (isTokenExpired(state.token)) {
        console.log('[AuthContext] Token expired locally');
        await handleTokenExpiry();
        return false;
      }

      // Verify with server by making a test API call
      const response = await api.get('/api/auth/verify-token');
      
      if (response.status === 200) {
        console.log('[AuthContext] Token is valid');
        return true;
      } else if (response.status === 401) {
        console.log('[AuthContext] Token invalid according to server');
        await handleTokenExpiry();
        return false;
      } else {
        console.warn('[AuthContext] Unexpected response from token verification:', response.status);
        return true; // Give benefit of doubt for non-401 errors
      }
      
    } catch (error: any) {
      console.error('[AuthContext] Token verification error:', error);
      
      // If it's a 401 error, handle as expired
      if (error.response?.status === 401) {
        await handleTokenExpiry();
        return false;
      }
      
      // For network errors, assume token is still valid
      return true;
    }
  };

  const loadToken = async () => {
    if (isLoadingToken.current) {
      console.log('[AuthContext] Token loading already in progress, skipping...');
      return;
    }

    try {
      isLoadingToken.current = true;
      console.log('[AuthContext] Loading stored token...');
      
      const [token, userData, tokenExpiry] = await Promise.all([
        SecureStore.getItemAsync('token'),
        SecureStore.getItemAsync('userData'),
        SecureStore.getItemAsync('tokenExpiry')
      ]);
      
      console.log('[AuthContext] Token exists:', !!token);
      console.log('[AuthContext] UserData exists:', !!userData);
      console.log('[AuthContext] TokenExpiry exists:', !!tokenExpiry);
      
      if (token) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          console.log('[AuthContext] Stored token is expired, clearing...');
          await Promise.all([
            SecureStore.deleteItemAsync('token'),
            SecureStore.deleteItemAsync('userData'),
            SecureStore.deleteItemAsync('tokenExpiry')
          ]);
          
          setState(prev => ({
            ...prev,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            name: null,
            role: null,
            stationId: null,
            userId: null,
            tokenExpiry: null,
          }));
          
          hasLoadedToken.current = true;
          isLoadingToken.current = false;
          return;
        }
        
        setAuthToken(token);
        
        let parsedUserData = null;
        if (userData) {
          try {
            parsedUserData = JSON.parse(userData);
            console.log('[AuthContext] User data parsed successfully');
          } catch (parseError) {
            console.error('[AuthContext] Error parsing user data:', parseError);
            parsedUserData = null;
          }
        }
        
        const expiryTime = tokenExpiry ? parseInt(tokenExpiry) : getTokenExpiryTime(token);
        
        setState(prev => ({
          ...prev,
          token,
          isAuthenticated: true,
          isLoading: false,
          name: parsedUserData?.name || null,
          role: parsedUserData?.role || null,
          stationId: parsedUserData?.stationId || null,
          userId: parsedUserData?.userId || null,
          tokenExpiry: expiryTime,
        }));
        
        console.log('[AuthContext] Authentication state restored successfully');
        
        // Verify token with server in background
        setTimeout(() => {
          checkTokenValidity();
        }, 1000);
        
      } else {
        console.log('[AuthContext] No token found, user needs to login');
        setAuthToken(null);
        
        setState(prev => ({
          ...prev,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          name: null,
          role: null,
          stationId: null,
          userId: null,
          tokenExpiry: null,
        }));
      }
    } catch (error) {
      console.error('[AuthContext] Error loading token:', error);
      
      setAuthToken(null);
      setState(prev => ({
        ...prev,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        name: null,
        role: null,
        stationId: null,
        userId: null,
        tokenExpiry: null,
      }));
    } finally {
      hasLoadedToken.current = true;
      isLoadingToken.current = false;
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
      
      if (response.status === 200) {
        const responseData = response.data;
        const token = responseData.token || responseData.accessToken || responseData.jwt;
        
        if (!token) {
          throw new Error('Login response missing authentication token');
        }
        
        // Get token expiry time
        const expiryTime = getTokenExpiryTime(token);
        
        if (!expiryTime) {
          throw new Error('Invalid token - no expiry information');
        }
        
        const userData = {
          name: responseData.name || responseData.user?.name || null,
          role: responseData.role || responseData.user?.role || null,
          stationId: responseData.stationId || responseData.user?.stationId || null,
          userId: responseData.userId || responseData.user?.id || null,
          phoneNumber: formattedPhone,
        };
        
        // Store token, user data, and expiry time
        await Promise.all([
          SecureStore.setItemAsync('token', token),
          SecureStore.setItemAsync('userData', JSON.stringify(userData)),
          SecureStore.setItemAsync('tokenExpiry', expiryTime.toString())
        ]);
        
        setAuthToken(token);
        
        setState(prev => ({
          ...prev,
          token,
          isAuthenticated: true,
          isLoading: false,
          name: userData.name,
          role: userData.role,
          stationId: userData.stationId,
          userId: userData.userId,
          tokenExpiry: expiryTime,
        }));
        
        console.log('[AuthContext] Login successful, token expires at:', new Date(expiryTime));
        
      } else if (response.status >= 400 && response.status < 500) {
        let errorMessage = 'Login failed';
        
        if (response.data) {
          if (typeof response.data === 'string') {
            errorMessage = response.data;
          } else if (typeof response.data === 'object') {
            errorMessage = response.data.message || 
                          response.data.error || 
                          response.data.details || 
                          response.data.errorMessage ||
                          response.data.msg ||
                          'Invalid credentials';
          }
        }
        
        if (response.status === 401) {
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
      
      if (error.message === 'Network Error' || error.code === 'NETWORK_ERROR') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Connection timeout. Please try again.');
      } else if (error.message.includes('ECONNREFUSED')) {
        throw new Error('Server is not available. Please try again later.');
      }
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Starting logout process...');
      
      // Stop token monitoring
      stopTokenExpiryMonitoring();
      
      setAuthToken(null);
      
      try {
        const response = await api.post('/api/auth/logout');
        console.log('[AuthContext] Server logout response:', response.status);
      } catch (logoutError: any) {
        console.warn('[AuthContext] Server logout failed, continuing with local logout');
      }
      
      await Promise.all([
        SecureStore.deleteItemAsync('token'),
        SecureStore.deleteItemAsync('userData'),
        SecureStore.deleteItemAsync('tokenExpiry')
      ]);
      
      setState(prev => ({
        ...prev,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        name: null,
        role: null,
        stationId: null,
        userId: null,
        tokenExpiry: null,
      }));
      
      // Reset the loaded flag so token can be loaded again after next login
      hasLoadedToken.current = false;
      
      console.log('[AuthContext] Logout completed');
      
    } catch (error: any) {
      console.error('[AuthContext] Logout error:', error);
      
      try {
        stopTokenExpiryMonitoring();
        setAuthToken(null);
        await Promise.all([
          SecureStore.deleteItemAsync('token'),
          SecureStore.deleteItemAsync('userData'),
          SecureStore.deleteItemAsync('tokenExpiry')
        ]);
        setState(prev => ({
          ...prev,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          name: null,
          role: null,
          stationId: null,
          userId: null,
          tokenExpiry: null,
        }));
        hasLoadedToken.current = false;
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
      
      if (response.status >= 200 && response.status < 300) {
        console.log('[AuthContext] Registration successful');
        
      } else if (response.status >= 400 && response.status < 500) {
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
        
        if (response.status === 409) {
          errorMessage = 'Phone number already registered';
        }
        
        throw new Error(errorMessage);
        
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
      
    } catch (error: any) {
      console.error('[AuthContext] Registration error:', error.message);
      
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
        checkTokenValidity,
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