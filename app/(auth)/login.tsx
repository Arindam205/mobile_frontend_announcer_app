// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   View, 
//   Text, 
//   TextInput, 
//   TouchableOpacity, 
//   StyleSheet, 
//   Image,
//   Platform,
//   KeyboardAvoidingView,
//   ScrollView,
//   Dimensions,
//   Pressable,
//   Animated,
//   Keyboard
// } from 'react-native';
// import { router } from 'expo-router';
// import { useAuth } from '../../src/context/AuthContext';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Eye, EyeOff, CheckCircle } from 'lucide-react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const { width } = Dimensions.get('window');
// const LOGO_SIZE = width * 0.4;

// export default function LoginScreen() {
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showSuccessToast, setShowSuccessToast] = useState(false);
//   const [isInputFocused, setIsInputFocused] = useState(false);
//   const [keyboardDismissedForNavigation, setKeyboardDismissedForNavigation] = useState(false);
  
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const { login } = useAuth();
//   const hasCheckedRegistration = useRef(false);
//   const scrollViewRef = useRef(null);

//   // Check AsyncStorage for successful registration flag
//   useEffect(() => {
//     const checkRegistrationSuccess = async () => {
//       if (hasCheckedRegistration.current) return;
      
//       try {
//         hasCheckedRegistration.current = true;
//         const successFlag = await AsyncStorage.getItem('REGISTRATION_SUCCESS');
        
//         if (successFlag === 'true') {
//           // Clear the flag immediately to prevent showing again
//           await AsyncStorage.removeItem('REGISTRATION_SUCCESS');
          
//           // Show the success toast
//           setShowSuccessToast(true);
          
//           // Fade in animation
//           Animated.timing(fadeAnim, {
//             toValue: 1,
//             duration: 300,
//             useNativeDriver: true,
//           }).start();
          
//           // Hide toast after exactly 1.5 seconds
//           setTimeout(() => {
//             Animated.timing(fadeAnim, {
//               toValue: 0,
//               duration: 300,
//               useNativeDriver: true,
//             }).start(({ finished }) => {
//               if (finished) {
//                 setShowSuccessToast(false);
//               }
//             });
//           }, 1500);
//         }
//       } catch (error) {
//         console.log('Error checking registration status:', error);
//       }
//     };
    
//     checkRegistrationSuccess();
//   }, []);

//   const handleLogin = async () => {
//     if (!phoneNumber || !password) {
//       setError('Please fill in all fields');
//       return;
//     }

//     try {
//       setError('');
//       // Dismiss keyboard
//       Keyboard.dismiss();
//       setIsInputFocused(false);
      
//       // Add a small delay to ensure animations settle
//       await new Promise(resolve => setTimeout(resolve, 50));
//       await login(phoneNumber, password);
//       router.replace('/(app)/home');
//     } catch (err: any) {
//       setError(err?.response?.data?.message || 'Login failed');
//     }
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   const navigateToRegister = () => {
//     // If keyboard is open, just dismiss it on first click
//     if (isInputFocused && !keyboardDismissedForNavigation) {
//       Keyboard.dismiss();
//       setIsInputFocused(false);
//       setKeyboardDismissedForNavigation(true);
      
//       // Reset the flag after a few seconds if user doesn't navigate
//       setTimeout(() => {
//         setKeyboardDismissedForNavigation(false);
//       }, 5000);
      
//       return;
//     }
    
//     // On second click or if keyboard wasn't open, navigate directly to register
//     setKeyboardDismissedForNavigation(false);
//     router.push('/(auth)/register');
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <KeyboardAvoidingView 
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardView}
//       >
//         <ScrollView 
//           ref={scrollViewRef}
//           contentContainerStyle={styles.scrollContent}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//           scrollEventThrottle={16}
//           scrollEnabled={!isInputFocused} // Disable scrolling when input is focused
//         >
//           <View style={styles.container}>
//             <Image
//               source={require('../../assets/images/akashvanilogo.png')}
//               style={styles.logo}
//               resizeMode="contain"
//             />
            
