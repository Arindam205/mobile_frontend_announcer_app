// import React, { useEffect, useState, useRef } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   ScrollView, 
//   Pressable,
//   Animated,
//   BackHandler,
//   Platform,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Radio, ChevronRight } from 'lucide-react-native';
// import { api } from '../../src/api/config';
// import { LinearGradient } from 'expo-linear-gradient';
// import { TouchableOpacity } from 'react-native-gesture-handler';
// import { useRouter } from 'expo-router';
// import { useChannel } from '../../src/context/ChannelContext';

// // Define interfaces
// interface Channel {
//   channelId: number;
//   channelName: string;
//   frequencyDetails: string;
//   description: string;
// }

// interface StationResponse {
//   stationId: string;
//   stationName: string;
//   channels: Channel[];
// }

// // Waveform component
// const WaveformAnimation = () => {
//   // Create animated values for each bar
//   const animations = [
//     useRef(new Animated.Value(0.3)).current,
//     useRef(new Animated.Value(0.5)).current,
//     useRef(new Animated.Value(0.7)).current,
//     useRef(new Animated.Value(0.4)).current,
//     useRef(new Animated.Value(0.6)).current,
//   ];

//   // Animation sequence for each bar
//   useEffect(() => {
//     const createAnimation = (value : Animated.Value) => {
//       return Animated.sequence([
//         Animated.timing(value, {
//           toValue: Math.random() * 0.7 + 0.3, // Random height between 0.3 and 1.0
//           duration: 700 + Math.random() * 500, // Random duration
//           useNativeDriver: false,
//         }),
//         Animated.timing(value, {
//           toValue: Math.random() * 0.5 + 0.2, // Random height between 0.2 and 0.7
//           duration: 700 + Math.random() * 500, // Random duration
//           useNativeDriver: false,
//         })
//       ]);
//     };

//     // Start animations
//     const startAnimations = () => {
//       const animationSequence = animations.map(anim => createAnimation(anim));
//       Animated.parallel(animationSequence).start(() => startAnimations());
//     };

//     startAnimations();

//     return () => {
//       animations.forEach(anim => anim.stopAnimation());
//     };
//   }, []);

//   return (
//     <View style={styles.waveformContainer}>
//       {animations.map((anim, index) => (
//         <Animated.View
//           key={index}
//           style={[
//             styles.waveformBar,
//             {
//               height: anim.interpolate({
//                 inputRange: [0, 1],
//                 outputRange: ['0%', '100%']
//               })
//             }
//           ]}
//         />
//       ))}
//     </View>
//   );
// };

// export default function HomeScreen() {
//   const [stationData, setStationData] = useState<StationResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  
//   const router = useRouter();
//   const { setSelectedChannelData } = useChannel();

//   // Add back button handler to exit app
//   useEffect(() => {
//     const backHandler = BackHandler.addEventListener(
//       'hardwareBackPress',
//       () => {
//         // Exit the app when back button is pressed on home screen
//         if (Platform.OS === 'android') {
//           BackHandler.exitApp();
//         }
//         return true; // Prevent default behavior
//       }
//     );

//     return () => backHandler.remove();
//   }, []);

//   useEffect(() => {
//     fetchChannels();
//   }, []);

//   // Replace the fetchChannels function in app/(app)/home.tsx

// const fetchChannels = async () => {
//   try {
//     setLoading(true);
//     setError(null);
    
//     const response = await api.get('/api/stations/my-channels');
    
//     console.log('[Home] My-channels response status:', response.status);
//     console.log('[Home] My-channels response data:', response.data);
    
//     if (response.status >= 200 && response.status < 300) {
//       // Successful response
//       setStationData(response.data);
//     } else if (response.status >= 400 && response.status < 500) {
//       // Client error - handle gracefully
//       const errorMessage = response.data?.message || 'Failed to load channels';
//       console.log(`[Home] API returned ${response.status}: ${errorMessage}`);
//       setError(errorMessage);
//     } else {
//       // Unexpected status
//       setError(`Unexpected server response: ${response.status}`);
//     }
//   } catch (error: any) {
//     // Only server errors (500+) and network errors reach here
//     console.error('[Home] Server/Network error fetching channels:', error);
//     setError('Failed to load channels. Please try again later.');
//   } finally {
//     setLoading(false);
//   }
// };
  
