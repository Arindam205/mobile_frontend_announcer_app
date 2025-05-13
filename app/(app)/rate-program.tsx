import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  Easing,
  AppState
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useChannel } from '../../src/context/ChannelContext';
import { useAuth } from '../../src/context/AuthContext';
import ErrorBoundary from '../../components/ErrorBoundary';
import { BackHandler } from 'react-native';
import SuccessOverlay from '../../components/SuccessOverlay';
import { Music } from 'lucide-react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { api } from '../../src/api/config';

// Define rating criteria
const RATING_CRITERIA = [
  {
    id: 'content',
    title: 'Content',
    description: 'Relevance, accuracy, and quality',
  },
  {
    id: 'presentation',
    title: 'Presentation',
    description: 'Structure, pacing, and flow of the program',
  },
  {
    id: 'production',
    title: 'Overall Production',
    description: 'Quality of sound effects, music, and technical execution',
  },
  {
    id: 'impact',
    title: 'Impact',
    description: 'Engagement level and value to the listener',
  },
];

// Interface for ratings state
interface RatingsState {
  content: number | null;
  presentation: number | null;
  production: number | null;
  impact: number | null;
}

// Interface for API response
interface ProgramRatingResponse {
  message: string;
  success: boolean;
  ratingDetails: {
    programRatingId: number;
    listenerId: number;
    programId: number;
    programName: string;
    timestamp: string;
    programDate: string;
    content: number;
    presentation: number;
    overallProduction: number;
    impact: number;
    stationName: string;
    channelName: string;
    languageName: string;
  } | null;
  averageRatingDetails?: {
    avgContent: number;
    avgPresentation: number;
    avgOverallProduction: number;
    avgImpact: number;
    avgOverallRating: number;
    totalRatings: number;
  };
}

// Custom Calendar Button component
const CalendarButton: React.FC<{
  selectedDate: Date | null;
  onPress: () => void;
  isDisabled: boolean;
  hasError?: boolean;
}> = ({ selectedDate, onPress, isDisabled, hasError }) => {
  return (
    <TouchableOpacity
      style={[
        styles.calendarButton,
        selectedDate ? styles.calendarButtonSelected : {},
        hasError ? styles.calendarButtonError : {},
        isDisabled ? styles.calendarButtonDisabled : {},
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.calendarButtonText,
        selectedDate ? styles.calendarButtonTextSelected : {},
        hasError ? styles.calendarButtonTextError : {},
      ]}>
        {selectedDate 
          ? selectedDate.toLocaleDateString('en-US', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            }) 
          : 'Select Date to Rate'}
      </Text>
      
      {hasError && (
        <Text style={styles.calendarErrorText}>
          Date selection required
        </Text>
      )}
    </TouchableOpacity>
  );
};

// Half Star Rating Component with enhanced validation
const PerfectStarRating: React.FC<{
  title: string;
  description: string;
  value: number | null;
  onChange: (value: number) => void;
  maxValue?: number;
  hasError?: boolean;
  disabled?: boolean;
  onCardPress: () => void; // For handling card press
}> = ({
  title,
  description,
  value,
  onChange,
  maxValue = 5,
  hasError = false,
  disabled = false,
  onCardPress,
}) => {
  // Helper to render individual stars
  const renderStar = (position: number) => {
    // Calculate fill level for this star (0 = empty, 0.5 = half, 1 = full)
    let fillLevel = 0;
    if (value !== null) {
      if (value >= position) {
        fillLevel = 1; // Full star
      } else if (value > position - 1 && value < position) {
        fillLevel = 0.5; // Half star
      }
    }
    
    return (
      <View key={position} style={styles.starContainer}>
        <View style={styles.starInner}>
          {/* Different rendering based on fill level */}
          {fillLevel === 1 ? (
            // Full star (completely gold)
            <Text style={styles.fullStar}>★</Text>
          ) : fillLevel === 0.5 ? (
            // Half star (left half gold, right half gray)
            <View style={styles.halfStarContainer}>
              {/* Gray background star */}
              <Text style={styles.emptyStar}>★</Text>
              
              {/* Gold half star overlay */}
              <View style={styles.halfFillMask}>
                <Text style={styles.fullStar}>★</Text>
              </View>
            </View>
          ) : (
            // Empty star (completely gray)
            <Text style={styles.emptyStar}>★</Text>
          )}
          
          {/* Touch areas */}
          <TouchableOpacity
            style={styles.leftHalfTouch}
            onPress={() => {
              if (disabled) {
                onCardPress(); // Call onCardPress when disabled
              } else {
                onChange(position - 0.5);
              }
            }}
          />
          <TouchableOpacity
            style={styles.rightHalfTouch}
            onPress={() => {
              if (disabled) {
                onCardPress(); // Call onCardPress when disabled
              } else {
                onChange(position);
              }
            }}
          />
        </View>
      </View>
    );
  };

  // Create a touchable container that will call onCardPress if date is not selected
  return (
    <TouchableOpacity 
      style={[styles.ratingContainer, hasError && styles.errorContainer]}
      onPress={disabled ? onCardPress : undefined}
      activeOpacity={disabled ? 0.8 : 1}
    >
      <View style={styles.ratingHeader}>
        <Text style={styles.ratingTitle}>{title}</Text>
        {hasError && <Text style={styles.errorText}>Please rate this</Text>}
      </View>
      
      <Text style={styles.ratingDescription}>{description}</Text>
      
      <View style={styles.starsRow}>
        {Array.from({ length: maxValue }).map((_, index) => renderStar(index + 1))}
      </View>
    </TouchableOpacity>
  );
};

