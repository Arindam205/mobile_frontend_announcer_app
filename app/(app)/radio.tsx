// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Animated,
//   Easing,
//   AppState,
//   Alert,
//   Platform,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Play, Square, Volume2, VolumeX, Radio as RadioIcon, RefreshCw, Wifi, WifiOff } from 'lucide-react-native';
// import TrackPlayer, {
//   Capability,
//   State,
//   usePlaybackState,
//   Event,
//   AppKilledPlaybackBehavior,
// } from 'react-native-track-player';
// import NetInfo from '@react-native-community/netinfo';
// import { NetworkMonitor, StreamValidator } from '../../src/utils/networkUtils';
// import * as Linking from 'expo-linking';
// import { URLHandler, createRadioURLHandler } from '../../src/utils/urlHandler';

// // Enhanced stream configuration with health tracking
// const RADIO_STREAMS = [
//   {
//     id: 'fm-ujjayanta-primary',
//     name: 'FM Ujjayanta Agartala',
//     url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/playlist.m3u8',
//     frequency: '103.7 FM',
//     location: 'Agartala, Tripura',
//     type: 'hls'
//   },
//   {
//     id: 'fm-ujjayanta-backup',
//     name: 'FM Ujjayanta Agartala',
//     url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/chunklist.m3u8',
//     frequency: '103.7 FM',
//     location: 'Agartala, Tripura',
//     type: 'hls'
//   },
// ];

// // Connection status constants
// const CONNECTION_STATUS = {
//   DISCONNECTED: 'disconnected',
//   CONNECTING: 'connecting',
//   BUFFERING: 'buffering',
//   PLAYING: 'playing',
//   ERROR: 'error',
//   NO_NETWORK: 'no_network',
//   RETRYING: 'retrying',
//   CHECKING_HEALTH: 'checking_health'
// };

// // Audio visualizer component
// const AudioVisualizer = ({ isPlaying }: { isPlaying: boolean }) => {
//   const bars = Array.from({ length: 5 }, () => useRef(new Animated.Value(0.3)).current);

//   useEffect(() => {
//     if (isPlaying) {
//       const animations = bars.map((bar) => {
//         return Animated.loop(
//           Animated.sequence([
//             Animated.timing(bar, {
//               toValue: Math.random() * 0.7 + 0.3,
//               duration: 300 + Math.random() * 200,
//               useNativeDriver: true,
//             }),
//             Animated.timing(bar, {
//               toValue: Math.random() * 0.5 + 0.2,
//               duration: 300 + Math.random() * 200,
//               useNativeDriver: true,
//             }),
//           ])
//         );
//       });

//       animations.forEach((anim, index) => {
//         setTimeout(() => anim.start(), index * 100);
//       });

//       return () => {
//         animations.forEach(anim => anim.stop());
//       };
//     } else {
//       bars.forEach(bar => {
//         Animated.timing(bar, {
//           toValue: 0.2,
//           duration: 200,
//           useNativeDriver: true,
//         }).start();
//       });
//     }
//   }, [isPlaying]);

//   return (
//     <View style={styles.visualizerContainer}>
//       {bars.map((bar, index) => (
//         <Animated.View
//           key={index}
//           style={[
//             styles.visualizerBar,
//             {
//               transform: [{ scaleY: bar }],
//             },
//           ]}
//         />
//       ))}
//     </View>
//   );
// };

// // Radio wave animation component
// const RadioWaveAnimation = ({ isPlaying }: { isPlaying: boolean }) => {
//   const wave1 = useRef(new Animated.Value(0)).current;
//   const wave2 = useRef(new Animated.Value(0)).current;
//   const wave3 = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     if (isPlaying) {
//       const createWaveAnimation = (value: Animated.Value) => {
//         return Animated.loop(
//           Animated.sequence([
//             Animated.timing(value, {
//               toValue: 1,
//               duration: 2000,
//               easing: Easing.out(Easing.ease),
//               useNativeDriver: true,
//             }),
//             Animated.timing(value, {
//               toValue: 0,
//               duration: 0,
//               useNativeDriver: true,
//             }),
//           ])
//         );
//       };

//       const anim1 = createWaveAnimation(wave1);
//       const anim2 = createWaveAnimation(wave2);
//       const anim3 = createWaveAnimation(wave3);

//       anim1.start();
//       setTimeout(() => anim2.start(), 400);
//       setTimeout(() => anim3.start(), 800);

//       return () => {
//         anim1.stop();
//         anim2.stop();
//         anim3.stop();
//       };
//     } else {
//       wave1.setValue(0);
//       wave2.setValue(0);
//       wave3.setValue(0);
//     }
//   }, [isPlaying]);

//   const createWaveStyle = (wave: Animated.Value) => ({
//     opacity: wave.interpolate({
//       inputRange: [0, 0.5, 1],
//       outputRange: [0.8, 0.4, 0],
//     }),
//     transform: [
//       {
//         scale: wave.interpolate({
//           inputRange: [0, 1],
//           outputRange: [1, 2.5],
//         }),
//       },
//     ],
//   });

//   return (
//     <View style={styles.waveContainer}>
//       <Animated.View style={[styles.wave, createWaveStyle(wave1)]} />
//       <Animated.View style={[styles.wave, createWaveStyle(wave2)]} />
//       <Animated.View style={[styles.wave, createWaveStyle(wave3)]} />
//     </View>
//   );
// };

// export default function EnhancedRadioScreen() {
//   const playbackState = usePlaybackState();
  
//   // Enhanced state management
//   const [isLoading, setIsLoading] = useState(false);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isTrackPlayerReady, setIsTrackPlayerReady] = useState(false);
//   const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
//   const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.DISCONNECTED);
//   const [retryCount, setRetryCount] = useState(0);
//   const [networkConnected, setNetworkConnected] = useState(true);
//   const [streamMetadata, setStreamMetadata] = useState<any>(null);
//   const [streamHealthStatus, setStreamHealthStatus] = useState<Record<string, any>>({});
//   const [isCheckingStreamHealth, setIsCheckingStreamHealth] = useState(false);

//   // Animation values
//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const rotateAnim = useRef(new Animated.Value(0)).current;

//   // Refs for cleanup and URL handling
//   const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
//   const radioControllerRef = useRef<any>(null);

//   // Get current stream
//   const currentStream = RADIO_STREAMS[currentStreamIndex];

//   // Create radio controller for URL handling
//   useEffect(() => {
//     radioControllerRef.current = createRadioURLHandler({ current: radioControllerRef });
//   }, []);

//   // URL handling setup
//   useEffect(() => {
//     const handleInitialURL = async () => {
//       try {
//         const initialURL = await Linking.getInitialURL();
//         if (initialURL) {
//           console.log('[Radio] Initial URL:', initialURL);
//           await URLHandler.handleIncomingURL(initialURL, radioControllerRef.current);
//         }
//       } catch (error) {
//         console.error('[Radio] Error handling initial URL:', error);
//       }
//     };

//     const handleURL = async (event: { url: string }) => {
//       console.log('[Radio] Incoming URL:', event.url);
//       await URLHandler.handleIncomingURL(event.url, radioControllerRef.current);
//     };

//     handleInitialURL();
//     const subscription = Linking.addEventListener('url', handleURL);

