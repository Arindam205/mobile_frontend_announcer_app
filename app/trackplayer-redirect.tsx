import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';

export default function TrackPlayerRedirectScreen() {
  useEffect(() => {
    // Redirect to home after a brief moment
    const timer = setTimeout(() => {
      try {
        console.log('[TrackPlayerRedirect] Redirecting to home...');
        router.push('/(app)/home');
      } catch (error) {
        console.error('[TrackPlayerRedirect] Navigation error:', error);
        // Fallback navigation
        router.push('/(app)/home');
      }
    }, 500); // 500ms for a smooth transition

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/akashvanilogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 200,
    height: 200,
  },
});