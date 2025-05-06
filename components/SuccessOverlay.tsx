// // import React, { useEffect, useRef } from 'react';
// // import { 
// //   View, 
// //   Text, 
// //   StyleSheet, 
// //   Modal, 
// //   Animated, 
// //   Easing, 
// //   Dimensions 
// // } from 'react-native';
// // import { CheckCircle2 } from 'lucide-react-native';
// // import RatingAnimation from './RatingAnimation';

// // interface SuccessOverlayProps {
// //   visible: boolean;
// //   message: string;
// //   subMessage?: string;
// // }

// // const { width, height } = Dimensions.get('window');

// // const SuccessOverlay: React.FC<SuccessOverlayProps> = ({ 
// //   visible, 
// //   message,
// //   subMessage
// // }) => {
// //   // Animation values
// //   const fadeAnim = useRef(new Animated.Value(0)).current;
// //   const scaleAnim = useRef(new Animated.Value(0.5)).current;
// //   const checkmarkScaleAnim = useRef(new Animated.Value(0)).current;
  
// //   useEffect(() => {
// //     if (visible) {
// //       // Start the animations when the overlay becomes visible
// //       Animated.parallel([
// //         Animated.timing(fadeAnim, {
// //           toValue: 1,
// //           duration: 400,
// //           useNativeDriver: true,
// //           easing: Easing.out(Easing.quad)
// //         }),
// //         Animated.timing(scaleAnim, {
// //           toValue: 1,
// //           duration: 400,
// //           useNativeDriver: true,
// //           easing: Easing.out(Easing.back(1.5))
// //         }),
// //         Animated.sequence([
// //           Animated.delay(200),
// //           Animated.spring(checkmarkScaleAnim, {
// //             toValue: 1,
// //             friction: 4,
// //             tension: 80,
// //             useNativeDriver: true
// //           })
// //         ])
// //       ]).start();
// //     } else {
// //       // Reset animations when hidden
// //       fadeAnim.setValue(0);
// //       scaleAnim.setValue(0.5);
// //       checkmarkScaleAnim.setValue(0);
// //     }
// //   }, [visible]);

// //   if (!visible) return null;

// //   return (
// //     <Modal
// //       transparent
// //       visible={visible}
// //       animationType="none"
// //     >
// //       <View style={styles.container}>
// //         <Animated.View 
// //           style={[
// //             styles.overlay,
// //             {
// //               opacity: fadeAnim,
// //               transform: [{ scale: scaleAnim }]
// //             }
// //           ]}
// //         >
// //           <View style={styles.animationContainer}>
// //             <RatingAnimation size={40} color="#FFD700" />
// //           </View>
          
// //           <Animated.View
// //             style={[
// //               styles.checkmarkContainer,
// //               {
// //                 transform: [{ scale: checkmarkScaleAnim }]
// //               }
// //             ]}
// //           >
// //             <CheckCircle2 size={56} color="#10B981" strokeWidth={2} />
// //           </Animated.View>
          
// //           <Text style={styles.message}>{message}</Text>
          
// //           {subMessage && (
// //             <Text style={styles.subMessage}>{subMessage}</Text>
// //           )}
// //         </Animated.View>
// //       </View>
// //     </Modal>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: 'rgba(0, 0, 0, 0.5)'
// //   },
// //   overlay: {
// //     backgroundColor: 'white',
// //     borderRadius: 20,
// //     padding: 32,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     width: width * 0.8,
// //     maxWidth: 320,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 8 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 24,
// //     elevation: 16,
// //   },
// //   animationContainer: {
// //     position: 'absolute',
// //     top: -50,
// //     left: 0,
// //     right: 0,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     height: 120,
// //   },
// //   checkmarkContainer: {
// //     width: 80,
// //     height: 80,
// //     borderRadius: 40,
// //     backgroundColor: '#ECFDF5',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginBottom: 20,
// //   },
// //   message: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: '#111827',
// //     textAlign: 'center',
// //     marginBottom: 8,
// //   },
// //   subMessage: {
// //     fontSize: 14,
// //     color: '#6B7280',
// //     textAlign: 'center',
// //   }
// // });

// // export default SuccessOverlay;


// import React, { useEffect, useRef } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   Modal, 
//   Animated, 
//   Easing, 
//   Dimensions 
// } from 'react-native';
// import { CheckCircle2 } from 'lucide-react-native';
// import RatingAnimation from './RatingAnimation';
// import ProgramSelectionAnimation from './ProgramSelectionAnimation';

// interface SuccessOverlayProps {
//   visible: boolean;
//   message: string;
//   subMessage?: string;
//   type?: 'rating' | 'program';
// }

// const { width } = Dimensions.get('window');

// const SuccessOverlay: React.FC<SuccessOverlayProps> = ({ 
//   visible, 
//   message,
//   subMessage,
//   type = 'rating'
// }) => {
//   // Animation values
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(0.5)).current;
//   const checkmarkScaleAnim = useRef(new Animated.Value(0)).current;
  