//   const handleChannelSelect = (channel: Channel, stationName: string) => {
//     // Set selected channel data in context
//     setSelectedChannelData(channel, stationName);
    
//     // Navigate to rating selection screen
//     router.push('/(app)/rating-selection');
//   };

//   const renderChannelCard = (channel: Channel, index: number) => {
//     // Define gradient colors based on index
//     const gradients : [string, string][] = [
//       ['#2563eb', '#1d4ed8'],
//       ['#0ea5e9', '#0369a1'],
//       ['#3b82f6', '#2563eb'],
//       ['#0c4a6e', '#082f49']
//     ];
//     const gradientColors = gradients[index % gradients.length];

//     return (
//       <TouchableOpacity 
//         key={channel.channelId}
//         onPress={() => handleChannelSelect(channel, stationData?.stationName || '')}
//         style={styles.channelCard}
//         activeOpacity={0.8}
//       >
//         <LinearGradient
//           colors={gradientColors}
//           style={styles.gradientBackground}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//         >
//           <View style={styles.channelContent}>
//             <View style={styles.channelInfo}>
//               <Radio size={24} color="rgba(255,255,255,0.8)" />
//               <Text style={styles.channelName}>{channel.channelName}</Text>
//             </View>
//             <Text style={styles.channelFrequency}>{channel.frequencyDetails}</Text>
//             {stationData?.stationName && (
//               <View style={styles.stationBadge}>
//                 <Text style={styles.stationName}>{stationData.stationName}</Text>
//               </View>
//             )}
//           </View>
          
//           <View style={styles.actionContainer}>
//             <WaveformAnimation />
//             <ChevronRight size={24} color="white" style={styles.chevronIcon} />
//           </View>
//         </LinearGradient>
//       </TouchableOpacity>
//     );
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <Text style={styles.loadingText}>Loading channels...</Text>
//       </SafeAreaView>
//     );
//   }

//   if (error) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <Text style={styles.errorText}>{error}</Text>
//         <Pressable onPress={fetchChannels} style={styles.retryButton}>
//           <Text style={styles.retryButtonText}>Retry</Text>
//         </Pressable>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView 
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <Text style={styles.heading}>Rate Announcer and Program</Text>
//         <Text style={styles.subheading}>Select a channel to rate</Text>

//         {stationData?.channels.length ? (
//           <View style={styles.channelsContainer}>
//             {stationData.channels.map((channel, index) => 
//               renderChannelCard(channel, index)
//             )}
//           </View>
//         ) : (
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyText}>No channels available</Text>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f4f4f4',
//   },
//   scrollContent: {
//     padding: 16,
//   },
//   heading: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#111827',
//     marginBottom: 8,
//   },
//   subheading: {
//     fontSize: 16,
//     color: '#6b7280',
//     marginBottom: 24,
//   },
//   channelsContainer: {
//     gap: 16,
//   },
//   channelCard: {
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginBottom: 16,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   gradientBackground: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 20,
//     height: 120,
//   },
//   channelContent: {
//     flex: 1,
//   },
//   channelInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   channelName: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: 'white',
//     marginLeft: 12,
//   },
//   channelFrequency: {
//     fontSize: 12,
//     color: 'rgba(255,255,255,0.8)',
//     marginLeft: 36,
//     marginTop: 4,
//   },
//   stationBadge: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 6,
//     alignSelf: 'flex-start',
//     marginTop: 12,
//   },
//   stationName: {
//     fontSize: 13,
//     color: 'white',
//   },
//   actionContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     flexDirection: 'row',
//   },
//   waveformContainer: {
//     flexDirection: 'row',
//     height: 40,
//     alignItems: 'flex-end',
//     marginRight: 12,
//   },
//   waveformBar: {
//     width: 4,
//     backgroundColor: 'rgba(255, 255, 255, 0.8)',
//     marginHorizontal: 1.5,
//     borderRadius: 2,
//   },
//   chevronIcon: {
//     marginLeft: 5,
//   },
//   loadingText: {
//     textAlign: 'center',
//     marginTop: 50,
//     fontSize: 18,
//     color: '#6b7280',
//   },
//   errorText: {
//     textAlign: 'center',
//     marginTop: 50,
//     fontSize: 18,
//     color: 'red',
//   },
//   retryButton: {
//     backgroundColor: '#2563eb',
//     padding: 12,
//     borderRadius: 8,
//     alignSelf: 'center',
//     marginTop: 16,
//   },
//   retryButtonText: {
//     color: 'white',
//     fontSize: 16,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 50,
//   },
//   emptyText: {
//     fontSize: 18,
//     color: '#6b7280',
//   },
// });


