import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Check } from 'lucide-react-native';

export default function VerificationSuccessScreen() {
  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(0.3)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the animation sequence
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-redirect to register screen after 2 seconds
    const timer = setTimeout(() => {
      router.replace('/(auth)/register');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.iconContainer, 
            { 
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim 
            }
          ]}
        >
          <Shield size={60} color="#3B82F6" stroke="#3B82F6" fill="#DBEAFE" />
          <View style={styles.checkCircle}>
            <Check size={28} color="#fff" strokeWidth={3} />
          </View>
        </Animated.View>
        
        <Animated.Text 
          style={[
            styles.title,
            { opacity: opacityAnim }
          ]}
        >
          Phone Number Verified
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    marginBottom: 24,
  },
  checkCircle: {
    position: 'absolute',
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 12,
    right: 12,
    borderWidth: 3,
    borderColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
});