//             <View style={styles.formContainer}>
//               <View style={styles.inputContainer}>
//                 <View style={styles.phoneInputContainer}>
//                   <Text style={styles.prefix}>+91</Text>
//                   <TextInput
//                     style={styles.phoneInput}
//                     placeholder="Phone Number"
//                     keyboardType="phone-pad"
//                     value={phoneNumber}
//                     onChangeText={setPhoneNumber}
//                     maxLength={10}
//                     placeholderTextColor="#666"
//                     onFocus={() => setIsInputFocused(true)}
//                     onBlur={() => setIsInputFocused(false)}
//                   />
//                 </View>
                
//                 <View style={styles.passwordContainer}>
//                   <TextInput
//                     style={styles.passwordInput}
//                     placeholder="Password"
//                     secureTextEntry={!showPassword}
//                     value={password}
//                     onChangeText={setPassword}
//                     placeholderTextColor="#666"
//                     autoCapitalize="none"
//                     autoComplete="password"
//                     textContentType="password"
//                     onFocus={() => setIsInputFocused(true)}
//                     onBlur={() => setIsInputFocused(false)}
//                   />
//                   <Pressable 
//                     onPress={togglePasswordVisibility}
//                     style={styles.eyeButton}
//                     accessibilityRole="button"
//                     accessibilityLabel={showPassword ? "Hide password" : "Show password"}
//                   >
//                     {showPassword ? (
//                       <EyeOff size={20} color="#64748B" />
//                     ) : (
//                       <Eye size={20} color="#64748B" />
//                     )}
//                   </Pressable>
//                 </View>
//               </View>

//               {error ? <Text style={styles.error}>{error}</Text> : null}

//               <TouchableOpacity 
//                 style={styles.button} 
//                 onPress={handleLogin}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.buttonText}>Login</Text>
//               </TouchableOpacity>

//               <TouchableOpacity 
//                 onPress={navigateToRegister}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.registerLink}>Not Registered? Register</Text>
//               </TouchableOpacity>
              
