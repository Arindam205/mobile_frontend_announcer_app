import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Music, Star } from 'lucide-react-native';

interface ProgramSelectionAnimationProps {
  size?: number;
  color?: string;
}

const ProgramSelectionAnimation: React.FC<ProgramSelectionAnimationProps> = ({
  size = 40,
  color = '#8b5cf6',
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Animation for stars flying out
  const star1Anim = {
    x: useRef(new Animated.Value(0)).current,
    y: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0)).current,
  };
  
  const star2Anim = {
    x: useRef(new Animated.Value(0)).current,
    y: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0)).current,
  };
  
  const star3Anim = {
    x: useRef(new Animated.Value(0)).current,
    y: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0)).current,
  };
  
  const noteAnim = {
    x: useRef(new Animated.Value(0)).current,
    y: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0)).current,
    rotate: useRef(new Animated.Value(0)).current,
  };

  useEffect(() => {
    // Start the animation sequence
    Animated.sequence([
      // Initial appearance of the center
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
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      
      // Launch the stars and note
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
        
        // Music note (top)
        Animated.parallel([
          Animated.timing(noteAnim.x, {
            toValue: 30,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(noteAnim.y, {
            toValue: -50,
            duration: 800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(noteAnim.rotate, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(noteAnim.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(noteAnim.opacity, {
              toValue: 0,
              duration: 400,
              delay: 400,
              useNativeDriver: true,
            }),
          ]),
        ]),
        
        // Main icon finale
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
            ],
            opacity: star1Anim.opacity,
          },
        ]}
      >
        <Star size={size * 0.6} color="#FFD700" fill="#FFD700" />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.star,
          {
            transform: [
              { translateX: star2Anim.x },
              { translateY: star2Anim.y },
            ],
            opacity: star2Anim.opacity,
          },
        ]}
      >
        <Star size={size * 0.5} color="#FFD700" fill="#FFD700" />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.star,
          {
            transform: [
              { translateX: star3Anim.x },
              { translateY: star3Anim.y },
            ],
            opacity: star3Anim.opacity,
          },
        ]}
      >
        <Star size={size * 0.4} color="#FFD700" fill="#FFD700" />
      </Animated.View>
      
      {/* Flying music note */}
      <Animated.View
        style={[
          styles.note,
          {
            transform: [
              { translateX: noteAnim.x },
              { translateY: noteAnim.y },
              { 
                rotate: noteAnim.rotate.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              },
            ],
            opacity: noteAnim.opacity,
          },
        ]}
      >
        <View style={styles.musicNote}>
          <View style={styles.noteHead} />
          <View style={styles.noteStem} />
        </View>
      </Animated.View>
      
      {/* Main center icon */}
      <Animated.View
        style={[
          styles.mainIcon,
          {
            transform: [
              { scale: scaleAnim },
              { 
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '15deg']
                })
              },
            ],
            opacity: opacityAnim,
          },
        ]}
      >
        <Music size={size} color={color} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  note: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  mainIcon: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    padding: 12,
  },
  musicNote: {
    width: 20,
    height: 30,
    position: 'relative',
  },
  noteHead: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 16,
    borderRadius: 6,
    backgroundColor: '#8b5cf6',
    transform: [{ rotate: '30deg' }],
  },
  noteStem: {
    position: 'absolute',
    top: 0,
    right: 3,
    width: 3,
    height: 26,
    backgroundColor: '#8b5cf6',
  },
});

export default ProgramSelectionAnimation;