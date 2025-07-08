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
//         <Tabs.Screen 
//           name="home" 
//           options={{ 
//             title: 'Home', 
//             tabBarIcon: ({ size, color }) => (
//               <Ionicons name="home" size={size} color={color} />
//             ),
//           }} 
//         />
        
//         {/* Radio tab removed - streaming is now integrated into home */}
        
//         <Tabs.Screen 
//           name="profile" 
//           options={{ 
//             title: 'Profile', 
//             tabBarIcon: ({ size, color }) => (
//               <Ionicons name="person" size={size} color={color} />
//             ),
//           }} 
//         />
        
//         {/* Hide all rating and program screens from tab bar */}
//         <Tabs.Screen 
//           name="rating-selection"
//           options={{
//             href: null
//           }}
//         />

//         <Tabs.Screen 
//           name="rate-announcer"
//           options={{
//             href: null
//           }} 
//         />
        
//         <Tabs.Screen 
//           name="program-selection"
//           options={{
//             href: null
//           }} 
//         />
        
//         <Tabs.Screen 
//           name="rate-program"
//           options={{
//             href: null
//           }} 
//         />

//         {/* Keep radio file but hide from tabs for backward compatibility */}
//         <Tabs.Screen 
//           name="radio"
//           options={{
//             href: null
//           }} 
//         />
//       </Tabs>
//     </ChannelProvider>
//   );
// }

import { Tabs } from 'expo-router'; 
import { useAuth } from '../../src/context/AuthContext'; 
import { useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChannelProvider } from '../../src/context/ChannelContext';
import { LogBox } from 'react-native';

// Ignore common warnings during development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Failed prop type',
  'VirtualizedLists should never be nested',
  '[Layout children]: No route named',
]);

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  
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
            title: 'Home', 
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="home" size={size} color={color} />
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
          REMOVED: radio.tsx tab 
          Since streaming is now integrated into the home screen,
          the separate radio page is no longer needed.
          The radio.tsx file should be deleted from the project.
        */}
      </Tabs>
    </ChannelProvider>
  );
}