//     return () => {
//       subscription?.remove();
//     };
//   }, []);

//   // Expose methods for URL handler
//   useEffect(() => {
//     if (radioControllerRef.current) {
//       radioControllerRef.current.handlePlay = handlePlayWithHealthCheck;
//       radioControllerRef.current.handleStop = handleStop;
//       radioControllerRef.current.playCustomStream = playCustomStream;
//     }
//   }, []);

//   // Network monitoring
//   useEffect(() => {
//     const unsubscribe = NetInfo.addEventListener(state => {
//       console.log('[Radio] Network state:', state.isConnected, state.type);
//       setNetworkConnected(!!state.isConnected);
      
//       if (!state.isConnected) {
//         setConnectionStatus(CONNECTION_STATUS.NO_NETWORK);
//         handleStop();
//       } else if (connectionStatus === CONNECTION_STATUS.NO_NETWORK) {
//         setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
//       }
//     });

//     return () => unsubscribe();
//   }, [connectionStatus]);

//   // Initialize everything
//   useEffect(() => {
//     setupTrackPlayer();
//     setupEventListeners();
//     checkAllStreamsHealth();
    
//     const subscription = AppState.addEventListener('change', handleAppStateChange);
    
//     return () => {
//       subscription?.remove();
//       cleanupTrackPlayer();
//       if (retryTimeoutRef.current) {
//         clearTimeout(retryTimeoutRef.current);
//       }
//       if (healthCheckIntervalRef.current) {
//         clearInterval(healthCheckIntervalRef.current);
//       }
//     };
//   }, []);

//   // Pulse animation for the radio icon
//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, {
//           toValue: 1.1,
//           duration: 1000,
//           easing: Easing.inOut(Easing.ease),
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: 1000,
//           easing: Easing.inOut(Easing.ease),
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, []);

//   // Rotation animation
//   useEffect(() => {
//     Animated.loop(
//       Animated.timing(rotateAnim, {
//         toValue: 1,
//         duration: 20000,
//         easing: Easing.linear,
//         useNativeDriver: true,
//       })
//     ).start();
//   }, []);

//   // Periodic health check
//   useEffect(() => {
//     healthCheckIntervalRef.current = setInterval(() => {
//       if (!isLoading && connectionStatus === CONNECTION_STATUS.DISCONNECTED) {
//         console.log('[Radio] Running periodic stream health check');
//         checkAllStreamsHealth();
//       }
//     }, 5 * 60 * 1000); // Every 5 minutes

//     return () => {
//       if (healthCheckIntervalRef.current) {
//         clearInterval(healthCheckIntervalRef.current);
//       }
//     };
//   }, [isLoading, connectionStatus]);

//   const setupTrackPlayer = async () => {
//     try {
//       console.log('[Radio] Setting up TrackPlayer...');
      
//       await TrackPlayer.setupPlayer({
//         waitForBuffer: false,
//         autoHandleInterruptions: true,
//         maxCacheSize: 2048,
//         minBuffer: 15,
//         maxBuffer: 50,
//         playBuffer: 2.5,
//         backBuffer: 0,
//       });

//       await TrackPlayer.updateOptions({
//         capabilities: [
//           Capability.Play,
//           Capability.Stop,
//         ],
//         compactCapabilities: [
//           Capability.Play,
//           Capability.Stop,
//         ],
//         notificationCapabilities: [
//           Capability.Play,
//           Capability.Stop,
//         ],
//         progressUpdateEventInterval: 2,
//         android: {
//           appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
//           alwaysPauseOnInterruption: true,
//         },
//       });

//       setIsTrackPlayerReady(true);
//       setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
//       console.log('[Radio] TrackPlayer setup completed');
//     } catch (error) {
//       console.error('[Radio] Error setting up track player:', error);
//       setConnectionStatus(CONNECTION_STATUS.ERROR);
//     }
//   };

//   const setupEventListeners = () => {
//     const playbackStateListener = TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
//       console.log('[Radio] Playback state changed:', data.state);
      
//       switch (data.state) {
//         case State.Playing:
//           setIsLoading(false);
//           setConnectionStatus(CONNECTION_STATUS.PLAYING);
//           setRetryCount(0);
//           break;
//         case State.Buffering:
//         case State.Connecting:
//           setConnectionStatus(CONNECTION_STATUS.BUFFERING);
//           break;
//         case State.Error:
//           console.log('[Radio] Playback error detected');
//           setConnectionStatus(CONNECTION_STATUS.ERROR);
//           handleConnectionError();
//           break;
//         case State.Stopped:
//           setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
//           setIsLoading(false);
//           break;
//       }
//     });

//     const errorListener = TrackPlayer.addEventListener(Event.PlaybackError, (data) => {
//       console.error('[Radio] Playback error event:', data);
//       setConnectionStatus(CONNECTION_STATUS.ERROR);
//       handleConnectionError();
//     });

//     const metadataListener = TrackPlayer.addEventListener(Event.PlaybackMetadataReceived as any, (data) => {
//       console.log('[Radio] Stream metadata:', data);
//       setStreamMetadata(data);
//     });

//     const trackChangedListener = TrackPlayer.addEventListener(Event.PlaybackTrackChanged, (data) => {
//       console.log('[Radio] Track changed:', data);
//     });

//     return () => {
//       playbackStateListener.remove();
//       errorListener.remove();
//       metadataListener.remove();
//       trackChangedListener.remove();
//     };
//   };

//   // Check all streams health
//   const checkAllStreamsHealth = async () => {
//     setIsCheckingStreamHealth(true);
//     const healthResults: Record<string, any> = {};

//     for (let i = 0; i < RADIO_STREAMS.length; i++) {
//       const stream = RADIO_STREAMS[i];
//       try {
//         const health = await StreamValidator.checkStreamHealth(stream.url);
//         healthResults[stream.id] = health;
//         console.log(`[Radio] Stream ${stream.id} health:`, health);
//       } catch (error: any) {
//         console.error(`[Radio] Health check failed for ${stream.id}:`, error);
//         healthResults[stream.id] = { isHealthy: false, error: error.message, timestamp: new Date().toISOString() };
//       }
//     }

//     setStreamHealthStatus(healthResults);
//     setIsCheckingStreamHealth(false);
//   };

//   // Find healthy stream
//   const findHealthyStream = async (): Promise<number> => {
//     for (let i = 0; i < RADIO_STREAMS.length; i++) {
//       if (i === currentStreamIndex) continue;
      
//       console.log(`[Radio] Testing stream ${i}: ${RADIO_STREAMS[i].url}`);
//       const health = await StreamValidator.checkStreamHealth(RADIO_STREAMS[i].url);
      
//       if (health.isHealthy) {
//         return i;
//       }
//     }
//     return -1;
//   };

//   // Enhanced connection error handler
//   const handleConnectionError = async () => {
//     if (!networkConnected) {
//       setConnectionStatus(CONNECTION_STATUS.NO_NETWORK);
//       return;
//     }

//     console.log('[Radio] Connection error - checking stream health');
    
//     // Check if current stream is still healthy
//     const currentStreamHealth = await StreamValidator.checkStreamHealth(currentStream.url);
    