//               {/* Toast that shows below the register text */}
//               {showSuccessToast ? (
//                 <Animated.View 
//                   style={[
//                     styles.successToast, 
//                     { opacity: fadeAnim }
//                   ]}
//                 >
//                   <CheckCircle size={20} color="#fff" />
//                   <Text style={styles.successToastText}>Registration Successful</Text>
//                 </Animated.View>
//               ) : null}
//             </View>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   logo: {
//     width: LOGO_SIZE,
//     height: LOGO_SIZE,
//     marginBottom: 40,
//   },
//   formContainer: {
//     width: '100%',
//     maxWidth: 400,
//   },
//   inputContainer: {
//     gap: 15,
//     marginBottom: 10,
//   },
//   phoneInputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     borderRadius: 12,
//     paddingHorizontal: 15,
//     backgroundColor: '#F8FAFC',
//     height: 56,
//   },
//   prefix: {
//     fontSize: 16,
//     color: '#64748B',
//     marginRight: 8,
//     fontWeight: '500',
//   },
//   phoneInput: {
//     flex: 1,
//     fontSize: 16,
//     color: '#1E293B',
//     height: '100%',
//   },
//   passwordContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//     borderRadius: 12,
//     backgroundColor: '#F8FAFC',
//     height: 56,
//     position: 'relative',
//   },
//   passwordInput: {
//     flex: 1,
//     height: '100%',
//     paddingHorizontal: 15,
//     fontSize: 16,
//     color: '#1E293B',
//   },
//   eyeButton: {
//     padding: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   button: {
//     backgroundColor: '#3B4CDF',
//     padding: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginTop: 24,
//     shadowColor: '#3B4CDF',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   error: {
//     color: '#EF4444',
//     marginTop: 8,
//     textAlign: 'center',
//     fontSize: 14,
//   },
//   registerLink: {
//     color: '#3B4CDF',
//     textAlign: 'center',
//     marginTop: 20,
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   successToast: {
//     backgroundColor: '#10B981',
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   successToastText: {
//     color: '#fff',
//     marginLeft: 10,
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  Pressable,
  Animated,
  Keyboard
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, CheckCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const LOGO_SIZE = width * 0.35; // Slightly reduced to accommodate text below

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [keyboardDismissedForNavigation, setKeyboardDismissedForNavigation] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { login } = useAuth();
  const hasCheckedRegistration = useRef(false);
  const scrollViewRef = useRef(null);

  // Check AsyncStorage for successful registration flag
  useEffect(() => {
    const checkRegistrationSuccess = async () => {
      if (hasCheckedRegistration.current) return;
      
      try {
        hasCheckedRegistration.current = true;
        const successFlag = await AsyncStorage.getItem('REGISTRATION_SUCCESS');
        
        if (successFlag === 'true') {
          // Clear the flag immediately to prevent showing again
          await AsyncStorage.removeItem('REGISTRATION_SUCCESS');
          
          // Show the success toast
          setShowSuccessToast(true);
          
          // Fade in animation
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
          
          // Hide toast after exactly 1.5 seconds
          setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(({ finished }) => {
              if (finished) {
                setShowSuccessToast(false);
              }
            });
          }, 1500);
        }
      } catch (error) {
        console.log('Error checking registration status:', error);
      }
    };
    
    checkRegistrationSuccess();
  }, []);

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      // Dismiss keyboard
      Keyboard.dismiss();
      setIsInputFocused(false);
      
      // Add a small delay to ensure animations settle
      await new Promise(resolve => setTimeout(resolve, 50));
      await login(phoneNumber, password);
      router.replace('/(app)/home');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const navigateToRegister = () => {
    // If keyboard is open, just dismiss it on first click
    if (isInputFocused && !keyboardDismissedForNavigation) {
      Keyboard.dismiss();
      setIsInputFocused(false);
      setKeyboardDismissedForNavigation(true);
      
      // Reset the flag after a few seconds if user doesn't navigate
      setTimeout(() => {
        setKeyboardDismissedForNavigation(false);
      }, 5000);
      
      return;
    }
    
    // On second click or if keyboard wasn't open, navigate directly to register
    setKeyboardDismissedForNavigation(false);
    router.push('/(auth)/register');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          scrollEnabled={!isInputFocused} // Disable scrolling when input is focused
        >
          <View style={styles.container}>
            {/* Logo and App Info Container */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/akashvanilogo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              
              {/* App Name */}
              <Text style={styles.appName}>RAISE</Text>
              
              {/* App Full Form */}
              <Text style={styles.appFullForm}>
                RADIO AUDIENCE INTERACTIVE{'\n'}SURVEY AND EVALUATION
              </Text>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <View style={styles.phoneInputContainer}>
                  <Text style={styles.prefix}>+91</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    maxLength={10}
                    placeholderTextColor="#666"
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                  />
                </View>
                
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor="#666"
                    autoCapitalize="none"
                    autoComplete="password"
                    textContentType="password"
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                  />
                  <Pressable 
                    onPress={togglePasswordVisibility}
                    style={styles.eyeButton}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#64748B" />
                    ) : (
                      <Eye size={20} color="#64748B" />
                    )}
                  </Pressable>
                </View>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity 
                style={styles.button} 
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={navigateToRegister}
                activeOpacity={0.7}
              >
                <Text style={styles.registerLink}>Not Registered? Register</Text>
              </TouchableOpacity>
              
              {/* Toast that shows below the register text */}
              {showSuccessToast ? (
                <Animated.View 
                  style={[
                    styles.successToast, 
                    { opacity: fadeAnim }
                  ]}
                >
                  <CheckCircle size={20} color="#fff" />
                  <Text style={styles.successToastText}>Registration Successful</Text>
                </Animated.View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginBottom: 20,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#3B4CDF',
    letterSpacing: 3,
    marginBottom: 8,
  },
  appFullForm: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  inputContainer: {
    gap: 15,
    marginBottom: 10,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F8FAFC',
    height: 56,
  },
  prefix: {
    fontSize: 16,
    color: '#64748B',
    marginRight: 8,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    height: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    height: 56,
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#1E293B',
  },
  eyeButton: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#3B4CDF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#3B4CDF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#EF4444',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  registerLink: {
    color: '#3B4CDF',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  successToast: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successToastText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
});