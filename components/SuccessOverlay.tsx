import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  Animated, 
  Easing, 
  Dimensions,
  AppState,
  TouchableWithoutFeedback
} from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import RatingAnimation from './RatingAnimation';

interface SuccessOverlayProps {
  visible: boolean;
  message: string;
  subMessage?: string;
  type?: 'rating' | 'program';
  onDismiss?: () => void; // Add an optional dismiss callback
}

const { width } = Dimensions.get('window');

const SuccessOverlay: React.FC<SuccessOverlayProps> = ({ 
  visible, 
  message,
  subMessage,
  type = 'rating',
  onDismiss
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const checkmarkScaleAnim = useRef(new Animated.Value(0)).current;
  
  // Handle app state changes
  useEffect(() => {
    // Track app state to dismiss overlay when app goes to background
    const subscription = AppState.addEventListener('change', nextAppState => {
      // If app goes to background and overlay is visible, call onDismiss
      if (nextAppState === 'background' && visible && onDismiss) {
        onDismiss();
      }
    });
    
    return () => {
      // Clean up event listener on unmount
      subscription.remove();
    };
  }, [visible, onDismiss]);
  
  useEffect(() => {
    if (visible) {
      // Start the animations when the overlay becomes visible
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad)
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5))
        }),
        Animated.sequence([
          Animated.delay(200),
          Animated.spring(checkmarkScaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 80,
            useNativeDriver: true
          })
        ])
      ]).start();
      
      // Auto-dismiss after a certain period if onDismiss provided
      if (onDismiss) {
        const timer = setTimeout(() => {
          onDismiss();
        }, 2500);
        
        return () => clearTimeout(timer);
      }
    } else {
      // Reset animations when hidden
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      checkmarkScaleAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  // Allow tapping outside to dismiss if onDismiss is provided
  const handleOutsideTap = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={handleOutsideTap}>
        <View style={styles.container}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.overlay,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              {/* Only show rating animation for announcer ratings, not for program */}
              {type === 'rating' && (
                <View style={styles.animationContainer}>
                  <RatingAnimation size={40} color="#FFD700" />
                </View>
              )}
              
              <Animated.View
                style={[
                  styles.checkmarkContainer,
                  {
                    transform: [{ scale: checkmarkScaleAnim }],
                    backgroundColor: type === 'rating' ? '#ECFDF5' : '#F3E8FF',
                  }
                ]}
              >
                <CheckCircle2 
                  size={56} 
                  color={type === 'rating' ? "#10B981" : "#8b5cf6"} 
                  strokeWidth={2} 
                />
              </Animated.View>
              
              <Text style={styles.message}>{message}</Text>
              
              {subMessage && (
                <Text style={styles.subMessage}>{subMessage}</Text>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  overlay: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.8,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
  animationContainer: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  checkmarkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  }
});

export default SuccessOverlay;