//     if (!currentStreamHealth.isHealthy) {
//       console.log('[Radio] Current stream is unhealthy, looking for alternatives');
      
//       const healthyStreamIndex = await findHealthyStream();
      
//       if (healthyStreamIndex !== -1) {
//         setCurrentStreamIndex(healthyStreamIndex);
//         setRetryCount(0);
//         setTimeout(retryConnection, 1000);
//         return;
//       }
//     }

//     // Normal retry logic with exponential backoff
//     const maxRetries = 3;
//     const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);

//     if (retryCount < maxRetries) {
//       setConnectionStatus(CONNECTION_STATUS.RETRYING);
      
//       retryTimeoutRef.current = setTimeout(() => {
//         setRetryCount(prev => prev + 1);
//         retryConnection();
//       }, backoffDelay);
//     } else if (currentStreamIndex < RADIO_STREAMS.length - 1) {
//       console.log('[Radio] Switching to backup stream');
//       setCurrentStreamIndex(prev => prev + 1);
//       setRetryCount(0);
//       setTimeout(retryConnection, 1000);
//     } else {
//       setIsLoading(false);
//       setConnectionStatus(CONNECTION_STATUS.ERROR);
//       Alert.alert(
//         'Connection Failed',
//         'Unable to connect to radio stream. Please check your internet connection and try again.',
//         [
//           { text: 'Check Streams', onPress: checkAllStreamsHealth },
//           { text: 'Retry', onPress: handleRetryFromBeginning },
//           { text: 'Cancel', style: 'cancel' }
//         ]
//       );
//     }
//   };

//   const handleRetryFromBeginning = () => {
//     setCurrentStreamIndex(0);
//     setRetryCount(0);
//     retryConnection();
//   };

//   const retryConnection = async () => {
//     if (!isTrackPlayerReady || !networkConnected) return;
    
//     console.log(`[Radio] Retrying connection - stream ${currentStreamIndex + 1}/${RADIO_STREAMS.length}, attempt ${retryCount + 1}`);
    
//     try {
//       await handleStop();
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       setIsLoading(true);
//       setConnectionStatus(CONNECTION_STATUS.CONNECTING);
//       await addTrack();
//       await TrackPlayer.play();
//     } catch (error) {
//       console.error('[Radio] Error during retry:', error);
//       handleConnectionError();
//     }
//   };

//   const cleanupTrackPlayer = async () => {
//     try {
//       await TrackPlayer.stop();
//       await TrackPlayer.reset();
//       console.log('[Radio] TrackPlayer cleaned up');
//     } catch (error) {
//       console.error('[Radio] Error cleaning up track player:', error);
//     }
//   };

//   const handleAppStateChange = (nextAppState: string) => {
//     if (nextAppState === 'active') {
//       checkPlaybackStatus();
//     }
//   };

//   const checkPlaybackStatus = async () => {
//     try {
//       const state = await TrackPlayer.getPlaybackState();
//       if (state.state === State.Error) {
//         retryConnection();
//       }
//     } catch (error) {
//       console.error('[Radio] Error checking playback status:', error);
//     }
//   };

//   const addTrack = async (streamUrl = currentStream) => {
//     try {
//       await TrackPlayer.reset();
      
//       console.log(`[Radio] Adding track: ${streamUrl.url}`);
      
//       await TrackPlayer.add({
//         id: streamUrl.id,
//         url: streamUrl.url,
//         title: streamUrl.name,
//         artist: streamUrl.location,
//         isLiveStream: true,
//         headers: {
//           'User-Agent': 'RAISE-RadioApp/3.0 (Android; Mobile)',
//           'Accept': 'application/vnd.apple.mpegurl, */*',
//           'Connection': 'keep-alive',
//           'Cache-Control': 'no-cache',
//           'Pragma': 'no-cache',
//           'Referer': 'https://akashvani.gov.in',
//           ...(Platform.OS === 'android' && {
//             'Accept-Encoding': 'identity',
//           })
//         },
//         contentType: streamUrl.type === 'hls' ? 'application/vnd.apple.mpegurl' : 'audio/mpeg',
//       });
      
//       console.log('[Radio] Track added successfully');
//     } catch (error) {
//       console.error('[Radio] Error adding track:', error);
//       throw error;
//     }
//   };

//   // Enhanced play/stop handler with health check
//   const handlePlayStop = async () => {
//     if (!isTrackPlayerReady) {
//       Alert.alert('Player Not Ready', 'Please wait for the player to initialize.');
//       return;
//     }

//     if (!networkConnected) {
//       Alert.alert('No Internet', 'Please check your internet connection.');
//       return;
//     }

//     try {
//       const state = await TrackPlayer.getPlaybackState();
      
//       if (state.state === State.Playing) {
//         await handleStop();
//       } else {
//         await handlePlayWithHealthCheck();
//       }
//     } catch (error) {
//       console.error('[Radio] Error in play/stop:', error);
//       setIsLoading(false);
//       handleConnectionError();
//     }
//   };

//   const handlePlayWithHealthCheck = async () => {
//     setIsLoading(true);
//     setConnectionStatus(CONNECTION_STATUS.CHECKING_HEALTH);

//     try {
//       // Check if current stream is healthy
//       const currentStreamHealth = await StreamValidator.checkStreamHealth(currentStream.url);
      
//       if (!currentStreamHealth.isHealthy) {
//         console.log('[Radio] Current stream unhealthy, trying backup streams');
        
//         const healthyStreamIndex = await findHealthyStream();
        
//         if (healthyStreamIndex !== -1) {
//           setCurrentStreamIndex(healthyStreamIndex);
//           console.log(`[Radio] Switched to healthy stream: ${RADIO_STREAMS[healthyStreamIndex].url}`);
//         } else {
//           throw new Error('No healthy streams available');
//         }
//       }

//       setConnectionStatus(CONNECTION_STATUS.CONNECTING);
      
//       const queue = await TrackPlayer.getQueue();
//       if (queue.length === 0) {
//         await addTrack(RADIO_STREAMS[currentStreamIndex]);
//       }
      
//       await TrackPlayer.play();
      
//     } catch (error: any) {
//       console.error('[Radio] Error in health-checked play:', error);
//       setIsLoading(false);
//       setConnectionStatus(CONNECTION_STATUS.ERROR);
//       Alert.alert(
//         'Stream Unavailable', 
//         'Radio stream is currently unavailable. Please try again later.',
//         [{ text: 'OK' }]
//       );
//     }
//   };

//   const handleStop = async () => {
//     await TrackPlayer.stop();
//     await TrackPlayer.reset();
//     setIsLoading(false);
//     setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
//   };

//   // Custom stream playback for URL handling
//   const playCustomStream = async (streamUrl: string) => {
//     try {
//       console.log('[Radio] Playing custom stream:', streamUrl);
      
//       // Validate the custom stream
//       const validation = StreamValidator.validateHLSUrl(streamUrl);
//       if (!validation) {
//         throw new Error('Invalid stream URL format');
//       }

//       // Check health of custom stream
//       const health = await StreamValidator.checkStreamHealth(streamUrl);
//       if (!health.isHealthy) {
//         throw new Error('Custom stream is not available');
//       }

//       // Stop current playback
//       await handleStop();

