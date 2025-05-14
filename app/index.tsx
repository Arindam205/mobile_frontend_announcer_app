import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

function MainIndex() {
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  
  // Safely initialize app with timeout
  useEffect(() => {
    console.log("[Index] Starting app initialization");
    
    // Set a timeout to ensure app proceeds even if auth is slow
    const timer = setTimeout(() => {
      console.log("[Index] Initialization timeout reached");
      setIsReady(true);
    }, 3000); // 3 seconds max wait
    
    // Check if auth is already ready
    if (!isLoading) {
      console.log("[Index] Auth already initialized");
      setIsReady(true);
      clearTimeout(timer);
    }
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  // Show loading until ready
  if (!isReady) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Starting app...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Show auth state
  console.log("[Index] Auth state:", { isAuthenticated, isLoading });
  
  // Navigate based on auth state
  return <Redirect href={isAuthenticated ? "/(app)/home" : "/(auth)/login"} />;
}

// Wrap with error boundary
export default function IndexWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <MainIndex />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
});