// import { Tabs } from 'expo-router'; 
// import { useAuth } from '../../src/context/AuthContext'; 
// import { useEffect } from 'react';
// import { router } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { ChannelProvider } from '../../src/context/ChannelContext';
// import { LogBox } from 'react-native';

// // Ignore common warnings during development
// LogBox.ignoreLogs([
//   'Non-serializable values were found in the navigation state',
//   'Failed prop type',
//   'VirtualizedLists should never be nested',
//   '[Layout children]: No route named',
//   'TrackPlayer is already initialized',
// ]);

// export default function AppLayout() {
//   const { isAuthenticated, isLoading } = useAuth();
  
//   // Only redirect if not loading and not authenticated
//   useEffect(() => {
//     if (!isLoading && !isAuthenticated) {
//       console.log("[AppLayout] User not authenticated, redirecting to login");
//       router.replace('/(auth)/login');
//     }
//   }, [isAuthenticated, isLoading]);

//   // Don't render tabs if still loading or not authenticated
//   if (isLoading || !isAuthenticated) {
//     return null;
//   }

//   return (
//     <ChannelProvider>
//       <Tabs 
//         screenOptions={{ 
//           headerShown: false, 
//           tabBarStyle: { 
//             elevation: 0, 
//             borderTopWidth: 1, 
//             borderTopColor: '#f0f0f0',
//             backgroundColor: '#ffffff',
//             height: 60,
//             paddingBottom: 8,
//             paddingTop: 8,
//             paddingHorizontal: 16,
//           },
//           tabBarActiveTintColor: '#3b82f6',
//           tabBarInactiveTintColor: '#6b7280',
//           tabBarLabelStyle: {
//             fontSize: 12,
//             fontWeight: '500',
//           },
//           tabBarItemStyle: {
//             paddingVertical: 4,
//           },
//         }}
//       >
//         {/* Main Home Tab - Now includes streaming functionality */}
//         <Tabs.Screen 
//           name="home" 
//           options={{ 
//             title: 'Live Radio', 
//             tabBarIcon: ({ size, color }) => (
//               <Ionicons name="radio" size={size} color={color} />
//             ),
//           }} 
//         />
        
//         {/* Profile Tab */}
//         <Tabs.Screen 
//           name="profile" 
//           options={{ 
//             title: 'Profile', 
//             tabBarIcon: ({ size, color }) => (
//               <Ionicons name="person" size={size} color={color} />
//             ),
//           }} 
//         />
        
//         {/* Hidden Screens - Not visible in tab bar but accessible via navigation */}
//         <Tabs.Screen 
//           name="rating-selection"
//           options={{
//             href: null // Hidden from tab bar
//           }}
//         />

//         <Tabs.Screen 
//           name="rate-announcer"
//           options={{
//             href: null // Hidden from tab bar
//           }} 
//         />
        
//         <Tabs.Screen 
//           name="program-selection"
//           options={{
//             href: null // Hidden from tab bar
//           }} 
//         />
        
//         <Tabs.Screen 
//           name="rate-program"
//           options={{
//             href: null // Hidden from tab bar
//           }} 
//         />

//         {/* 
//           RADIO TAB COMPLETELY REMOVED:
//           The radio.tsx file should be deleted from the project since 
//           streaming is now fully integrated into the home screen.
          
//           Previous radio functionality has been merged into home.tsx with:
//           - Dynamic channel selection and streaming
//           - Enhanced foreground service controls
//           - Channel state persistence
//           - Proper lock screen behavior
//         */}
//       </Tabs>
//     </ChannelProvider>
//   );
// }

// app/(app)/_layout.tsx
import { Tabs } from 'expo-router'; 
import { useAuth } from '../../src/context/AuthContext'; 
import { useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChannelProvider } from '../../src/context/ChannelContext';
import { LogBox, AppState, AppStateStatus } from 'react-native';
import TrackPlayer, { State } from 'react-native-track-player';

