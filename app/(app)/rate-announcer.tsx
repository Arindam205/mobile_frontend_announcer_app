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
  AppState
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useChannel } from '../../src/context/ChannelContext';
import { useAuth } from '../../src/context/AuthContext';
import ErrorBoundary from '../../components/ErrorBoundary';
import { BackHandler } from 'react-native';
import SuccessOverlay from '../../components/SuccessOverlay';
import MicAnimation from '../../components/MicAnimation';
import { api } from '../../src/api/config';

// Define rating criteria
const RATING_CRITERIA = [
  {
    id: 'voice',
    title: 'Voice Quality',
    description: 'Clarity, tone, and pleasantness of voice',
  },
  {
    id: 'grammar',
    title: 'Grammar',
    description: 'Correct use of language rules and structure',
  },
  {
    id: 'presentation',
    title: 'Presentation',
    description: 'Overall delivery style and engagement',
  },
  {
    id: 'pronunciation',
    title: 'Pronunciation',
    description: 'Accuracy in pronouncing words and phrases',
  },
];

// Interface for ratings state
interface RatingsState {
  voice: number | null;
  grammar: number | null;
  presentation: number | null;
  pronunciation: number | null;
}

// Interface for API response
interface RatingResponse {
  message: string;
  nextRatingTime: string;
  success: boolean;
  ratingDetails: {
    ratingId: number;
    listenerId: number;
    rjId: number;
    rjName: string;
    timestamp: string;
    presentation: number;
    voice: number;
    grammar: number;
    pronunciation: number;
    stationName: string;
    channelName: string;
    languageName: string;
    shiftName: string;
  } | null;
}

// Half Star Rating Component that matches the provided design
const PerfectStarRating: React.FC<{
  title: string;
  description: string;
  value: number | null;
  onChange: (value: number) => void;
  maxValue?: number;
  hasError?: boolean;
  disabled?: boolean;
}> = ({
  title,
  description,
  value,
  onChange,
  maxValue = 5,
  hasError = false,
  disabled = false,
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
            onPress={() => !disabled && onChange(position - 0.5)}
            disabled={disabled}
          />
          <TouchableOpacity
            style={styles.rightHalfTouch}
            onPress={() => !disabled && onChange(position)}
            disabled={disabled}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.ratingContainer, hasError && styles.errorContainer]}>
      <View style={styles.ratingHeader}>
        <Text style={styles.ratingTitle}>{title}</Text>
        {hasError && <Text style={styles.errorText}>Please rate this</Text>}
      </View>
      
      <Text style={styles.ratingDescription}>{description}</Text>
      
      <View style={styles.starsRow}>
        {Array.from({ length: maxValue }).map((_, index) => renderStar(index + 1))}
      </View>
    </View>
  );
};

