import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ShimmerLoadingProps {
  width: number | string;
  height: number | string;
  style?: object;
  borderRadius?: number;
}

const ShimmerLoading: React.FC<ShimmerLoadingProps> = ({
  width,
  height,
  style,
  borderRadius = 8,
}) => {
  // Use a ref to store the width value to avoid recreation of the animation
  const widthNum = useRef(typeof width === 'string' ? 100 : width).current;
  const translateX = useRef(new Animated.Value(-widthNum)).current;
  
  // Use a ref to track if animation has started
  const hasAnimationStarted = useRef(false);

  useEffect(() => {
    // Only start the animation if it hasn't been started yet
    if (!hasAnimationStarted.current) {
      hasAnimationStarted.current = true;
      
      Animated.loop(
        Animated.timing(translateX, {
          toValue: widthNum,
          duration: 1200,
          useNativeDriver: true,
        })
      ).start();
    }
    
    // Clean up animation when component unmounts
    return () => {
      translateX.stopAnimation();
    };
  }, []);

  return (
    <View 
      style={[
        {
          width,
          height,
          backgroundColor: '#f1f1f1',
          overflow: 'hidden',
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          style={{ width: '100%', height: '100%' }}
          colors={['transparent', 'rgba(255, 255, 255, 0.6)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>
    </View>
  );
};

export default ShimmerLoading;