import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import AppErrorBoundary from '../components/ErrorBoundary';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import TrackPlayer from 'react-native-track-player';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Register the TrackPlayer service for background playback
    TrackPlayer.registerPlaybackService(() => require('../src/services/TrackPlayerService'));
  }, []);

  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
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