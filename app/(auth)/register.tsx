import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Platform, 
  KeyboardAvoidingView, 
  BackHandler,
  ActivityIndicator
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../src/context/AuthContext';
import DatePicker from '../../components/DatePicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlertCircle } from 'lucide-react-native';

const occupations = [
  'Govt Service',
  'Self Employed',
  'Private Job',
  'Others'
];

const mediumOptions = [
  'Radio',
  'Youtube',
  'Facebook',
  'AIR app'
];

interface FormData {
  name: string;
  dateOfBirth: Date;
  occupation: string;
  pincode: string;
  averageListeningHours: string;
  mediumOfListening: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  pincode?: string;
  averageListeningHours?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function RegisterScreen() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    dateOfBirth: new Date(),
    occupation: 'Govt Service',
    pincode: '',
    averageListeningHours: '',
    mediumOfListening: 'Radio',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const { register } = useAuth();

  // Custom back button handler
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Navigate directly to login page instead of verify
        router.replace('/(auth)/login');
        return true; // Prevents default back behavior
      };

      // Add event listener for hardware back button
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Cleanup
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    // Validate pincode
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
      isValid = false;
    } else if (formData.pincode.trim().length !== 6 || !/^\d+$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
      isValid = false;
    }

    // Validate listening hours
    if (!formData.averageListeningHours.trim()) {
      newErrors.averageListeningHours = 'Listening hours is required';
      isValid = false;
    } else if (isNaN(Number(formData.averageListeningHours)) || Number(formData.averageListeningHours) <= 0) {
      newErrors.averageListeningHours = 'Please enter a valid number';
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Validate password confirmation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    setShowValidationMessage(!isValid);
    return isValid;
  };

  const handleInputChange = (field: keyof FormData, value: string | Date) => {
    // Clear error for this field when user starts typing
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});
      
      await register({
        ...formData,
        dateOfBirth: formData.dateOfBirth.toISOString().split('T')[0],
      });
      
      // Set a flag in AsyncStorage to indicate successful registration
      await AsyncStorage.setItem('REGISTRATION_SUCCESS', 'true');
      
      // Navigate to login screen
      router.replace('/(auth)/login');
    } catch (err: any) {
      setErrors({
        general: err.response?.data?.message || 'Registration failed'
      });
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Please fill in the details below</Text>
          </View>
          
          {showValidationMessage && (
            <View style={styles.validationMessageContainer}>
              <AlertCircle size={20} color="#DC2626" />
              <Text style={styles.validationMessageText}>
                All fields are mandatory. Please complete the form.
              </Text>
            </View>
          )}
          
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Full Name</Text>
                <Text style={styles.requiredAsterisk}>*</Text>
              </View>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholderTextColor="#666"
                returnKeyType="next"
                editable={!isSubmitting}
              />
              {errors.name && <Text style={styles.fieldErrorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Date of Birth</Text>
                <Text style={styles.requiredAsterisk}>*</Text>
              </View>
              <DatePicker
                date={formData.dateOfBirth}
                onDateChange={(date) => handleInputChange('dateOfBirth', date)}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Occupation</Text>
                <Text style={styles.requiredAsterisk}>*</Text>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.occupation}
                  onValueChange={(value) => handleInputChange('occupation', value)}
                  style={styles.picker}
                  enabled={!isSubmitting}
                  dropdownIconColor="#000">
                  {occupations.map((occupation) => (
                    <Picker.Item 
                      key={occupation} 
                      label={occupation} 
                      value={occupation}
                      color="#000"
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Pincode</Text>
                <Text style={styles.requiredAsterisk}>*</Text>
              </View>
              <TextInput
                style={[styles.input, errors.pincode && styles.inputError]}
                placeholder="Enter your pincode"
                keyboardType="number-pad"
                value={formData.pincode}
                onChangeText={(value) => handleInputChange('pincode', value)}
                maxLength={6}
                placeholderTextColor="#666"
                returnKeyType="next"
                editable={!isSubmitting}
              />
              {errors.pincode && <Text style={styles.fieldErrorText}>{errors.pincode}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Average Listening Hours</Text>
                <Text style={styles.requiredAsterisk}>*</Text>
              </View>
              <TextInput
                style={[styles.input, errors.averageListeningHours && styles.inputError]}
                placeholder="Hours per day"
                keyboardType="decimal-pad"
                value={formData.averageListeningHours}
                onChangeText={(value) => handleInputChange('averageListeningHours', value)}
                placeholderTextColor="#666"
                returnKeyType="next"
                editable={!isSubmitting}
              />
              {errors.averageListeningHours && (
                <Text style={styles.fieldErrorText}>{errors.averageListeningHours}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Preferred Medium</Text>
                <Text style={styles.requiredAsterisk}>*</Text>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.mediumOfListening}
                  onValueChange={(value) => handleInputChange('mediumOfListening', value)}
                  style={styles.picker}
                  enabled={!isSubmitting}
                  dropdownIconColor="#000">
                  {mediumOptions.map((medium) => (
                    <Picker.Item 
                      key={medium} 
                      label={medium} 
                      value={medium}
                      color="#000"
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <Text style={styles.requiredAsterisk}>*</Text>
              </View>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Create a password"
                secureTextEntry
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholderTextColor="#666"
                returnKeyType="next"
                editable={!isSubmitting}
              />
              {errors.password && <Text style={styles.fieldErrorText}>{errors.password}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Confirm Password</Text>
                <Text style={styles.requiredAsterisk}>*</Text>
              </View>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                placeholder="Confirm your password"
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholderTextColor="#666"
                returnKeyType="done"
                editable={!isSubmitting}
              />
              {errors.confirmPassword && (
                <Text style={styles.fieldErrorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {errors.general ? (
              <View style={styles.errorContainer}>
                <Text style={styles.error}>{errors.general}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              style={[styles.button, isSubmitting && styles.buttonDisabled]} 
              onPress={handleRegister}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
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
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  validationMessageContainer: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  validationMessageText: {
    color: '#DC2626',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  form: {
    padding: 20,
    paddingTop: 0,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  requiredAsterisk: {
    color: '#DC2626',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  fieldErrorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    height: 50,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#000',
    backgroundColor: 'transparent',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#3B4CDF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#3B4CDF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    height: 56,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    shadowColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