//       // Create temporary stream object
//       const customStream = {
//         id: 'custom-stream',
//         name: 'External Stream',
//         url: streamUrl,
//         frequency: 'Custom',
//         location: 'External Source',
//         type: 'hls'
//       };

//       setIsLoading(true);
//       setConnectionStatus(CONNECTION_STATUS.CONNECTING);
      
//       await addTrack(customStream);
//       await TrackPlayer.play();

//     } catch (error: any) {
//       console.error('[Radio] Error playing custom stream:', error);
//       setIsLoading(false);
//       setConnectionStatus(CONNECTION_STATUS.ERROR);
//       Alert.alert(
//         'Stream Error',
//         `Cannot play external stream: ${error.message}`,
//         [{ text: 'OK' }]
//       );
//     }
//   };

//   const toggleMute = async () => {
//     try {
//       const volume = isMuted ? 1 : 0;
//       await TrackPlayer.setVolume(volume);
//       setIsMuted(!isMuted);
//     } catch (error) {
//       console.error('[Radio] Error toggling mute:', error);
//     }
//   };

//   // Get status info
//   const getStatusInfo = () => {
//     switch (connectionStatus) {
//       case CONNECTION_STATUS.CHECKING_HEALTH:
//         return { text: 'Checking stream...', color: '#f59e0b' };
//       case CONNECTION_STATUS.CONNECTING:
//         return { text: 'Connecting...', color: '#f59e0b' };
//       case CONNECTION_STATUS.BUFFERING:
//         return { text: 'Buffering...', color: '#f59e0b' };
//       case CONNECTION_STATUS.PLAYING:
//         return { text: '🔴 Live', color: '#10b981' };
//       case CONNECTION_STATUS.DISCONNECTED:
//         return { text: 'Ready to Play', color: '#6b7280' };
//       case CONNECTION_STATUS.RETRYING:
//         return { text: `Retrying... (${retryCount + 1}/3)`, color: '#f59e0b' };
//       case CONNECTION_STATUS.ERROR:
//         return { text: 'Connection Error', color: '#ef4444' };
//       case CONNECTION_STATUS.NO_NETWORK:
//         return { text: 'No Internet', color: '#ef4444' };
//       default:
//         return { text: 'Ready to Play', color: '#6b7280' };
//     }
//   };

//   // Render stream health indicator
//   const renderStreamHealthIndicator = () => {
//     const currentStreamHealth = streamHealthStatus[currentStream?.id];
    
//     if (isCheckingStreamHealth) {
//       return (
//         <View style={styles.healthIndicator}>
//           <ActivityIndicator size="small" color="#f59e0b" />
//           <Text style={styles.healthText}>Checking stream...</Text>
//         </View>
//       );
//     }

//     if (!currentStreamHealth) return null;

//     return (
//       <View style={styles.healthIndicator}>
//         <View style={[
//           styles.healthDot, 
//           { backgroundColor: currentStreamHealth.isHealthy ? '#10b981' : '#ef4444' }
//         ]} />
//         <Text style={styles.healthText}>
//           Stream {currentStreamHealth.isHealthy ? 'Healthy' : 'Issues Detected'}
//         </Text>
//       </View>
//     );
//   };

//   const statusInfo = getStatusInfo();
//   const isPlaying = playbackState?.state === State.Playing;
//   const isBuffering = connectionStatus === CONNECTION_STATUS.BUFFERING || 
//                      connectionStatus === CONNECTION_STATUS.CONNECTING ||
//                      connectionStatus === CONNECTION_STATUS.CHECKING_HEALTH;

//   return (
//     <SafeAreaView style={styles.container}>
//       <LinearGradient
//         colors={['#3b82f6', '#8b5cf6']}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.header}
//       >
//         <View style={styles.headerContent}>
//           <Text style={styles.headerTitle}>Live Radio</Text>
//           <Text style={styles.headerSubtitle}>Now Playing</Text>
//         </View>
//       </LinearGradient>

//       <View style={styles.playerContainer}>
//         {/* Network Warning */}
//         {!networkConnected && (
//           <View style={styles.networkWarning}>
//             <WifiOff size={16} color="#ef4444" />
//             <Text style={styles.networkWarningText}>No Internet Connection</Text>
//           </View>
//         )}

//         {/* Stream Health Indicator */}
//         {renderStreamHealthIndicator()}

//         {/* Radio Station Info */}
//         <View style={styles.stationInfo}>
//           <Text style={styles.stationName}>{currentStream.name}</Text>
//           <Text style={styles.stationFrequency}>{currentStream.frequency}</Text>
//           <Text style={styles.stationLocation}>{currentStream.location}</Text>
//           {currentStreamIndex > 0 && (
//             <Text style={styles.streamInfo}>
//               Backup Stream {currentStreamIndex + 1}/{RADIO_STREAMS.length}
//             </Text>
//           )}
//         </View>

//         {/* Main Player Visual */}
//         <View style={styles.playerVisual}>
//           <RadioWaveAnimation isPlaying={isPlaying} />
          
//           <Animated.View
//             style={[
//               styles.radioIconContainer,
//               {
//                 transform: [
//                   { scale: pulseAnim },
//                   {
//                     rotate: rotateAnim.interpolate({
//                       inputRange: [0, 1],
//                       outputRange: ['0deg', '360deg'],
//                     }),
//                   },
//                 ],
//               },
//             ]}
//           >
//             <LinearGradient
//               colors={isPlaying ? ['#10b981', '#059669'] : ['#6b7280', '#4b5563']}
//               style={styles.radioIconGradient}
//             >
//               <RadioIcon size={48} color="white" />
//             </LinearGradient>
//           </Animated.View>
//         </View>

//         {/* Audio Visualizer */}
//         <AudioVisualizer isPlaying={isPlaying} />

//         {/* Status Text */}
//         <View style={styles.statusContainer}>
//           {isLoading || isBuffering ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="small" color="#3b82f6" />
//               <Text style={[styles.statusText, { color: statusInfo.color }]}>
//                 {statusInfo.text}
//               </Text>
//             </View>
//           ) : (
//             <Text style={[styles.statusText, { color: statusInfo.color }]}>
//               {statusInfo.text}
//             </Text>
//           )}
          
//           {/* Stream Metadata */}
//           {streamMetadata && (
//             <Text style={styles.metadataText} numberOfLines={1}>
//               {streamMetadata.title || streamMetadata.name}
//             </Text>
//           )}
//         </View>

//         {/* Controls */}
//         <View style={styles.controlsContainer}>
//           <TouchableOpacity
//             style={styles.controlButton}
//             onPress={toggleMute}
//             activeOpacity={0.7}
//           >
//             {isMuted ? (
//               <VolumeX size={24} color="#6b7280" />
//             ) : (
//               <Volume2 size={24} color="#3b82f6" />
//             )}
//           </TouchableOpacity>