// Main component
export default function RateAnnouncerScreen() {
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
  const [ratings, setRatings] = useState<RatingsState>({
    voice: null,
    grammar: null,
    presentation: null,
    pronunciation: null,
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [nextRatingTime, setNextRatingTime] = useState<string | null>(null);
  
  // Reference to track timeout
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get language from URL params
  const languageId = params.languageId as string;
  const languageName = params.languageName as string;

  const scrollViewRef = useRef<ScrollView>(null);

  // Add a handler function to dismiss success overlay
  const handleDismissSuccess = useCallback(() => {
    setShowSuccess(false);
  }, []);
  
  // Add AppState listener effect to dismiss overlay when app goes to background
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
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Also ensure success overlay is dismissed when component unmounts
      setShowSuccess(false);
    };
  }, []);
  
  // Reset ratings every time this screen is focused
  useFocusEffect(
    useCallback(() => {
      // This will run when the screen comes into focus
      console.log("Rate announcer screen focused - resetting state");
      setRatings({
        voice: null,
        grammar: null,
        presentation: null,
        pronunciation: null,
      });
      setValidationErrors([]);
      setIsSuccess(false);
      setIsSubmitting(false);
      setShowSuccess(false);
      setResponseMessage(null);
      setNextRatingTime(null);

      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
        }
      }, 50);
      
      return () => {
        // This cleanup runs when the screen loses focus
        console.log("Rate announcer screen unfocused");
      };
    }, [])
  );
  
  // Handle back button presses
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleGoBack();
        return true;
      };
      
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );
  
  // Make sure we have the required data
  useEffect(() => {
    if (!selectedChannel || !languageId) {
      console.error('Missing required data', { selectedChannel, languageId });
      Alert.alert(
        'Error',
        'Missing required channel or language information',
        [
          {
            text: 'Go Back',
            onPress: () => router.back(),
          }
        ]
      );
    }
  }, [selectedChannel, languageId]);

  // Handle star rating selection
  const handleRatingSelect = (criteriaId: keyof RatingsState, rating: number) => {
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

  // Submit the ratings
  // Replace the handleSubmit function in app/(app)/rate-announcer.tsx

const handleSubmit = async () => {
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
  
  try {
    setIsSubmitting(true);
    
    const timestamp = new Date().toISOString();
    const channelId = Number(selectedChannel?.channelId);

    const requestBody = {
      stationId: stationId,
      channelId: channelId,
      languageId: Number(languageId),
      timestamp: timestamp,
      rating: {
        presentation: ratings.presentation,
        voice: ratings.voice,
        grammar: ratings.grammar,
        pronunciation: ratings.pronunciation,
      }
    };

    console.log('[RateAnnouncer] Submitting rating:', requestBody);
    
    const response = await api.post<RatingResponse>('/api/ratings/submit', requestBody);
    
    console.log('[RateAnnouncer] Rating response status:', response.status);
    console.log('[RateAnnouncer] Rating response data:', response.data);
    
    setIsSubmitting(false);
    
    if (response.status >= 200 && response.status < 300) {
      // Successful submission
      const { success, message, nextRatingTime } = response.data;
      
      setResponseMessage(message);
      setNextRatingTime(nextRatingTime);
      
      if (success) {
        setIsSuccess(true);
        setShowSuccess(true);
        
        const timer = setTimeout(() => {
          setShowSuccess(false);
          router.replace('/(app)/home');
        }, 2500);
        
        timerRef.current = timer;
      } else {
        Alert.alert(
          'Rating Submission',
          message,
          [{ 
            text: 'OK', 
            onPress: () => {
              setShowSuccess(false);
              router.replace('/(app)/home');
            }
          }]
        );
      }
    } else if (response.status >= 400 && response.status < 500) {
      // Client error - handle gracefully
      const errorMessage = response.data?.message || 'Rating submission failed';
      console.log(`[RateAnnouncer] API returned ${response.status}: ${errorMessage}`);
      Alert.alert('Rating Submission', errorMessage, [{ text: 'OK' }]);
    } else {
      // Unexpected status
      Alert.alert(
        'Rating Submission',
        `Unexpected server response: ${response.status}`,
        [{ text: 'OK' }]
      );
    }
    
  } catch (error: any) {
    // Only server errors (500+) and network errors reach here
    console.error('[RateAnnouncer] Server/Network error submitting rating:', error);
    setIsSubmitting(false);
    
    Alert.alert(
      'Submission Error',
      'Failed to submit rating. Please try again later.',
      [{ text: 'OK' }]
    );
  }
};
  
  // Navigate back to rating selection screen
  const handleGoBack = () => {
    router.replace('/(app)/rating-selection'); // This will go back to the rating-selection screen
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
              <Text style={styles.headerTitle}>Rate Announcer</Text>
              
              <View style={styles.channelInfoContainer}>
                <View>
                  <Text style={styles.channelName}>{selectedChannel?.channelName || ''}</Text>
                  <Text style={styles.stationNameText}>{stationName}</Text>
                  <Text style={styles.languageNameText}>{languageName}</Text>
                </View>
              </View>
              
              {/* Mic animation in the header */}
              <View style={styles.micAnimationContainer}>
                <MicAnimation size={42} color="#fff" />
              </View>
            </View>
          </LinearGradient>

          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
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
                disabled={isSubmitting || showSuccess}
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
            subMessage={nextRatingTime ? `You can rate again after ${nextRatingTime}` : "Thank you for your feedback"}
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
  channelName: {
    fontSize: 20,
    fontWeight: '500',
    color: 'white',
  },
  stationNameText: {
    fontSize: 14,
    color: '#FDE68A',
    marginTop: 4,
  },
  languageNameText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  micAnimationContainer: {
    position: 'absolute',
    top: 30,
    right: 0,
    width: 100,
    height: 100,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
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