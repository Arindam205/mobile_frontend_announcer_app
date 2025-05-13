// app/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

// Add startup log
console.log('[STARTUP] Index screen initializing');

export default function Index() {
  console.log('[STARTUP] Index component function executing');
  const { isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState(null);
  
  console.log('[STARTUP] Auth state:', { isAuthenticated, isLoading });
  
  useEffect(() => {
    console.log('[STARTUP] Index component mounted');
    
    // Simple error catcher
  try {
    console.log('[STARTUP] Testing navigation path');
    const destination = isAuthenticated ? '/(app)/home' : '/(auth)/login';
    console.log('[STARTUP] Will navigate to:', destination);
  } catch (error: any) { // Explicitly type as any
    console.error('[STARTUP] Navigation preparation error:', error);
    setError(error?.message || 'An unknown error occurred');
  }
    
    return () => {
      console.log('[STARTUP] Index component unmounting');
    };
  }, [isAuthenticated]);
  
  // Show any errors that occur during initialization
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Startup Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }
  
  // Show loading state
  if (isLoading) {
    console.log('[STARTUP] Showing loading state');
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Route to the appropriate screen
  console.log('[STARTUP] Redirecting to:', isAuthenticated ? '/(app)/home' : '/(auth)/login');
  return <Redirect href={isAuthenticated ? '/(app)/home' : '/(auth)/login'} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});