//   useEffect(() => {
//     if (visible) {
//       // Start the animations when the overlay becomes visible
//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 400,
//           useNativeDriver: true,
//           easing: Easing.out(Easing.quad)
//         }),
//         Animated.timing(scaleAnim, {
//           toValue: 1,
//           duration: 400,
//           useNativeDriver: true,
//           easing: Easing.out(Easing.back(1.5))
//         }),
//         Animated.sequence([
//           Animated.delay(200),
//           Animated.spring(checkmarkScaleAnim, {
//             toValue: 1,
//             friction: 4,
//             tension: 80,
//             useNativeDriver: true
//           })
//         ])
//       ]).start();
//     } else {
//       // Reset animations when hidden
//       fadeAnim.setValue(0);
//       scaleAnim.setValue(0.5);
//       checkmarkScaleAnim.setValue(0);
//     }
//   }, [visible]);

//   if (!visible) return null;

//   return (
//     <Modal
//       transparent
//       visible={visible}
//       animationType="none"
//     >
//       <View style={styles.container}>
//         <Animated.View 
//           style={[
//             styles.overlay,
//             {
//               opacity: fadeAnim,
//               transform: [{ scale: scaleAnim }]
//             }
//           ]}
//         >
//           <View style={styles.animationContainer}>
//             {type === 'rating' ? (
//               <RatingAnimation size={40} color="#FFD700" />
//             ) : (
//               <ProgramSelectionAnimation size={40} color="#8b5cf6" />
//             )}
//           </View>
          
//           <Animated.View
//             style={[
//               styles.checkmarkContainer,
//               {
//                 transform: [{ scale: checkmarkScaleAnim }],
//                 backgroundColor: type === 'rating' ? '#ECFDF5' : '#F3E8FF',
//               }
//             ]}
//           >
//             <CheckCircle2 
//               size={56} 
//               color={type === 'rating' ? "#10B981" : "#8b5cf6"} 
//               strokeWidth={2} 
//             />
//           </Animated.View>
          
//           <Text style={styles.message}>{message}</Text>
          
//           {subMessage && (
//             <Text style={styles.subMessage}>{subMessage}</Text>
//           )}
//         </Animated.View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)'
//   },
//   overlay: {
//     backgroundColor: 'white',
//     borderRadius: 20,
//     padding: 32,
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: width * 0.8,
//     maxWidth: 320,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 24,
//     elevation: 16,
//   },
//   animationContainer: {
//     position: 'absolute',
//     top: -50,
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//     justifyContent: 'center',
//     height: 120,
//   },
//   checkmarkContainer: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   message: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#111827',
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   subMessage: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//   }
// });

// export default SuccessOverlay;


import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  Animated, 
  Easing, 
  Dimensions 
} from 'react-native';
import { CheckCircle2, Clock } from 'lucide-react-native';
import RatingAnimation from './RatingAnimation';
import ProgramSelectionAnimation from './ProgramSelectionAnimation';

interface SuccessOverlayProps {
  visible: boolean;
  message: string;
  subMessage?: string;
  type?: 'rating' | 'program';
}

const { width } = Dimensions.get('window');

const SuccessOverlay: React.FC<SuccessOverlayProps> = ({ 
  visible, 
  message,
  subMessage,
  type = 'rating'
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const checkmarkScaleAnim = useRef(new Animated.Value(0)).current;
  const clockOpacityAnim = useRef(new Animated.Value(0)).current;
  
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
        ]),
        // Only animate the clock if we have a time-related subMessage
        ...(subMessage && subMessage.includes('again after') ? [
          Animated.sequence([
            Animated.delay(400),
            Animated.timing(clockOpacityAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true
            })
          ])
        ] : [])
      ]).start();
    } else {
      // Reset animations when hidden
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      checkmarkScaleAnim.setValue(0);
      clockOpacityAnim.setValue(0);
    }
  }, [visible, subMessage]);

  if (!visible) return null;

  // Helper to determine if the subMessage contains timing information
  const hasTimingInfo = subMessage && subMessage.includes('again after');

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
    >
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.animationContainer}>
            {type === 'rating' ? (
              <RatingAnimation size={40} color="#FFD700" />
            ) : (
              <ProgramSelectionAnimation size={40} color="#8b5cf6" />
            )}
          </View>
          
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
            <View style={styles.subMessageContainer}>
              {hasTimingInfo && (
                <Animated.View 
                  style={[
                    styles.clockIconContainer,
                    { opacity: clockOpacityAnim }
                  ]}
                >
                  <Clock size={16} color="#6B7280" />
                </Animated.View>
              )}
              <Text style={[
                styles.subMessage,
                hasTimingInfo && styles.subMessageWithIcon
              ]}>
                {subMessage}
              </Text>
            </View>
          )}
        </Animated.View>
      </View>
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
  subMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  clockIconContainer: {
    marginRight: 6,
  },
  subMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  subMessageWithIcon: {
    color: '#4B5563',
    fontWeight: '500',
  }
});

export default SuccessOverlay;