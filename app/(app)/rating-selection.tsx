import React, { useState, useEffect, useRef } from 'react';
import { 
  Text, 
  View, 
  StatusBar,
  SafeAreaView,
  Alert,
  BackHandler,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  ImageBackground,
  TouchableWithoutFeedback,
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Music, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useChannel } from '../../src/context/ChannelContext';
import ErrorBoundary from '../../components/ErrorBoundary';
import { api } from '../../src/api/config';
import * as SecureStore from 'expo-secure-store';
import { ReactNode } from 'react';

// Interfaces
interface Channel {
  channelId: string | number;
  channelName: string;
  frequencyDetails?: string;
  stationId?: string;
}

interface Language {
  languageId: number;
  languageName: string;
  micAnimation: Animated.Value;
}

interface RatingOption {
  id: 'announcer' | 'program';
  title: string;
  description: string;
  icon: ReactNode;
  image: any;
}

// Extract frequency helper function
const extractFrequency = (frequencyDetails: string | undefined): string => {
  if (!frequencyDetails) return '';
  
  const matches = frequencyDetails.match(/(\d+\.\d+)/);
  if (matches && matches[1]) {
    return matches[1];
  }
  
  return '102.8';
};

// Main component implementation
const RatingSelectionScreen: React.FC = () => {
  // Screen states
  const [isLoading, setIsLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Selection states
  const [selectedOption, setSelectedOption] = useState<RatingOption | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  // Animation values for microphone
  const microphoneRotate = useRef(new Animated.Value(0)).current;
  const microphoneScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.15)).current;

  // Animation values for cards
  const cardOneScale = useRef(new Animated.Value(1)).current;
  const cardTwoScale = useRef(new Animated.Value(1)).current;
  
  // Get channel data from context
  const channelData = useChannel();
  const selectedChannel = channelData?.selectedChannel as Channel | undefined;
  const stationName = channelData?.stationName as string | undefined;

  // Define rating options
  const ratingOptions: RatingOption[] = [
    {
      id: 'announcer',
      title: 'Rate Announcer',
      description: "Provide feedback for the announcer's performance",
      icon: <Mic size={28} color="#fff" />,
      image: require('../../assets/images/rate-announcer.png')
    },
    {
      id: 'program',
      title: 'Rate Program',
      description: 'Evaluate program content and quality',
      icon: <Music size={28} color="#fff" />,
      image: require('../../assets/images/rate-program.png')
    }
  ];

  // Start microphone animations
  useEffect(() => {
    if (dataReady) {
      // Subtle rotation animation for microphone
      Animated.loop(
        Animated.sequence([
          Animated.timing(microphoneRotate, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(microphoneRotate, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          })
        ])
      ).start();
      
      // Subtle scale animation for microphone
      Animated.loop(
        Animated.sequence([
          Animated.timing(microphoneScale, {
            toValue: 1.05,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(microphoneScale, {
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
          Animated.timing(glowOpacity, {
            toValue: 0.3,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          })
        ])
      ).start();
      
      // Start subtle breathing animations for cards
      Animated.loop(
        Animated.sequence([
          Animated.timing(cardOneScale, {
            toValue: 1.03,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(cardOneScale, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      ).start();
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(cardTwoScale, {
            toValue: 1.03,
            duration: 2500, // Slightly different timing
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(cardTwoScale, {
            toValue: 1,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      ).start();
    }
  }, [dataReady]);

  // Fetch languages for the station
  const fetchLanguages = async () => {
    setIsLoadingLanguages(true);
    setApiError(null);
    
    try {
      // Get the JWT token from SecureStore
      const token = await SecureStore.getItemAsync('token');
      
      if (!token) {
        console.error('[RatingSelection] No token found, user may not be authenticated');
        throw new Error('Authentication token not found');
      }
      
      const response = await api.get('/api/languages/station-languages');
      
      console.log('[RatingSelection] Languages response status:', response.status);
      console.log('[RatingSelection] Languages response data:', response.data);
      
      if (response.status >= 200 && response.status < 300) {
        // Successful response
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          console.log('[RatingSelection] Languages fetched successfully:', response.data);
          
          const languagesWithAnim = response.data.map((lang : any) => ({
            ...lang,
            micAnimation: new Animated.Value(0)
          })) as Language[];
          
          setLanguages(languagesWithAnim);
          
          // Start mic animations for each language after a short delay
          setTimeout(() => {
            languagesWithAnim.forEach(lang => {
              Animated.loop(
                Animated.sequence([
                  Animated.timing(lang.micAnimation, {
                    toValue: 1,
                    duration: 1500 + Math.random() * 500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true
                  }),
                  Animated.timing(lang.micAnimation, {
                    toValue: 0,
                    duration: 1500 + Math.random() * 500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true
                  })
                ])
              ).start();
            });
          }, 300);
        } else {
          console.log('[RatingSelection] No languages returned from API');
          setLanguages([]);
          setApiError('No languages available for this station.');
        }
      } else if (response.status >= 400 && response.status < 500) {
        // Client error - handle gracefully
        const errorMessage = response.data?.message || 'Failed to load languages';
        console.log(`[RatingSelection] API returned ${response.status}: ${errorMessage}`);
        setApiError(errorMessage);
        setLanguages([]);
      } else {
        // Unexpected status
        setApiError(`Unexpected server response: ${response.status}`);
        setLanguages([]);
      }
    } catch (error: any) {
      // Only server errors (500+) and network errors reach here
      console.error('[RatingSelection] Server/Network error fetching languages:', error);
      setApiError('Failed to load languages. Please try again later.');
      setLanguages([]);
    } finally {
      setIsLoadingLanguages(false);
    }
  };

  // Component mount logging and initialization
  useEffect(() => {
    console.log("[RatingSelection] Screen mounted");
    
    // Verify channel data on mount
    if (!selectedChannel) {
      console.log("[RatingSelection] No channel data, returning to home");
      setTimeout(() => {
        router.replace("/(app)/home");
      }, 100);
      return;
    }
    
    console.log("[RatingSelection] Channel data found:", {
      channelId: selectedChannel.channelId,
      channelName: selectedChannel.channelName
    });
    
    // Fetch languages for this station
    fetchLanguages();
    
    // Mark data as ready after a short delay
    setTimeout(() => {
      setIsLoading(false);
      setDataReady(true);
    }, 300);
    
    return () => {
      console.log("[RatingSelection] Screen unmounted");
    };
  }, [selectedChannel]);

  // Add back button handler for hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (showLanguageModal) {
          setShowLanguageModal(false);
          return true;
        }
        if (selectedOption) {
          setSelectedOption(null);
          return true;
        }
        handleBackPress();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [showLanguageModal, selectedOption]);
  
  // Navigate back to home screen
  const handleBackPress = () => {
    try {
      console.log("[RatingSelection] Back button pressed, navigating to home");
      router.replace("/(app)/home");
    } catch (error) {
      console.error("[RatingSelection] Error navigating back:", error);
      // Fallback
      router.push("/(app)/home");
    }
  };

  // Select an option
  const handleSelectOption = (option: RatingOption) => {
    setSelectedOption(option);
    // Reset language selection when opening the modal
    setSelectedLanguage(null);
    setShowLanguageModal(true);
    
    // Restart microphone animations when opening modal
    languages.forEach(lang => {
      if (lang.micAnimation) {
        // Reset animation value
        lang.micAnimation.setValue(0);
        
        // Restart the animation loop
        Animated.loop(
          Animated.sequence([
            Animated.timing(lang.micAnimation, {
              toValue: 1,
              duration: 1500 + Math.random() * 500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true
            }),
            Animated.timing(lang.micAnimation, {
              toValue: 0,
              duration: 1500 + Math.random() * 500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true
            })
          ])
        ).start();
      }
    });
  };

  // Handle language selection
  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setShowLanguageModal(false);
    
    // Navigate based on the selected option
    if (selectedOption?.id === 'announcer') {
      console.log(`[RatingSelection] Selected ${language.languageName} language for announcer rating`);
      
      // Navigate to announcer rating page
      router.push({
        pathname: "/(app)/rate-announcer",
        params: {
          languageId: language.languageId,
          languageName: language.languageName
        }
      });
    } else if (selectedOption?.id === 'program') {
      console.log(`[RatingSelection] Selected ${language.languageName} language for program rating`);
      
      // Navigate to program selection page
      router.push({
        pathname: "/(app)/program-selection",
        params: {
          languageId: language.languageId,
          languageName: language.languageName
        }
      });
    }
  };

  // Close the language modal
  const handleCloseLanguageModal = () => {
    // Stop animations when closing modal to prevent performance issues
    languages.forEach(lang => {
      if (lang.micAnimation) {
        // We don't actually stop the animation here, just letting it run
        // as we'll restart it when the modal opens again
      }
    });
    
    // Immediately set modal visibility to false
    setShowLanguageModal(false);
  };

  // Show loading state
  if (isLoading || !dataReady || !selectedChannel) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>
            {!selectedChannel ? "Loading channel data..." : "Preparing content..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Extract frequency for display
  const frequencyValue = extractFrequency(selectedChannel.frequencyDetails);

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#3b82f6" barStyle="light-content" />
        
        {/* Header with Blue-Purple Gradient */}
        <LinearGradient
          colors={["#3b82f6", "#8b5cf6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{selectedChannel.channelName || 'Channel'}</Text>
            <View style={styles.frequencyContainer}>
              {/* <Text style={styles.frequencyText}>{frequencyValue}</Text> */}
              <Text style={styles.frequencyText}>{selectedChannel.frequencyDetails?.replace(/^\S+\s/, '')}</Text>
              {/* <Text style={styles.mhzText}>MHz</Text> */}
            </View>
            {stationName ? (
              <Text style={styles.stationName}>{stationName}</Text>
            ) : null}
            <Text style={styles.headerDescription}>
              Choose an option to rate
            </Text>
          </View>
          
          {/* Microphone image in bottom right corner with glow effect */}
          <View style={styles.microphoneContainer}>
            <Animated.View 
              style={[
                styles.microphoneGlow,
                { opacity: glowOpacity }
              ]} 
            />
            <Animated.Image
              source={require('../../assets/images/Microphone-white.png')}
              style={[
                styles.microphoneImage,
                {
                  transform: [
                    { 
                      rotate: microphoneRotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['-10deg', '5deg']
                      }) 
                    },
                    { scale: microphoneScale }
                  ]
                }
              ]}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
        
        {/* Rating Options Cards with Full Image Backgrounds */}
        <View style={styles.cardsContainer}>
          {/* Card 1 - Announcer */}
          <Animated.View
            style={[
              styles.cardContainer,
              { transform: [{ scale: cardOneScale }] }
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleSelectOption(ratingOptions[0])}
              style={styles.cardTouchable}
            >
              <ImageBackground
                source={ratingOptions[0].image}
                style={styles.backgroundImage}
                resizeMode="cover"
              >
                <View style={styles.cardOverlay}>
                  <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                      {ratingOptions[0].icon}
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.cardTitle}>{ratingOptions[0].title}</Text>
                      <Text style={styles.cardDescription}>{ratingOptions[0].description}</Text>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </Animated.View>

          {/* Card 2 - Program */}
          <Animated.View
            style={[
              styles.cardContainer,
              { transform: [{ scale: cardTwoScale }] }
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleSelectOption(ratingOptions[1])}
              style={styles.cardTouchable}
            >
              <ImageBackground
                source={ratingOptions[1].image}
                style={styles.backgroundImage}
                resizeMode="cover"
              >
                <View style={styles.cardOverlay}>
                  <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                      {ratingOptions[1].icon}
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.cardTitle}>{ratingOptions[1].title}</Text>
                      <Text style={styles.cardDescription}>{ratingOptions[1].description}</Text>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </Animated.View>
        </View>
        
        {/* Language Selection Modal */}
        <Modal
          visible={showLanguageModal}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseLanguageModal}
        >
          <TouchableWithoutFeedback onPress={handleCloseLanguageModal}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalContainer}>
                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderSpacer} />
                    <Text style={styles.modalTitle}>
                      {`Select Language for ${selectedOption?.title}`}
                    </Text>
                    <TouchableOpacity
                      onPress={handleCloseLanguageModal}
                      style={styles.modalCloseButton}
                    >
                      <X size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Language list */}
                  {isLoadingLanguages ? (
                    <View style={styles.loadingLanguagesContainer}>
                      <ActivityIndicator size="large" color="#6366f1" />
                      <Text style={styles.loadingLanguagesText}>
                        Loading languages...
                      </Text>
                    </View>
                  ) : (
                    <>
                      {apiError ? (
                        <View style={styles.apiErrorContainer}>
                          <Text style={styles.apiErrorText}>{apiError}</Text>
                        </View>
                      ) : (
                        <ScrollView 
                          style={styles.languagesList}
                          contentContainerStyle={styles.languagesListContent}
                          showsVerticalScrollIndicator={true}
                        >
                          {languages.length > 0 ? (
                            languages.map((language, index) => (
                              <TouchableOpacity
                                key={language.languageId}
                                style={[
                                  styles.languageOption,
                                  // Only add bottom border if not the last item
                                  index !== languages.length - 1 && styles.languageOptionBorder,
                                  // Apply padding to last item to remove extra space
                                  index === languages.length - 1 && styles.lastLanguageOption
                                ]}
                                onPress={() => handleLanguageSelect(language)}
                              >
                                <Text style={styles.languageText}>
                                  {language.languageName}
                                </Text>
                                
                                {/* Animated microphone icon */}
                                <Animated.View 
                                  style={[
                                    styles.languageMicContainer,
                                    {
                                      transform: [
                                        {
                                          rotate: language.micAnimation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '10deg']
                                          })
                                        },
                                        {
                                          scale: language.micAnimation.interpolate({
                                            inputRange: [0, 0.5, 1],
                                            outputRange: [0.8, 1, 0.8]
                                          })
                                        }
                                      ],
                                      opacity: language.micAnimation.interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [0.5, 0.9, 0.5]
                                      })
                                    }
                                  ]}
                                >
                                  <Mic size={18} color="#6366f1" />
                                </Animated.View>
                              </TouchableOpacity>
                            ))
                          ) : (
                            <View style={styles.noLanguagesContainer}>
                              <Text style={styles.noLanguagesText}>
                                No languages available for this station.
                              </Text>
                            </View>
                          )}
                        </ScrollView>
                      )}
                    </>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </ErrorBoundary>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12
  },
  header: {
    position: 'relative',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12
  },
  headerContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 30
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 0,
    letterSpacing: 1.2
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
    marginTop: -4
  },
  frequencyText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#E9D5FF',
    letterSpacing: 2
  },
  mhzText: {
    fontSize: 18,
    fontWeight: '300',
    color: '#E9D5FF',
    marginLeft: 4,
    opacity: 0.9
  },
  stationName: {
    fontSize: 16,
    color: '#FDE68A',
    marginBottom: 10,
    fontWeight: '600'
  },
  headerDescription: {
    fontSize: 16,
    color: '#F3E8FF',
    opacity: 0.9,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.8
  },
  microphoneContainer: {
    position: 'absolute',
    bottom: 5,
    right: 15,
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible'
  },
  microphoneGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10
  },
  microphoneImage: {
    width: 120,
    height: 120,
    opacity: 0.92,
    transform: [{ rotateZ: '-100deg' }],
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 24
  },
  cardsContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 24
  },
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 180,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  cardTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden'
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', // Overlay on entire card
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center'
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%'
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  textContainer: {
    flex: 1
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: Dimensions.get('window').height * 0.7,
    paddingBottom: 16, // Add padding at the bottom for better spacing
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 16
  },
  modalHeaderSpacer: {
    width: 40
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center'
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingLanguagesContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingLanguagesText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center'
  },
  apiErrorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  apiErrorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center'
  },
  languagesList: {
    maxHeight: Dimensions.get('window').height * 0.6
  },
  languagesListContent: {
    flexGrow: 1 // Allow content to grow to fill available space
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
    minHeight: 60, // Minimum height to ensure sufficient tap area
  },
  languageOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastLanguageOption: {
    marginBottom: 0,
    paddingBottom: 16,
  },
  selectedLanguageOption: {
    backgroundColor: '#F3F4F6'
  },
  languageText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: 'normal'
  },
  selectedLanguageText: {
    fontWeight: '600'
  },
  languageMicContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(243, 244, 246, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#6366f1', // Purple-blue border color
  },
  noLanguagesContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  noLanguagesText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center'
  }
});

export default RatingSelectionScreen;