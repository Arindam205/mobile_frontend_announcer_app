import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Alert
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../src/context/AuthContext';
import DatePicker from '../../components/DatePicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlertCircle, ArrowLeft } from 'lucide-react-native';
import StationSelector from '../../components/StationSelector';

// Define interface for the station
interface Station {
  stationId: string;
  stationName: string;
}

// Define allowed occupation options
const occupations = [
  'Govt Service',
  'Self Employed',
  'Private Job',
  'Others'
];

// Define medium options
const mediumOptions = [
  'Radio',
  'Youtube',
  'Facebook',
  'AIR app'
];

// Define listening hours options
const listeningHoursOptions = [
  'Less than 1',
  '1-2',
  '2-3',
  'More than 3'
];

// Define gender options
const genderOptions = [
  'Male',
  'Female',
  'Others'
];

// Form data interface
interface FormData {
  name: string;
  dateOfBirth: Date;
  occupation: string;
  pincode: string;
  averageListeningHours: string;
  mediumOfListening: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  gender: string;
  stationId: string;
  stationName: string;
}

// Form errors interface
interface FormErrors {
  name?: string;
  phoneNumber?: string;
  averageListeningHours?: string;
  password?: string;
  confirmPassword?: string;
  gender?: string;
  station?: string;
  general?: string;
}

export default function RegisterScreen() {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    dateOfBirth: new Date(),
    occupation: 'Govt Service',
    pincode: '',
    averageListeningHours: '1-2',
    mediumOfListening: 'Radio',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    gender: 'Male',
    stationId: '',
    stationName: '',
  });
  
  // Selected station state
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  
  // Other state variables
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  
  // Auth context
  const { register } = useAuth();

  // Custom back button handler
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Navigate to login page
        router.replace('/(auth)/login');
        return true; // Prevents default back behavior
      };

      // Add event listener for hardware back button
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Cleanup
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  // Handle station selection
  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    
    // Update form data with station information
    setFormData(prev => ({
      ...prev,
      stationId: station.stationId,
      stationName: station.stationName
    }));
    
    // Clear any station-related errors
    setErrors(prev => ({ ...prev, station: undefined }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    // Validate phone
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else if (formData.phoneNumber.trim().length !== 10 || !/^\d+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
      isValid = false;
    }

    // Validate listening hours
    if (!formData.averageListeningHours) {
      newErrors.averageListeningHours = 'Please select listening hours';
      isValid = false;
    }

    // Validate station
    if (!formData.stationId) {
      newErrors.station = 'Please select a station';
      isValid = false;
    }

    // Validate gender
    if (!formData.gender) {
      newErrors.gender = 'Please select a gender';
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

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | Date) => {
    // Clear error for this field when user starts typing
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle registration
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

  // Navigate to login screen
  const navigateToLogin = () => {
    router.replace('/(auth)/login');
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
          {/* Header with back button */}
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={navigateToLogin}
            >
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
            
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Please fill in the details below</Text>
            </View>
          </View>
          
          {/* Validation message */}
          {showValidationMessage && (
            <View style={styles.validationMessageContainer}>
              <AlertCircle size={20} color="#DC2626" />
              <Text style={styles.validationMessageText}>
                Please complete all required fields marked with an asterisk (*).
              </Text>
            </View>
          )}
          
          {/* Registration form */}
          <View style={styles.form}>
            {/* Name field */}
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

            {/* Phone Number field */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Phone Number</Text>
                <Text style={styles.requiredAsterisk}>*</Text>
              </View>
              <View style={styles.phoneInputContainer}>
                <Text style={styles.phonePrefix}>+91</Text>
                <TextInput
                  style={[styles.phoneInput, errors.phoneNumber && styles.inputError]}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  value={formData.phoneNumber}
                  onChangeText={(value) => handleInputChange('phoneNumber', value)}
                  maxLength={10}
                  placeholderTextColor="#666"
                  returnKeyType="next"
                  editable={!isSubmitting}
                />
              </View>
              {errors.phoneNumber && <Text style={styles.fieldErrorText}>{errors.phoneNumber}</Text>}
            </View>

            {/* Date of Birth field */}
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

            {/* Gender selection */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Gender</Text>
                <Text style={styles.requiredAsterisk}>*</Text>
              </View>
              <View style={[styles.pickerContainer, errors.gender && styles.inputError]}>
                <Picker
                  selectedValue={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  style={styles.picker}
                  enabled={!isSubmitting}
                  dropdownIconColor="#000">
                  {genderOptions.map((gender) => (
                    <Picker.Item 
                      key={gender} 
                      label={gender} 
                      value={gender}
                      color="#000"
                    />
                  ))}
                </Picker>
              </View>
              {errors.gender && <Text style={styles.fieldErrorText}>{errors.gender}</Text>}
            </View>

            {/* Station selection */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Station</Text>
                <Text style={styles.requiredAsterisk}>*</Text>
              </View>
              <StationSelector
                onStationSelect={handleStationSelect}
                selectedStation={selectedStation}
                error={errors.station}
              />
            </View>

            {/* Occupation field */}
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

            {/* Pincode field (optional) */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Pincode</Text>
                <Text style={styles.optionalText}>(Optional)</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your pincode"
                keyboardType="number-pad"
                value={formData.pincode}
                onChangeText={(value) => handleInputChange('pincode', value)}
                maxLength={6}
                placeholderTextColor="#666"
                returnKeyType="next"
                editable={!isSubmitting}
              />
            </View>

            {/* Average Listening Hours field */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Average Listening Hours</Text>
                <Text style={styles.requiredAsterisk}>*</Text>
              </View>
              <View style={[styles.pickerContainer, errors.averageListeningHours && styles.inputError]}>
                <Picker
                  selectedValue={formData.averageListeningHours}
                  onValueChange={(value) => handleInputChange('averageListeningHours', value)}
                  style={styles.picker}
                  enabled={!isSubmitting}
                  dropdownIconColor="#000">
                  {listeningHoursOptions.map((option) => (
                    <Picker.Item 
                      key={option} 
                      label={option} 
                      value={option}
                      color="#000"
                    />
                  ))}
                </Picker>
              </View>
              {errors.averageListeningHours && (
                <Text style={styles.fieldErrorText}>{errors.averageListeningHours}</Text>
              )}
            </View>

            {/* Medium of Listening field */}
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

            {/* Password field */}
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

            {/* Confirm Password field */}
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

            {/* General error message */}
            {errors.general ? (
              <View style={styles.errorContainer}>
                <Text style={styles.error}>{errors.general}</Text>
              </View>
            ) : null}

            {/* Submit button */}
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
  headerContainer: {
    padding: 20,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  header: {
    flex: 1,
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
  optionalText: {
    color: '#94A3B8',
    fontSize: 14,
    marginLeft: 4,
    fontStyle: 'italic',
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
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  phonePrefix: {
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    backgroundColor: '#f3f4f6',
    height: '100%',
    textAlignVertical: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    fontSize: 16,
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