// Main component
export default function RateProgramScreen() {
  // Get URL params
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Get channel data from context
  const { selectedChannel, stationName } = useChannel();
  // Get auth data for stationId
  const { stationId } = useAuth();

  // State variables
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [ratings, setRatings] = useState<RatingsState>({
    content: null,
    presentation: null,
    production: null,
    impact: null,
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  
  // Reference to track timer for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation values for music icon
  const musicIconRotate = useRef(new Animated.Value(0)).current;
  const musicIconScale = useRef(new Animated.Value(1)).current;
  const musicGlowOpacity = useRef(new Animated.Value(0.15)).current;
  
  // Get program data from URL params
  const programId = params.programId as string;
  const programName = params.programName as string;
  const languageId = params.languageId as string;
  const languageName = params.languageName as string;

  const scrollViewRef = useRef<ScrollView>(null);
  
  // Current date for validation
  const currentDate = new Date();
  // Min date for validation (May 1, 2025)
  const minDate = new Date(2025, 4, 1); // Month is 0-based, so 4 = May

  // Handle dismissing success overlay
  const handleDismissSuccess = useCallback(() => {
    setShowSuccess(false);
  }, []);
  
  // Add AppState listener to detect when app goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background' && showSuccess) {
        setShowSuccess(false);
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [showSuccess]);
  
  // Cleanup timer and reset success state when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setShowSuccess(false);
    };
  }, []);

  // Set data ready
  useEffect(() => {
    setTimeout(() => {
      setDataReady(true);
    }, 300);
  }, []);
  
  // Start music icon animations
  useEffect(() => {
    if (dataReady) {
      // Subtle rotation animation for music icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(musicIconRotate, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(musicIconRotate, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          })
        ])
      ).start();
      
      // Subtle scale animation for music icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(musicIconScale, {
            toValue: 1.05,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(musicIconScale, {
            toValue: 0.98,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      ).start();
      
      // Glow pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(musicGlowOpacity, {
            toValue: 0.3,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(musicGlowOpacity, {
            toValue: 0.1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          })
        ])
      ).start();
    }
  }, [dataReady]);
  
  // Reset ratings every time this screen is focused
  useFocusEffect(
    useCallback(() => {
      // This will run when the screen comes into focus
      console.log("Rate program screen focused - resetting state");
      setRatings({
        content: null,
        presentation: null,
        production: null,
        impact: null,
      });
      setValidationErrors([]);
      setIsSuccess(false);
      setIsSubmitting(false);
      setShowSuccess(false);
      setSelectedDate(null);
      setDateError(null);
      setResponseMessage(null);

      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
        }
      }, 50);
      
      return () => {
        // This cleanup runs when the screen loses focus
        console.log("Rate program screen unfocused");
      };
    }, [])
  );
  
  // Handle back button presses - CORRECTED VERSION
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Navigate back to program-selection with the required parameters
        router.push({
          pathname: '/(app)/program-selection',
          params: {
            languageId,
            languageName
          }
        });
        return true;
      };
      
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [router, languageId, languageName])
  );
  
  // Make sure we have the required data
  useEffect(() => {
    if (!selectedChannel || !programId || !languageId) {
      console.error('Missing required data', { selectedChannel, programId, languageId });
      Alert.alert(
        'Error',
        'Missing required program or language information',
        [
          {
            text: 'Go Back',
            onPress: () => router.back(),
          }
        ]
      );
    }
  }, [selectedChannel, programId, languageId, router]);

  // Handle date validation when ANY interaction occurs
  const handleDateValidation = () => {
    // Check if date is selected
    if (!selectedDate) {
      // Show date error
      setDateError('Please select a date first');
      
      // Scroll to top to make sure the date field is visible
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
      }
      
      // Show alert to guide the user
      Alert.alert(
        'Date Required',
        'Please select the date you listened to this program before rating',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Enhanced handle star rating selection with date validation
  const handleRatingSelect = (criteriaId: keyof RatingsState, rating: number) => {
    // Validate date first
    if (!handleDateValidation()) {
      return;
    }
    
    // If the same rating is selected, clear it to allow re-selection
    if (ratings[criteriaId] === rating) {
      setRatings(prev => ({
        ...prev,
        [criteriaId]: null,
      }));
    } else {
      setRatings(prev => ({
        ...prev,
        [criteriaId]: rating,
      }));
      
      // Clear validation error for this criteria
      setValidationErrors(prev => prev.filter(error => !error.includes(RATING_CRITERIA.find(c => c.id === criteriaId)?.title || '')));
    }
  };

  // Date picker functions
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleDateConfirm = (date: Date) => {
    setSelectedDate(date);
    setDateError(null);
    hideDatePicker();
  };

  // Submit the ratings
  const handleSubmit = async () => {
    // Validate date selection
    if (!selectedDate) {
      setDateError('Please select a date to rate this program');
      
      // Scroll to top to make sure the date field is visible
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
      }
      
      Alert.alert(
        'Date Required',
        'Please select a date when you listened to this program',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Validate all ratings are provided
    const missingRatings = [];
    
    for (const criteria of RATING_CRITERIA) {
      if (ratings[criteria.id as keyof RatingsState] === null) {
        missingRatings.push(criteria.title);
      }
    }
    
    if (missingRatings.length > 0) {
      setValidationErrors(missingRatings);
      Alert.alert(
        'Missing Ratings',
        `Please rate the following: ${missingRatings.join(', ')}`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    // All validations passed, begin submission
    try {
      setIsSubmitting(true);
      
      // Format the selected date for API (YYYY-MM-DD)
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      // Create current timestamp in ISO format for the API
      const timestamp = new Date().toISOString();
      
      // Get program ID from params
      const programIdNumber = Number(programId);
      
      // Prepare API request body
      const requestBody = {
        stationId: stationId,
        channelId: selectedChannel?.channelId,
        languageId: Number(languageId),
        timestamp: timestamp,
        programDate: formattedDate,
        programId: programIdNumber,
        rating: {
          content: ratings.content,
          presentation: ratings.presentation,
          overallProduction: ratings.production, // Map 'production' to 'overallProduction'
          impact: ratings.impact,
        }
      };
      
      console.log('Submitting program rating:', requestBody);
      
      // Call the API
      const response = await api.post<ProgramRatingResponse>('/api/program-ratings/submit', requestBody);
      
      console.log('Program rating submission response:', response.data);
      
      setIsSubmitting(false);
      
      // Extract important information from the response
      const { success, message, ratingDetails, averageRatingDetails } = response.data;
      
      setResponseMessage(message);
      
      if (success) {
        // Rating was submitted successfully
        setIsSuccess(true);
        setShowSuccess(true);
        
        // Display average ratings if provided (optional)
        if (averageRatingDetails) {
          console.log('Average program ratings:', averageRatingDetails);
        }
        
        // Navigate to home after a delay
        const timer = setTimeout(() => {
          setShowSuccess(false); // Hide overlay before navigation
          router.replace('/(app)/home');
        }, 2500);
        
        // Store timer reference for cleanup
        timerRef.current = timer;
      } else {
        // Rating was not successful
        Alert.alert(
          'Rating Submission',
          message || 'Failed to submit rating',
          [{ 
            text: 'OK', 
            onPress: () => {
              setShowSuccess(false); // Ensure overlay is hidden
              router.push({
                pathname: '/(app)/program-selection',
                params: {
                  languageId,
                  languageName
                }
              });
            } 
          }]
        );
      }
    } catch (error: any) {
      console.error('Error submitting program rating:', error);
      setIsSubmitting(false);
      
      Alert.alert(
        'Submission Error',
        error.response?.data?.message || 'Failed to submit rating. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  // Calculate dynamic button color based on state
  const getButtonStyle = () => {
    if (isSuccess) {
      return [styles.submitButton, styles.successButton];
    } else if (isSubmitting) {
      return [styles.submitButton, styles.loadingButton];
    }
    return styles.submitButton;
  };

  // Check if stars should be disabled (if no date is selected)
  const areStarsDisabled = !selectedDate || isSubmitting || showSuccess;

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flexGrow}
        >
          {/* Header */}
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Rate Program</Text>
              
              <View style={styles.channelInfoContainer}>
                <View>
                  <Text style={styles.programName}>{programName || 'Program'}</Text>
                  <Text style={styles.channelName}>{selectedChannel?.channelName || ''}</Text>
                  <Text style={styles.languageNameText}>{languageName}</Text>
                </View>
              </View>
              
              {/* Music icon animation in the header */}
              <View style={styles.musicIconContainer}>
                <Animated.View 
                  style={[
                    styles.musicIconGlow,
                    { opacity: musicGlowOpacity }
                  ]} 
                />
                <Animated.View
                  style={[
                    styles.musicIconBackground,
                    {
                      transform: [
                        { 
                          rotate: musicIconRotate.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['-10deg', '5deg']
                          }) 
                        },
                        { scale: musicIconScale }
                      ]
                    }
                  ]}
                >
                  <Music size={42} color="#fff" />
                </Animated.View>
              </View>
            </View>
          </LinearGradient>

          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Date Selection - Highlighted with animation or color if there's an error */}
            <View style={[
              styles.dateSelectionContainer,
              dateError ? styles.dateSelectionError : null
            ]}>
              <Text style={[
                styles.dateSelectionTitle,
                dateError ? styles.dateSelectionTitleError : null
              ]}>
                {dateError ? '* Select the date you listened to this program' : 'Select the date you listened to this program'}
              </Text>
              
              <CalendarButton 
                selectedDate={selectedDate}
                onPress={showDatePicker}
                isDisabled={isSubmitting || showSuccess}
                hasError={!!dateError}
              />
              
              <DateTimePicker
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={hideDatePicker}
                date={selectedDate || new Date()}
                maximumDate={currentDate}
                minimumDate={minDate}
              />
            </View>
            
            {/* Rating instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                Tap left side of star for half rating, right side for full rating
              </Text>
            </View>

            {/* Rating criteria */}
            {RATING_CRITERIA.map((criteria) => (
              <PerfectStarRating
                key={criteria.id}
                title={criteria.title}
                description={criteria.description}
                value={ratings[criteria.id as keyof RatingsState]}
                onChange={(value) => handleRatingSelect(criteria.id as keyof RatingsState, value)}
                hasError={validationErrors.includes(criteria.title)}
                disabled={areStarsDisabled}
                onCardPress={handleDateValidation}
              />
            ))}

            {/* Submit Button */}
            <TouchableOpacity
              style={getButtonStyle()}
              onPress={handleSubmit}
              disabled={isSubmitting || isSuccess}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" size="small" />
              ) : isSuccess ? (
                <Text style={styles.submitButtonText}>Rating Submitted</Text>
              ) : (
                <Text style={styles.submitButtonText}>Submit Rating</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
          
          {/* Success Overlay with onDismiss handler */}
          <SuccessOverlay
            visible={showSuccess}
            message={responseMessage || "Rating Submitted!"}
            subMessage="Thank you for your feedback"
            type="program"
            onDismiss={handleDismissSuccess}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  flexGrow: {
    flex: 1,
  },
  header: {
    paddingTop: 25,
    paddingBottom: 40,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    height: 210,
  },
  headerContent: {
    flex: 1,
    paddingTop: 30,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
    marginBottom: 20,
    letterSpacing: 1.2,
  },
  channelInfoContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  programName: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  channelName: {
    fontSize: 16,
    color: '#FDE68A',
    marginTop: 4,
  },
  languageNameText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  musicIconContainer: {
    position: 'absolute',
    top: 30,
    right: 0,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicIconGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10
  },
  musicIconBackground: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  dateSelectionContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dateSelectionError: {
    backgroundColor: 'rgba(254, 226, 226, 0.5)',
    borderColor: '#FCA5A5',
  },
  dateSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
    textAlign: 'center',
  },
  dateSelectionTitleError: {
    color: '#DC2626',
    fontWeight: '700',
  },
  calendarButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  calendarButtonSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#EEF2FF',
  },
  calendarButtonDisabled: {
    opacity: 0.6,
  },
  calendarButtonError: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  calendarButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  calendarButtonTextSelected: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  calendarButtonTextError: {
    color: '#DC2626',
  },
  calendarErrorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 6,
    fontWeight: '500',
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionsText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 22,
    textAlign: 'center',
  },
  ratingContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  errorContainer: {
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  ratingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  starContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starInner: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStar: {
    fontSize: 40,
    color: '#D1D5DB',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  fullStar: {
    fontSize: 40,
    color: '#FFD700',
    textShadowColor: 'rgba(177, 127, 0, 0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  halfStarContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  halfFillMask: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 20, // Exactly half the width
    height: 40,
    overflow: 'hidden',
  },
  leftHalfTouch: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 20,
    height: 40,
    zIndex: 5,
  },
  rightHalfTouch: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 20,
    height: 40,
    zIndex: 5,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingButton: {
    backgroundColor: '#94A3B8',
    shadowColor: '#94A3B8',
  },
  successButton: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});