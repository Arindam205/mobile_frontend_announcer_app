// import React, { useEffect } from 'react';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
// import { AuthProvider } from '../src/context/AuthContext';
// import AppErrorBoundary from '../components/ErrorBoundary';
// import { useFrameworkReady } from '@/hooks/useFrameworkReady';
// import TrackPlayer from 'react-native-track-player';

// export default function RootLayout() {
//   useFrameworkReady();

//   useEffect(() => {
//     // Register the TrackPlayer service for background playback
//     TrackPlayer.registerPlaybackService(() => require('../src/services/TrackPlayerService'));
//   }, []);

//   return (
//     <AppErrorBoundary>
//       <GestureHandlerRootView style={{ flex: 1 }}>
//         <SafeAreaProvider initialMetrics={initialWindowMetrics}>
//           <AuthProvider>
//             <Stack screenOptions={{ headerShown: false }}>
//               <Stack.Screen name="index" />
//               <Stack.Screen name="(auth)" />
//               <Stack.Screen name="(app)" />
//             </Stack>
//             <StatusBar style="auto" />
//           </AuthProvider>
//         </SafeAreaProvider>
//       </GestureHandlerRootView>
//     </AppErrorBoundary>
//   );
// }

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import AppErrorBoundary from '../components/ErrorBoundary';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import TrackPlayer from 'react-native-track-player';
import * as Linking from 'expo-linking';
import { URLHandler } from '../src/utils/urlHandler';

// Enhanced linking configuration
const linking = {
  prefixes: [
    'raise://',
    'com.subhra.raiseapp://',
    // Add your website domains here when available
    // 'https://yourapp.com',
    // 'http://yourapp.com',
  ],
  config: {
    screens: {
      // Map URL patterns to screen routes
      index: '',
      '(auth)': {
        screens: {
          login: 'login',
          register: 'register',
        },
      },
      '(app)': {
        screens: {
          home: 'home',
          radio: 'radio',
          profile: 'profile',
          'rating-selection': 'rating-selection',
          'rate-announcer': 'rate-announcer',
          'program-selection': 'program-selection',
          'rate-program': 'rate-program',
        },
      },
      // Custom deep link patterns
      'station/:stationId': '(app)/radio',
      'stream/:streamUrl': '(app)/radio',
      'play': '(app)/radio',
      'stop': '(app)/radio',
    },
  },
};

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Register the TrackPlayer service for background playback
    TrackPlayer.registerPlaybackService(() => require('../src/services/TrackPlayerService'));
    
    // Setup URL handling
    setupURLHandling();
  }, []);

  const setupURLHandling = () => {
    // Handle initial URL when app is opened from a link
    const handleInitialURL = async () => {
      try {
        const initialURL = await Linking.getInitialURL();
        if (initialURL) {
          console.log('[App] Initial URL:', initialURL);
          handleIncomingURL(initialURL);
        }
      } catch (error) {
        console.error('[App] Error getting initial URL:', error);
      }
    };

    // Handle URLs when app is already running
    const handleURL = (event: { url: string }) => {
      console.log('[App] Incoming URL:', event.url);
      handleIncomingURL(event.url);
    };

    // Setup listeners
    handleInitialURL();
    
    const subscription = Linking.addEventListener('url', handleURL);
    
    return () => {
      subscription?.remove();
    };
  };

  const handleIncomingURL = async (url: string) => {
    try {
      // Basic validation
      const validation = URLHandler.validateIncomingURL(url);
      
      if (!validation.isValid) {
        console.warn(`[App] Rejected URL: ${validation.reason}`);
        return;
      }

      console.log(`[App] Processing ${validation.type} URL:`, url);

      // Handle different URL types
      switch (validation.type) {
        case 'hls_stream':
          // Store the stream URL for the radio component to pick up
          // You might want to use a global state or context for this
          console.log('[App] HLS stream URL received, will be handled by radio component');
          break;
        
        case 'custom_scheme':
          // Parse and handle custom scheme
          const parsed = URLHandler.parseCustomSchemeURL(url);
          if (parsed) {
            console.log('[App] Custom scheme parsed:', parsed);
            // The navigation will be handled by the linking config above
          }
          break;
        
        default:
          console.log('[App] URL will be handled by standard navigation');
      }
    } catch (error) {
      console.error('[App] Error handling incoming URL:', error);
    }
  };

  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <AuthProvider>
            <Stack 
              screenOptions={{ headerShown: false }}
              // Add linking configuration
              // Note: This is a conceptual addition - actual implementation depends on your navigation setup
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
            </Stack>
            <StatusBar style="auto" />
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
}