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
  TouchableWithoutFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Music, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useChannel } from '../../../src/context/ChannelContext';
import ErrorBoundary from '../../../components/ErrorBoundary';
import { api } from '../../../src/api/config';
import * as SecureStore from 'expo-secure-store';

// Import interfaces and styles
import { Channel, Language, RatingOption } from './interfaces';
import { styles } from './styles';

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
      image: require('../../../assets/images/rate-announcer.png')
    },
    {
      id: 'program',
      title: 'Rate Program',
      description: 'Evaluate program content and quality',
      icon: <Music size={28} color="#fff" />,
      image: require('../../../assets/images/rate-program.png')
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
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log('[RatingSelection] Languages fetched successfully:', response.data);
        // Add animation value to each language
        const languagesWithAnim = response.data.map(lang => ({
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
                  duration: 1500 + Math.random() * 500, // Randomize timing a bit
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
    } catch (error) {
      console.error('[RatingSelection] Error fetching languages:', error);
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
// const handleLanguageSelect = (language: Language) => {
//   setSelectedLanguage(language);
//   setShowLanguageModal(false);
  
//   // Navigate based on the selected option
//   if (selectedOption?.id === 'announcer') {
//     console.log(`[RatingSelection] Selected ${language.languageName} language for announcer rating`);
    
//     // Navigate to announcer rating page
//     router.push({
//       pathname: "/(app)/rate-announcer",
//       params: {
//         languageId: language.languageId,
//         languageName: language.languageName
//       }
//     });
//   } else if (selectedOption?.id === 'program') {
//     // For program rating, just show an alert for now
//     Alert.alert(
//       "Selection Made",
//       `You selected to rate the program in ${language.languageName} language.`,
//       [{ text: 'OK' }]
//     );
//   }
// };

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
              <Text style={styles.frequencyText}>{frequencyValue}</Text>
              <Text style={styles.mhzText}>MHz</Text>
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
              source={require('../../../assets/images/Microphone-white.png')}
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

export default RatingSelectionScreen;