//           {/* Play/Stop Button */}
//           <TouchableOpacity
//             style={[
//               styles.playButton,
//               isPlaying && styles.playButtonActive
//             ]}
//             onPress={handlePlayStop}
//             activeOpacity={0.8}
//             disabled={!isTrackPlayerReady || (!networkConnected && !isPlaying)}
//           >
//             <LinearGradient
//               colors={isPlaying ? ['#ef4444', '#dc2626'] : ['#3b82f6', '#2563eb']}
//               style={styles.playButtonGradient}
//             >
//               {isLoading || isBuffering ? (
//                 <ActivityIndicator size="large" color="white" />
//               ) : isPlaying ? (
//                 <Square size={32} color="white" />
//               ) : (
//                 <Play size={32} color="white" />
//               )}
//             </LinearGradient>
//           </TouchableOpacity>

//           {/* Manual Stream Health Check Button */}
//           <TouchableOpacity
//             style={styles.controlButton}
//             onPress={checkAllStreamsHealth}
//             activeOpacity={0.7}
//             disabled={isCheckingStreamHealth}
//           >
//             {isCheckingStreamHealth ? (
//               <ActivityIndicator size="small" color="#f59e0b" />
//             ) : (
//               <RefreshCw size={24} color="#6366f1" />
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Live Indicator */}
//         {isPlaying && (
//           <View style={styles.liveIndicator}>
//             <View style={styles.liveDot} />
//             <Text style={styles.liveText}>LIVE BROADCAST</Text>
//           </View>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8fafc',
//   },
//   header: {
//     paddingTop: 20,
//     paddingBottom: 30,
//     paddingHorizontal: 16,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//   },
//   headerContent: {
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: 'white',
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     color: 'rgba(255, 255, 255, 0.8)',
//   },
//   playerContainer: {
//     flex: 1,
//     paddingHorizontal: 24,
//     paddingTop: 40,
//     alignItems: 'center',
//   },
//   networkWarning: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fef2f2',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#fecaca',
//   },
//   networkWarningText: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: '#ef4444',
//     fontWeight: '500',
//   },
//   healthIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     borderRadius: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//   },
//   healthDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginRight: 8,
//   },
//   healthText: {
//     fontSize: 12,
//     color: '#4b5563',
//     fontWeight: '500',
//   },
//   stationInfo: {
//     alignItems: 'center',
//     marginBottom: 40,
//   },
//   stationName: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#1f2937',
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   stationFrequency: {
//     fontSize: 18,
//     fontWeight: '500',
//     color: '#3b82f6',
//     marginBottom: 4,
//   },
//   stationLocation: {
//     fontSize: 14,
//     color: '#6b7280',
//   },
//   streamInfo: {
//     fontSize: 12,
//     color: '#9ca3af',
//     marginTop: 4,
//     fontStyle: 'italic',
//   },
//   playerVisual: {
//     position: 'relative',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 40,
//   },
//   waveContainer: {
//     position: 'absolute',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   wave: {
//     position: 'absolute',
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     borderWidth: 2,
//     borderColor: '#3b82f6',
//   },
//   radioIconContainer: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     overflow: 'hidden',
//   },
//   radioIconGradient: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   visualizerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     height: 40,
//     marginBottom: 20,
//     gap: 4,
//   },
//   visualizerBar: {
//     width: 4,
//     height: 30,
//     backgroundColor: '#3b82f6',
//     borderRadius: 2,
//   },
//   statusContainer: {
//     marginBottom: 40,
//     alignItems: 'center',
//   },
//   loadingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   statusText: {
//     fontSize: 16,
//     fontWeight: '500',
//     textAlign: 'center',
//   },
//   metadataText: {
//     fontSize: 12,
//     color: '#6b7280',
//     marginTop: 4,
//     fontStyle: 'italic',
//   },
//   controlsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 24,
//     marginBottom: 40,
//   },
//   controlButton: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: 'white',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   playButton: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     overflow: 'hidden',
//   },
//   playButtonActive: {
//     shadowColor: '#ef4444',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   playButtonGradient: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   liveIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fef2f2',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#fecaca',
//     gap: 8,
//   },
//   liveDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#ef4444',
//   },
//   liveText: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: '#ef4444',
//     letterSpacing: 1,
//   },
// });

// app/(app)/radio.tsx - Enhanced with detailed logging
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  AppState,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Square, Volume2, VolumeX, Radio as RadioIcon, RefreshCw, Wifi, WifiOff } from 'lucide-react-native';
import TrackPlayer, {
  Capability,
  State,
  usePlaybackState,
  Event,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';
import NetInfo from '@react-native-community/netinfo';
import { NetworkMonitor, StreamValidator } from '../../src/utils/networkUtils';

// Enhanced stream configuration with detailed logging
const RADIO_STREAMS = [
  {
    id: 'fm-ujjayanta-primary',
    name: 'FM Ujjayanta Agartala',
    url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/playlist.m3u8',
    frequency: '103.7 FM',
    location: 'Agartala, Tripura',
    type: 'hls'
  },
  {
    id: 'fm-ujjayanta-backup',
    name: 'FM Ujjayanta Agartala', 
    url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/chunklist.m3u8',
    frequency: '103.7 FM',
    location: 'Agartala, Tripura',
    type: 'hls'
  },
];

// Enhanced logging utility
const Logger = {
  info: (tag: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`🔵 [${timestamp}] [${tag}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (tag: string, message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`🔴 [${timestamp}] [${tag}] ${message}`, error);
  },
  warn: (tag: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`🟡 [${timestamp}] [${tag}] ${message}`, data);
  },
  debug: (tag: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`🟣 [${timestamp}] [${tag}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

// Connection status constants
const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  BUFFERING: 'buffering',
  PLAYING: 'playing',
  ERROR: 'error',
  NO_NETWORK: 'no_network',
  RETRYING: 'retrying',
  CHECKING_HEALTH: 'checking_health'
};

// Audio visualizer component (simplified for logging)
const AudioVisualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  const bars = Array.from({ length: 5 }, () => useRef(new Animated.Value(0.3)).current);

  useEffect(() => {
    Logger.debug('AudioVisualizer', `Animation state changed: ${isPlaying ? 'started' : 'stopped'}`);
    
    if (isPlaying) {
      const animations = bars.map((bar, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: Math.random() * 0.7 + 0.3,
              duration: 300 + Math.random() * 200,
              useNativeDriver: true,
            }),
            Animated.timing(bar, {
              toValue: Math.random() * 0.5 + 0.2,
              duration: 300 + Math.random() * 200,
              useNativeDriver: true,
            }),
          ])
        );
      });

      animations.forEach((anim, index) => {
        setTimeout(() => anim.start(), index * 100);
      });

      return () => {
        Logger.debug('AudioVisualizer', 'Stopping animations');
        animations.forEach(anim => anim.stop());
      };
    } else {
      bars.forEach(bar => {
        Animated.timing(bar, {
          toValue: 0.2,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isPlaying]);

  return (
    <View style={styles.visualizerContainer}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.visualizerBar,
            {
              transform: [{ scaleY: bar }],
            },
          ]}
        />
      ))}
    </View>
  );
};