// Ignore common warnings during development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Failed prop type',
  'VirtualizedLists should never be nested',
  '[Layout children]: No route named',
  'TrackPlayer is already initialized',
]);

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // NOTIFICATION CLICK HANDLER - Add this effect
  useEffect(() => {
    let appState: AppStateStatus = AppState.currentState;
    
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log('[AppLayout] App state changed from', appState, 'to', nextAppState);
      
      // Detect app coming to foreground (likely from notification)
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[AppLayout] App activated, checking if from notification');
        
        // Small delay to ensure TrackPlayer is ready
        setTimeout(async () => {
          try {
            // Check if there's active playback (indicates notification click)
            const playbackState = await TrackPlayer.getPlaybackState();
            const queue = await TrackPlayer.getQueue();
            
            console.log('[AppLayout] Playback state:', playbackState.state, 'Queue length:', queue.length);
            
            if (queue.length > 0 && (playbackState.state === State.Playing || playbackState.state === State.Paused)) {
              console.log('[AppLayout] Active playback detected, ensuring home screen');
              
              // Check current route and navigate to home if needed
              setTimeout(() => {
                try {
                  // Check if we're currently on the home screen
                  // Note: router.segments is not available in the current Expo Router version
                  // We'll use a different approach to check the current route
                  
                  console.log('[AppLayout] Navigating to home from notification');
                  router.replace('/(app)/home');
                  
                } catch (navError) {
                  console.error('[AppLayout] Navigation error:', navError);
                  // Fallback navigation
                  try {
                    router.replace('/(app)/home');
                  } catch (fallbackError) {
                    console.error('[AppLayout] Fallback navigation failed:', fallbackError);
                  }
                }
              }, 100);
            } else {
              console.log('[AppLayout] No active playback, regular app activation');
            }
          } catch (error) {
            console.error('[AppLayout] Error checking playback state:', error);
          }
        }, 200);
      }
      
      appState = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, []);
  
  // Only redirect if not loading and not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("[AppLayout] User not authenticated, redirecting to login");
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading]);

  // Don't render tabs if still loading or not authenticated
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <ChannelProvider>
      <Tabs 
        screenOptions={{ 
          headerShown: false, 
          tabBarStyle: { 
            elevation: 0, 
            borderTopWidth: 1, 
            borderTopColor: '#f0f0f0',
            backgroundColor: '#ffffff',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            paddingHorizontal: 16,
          },
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#6b7280',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
        }}
      >
        {/* Main Home Tab - Now includes streaming functionality */}
        <Tabs.Screen 
          name="home" 
          options={{ 
            title: 'Live Radio', 
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="radio" size={size} color={color} />
            ),
          }} 
        />
        
        {/* Profile Tab */}
        <Tabs.Screen 
          name="profile" 
          options={{ 
            title: 'Profile', 
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }} 
        />
        
        {/* Hidden Screens - Not visible in tab bar but accessible via navigation */}
        <Tabs.Screen 
          name="rating-selection"
          options={{
            href: null // Hidden from tab bar
          }}
        />

        <Tabs.Screen 
          name="rate-announcer"
          options={{
            href: null // Hidden from tab bar
          }} 
        />
        
        <Tabs.Screen 
          name="program-selection"
          options={{
            href: null // Hidden from tab bar
          }} 
        />
        
        <Tabs.Screen 
          name="rate-program"
          options={{
            href: null // Hidden from tab bar
          }} 
        />

        {/* 
          RADIO TAB COMPLETELY REMOVED:
          The radio.tsx file should be deleted from the project since 
          streaming is now fully integrated into the home screen.
          
          Previous radio functionality has been merged into home.tsx with:
          - Dynamic channel selection and streaming
          - Enhanced foreground service controls
          - Channel state persistence
          - Proper lock screen behavior
        */}
      </Tabs>
    </ChannelProvider>
  );
}