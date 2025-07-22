// import React, { useEffect } from 'react';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
// import { AuthProvider } from '../src/context/AuthContext';
// import AppErrorBoundary from '../components/ErrorBoundary';
// import { useFrameworkReady } from '@/hooks/useFrameworkReady';
// import TrackPlayer from 'react-native-track-player';
// import * as Linking from 'expo-linking';
// import { URLHandler } from '../src/utils/urlHandler';
// import { router } from 'expo-router';

// // Enhanced linking configuration
// const linking = {
//   prefixes: [
//     'raise://',
//     'com.subhra.raiseapp://',
//     'trackplayer://', // Add TrackPlayer scheme
//     // Add your website domains here when available
//     // 'https://yourapp.com',
//     // 'http://yourapp.com',
//   ],
//   config: {
//     screens: {
//       // Map URL patterns to screen routes
//       index: '',
//       'trackplayer-redirect': 'trackplayer-redirect', // Map TrackPlayer URLs to splash screen
//       '(auth)': {
//         screens: {
//           login: 'login',
//           register: 'register',
//         },
//       },
//       '(app)': {
//         screens: {
//           home: 'home',
//           radio: 'radio',
//           profile: 'profile',
//           'rating-selection': 'rating-selection',
//           'rate-announcer': 'rate-announcer',
//           'program-selection': 'program-selection',
//           'rate-program': 'rate-program',
//         },
//       },
//       // Custom deep link patterns - map ALL trackplayer URLs to splash
//       'trackplayer': 'trackplayer-redirect',
//       'trackplayer/*': 'trackplayer-redirect', // Catch any trackplayer sub-paths
//       'station/:stationId': '(app)/radio',
//       'stream/:streamUrl': '(app)/radio',
//       'play': '(app)/home', // Redirect play action to home
//       'stop': '(app)/home', // Redirect stop action to home
//     },
//   },
// };

// export default function RootLayout() {
//   useFrameworkReady();

//   useEffect(() => {
//     // Register the TrackPlayer service for background playback
//     TrackPlayer.registerPlaybackService(() => require('../src/services/TrackPlayerService'));
    
//     // Setup URL handling
//     setupURLHandling();
//   }, []);

//   const setupURLHandling = () => {
//     // Handle initial URL when app is opened from a link
//     const handleInitialURL = async () => {
//       try {
//         const initialURL = await Linking.getInitialURL();
//         if (initialURL) {
//           console.log('[App] Initial URL:', initialURL);
//           handleIncomingURL(initialURL);
//         }
//       } catch (error) {
//         console.error('[App] Error getting initial URL:', error);
//       }
//     };

//     // Handle URLs when app is already running
//     const handleURL = (event: { url: string }) => {
//       console.log('[App] Incoming URL:', event.url);
//       handleIncomingURL(event.url);
//     };

//     // Setup listeners
//     handleInitialURL();
    
//     const subscription = Linking.addEventListener('url', handleURL);
    
//     return () => {
//       subscription?.remove();
//     };
//   };

//   const handleIncomingURL = async (url: string) => {
//     try {
//       // Check if it's a TrackPlayer URL first
//       if (url.startsWith('trackplayer://')) {
//         console.log('[App] TrackPlayer URL detected, showing splash and redirecting to home');
        
//         // Navigate to the TrackPlayer redirect screen instead of directly to home
//         try {
//           router.replace('/trackplayer-redirect');
//           console.log('[App] Successfully navigated to TrackPlayer redirect screen');
//         } catch (navError) {
//           console.error('[App] Error navigating to redirect screen:', navError);
//           // Fallback - go directly to home with a longer delay
//           setTimeout(() => {
//             try {
//               router.replace('/(app)/home');
//             } catch (fallbackError) {
//               console.error('[App] Fallback navigation also failed:', fallbackError);
//               router.push('/(app)/home');
//             }
//           }, 300);
//         }
        
//         return;
//       }

