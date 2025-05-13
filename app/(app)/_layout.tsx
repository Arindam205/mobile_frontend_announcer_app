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
//   const { isAuthenticated } = useAuth();
  
//   useEffect(() => {
//     if (!isAuthenticated) {
//       console.log("[AppLayout] User not authenticated, redirecting to login");
//       router.replace('/(auth)/login');
//     }
//   }, [isAuthenticated]);

//   return (
//     <ChannelProvider>
//       <Tabs 
//         screenOptions={{ 
//           headerShown: false, 
//           tabBarStyle: { elevation: 0, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
//         }}
//       >
//         <Tabs.Screen name="home" options={{ 
//           title: 'Home', 
//           tabBarIcon: ({ size, color }) => (
//             <Ionicons name="home" size={size} color={color} />
//           ),
//         }} />
//         <Tabs.Screen name="profile" options={{ 
//           title: 'Profile', 
//           tabBarIcon: ({ size, color }) => (
//             <Ionicons name="person" size={size} color={color} />
//           ),
//         }} />
        
//         {/* Simply use tabBarButton to hide the rating-selection screen from tab bar */}
//         <Tabs.Screen 
//           name="rating-selection/index"
//           options={{
//             href: null
//           }}
//         />

//         {/* Hide the rating screens from tab bar */}
//         <Tabs.Screen 
//           name="rate-announcer"
//           options={{
//             href: null
//           }} 
//         />
        
//         {/* Hide the program selection screen from tab bar */}
//         <Tabs.Screen 
//           name="program-selection"
//           options={{
//             href: null
//           }} 
//         />
        
//         {/* Hide the rate-program screen from tab bar */}
//         <Tabs.Screen 
//           name="rate-program"
//           options={{
//             href: null
//           }} 
//         />
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
import { LogBox } from 'react-native';

// Ignore common warnings during development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Failed prop type',
  'VirtualizedLists should never be nested',
  '[Layout children]: No route named',
]);

export default function AppLayout() {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("[AppLayout] User not authenticated, redirecting to login");
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  return (
    <ChannelProvider>
      <Tabs 
        screenOptions={{ 
          headerShown: false, 
          tabBarStyle: { elevation: 0, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
        }}
      >
        <Tabs.Screen name="home" options={{ 
          title: 'Home', 
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }} />
        
        <Tabs.Screen name="profile" options={{ 
          title: 'Profile', 
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }} />
        
        {/* Add debug tab */}
        <Tabs.Screen name="debug" options={{
          title: 'Debug',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="bug" size={size} color={color} />
          ),
        }} />
        
        {/* Hidden screens (unchanged) */}
        <Tabs.Screen name="rating-selection/index" options={{ href: null }} />
        <Tabs.Screen name="rate-announcer" options={{ href: null }} />
        <Tabs.Screen name="program-selection" options={{ href: null }} />
        <Tabs.Screen name="rate-program" options={{ href: null }} />
      </Tabs>
    </ChannelProvider>
  );
}