import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Mic } from 'lucide-react-native';

interface MicAnimationProps {
  size?: number;
  color?: string;
  duration?: number;
}

const MicAnimation: React.FC<MicAnimationProps> = ({
  size = 24,
  color = '#FFFFFF',
  duration = 2000,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;
  
  // Pulse animations
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main mic animation sequence
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          // Scale animation
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.15,
              duration: 800,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          
          // Slight rotation animation
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          
          // Opacity pulsing
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.7,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ])
    ).start();
    
    // Sound wave pulse animations
    const startPulses = () => {
      // First pulse wave
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse1, {
            toValue: 1,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Second pulse wave (delayed)
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulse2, {
              toValue: 1,
              duration: 1500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulse2, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 400);
      
      // Third pulse wave (more delayed)
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulse3, {
              toValue: 1,
              duration: 1500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulse3, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 800);
    };
    
    startPulses();
    
    return () => {
      // Cleanup animations if needed
      scaleAnim.stopAnimation();
      rotateAnim.stopAnimation();
      opacityAnim.stopAnimation();
      pulse1.stopAnimation();
      pulse2.stopAnimation();
      pulse3.stopAnimation();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Sound wave pulse rings */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            opacity: pulse1.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.4, 0.2, 0],
            }),
            transform: [
              {
                scale: pulse1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2.5],
                }),
              },
            ],
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.pulseRing,
          {
            opacity: pulse2.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.4, 0.2, 0],
            }),
            transform: [
              {
                scale: pulse2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2.2],
                }),
              },
            ],
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.pulseRing,
          {
            opacity: pulse3.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.4, 0.2, 0],
            }),
            transform: [
              {
                scale: pulse3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.8],
                }),
              },
            ],
          },
        ]}
      />
      
      {/* Main microphone */}
      <Animated.View
        style={[
          styles.micContainer,
          {
            opacity: opacityAnim,
            transform: [
              { scale: scaleAnim },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '10deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Mic size={size} color={color} strokeWidth={2} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1,
  },
});

export default MicAnimation;