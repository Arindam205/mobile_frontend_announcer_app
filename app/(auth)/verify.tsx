import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

export default function VerifyScreen() {
  // State declarations
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [keyboardDismissedForNavigation, setKeyboardDismissedForNavigation] = useState(false);
  
  // Auth context
  const { verifyPhone } = useAuth();

  // Handlers
  const handleVerify = async () => {
    // Basic validation
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    Keyboard.dismiss();
    setIsInputFocused(false);
    setIsLoading(true);
    setError('');

    try {
      // Small delay to ensure keyboard dismissal starts
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Call the verification API
      await verifyPhone(phoneNumber);
      
      // If successful, navigate to success screen
      router.push('/(auth)/verification-success');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Verification failed. Please try again.');
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
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
    
    // On second click or if keyboard wasn't open, navigate
    setKeyboardDismissedForNavigation(false);
    router.replace('/(auth)/login');
  };

  // Component rendering
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isInputFocused} // Disable scrolling when input is focused
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <TouchableOpacity 
                onPress={navigateToLogin}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <ArrowLeft size={24} color="#111827" />
              </TouchableOpacity>

              <View style={styles.contentContainer}>
                <Text style={styles.title}>Verify Your Phone</Text>
                <Text style={styles.subtitle}>Enter your phone number to continue</Text>

                <View style={styles.inputWrapper}>
                  <View style={styles.phoneInputContainer}>
                    <Text style={styles.prefix}>+91</Text>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="Enter phone number"
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={(text) => {
                        setError('');
                        setPhoneNumber(text.replace(/[^0-9]/g, ''));
                      }}
                      maxLength={10}
                      placeholderTextColor="#6B7280"
                      editable={!isLoading}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                    />
                  </View>

                  {error ? <Text style={styles.error}>{error}</Text> : null}

                  <TouchableOpacity 
                    style={[styles.button, isLoading && styles.buttonDisabled]} 
                    onPress={handleVerify}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Verify Phone Number</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles
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
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginBottom: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  inputWrapper: {
    width: '100%',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    height: 56,
  },
  prefix: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#111827',
  },
  button: {
    backgroundColor: '#3B4CDF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    height: 56,
    justifyContent: 'center',
    shadowColor: '#3B4CDF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#EF4444',
    marginTop: 12,
    fontSize: 14,
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  infoText: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
});