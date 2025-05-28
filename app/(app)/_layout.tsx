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
        <Tabs.Screen 
          name="home" 
          options={{ 
            title: 'Home', 
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }} 
        />
        
        <Tabs.Screen 
          name="profile" 
          options={{ 
            title: 'Profile', 
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }} 
        />
        
        {/* Simply use tabBarButton to hide the rating-selection screen from tab bar */}
        <Tabs.Screen 
          name="rating-selection"
          options={{
            href: null
          }}
        />

        {/* Hide the rating screens from tab bar */}
        <Tabs.Screen 
          name="rate-announcer"
          options={{
            href: null
          }} 
        />
        
        {/* Hide the program selection screen from tab bar */}
        <Tabs.Screen 
          name="program-selection"
          options={{
            href: null
          }} 
        />
        
        {/* Hide the rate-program screen from tab bar */}
        <Tabs.Screen 
          name="rate-program"
          options={{
            href: null
          }} 
        />
      </Tabs>
    </ChannelProvider>
  );
}