export default function EnhancedRadioScreen() {
  const playbackState = usePlaybackState();
  
  // Enhanced state management with logging
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTrackPlayerReady, setIsTrackPlayerReady] = useState(false);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATUS.DISCONNECTED);
  const [retryCount, setRetryCount] = useState(0);
  const [networkConnected, setNetworkConnected] = useState(true);
  const [streamMetadata, setStreamMetadata] = useState<any>(null);
  const [streamHealthStatus, setStreamHealthStatus] = useState<Record<string, any>>({});
  const [isCheckingStreamHealth, setIsCheckingStreamHealth] = useState(false);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Refs for cleanup
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get current stream
  const currentStream = RADIO_STREAMS[currentStreamIndex];

  // Enhanced logging for state changes
  useEffect(() => {
    Logger.info('RadioScreen', 'Component mounted', {
      currentStreamIndex,
      currentStream: currentStream?.name,
      playbackState: playbackState?.state
    });

    return () => {
      Logger.info('RadioScreen', 'Component unmounting');
    };
  }, []);

  // Log playback state changes
  useEffect(() => {
    if (playbackState?.state) {
      Logger.info('PlaybackState', `State changed to: ${playbackState.state}`, {
        previousState: connectionStatus,
        isLoading,
        currentStream: currentStream?.name
      });
    }
  }, [playbackState?.state]);

  // Network monitoring with detailed logging
  useEffect(() => {
    Logger.info('NetworkMonitor', 'Setting up network monitoring');
    
    const unsubscribe = NetInfo.addEventListener(state => {
      Logger.info('NetworkMonitor', 'Network state changed', {
        isConnected: state.isConnected,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
        details: state.details
      });
      
      const wasConnected = networkConnected;
      setNetworkConnected(!!state.isConnected);
      
      if (!state.isConnected && wasConnected) {
        Logger.warn('NetworkMonitor', 'Network disconnected - stopping playback');
        setConnectionStatus(CONNECTION_STATUS.NO_NETWORK);
        handleStop();
      } else if (state.isConnected && !wasConnected) {
        Logger.info('NetworkMonitor', 'Network reconnected');
        setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      }
    });

    return () => {
      Logger.info('NetworkMonitor', 'Cleaning up network monitoring');
      unsubscribe();
    };
  }, [networkConnected]);

  // Initialize everything with detailed logging
  useEffect(() => {
    Logger.info('RadioScreen', 'Starting initialization');
    setupTrackPlayer();
    setupEventListeners();
    checkAllStreamsHealth();
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      Logger.info('RadioScreen', 'Cleanup started');
      subscription?.remove();
      cleanupTrackPlayer();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
      Logger.info('RadioScreen', 'Cleanup completed');
    };
  }, []);

  const setupTrackPlayer = async () => {
    try {
      Logger.info('TrackPlayer', 'Starting TrackPlayer setup');
      
      Logger.debug('TrackPlayer', 'Calling TrackPlayer.setupPlayer with config', {
        waitForBuffer: false,
        autoHandleInterruptions: true,
        maxCacheSize: 2048,
        minBuffer: 15,
        maxBuffer: 50,
        playBuffer: 2.5,
        backBuffer: 0,
      });
      
      await TrackPlayer.setupPlayer({
        waitForBuffer: false,
        autoHandleInterruptions: true,
        maxCacheSize: 2048,
        minBuffer: 15,
        maxBuffer: 50,
        playBuffer: 2.5,
        backBuffer: 0,
      });

      Logger.info('TrackPlayer', 'Player setup complete, configuring options');

      const options = {
        capabilities: [
          Capability.Play,
          Capability.Stop,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Stop,
        ],
        notificationCapabilities: [
          Capability.Play,
          Capability.Stop,
        ],
        progressUpdateEventInterval: 2,
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
          alwaysPauseOnInterruption: true,
        },
      };

      Logger.debug('TrackPlayer', 'Updating options', options);
      await TrackPlayer.updateOptions(options);

      setIsTrackPlayerReady(true);
      setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      Logger.info('TrackPlayer', 'TrackPlayer setup completed successfully');
    } catch (error) {
      Logger.error('TrackPlayer', 'Error setting up TrackPlayer', error);
      setConnectionStatus(CONNECTION_STATUS.ERROR);
    }
  };

  const setupEventListeners = () => {
    Logger.info('TrackPlayer', 'Setting up event listeners');

    const playbackStateListener = TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
      Logger.info('TrackPlayerEvent', `Playback state event: ${data.state}`, data);
      
      switch (data.state) {
        case State.Playing:
          Logger.info('TrackPlayerEvent', 'Stream started playing successfully');
          setIsLoading(false);
          setConnectionStatus(CONNECTION_STATUS.PLAYING);
          setRetryCount(0);
          break;
        case State.Buffering:
          Logger.info('TrackPlayerEvent', 'Stream buffering');
          setConnectionStatus(CONNECTION_STATUS.BUFFERING);
          break;
        case State.Connecting:
          Logger.info('TrackPlayerEvent', 'Stream connecting');
          setConnectionStatus(CONNECTION_STATUS.BUFFERING);
          break;
        case State.Error:
          Logger.error('TrackPlayerEvent', 'Playback error detected');
          setConnectionStatus(CONNECTION_STATUS.ERROR);
          handleConnectionError();
          break;
        case State.Stopped:
          Logger.info('TrackPlayerEvent', 'Playback stopped');
          setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
          setIsLoading(false);
          break;
        default:
          Logger.debug('TrackPlayerEvent', `Unknown playback state: ${data.state}`);
      }
    });

    const errorListener = TrackPlayer.addEventListener(Event.PlaybackError, (data) => {
      Logger.error('TrackPlayerEvent', 'Playback error event received', data);
      setConnectionStatus(CONNECTION_STATUS.ERROR);
      handleConnectionError();
    });

    const metadataListener = TrackPlayer.addEventListener(Event.PlaybackMetadataReceived as any, (data) => {
      Logger.info('TrackPlayerEvent', 'Stream metadata received', data);
      setStreamMetadata(data);
    });

    const trackChangedListener = TrackPlayer.addEventListener(Event.PlaybackTrackChanged, (data) => {
      Logger.info('TrackPlayerEvent', 'Track changed event', data);
    });

    Logger.info('TrackPlayer', 'Event listeners setup complete');

    return () => {
      Logger.info('TrackPlayer', 'Removing event listeners');
      playbackStateListener.remove();
      errorListener.remove();
      metadataListener.remove();
      trackChangedListener.remove();
    };
  };

  // Check all streams health with detailed logging
  const checkAllStreamsHealth = async () => {
    Logger.info('HealthCheck', 'Starting stream health checks');
    setIsCheckingStreamHealth(true);
    const healthResults: Record<string, any> = {};

    for (let i = 0; i < RADIO_STREAMS.length; i++) {
      const stream = RADIO_STREAMS[i];
      Logger.info('HealthCheck', `Checking health of stream ${i}: ${stream.name}`, {
        url: stream.url,
        type: stream.type
      });
      
      try {
        const startTime = Date.now();
        const health = await StreamValidator.checkStreamHealth(stream.url);
        const duration = Date.now() - startTime;
        
        healthResults[stream.id] = { ...health, checkDuration: duration };
        
        Logger.info('HealthCheck', `Stream ${stream.id} health check complete`, {
          isHealthy: health.isHealthy,
          status: health.status,
          duration: duration + 'ms',
          error: health.error
        });
      } catch (error: any) {
        Logger.error('HealthCheck', `Health check failed for ${stream.id}`, error);
        healthResults[stream.id] = { 
          isHealthy: false, 
          error: error.message, 
          timestamp: new Date().toISOString() 
        };
      }
    }

    setStreamHealthStatus(healthResults);
    setIsCheckingStreamHealth(false);
    Logger.info('HealthCheck', 'All stream health checks completed', healthResults);
  };

  const addTrack = async (streamUrl = currentStream) => {
    try {
      Logger.info('TrackPlayer', 'Adding track to player', {
        streamName: streamUrl.name,
        streamUrl: streamUrl.url,
        streamType: streamUrl.type
      });

      await TrackPlayer.reset();
      Logger.debug('TrackPlayer', 'Player reset complete');

      const trackConfig = {
        id: streamUrl.id,
        url: streamUrl.url,
        title: streamUrl.name,
        artist: streamUrl.location,
        isLiveStream: true,
        headers: {
          'User-Agent': 'RAISE-RadioApp/3.0 (Android; Mobile)',
          'Accept': 'application/vnd.apple.mpegurl, */*',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Referer': 'https://akashvani.gov.in',
          ...(Platform.OS === 'android' && {
            'Accept-Encoding': 'identity',
          })
        },
        contentType: streamUrl.type === 'hls' ? 'application/vnd.apple.mpegurl' : 'audio/mpeg',
      };

      Logger.debug('TrackPlayer', 'Track configuration', trackConfig);
      
      await TrackPlayer.add(trackConfig);
      Logger.info('TrackPlayer', 'Track added successfully');
    } catch (error) {
      Logger.error('TrackPlayer', 'Error adding track', error);
      throw error;
    }
  };

  // Enhanced play/stop handler with detailed logging
  const handlePlayStop = async () => {
    Logger.info('UserAction', 'Play/Stop button pressed', {
      isTrackPlayerReady,
      networkConnected,
      currentState: playbackState?.state,
      connectionStatus
    });

    if (!isTrackPlayerReady) {
      Logger.warn('UserAction', 'TrackPlayer not ready');
      Alert.alert('Player Not Ready', 'Please wait for the player to initialize.');
      return;
    }

    if (!networkConnected) {
      Logger.warn('UserAction', 'No network connection');
      Alert.alert('No Internet', 'Please check your internet connection.');
      return;
    }

    try {
      const state = await TrackPlayer.getPlaybackState();
      Logger.info('UserAction', 'Current playback state retrieved', { state: state.state });
      
      if (state.state === State.Playing) {
        Logger.info('UserAction', 'Stopping playback');
        await handleStop();
      } else {
        Logger.info('UserAction', 'Starting playback with health check');
        await handlePlayWithHealthCheck();
      }
    } catch (error) {
      Logger.error('UserAction', 'Error in play/stop handler', error);
      setIsLoading(false);
      handleConnectionError();
    }
  };

  const handlePlayWithHealthCheck = async () => {
    Logger.info('StreamPlay', 'Starting playback with health check');
    setIsLoading(true);
    setConnectionStatus(CONNECTION_STATUS.CHECKING_HEALTH);

    try {
      Logger.info('StreamPlay', `Checking health of current stream: ${currentStream.name}`);
      const currentStreamHealth = await StreamValidator.checkStreamHealth(currentStream.url);
      
      Logger.info('StreamPlay', 'Current stream health check result', currentStreamHealth);
      
      if (!currentStreamHealth.isHealthy) {
        Logger.warn('StreamPlay', 'Current stream unhealthy, searching for backup');
        
        const healthyStreamIndex = await findHealthyStream();
        
        if (healthyStreamIndex !== -1) {
          Logger.info('StreamPlay', `Switching to backup stream ${healthyStreamIndex}`, {
            backupStream: RADIO_STREAMS[healthyStreamIndex].name
          });
          setCurrentStreamIndex(healthyStreamIndex);
        } else {
          throw new Error('No healthy streams available');
        }
      }

      setConnectionStatus(CONNECTION_STATUS.CONNECTING);
      
      const queue = await TrackPlayer.getQueue();
      Logger.info('StreamPlay', `Current queue length: ${queue.length}`);
      
      if (queue.length === 0) {
        Logger.info('StreamPlay', 'Queue empty, adding track');
        await addTrack(RADIO_STREAMS[currentStreamIndex]);
      }
      
      Logger.info('StreamPlay', 'Starting playback');
      await TrackPlayer.play();
      
    } catch (error: any) {
      Logger.error('StreamPlay', 'Error in health-checked play', error);
      setIsLoading(false);
      setConnectionStatus(CONNECTION_STATUS.ERROR);
      Alert.alert(
        'Stream Unavailable', 
        'Radio stream is currently unavailable. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleStop = async () => {
    Logger.info('StreamStop', 'Stopping playback');
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
      setIsLoading(false);
      setConnectionStatus(CONNECTION_STATUS.DISCONNECTED);
      Logger.info('StreamStop', 'Playback stopped successfully');
    } catch (error) {
      Logger.error('StreamStop', 'Error stopping playback', error);
    }
  };

  const findHealthyStream = async (): Promise<number> => {
    Logger.info('StreamSwitch', 'Searching for healthy backup stream');
    
    for (let i = 0; i < RADIO_STREAMS.length; i++) {
      if (i === currentStreamIndex) {
        Logger.debug('StreamSwitch', `Skipping current stream ${i}`);
        continue;
      }
      
      Logger.info('StreamSwitch', `Testing stream ${i}: ${RADIO_STREAMS[i].name}`);
      const health = await StreamValidator.checkStreamHealth(RADIO_STREAMS[i].url);
      
      Logger.info('StreamSwitch', `Stream ${i} health result`, health);
      
      if (health.isHealthy) {
        Logger.info('StreamSwitch', `Found healthy stream at index ${i}`);
        return i;
      }
    }
    
    Logger.warn('StreamSwitch', 'No healthy backup streams found');
    return -1;
  };

  const handleConnectionError = async () => {
    Logger.error('StreamError', 'Connection error handler triggered', {
      networkConnected,
      retryCount,
      currentStreamIndex,
      maxRetries: 3
    });

    if (!networkConnected) {
      Logger.warn('StreamError', 'No network - setting NO_NETWORK status');
      setConnectionStatus(CONNECTION_STATUS.NO_NETWORK);
      return;
    }

    // Normal retry logic
    const maxRetries = 3;
    const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);

    if (retryCount < maxRetries) {
      Logger.info('StreamError', `Scheduling retry ${retryCount + 1}/${maxRetries} in ${backoffDelay}ms`);
      setConnectionStatus(CONNECTION_STATUS.RETRYING);
      
      retryTimeoutRef.current = setTimeout(() => {
        Logger.info('StreamError', `Executing retry attempt ${retryCount + 1}`);
        setRetryCount(prev => prev + 1);
        retryConnection();
      }, backoffDelay);
    } else {
      Logger.error('StreamError', 'Max retries exceeded, showing error to user');
      setIsLoading(false);
      setConnectionStatus(CONNECTION_STATUS.ERROR);
      Alert.alert(
        'Connection Failed',
        'Unable to connect to radio stream. Please check your internet connection and try again.',
        [
          { text: 'Check Streams', onPress: checkAllStreamsHealth },
          { text: 'Retry', onPress: handleRetryFromBeginning },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const retryConnection = async () => {
    if (!isTrackPlayerReady || !networkConnected) {
      Logger.warn('StreamRetry', 'Cannot retry - player not ready or no network');
      return;
    }
    
    Logger.info('StreamRetry', `Retrying connection - stream ${currentStreamIndex + 1}/${RADIO_STREAMS.length}, attempt ${retryCount + 1}`);
    
    try {
      await handleStop();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsLoading(true);
      setConnectionStatus(CONNECTION_STATUS.CONNECTING);
      await addTrack();
      await TrackPlayer.play();
    } catch (error) {
      Logger.error('StreamRetry', 'Retry attempt failed', error);
      handleConnectionError();
    }
  };

  const handleRetryFromBeginning = () => {
    Logger.info('StreamRetry', 'Resetting to first stream and retrying');
    setCurrentStreamIndex(0);
    setRetryCount(0);
    retryConnection();
  };

  const cleanupTrackPlayer = async () => {
    try {
      Logger.info('TrackPlayer', 'Starting cleanup');
      await TrackPlayer.stop();
      await TrackPlayer.reset();
      Logger.info('TrackPlayer', 'Cleanup completed');
    } catch (error) {
      Logger.error('TrackPlayer', 'Error during cleanup', error);
    }
  };

  const handleAppStateChange = (nextAppState: string) => {
    Logger.info('AppState', `App state changed to: ${nextAppState}`);
    if (nextAppState === 'active') {
      checkPlaybackStatus();
    }
  };

  const checkPlaybackStatus = async () => {
    try {
      const state = await TrackPlayer.getPlaybackState();
      Logger.info('AppState', 'Checked playback status on app resume', { state: state.state });
      if (state.state === State.Error) {
        Logger.warn('AppState', 'Found error state on resume, retrying');
        retryConnection();
      }
    } catch (error) {
      Logger.error('AppState', 'Error checking playback status', error);
    }
  };

  const toggleMute = async () => {
    try {
      const volume = isMuted ? 1 : 0;
      Logger.info('UserAction', `${isMuted ? 'Unmuting' : 'Muting'} audio`, { volume });
      await TrackPlayer.setVolume(volume);
      setIsMuted(!isMuted);
    } catch (error) {
      Logger.error('UserAction', 'Error toggling mute', error);
    }
  };

  // Get status info
  const getStatusInfo = () => {
    switch (connectionStatus) {
      case CONNECTION_STATUS.CHECKING_HEALTH:
        return { text: 'Checking stream...', color: '#f59e0b' };
      case CONNECTION_STATUS.CONNECTING:
        return { text: 'Connecting...', color: '#f59e0b' };
      case CONNECTION_STATUS.BUFFERING:
        return { text: 'Buffering...', color: '#f59e0b' };
      case CONNECTION_STATUS.PLAYING:
        return { text: '🔴 Live', color: '#10b981' };
      case CONNECTION_STATUS.DISCONNECTED:
        return { text: 'Ready to Play', color: '#6b7280' };
      case CONNECTION_STATUS.RETRYING:
        return { text: `Retrying... (${retryCount + 1}/3)`, color: '#f59e0b' };
      case CONNECTION_STATUS.ERROR:
        return { text: 'Connection Error', color: '#ef4444' };
      case CONNECTION_STATUS.NO_NETWORK:
        return { text: 'No Internet', color: '#ef4444' };
      default:
        return { text: 'Ready to Play', color: '#6b7280' };
    }
  };

  const statusInfo = getStatusInfo();
  const isPlaying = playbackState?.state === State.Playing;
  const isBuffering = connectionStatus === CONNECTION_STATUS.BUFFERING || 
                     connectionStatus === CONNECTION_STATUS.CONNECTING ||
                     connectionStatus === CONNECTION_STATUS.CHECKING_HEALTH;

  // Log current state every 10 seconds when playing
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        Logger.debug('PlaybackStatus', 'Current playback status', {
          isPlaying,
          connectionStatus,
          currentStream: currentStream?.name,
          networkConnected,
          retryCount
        });
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, connectionStatus, currentStream, networkConnected, retryCount]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Live Radio - Debug Mode</Text>
          <Text style={styles.headerSubtitle}>Check Console for Logs</Text>
        </View>
      </LinearGradient>

      <View style={styles.playerContainer}>
        {/* Network Warning */}
        {!networkConnected && (
          <View style={styles.networkWarning}>
            <WifiOff size={16} color="#ef4444" />
            <Text style={styles.networkWarningText}>No Internet Connection</Text>
          </View>
        )}

        {/* Debug Info Display */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>Status: {connectionStatus}</Text>
          <Text style={styles.debugText}>Network: {networkConnected ? '✅' : '❌'}</Text>
          <Text style={styles.debugText}>Stream: {currentStreamIndex + 1}/{RADIO_STREAMS.length}</Text>
          <Text style={styles.debugText}>Retries: {retryCount}/3</Text>
        </View>

        {/* Radio Station Info */}
        <View style={styles.stationInfo}>
          <Text style={styles.stationName}>{currentStream.name}</Text>
          <Text style={styles.stationFrequency}>{currentStream.frequency}</Text>
          <Text style={styles.stationLocation}>{currentStream.location}</Text>
        </View>

        {/* Simple Play Button */}
        <TouchableOpacity
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          onPress={handlePlayStop}
          disabled={!isTrackPlayerReady || (!networkConnected && !isPlaying)}
        >
          <LinearGradient
            colors={isPlaying ? ['#ef4444', '#dc2626'] : ['#3b82f6', '#2563eb']}
            style={styles.playButtonGradient}
          >
            {isLoading || isBuffering ? (
              <ActivityIndicator size="large" color="white" />
            ) : isPlaying ? (
              <Square size={32} color="white" />
            ) : (
              <Play size={32} color="white" />
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Status Text */}
        <Text style={[styles.statusText, { color: statusInfo.color }]}>
          {statusInfo.text}
        </Text>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleMute}
            activeOpacity={0.7}
          >
            {isMuted ? (
              <VolumeX size={24} color="#6b7280" />
            ) : (
              <Volume2 size={24} color="#3b82f6" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={checkAllStreamsHealth}
            activeOpacity={0.7}
            disabled={isCheckingStreamHealth}
          >
            {isCheckingStreamHealth ? (
              <ActivityIndicator size="small" color="#f59e0b" />
            ) : (
              <RefreshCw size={24} color="#6366f1" />
            )}
          </TouchableOpacity>
        </View>

        {/* Stream Metadata */}
        {streamMetadata && (
          <View style={styles.metadataContainer}>
            <Text style={styles.metadataTitle}>Now Playing:</Text>
            <Text style={styles.metadataText}>
              {streamMetadata.title || streamMetadata.name || 'Unknown'}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  playerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  networkWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  networkWarningText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  debugInfo: {
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  debugText: {
    color: '#10b981',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  stationInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stationName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  stationFrequency: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3b82f6',
    marginBottom: 4,
  },
  stationLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 20,
  },
  playButtonActive: {
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  playButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  visualizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    marginBottom: 20,
    gap: 4,
  },
  visualizerBar: {
    width: 4,
    height: 30,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  metadataContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  metadataText: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
  },
});