import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Star } from 'lucide-react-native';

interface RatingAnimationProps {
  size?: number;
  color?: string;
  duration?: number;
}

const RatingAnimation: React.FC<RatingAnimationProps> = ({
  size = 24,
  color = '#FFD700',
  duration = 2000,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Animation for stars flying out
  const star1Anim = {
    x: useRef(new Animated.Value(0)).current,
    y: useRef(new Animated.Value(0)).current,
    rotate: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0)).current,
  };
  
  const star2Anim = {
    x: useRef(new Animated.Value(0)).current,
    y: useRef(new Animated.Value(0)).current,
    rotate: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0)).current,
  };
  
  const star3Anim = {
    x: useRef(new Animated.Value(0)).current,
    y: useRef(new Animated.Value(0)).current,
    rotate: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0)).current,
  };

  useEffect(() => {
    // Start the animation sequence
    Animated.sequence([
      // Initial appearance of the center star
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 400,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      
      // Start rotate animation
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      
      // Launch the stars
      Animated.parallel([
        // Star 1 (top-right)
        Animated.parallel([
          Animated.timing(star1Anim.x, {
            toValue: 40,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(star1Anim.y, {
            toValue: -40,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(star1Anim.rotate, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(star1Anim.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(star1Anim.opacity, {
              toValue: 0,
              duration: 400,
              delay: 200,
              useNativeDriver: true,
            }),
          ]),
        ]),
        
        // Star 2 (top-left)
        Animated.parallel([
          Animated.timing(star2Anim.x, {
            toValue: -40,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(star2Anim.y, {
            toValue: -30,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(star2Anim.rotate, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(star2Anim.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(star2Anim.opacity, {
              toValue: 0,
              duration: 400,
              delay: 200,
              useNativeDriver: true,
            }),
          ]),
        ]),
        
        
        // Star 3 (bottom)
        Animated.parallel([
            Animated.timing(star3Anim.x, {
              toValue: 10,
              duration: 600,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(star3Anim.y, {
              toValue: 40,
              duration: 600,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(star3Anim.rotate, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(star3Anim.opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(star3Anim.opacity, {
                toValue: 0,
                duration: 400,
                delay: 200,
                useNativeDriver: true,
              }),
            ]),
          ]),
          
          // Main star finale
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.4,
              duration: 300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 300,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
      
      // Auto-restart animation
      const interval = setInterval(() => {
        // Reset animation values
        scaleAnim.setValue(0);
        rotateAnim.setValue(0);
        opacityAnim.setValue(0);
        star1Anim.x.setValue(0);
        star1Anim.y.setValue(0);
        star1Anim.rotate.setValue(0);
        star1Anim.opacity.setValue(0);
        star2Anim.x.setValue(0);
        star2Anim.y.setValue(0);
        star2Anim.rotate.setValue(0);
        star2Anim.opacity.setValue(0);
        star3Anim.x.setValue(0);
        star3Anim.y.setValue(0);
        star3Anim.rotate.setValue(0);
        star3Anim.opacity.setValue(0);
        
        // Restart animation sequence
        Animated.sequence([
          // Initial appearance of the center star
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1.2,
              duration: 400,
              easing: Easing.out(Easing.back(2)),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          
          // Start rotate animation
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          
          // Launch the stars
          Animated.parallel([
            // Star 1 (top-right)
            Animated.parallel([
              Animated.timing(star1Anim.x, {
                toValue: 40,
                duration: 600,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(star1Anim.y, {
                toValue: -40,
                duration: 600,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(star1Anim.rotate, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.timing(star1Anim.opacity, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }),
                Animated.timing(star1Anim.opacity, {
                  toValue: 0,
                  duration: 400,
                  delay: 200,
                  useNativeDriver: true,
                }),
              ]),
            ]),
            
            // Star 2 (top-left)
            Animated.parallel([
              Animated.timing(star2Anim.x, {
                toValue: -40,
                duration: 600,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(star2Anim.y, {
                toValue: -30,
                duration: 600,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(star2Anim.rotate, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.timing(star2Anim.opacity, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }),
                Animated.timing(star2Anim.opacity, {
                  toValue: 0,
                  duration: 400,
                  delay: 200,
                  useNativeDriver: true,
                }),
              ]),
            ]),
            
            // Star 3 (bottom)
            Animated.parallel([
              Animated.timing(star3Anim.x, {
                toValue: 10,
                duration: 600,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(star3Anim.y, {
                toValue: 40,
                duration: 600,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(star3Anim.rotate, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.timing(star3Anim.opacity, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }),
                Animated.timing(star3Anim.opacity, {
                  toValue: 0,
                  duration: 400,
                  delay: 200,
                  useNativeDriver: true,
                }),
              ]),
            ]),
            
            // Main star finale
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 1.4,
                duration: 300,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 300,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]).start();
      }, duration);
      
      return () => clearInterval(interval);
    }, []);
  
    return (
      <View style={styles.container}>
        {/* Flying stars */}
        <Animated.View
          style={[
            styles.star,
            {
              transform: [
                { translateX: star1Anim.x },
                { translateY: star1Anim.y },
                { 
                  rotate: star1Anim.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  })
                },
              ],
              opacity: star1Anim.opacity,
            },
          ]}
        >
          <Star size={size * 0.6} color={color} fill={color} />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.star,
            {
              transform: [
                { translateX: star2Anim.x },
                { translateY: star2Anim.y },
                { 
                  rotate: star2Anim.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-180deg'],
                  })
                },
              ],
              opacity: star2Anim.opacity,
            },
          ]}
        >
          <Star size={size * 0.5} color={color} fill={color} />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.star,
            {
              transform: [
                { translateX: star3Anim.x },
                { translateY: star3Anim.y },
                { 
                  rotate: star3Anim.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '120deg'],
                  })
                },
              ],
              opacity: star3Anim.opacity,
            },
          ]}
        >
          <Star size={size * 0.4} color={color} fill={color} />
        </Animated.View>
        
        {/* Main central star */}
        <Animated.View
          style={[
            styles.mainStar,
            {
              transform: [
                { scale: scaleAnim },
                { 
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '30deg'],
                  }) 
                },
              ],
              opacity: opacityAnim,
            },
          ]}
        >
          <Star size={size} color={color} fill={color} />
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
    star: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
    },
    mainStar: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  
  export default RatingAnimation;
        