//       // Basic validation for other URLs
//       const validation = URLHandler.validateIncomingURL(url);
      
//       if (!validation.isValid) {
//         console.warn(`[App] Rejected URL: ${validation.reason}`);
//         return;
//       }

//       console.log(`[App] Processing ${validation.type} URL:`, url);

//       // Handle different URL types
//       switch (validation.type) {
//         case 'hls_stream':
//           // Store the stream URL for the radio component to pick up
//           // You might want to use a global state or context for this
//           console.log('[App] HLS stream URL received, will be handled by radio component');
//           break;
        
//         case 'custom_scheme':
//           // Parse and handle custom scheme
//           const parsed = URLHandler.parseCustomSchemeURL(url);
//           if (parsed) {
//             console.log('[App] Custom scheme parsed:', parsed);
            
//             // Handle specific custom scheme actions
//             if (parsed.path === 'play' || parsed.path === 'stop') {
//               // Redirect to home for play/stop actions
//               setTimeout(() => {
//                 router.replace('/(app)/home');
//               }, 100);
//             }
//             // The navigation will be handled by the linking config above for other paths
//           }
//           break;
        
//         default:
//           console.log('[App] URL will be handled by standard navigation');
//       }
//     } catch (error) {
//       console.error('[App] Error handling incoming URL:', error);
//     }
//   };

//   return (
//     <AppErrorBoundary>
//       <GestureHandlerRootView style={{ flex: 1 }}>
//         <SafeAreaProvider initialMetrics={initialWindowMetrics}>
//           <AuthProvider>
//             <Stack 
//               screenOptions={{ headerShown: false }}
//               // Note: Expo Router handles linking automatically based on file structure
//               // The linking config above is more for reference and custom schemes
//             >
//               <Stack.Screen name="index" />
//               <Stack.Screen name="(auth)" />
//               <Stack.Screen name="(app)" />
//               <Stack.Screen name="+not-found" />
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
import { router } from 'expo-router';

// Enhanced linking configuration
const linking = {
  prefixes: [
    'raise://',
    'com.subhra.raiseapp://',
    'trackplayer://', // Add TrackPlayer scheme
  ],
  config: {
    screens: {
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
      // Map ALL TrackPlayer URLs directly to home - no intermediate redirect
      'trackplayer': '(app)/home',
      'trackplayer/*': '(app)/home',
      'station/:stationId': '(app)/radio',
      'stream/:streamUrl': '(app)/radio',
      'play': '(app)/home',
      'stop': '(app)/home',
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
      // FIXED: Handle TrackPlayer URLs directly without intermediate redirect
      if (url.startsWith('trackplayer://')) {
        console.log('[App] TrackPlayer URL detected, navigating directly to home');
        
        // Navigate directly to home without showing splash screen
        try {
          // Use replace to avoid stacking navigation
          router.replace('/(app)/home');
          console.log('[App] Successfully navigated directly to home');
        } catch (navError) {
          console.error('[App] Direct navigation failed:', navError);
          // Fallback - use push if replace fails
          router.push('/(app)/home');
        }
        
        return;
      }

      // Basic validation for other URLs
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
          console.log('[App] HLS stream URL received, will be handled by radio component');
          break;
        
        case 'custom_scheme':
          // Parse and handle custom scheme
          const parsed = URLHandler.parseCustomSchemeURL(url);
          if (parsed) {
            console.log('[App] Custom scheme parsed:', parsed);
            
            // Handle specific custom scheme actions
            if (parsed.path === 'play' || parsed.path === 'stop') {
              // Redirect to home for play/stop actions
              setTimeout(() => {
                router.replace('/(app)/home');
              }, 100);
            }
            // The navigation will be handled by the linking config above for other paths
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
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
              <Stack.Screen name="+not-found" />
              {/* REMOVED: trackplayer-redirect screen - no longer needed */}
            </Stack>
            <StatusBar style="auto" />
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
}