import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Animated,
  BackHandler,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radio, ChevronRight, Play, Pause, WifiOff, AlertCircle } from 'lucide-react-native';
import { api } from '../../src/api/config';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useChannel } from '../../src/context/ChannelContext';
import TrackPlayer, {
  Capability,
  usePlaybackState,
  State,
  AppKilledPlaybackBehavior,
  Event,
  useTrackPlayerEvents,
  TrackType
} from 'react-native-track-player';
import NetInfo from '@react-native-community/netinfo';

// Enhanced interfaces with streamKey
interface Channel {
  channelId: number;
  channelName: string;
  frequencyDetails: string;
  description: string;
  streamKey: string; // New streaming URL field
}

interface Language {
  languageId: number;
  languageName: string;
}

interface StationResponse {
  stationId: string;
  stationName: string;
  channels: Channel[];
  languages: Language[];
}

// Error Toast Component
const ErrorToast = ({ 
  visible, 
  message, 
  type = 'error',
  onDismiss 
}: {
  visible: boolean;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onDismiss: () => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(onDismiss);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'warning':
        return { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' };
      case 'info':
        return { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' };
      default:
        return { backgroundColor: '#FEE2E2', borderColor: '#EF4444' };
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return '#F59E0B';
      case 'info':
        return '#3B82F6';
      default:
        return '#EF4444';
    }
  };

  return (
    <Animated.View
      style={[
        styles.errorToast,
        getToastStyle(),
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {type === 'error' && <WifiOff size={20} color={getIconColor()} />}
      {type === 'warning' && <AlertCircle size={20} color={getIconColor()} />}
      <Text style={[styles.errorToastText, { color: getIconColor() }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

// Enhanced Channel Card with Play/Pause Button
const EnhancedChannelCard = ({ 
  channel, 
  index, 
  onChannelSelect,
  onStreamToggle,
  isCurrentlyPlaying,
  isCurrentlyBuffering,
  playbackState,
  stationName
}: {
  channel: Channel;
  index: number;
  onChannelSelect: (channel: Channel, stationName: string) => void;
  onStreamToggle: (channel: Channel) => void;
  isCurrentlyPlaying: boolean;
  isCurrentlyBuffering: boolean;
  playbackState: any;
  stationName: string;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for buffering
  useEffect(() => {
    if (isCurrentlyBuffering) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isCurrentlyBuffering]);

  // Rotation animation for playing
  useEffect(() => {
    if (isCurrentlyPlaying) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isCurrentlyPlaying]);

  // Define gradient colors based on index
  const gradients: [string, string][] = [
    ['#2563eb', '#1d4ed8'],
    ['#0ea5e9', '#0369a1'],
    ['#3b82f6', '#2563eb'],
    ['#0c4a6e', '#082f49']
  ];
  const gradientColors = gradients[index % gradients.length];

  const handlePress = () => {
    if (channel.streamKey) {
      onStreamToggle(channel);
    } else {
      onChannelSelect(channel, stationName);
    }
  };

  const renderPlayButton = () => {
    if (isCurrentlyBuffering) {
      return (
        <View style={styles.playButtonContainer}>
          <ActivityIndicator size={24} color="white" />
        </View>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.playButtonContainer}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {isCurrentlyPlaying ? (
          <Pause size={24} color="white" fill="white" />
        ) : (
          <Play size={24} color="white" fill="white" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View
      style={[
        styles.channelCard,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.channelContent}>
          <View style={styles.channelInfo}>
            <Animated.View
              style={[
                styles.radioIconContainer,
                {
                  transform: [
                    {
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Radio size={24} color="rgba(255,255,255,0.8)" />
            </Animated.View>
            <View style={styles.channelTextInfo}>
              <Text style={styles.channelName}>{channel.channelName}</Text>
              <Text style={styles.channelFrequency}>{channel.frequencyDetails}</Text>
              {!channel.streamKey && (
                <Text style={styles.noStreamText}>Audio not available</Text>
              )}
            </View>
          </View>
          
          <View style={styles.stationBadge}>
            <Text style={styles.stationName}>{stationName}</Text>
          </View>
        </View>
        
        <View style={styles.actionContainer}>
          {channel.streamKey ? (
            renderPlayButton()
          ) : (
            <TouchableOpacity 
              style={styles.infoButtonContainer}
              onPress={() => onChannelSelect(channel, stationName)}
              activeOpacity={0.8}
            >
              <ChevronRight size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const [stationData, setStationData] = useState<StationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPlayingChannel, setCurrentPlayingChannel] = useState<number | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [networkConnected, setNetworkConnected] = useState(true);
  const [errorToast, setErrorToast] = useState<{
    visible: boolean;
    message: string;
    type: 'error' | 'warning' | 'info';
  }>({
    visible: false,
    message: '',
    type: 'error',
  });
  
  const router = useRouter();
  const { setSelectedChannelData } = useChannel();
  const playbackState = usePlaybackState();

  // Network monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected === true && state.isInternetReachable !== false;
      setNetworkConnected(isConnected);

      if (!isConnected) {
        showErrorToast('No internet connection. Please check your network.', 'error');
      }
    });

    return () => unsubscribe();
  }, []);

  // Add back button handler to exit app
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (Platform.OS === 'android') {
          BackHandler.exitApp();
        }
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  // Track player events
  useTrackPlayerEvents([Event.PlaybackError, Event.PlaybackState], async (event) => {
    if (event.type === Event.PlaybackError) {
      console.error('[HomeScreen] Playback Error:', event);
      setIsBuffering(false);
      showErrorToast('Streaming error occurred. Please try again.', 'error');
    }
    
    if (event.type === Event.PlaybackState) {
      console.log('[HomeScreen] Playback State Changed:', event.state);
      
      switch (event.state) {
        case State.Playing:
          setIsBuffering(false);
          break;
        case State.Paused:
        case State.Stopped:
          setIsBuffering(false);
          break;
        case State.Buffering:
        case State.Loading:
          setIsBuffering(true);
          break;
        default:
          setIsBuffering(false);
      }
    }
  });

  // Initialize player
  useEffect(() => {
    initializePlayer();
    
    return () => {
      // Cleanup on unmount
      if ((global as any).trackPlayerServiceControls?.stopFromApp) {
        (global as any).trackPlayerServiceControls.stopFromApp();
      }
    };
  }, []);

  const initializePlayer = async () => {
    try {
      const isSetup = await TrackPlayer.isServiceRunning();
      if (!isSetup) {
        await TrackPlayer.setupPlayer({
          maxCacheSize: 1024 * 15,
          waitForBuffer: true,
          autoHandleInterruptions: true,
          autoUpdateMetadata: true,
        });

        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
          ],
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
          ],
          android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            alwaysPauseOnInterruption: false,
          },
          color: 0x3b82f6,
          progressUpdateEventInterval: 5,
        });
      }
    } catch (error) {
      console.error('[HomeScreen] Player initialization error:', error);
    }
  };

  const showErrorToast = (message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    setErrorToast({ visible: true, message, type });
  };

  const hideErrorToast = () => {
    setErrorToast(prev => ({ ...prev, visible: false }));
  };

  // Helper function to create fresh stream URL
  const createFreshStreamUrl = async (baseUrl: string): Promise<string> => {
    try {
      const url = new URL(baseUrl);
      url.searchParams.set('_t', Date.now().toString());
      url.searchParams.set('_cb', Math.random().toString(36).substring(2, 15));
      url.searchParams.set('_v', '3.0.0');
      return url.toString();
    } catch (error) {
      console.error('[HomeScreen] Error creating fresh URL:', error);
      return `${baseUrl}?_t=${Date.now()}&_cb=${Math.random().toString(36).substring(2, 15)}`;
    }
  };

  // Stream toggle function
  const handleStreamToggle = async (channel: Channel) => {
    if (!networkConnected) {
      showErrorToast('No internet connection. Please check your network.', 'error');
      return;
    }

    if (!channel.streamKey) {
      showErrorToast('Audio streaming not available for this channel.', 'warning');
      return;
    }

    try {
      const currentState = await TrackPlayer.getPlaybackState();
      
      // If this channel is already playing, pause it
      if (currentPlayingChannel === channel.channelId && currentState.state === State.Playing) {
        await TrackPlayer.pause();
        setCurrentPlayingChannel(null);
        return;
      }

      setIsBuffering(true);
      setCurrentPlayingChannel(channel.channelId);

      // Stop any current playback and reset
      await TrackPlayer.stop();
      await TrackPlayer.reset();

      // Create fresh stream URL
      const freshStreamUrl = await createFreshStreamUrl(channel.streamKey);

      // Add new track
      await TrackPlayer.add({
        id: `channel-${channel.channelId}-${Date.now()}`,
        url: freshStreamUrl,
        title: channel.channelName,
        artist: stationData?.stationName || 'AIR Radio',
        artwork: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/All_India_Radio_Logo.svg/1200px-All_India_Radio_Logo.svg.png',
        type: TrackType.HLS,
        isLiveStream: true,
        duration: 0,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          'Accept': 'application/vnd.apple.mpegurl, application/x-mpegurl, audio/x-mpegurl, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Referer': 'https://akashvani.gov.in/',
          'Origin': 'https://akashvani.gov.in',
        },
      });

      // Start playback
      await TrackPlayer.play();
      
    } catch (error) {
      console.error('[HomeScreen] Stream toggle error:', error);
      setIsBuffering(false);
      setCurrentPlayingChannel(null);
      showErrorToast('Failed to start streaming. Please try again.', 'error');
    }
  };

  // Fetch channels
  const fetchChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/stations/my-channels');
      
      console.log('[Home] My-channels response status:', response.status);
      console.log('[Home] My-channels response data:', response.data);
      
      if (response.status >= 200 && response.status < 300) {
        setStationData(response.data);
      } else if (response.status >= 400 && response.status < 500) {
        const errorMessage = response.data?.message || 'Failed to load channels';
        console.log(`[Home] API returned ${response.status}: ${errorMessage}`);
        setError(errorMessage);
      } else {
        setError(`Unexpected server response: ${response.status}`);
      }
    } catch (error: any) {
      console.error('[Home] Server/Network error fetching channels:', error);
      setError('Failed to load channels. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChannelSelect = (channel: Channel, stationName: string) => {
    setSelectedChannelData(channel, stationName);
    router.push('/(app)/rating-selection');
  };

  // Load data on mount
  useEffect(() => {
    fetchChannels();
  }, []);

  const isChannelPlaying = (channelId: number) => {
    return currentPlayingChannel === channelId && playbackState?.state === State.Playing;
  };

  const isChannelBuffering = (channelId: number) => {
    return currentPlayingChannel === channelId && isBuffering;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading channels...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={fetchChannels} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ErrorToast
        visible={errorToast.visible}
        message={errorToast.message}
        type={errorToast.type}
        onDismiss={hideErrorToast}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Live Radio Streams</Text>
        <Text style={styles.subheading}>Tap play to stream • Tap rate to evaluate</Text>

        {stationData?.channels.length ? (
          <View style={styles.channelsContainer}>
            {stationData.channels.map((channel, index) => (
              <EnhancedChannelCard
                key={channel.channelId}
                channel={channel}
                index={index}
                onChannelSelect={handleChannelSelect}
                onStreamToggle={handleStreamToggle}
                isCurrentlyPlaying={isChannelPlaying(channel.channelId)}
                isCurrentlyBuffering={isChannelBuffering(channel.channelId)}
                playbackState={playbackState}
                stationName={stationData.stationName}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No channels available</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  channelsContainer: {
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
  },
  channelCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradientBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 120,
  },
  channelContent: {
    flex: 1,
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioIconContainer: {
    marginRight: 12,
  },
  channelTextInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  channelFrequency: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  noStreamText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    marginTop: 2,
  },
  stationBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  stationName: {
    fontSize: 13,
    color: 'white',
    fontWeight: '500',
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  infoButtonContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorToast: {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  errorToastText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});