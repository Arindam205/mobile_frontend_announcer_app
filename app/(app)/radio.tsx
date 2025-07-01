import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
  Alert,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Radio as RadioIcon,
  Headphones,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react-native';
import TrackPlayer, { 
  State, 
  usePlaybackState, 
  useProgress,
  Event,
  useTrackPlayerEvents 
} from 'react-native-track-player';
import TrackPlayerService from '../../src/services/TrackPlayerService';

// Radio station configuration
const RADIO_CONFIG = {
  name: 'FM Ujjayanta Agartala',
  frequency: '102.8 FM',
  description: 'All India Radio - Agartala',
  streamUrl: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/playlist.m3u8',
};

// Audio Wave Animation Component
const AudioWaveAnimation = ({ isPlaying }: { isPlaying: boolean }) => {
  const bars = Array.from({ length: 5 }, () => useRef(new Animated.Value(0.3)).current);
  
  useEffect(() => {
    if (isPlaying) {
      const animations = bars.map((bar, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: Math.random() * 0.7 + 0.3,
              duration: 400 + index * 100,
              useNativeDriver: true,
            }),
            Animated.timing(bar, {
              toValue: Math.random() * 0.4 + 0.2,
              duration: 400 + index * 100,
              useNativeDriver: true,
            }),
          ])
        );
      });
      
      animations.forEach(anim => anim.start());
      
      return () => animations.forEach(anim => anim.stop());
    } else {
      bars.forEach(bar => {
        Animated.timing(bar, {
          toValue: 0.2,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isPlaying]);
  
  return (
    <View style={styles.waveContainer}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveBar,
            {
              transform: [{ scaleY: bar }],
              opacity: isPlaying ? 1 : 0.3,
            }
          ]}
        />
      ))}
    </View>
  );
};

// Circular Progress Component
const CircularProgress = ({ isPlaying, size = 200 }: { isPlaying: boolean; size?: number }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (isPlaying) {
      // Rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
      
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      rotateAnim.stopAnimation();
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);
  
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <Animated.View
      style={[
        styles.circularProgress,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [
            { rotate: spin },
            { scale: pulseAnim }
          ],
        }
      ]}
    >
      <View style={styles.innerCircle}>
        <RadioIcon size={size * 0.3} color="#fff" strokeWidth={2} />
      </View>
    </Animated.View>
  );
};

export default function RadioScreen() {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [volume, setVolume] = useState(1);
  
  // TrackPlayer hooks
  const playbackState = usePlaybackState();
  const progress = useProgress();
  
  // TrackPlayer service instance
  const trackPlayerService = TrackPlayerService.getInstance();
  
  // Derived state - handle the new playbackState structure
  const currentState = playbackState?.state || playbackState;
  const isPlaying = currentState === State.Playing;
  const isBuffering = currentState === State.Buffering || currentState === State.Loading;
  const isPaused = currentState === State.Paused;
  const isStopped = currentState === State.Stopped;
  
  // Listen to TrackPlayer events
  useTrackPlayerEvents([Event.PlaybackError, Event.PlaybackQueueEnded], async (event) => {
    console.log('[Radio] TrackPlayer event:', event);
    
    if (event.type === Event.PlaybackError) {
      console.error('[Radio] Playback error:', event);
      setError(`Playback error: ${event.message || 'Unknown error'}`);
      setIsConnected(false);
    }
    
    if (event.type === Event.PlaybackQueueEnded) {
      console.log('[Radio] Queue ended, attempting to restart...');
      try {
        await trackPlayerService.addRadioTrack();
        await trackPlayerService.play();
      } catch (error) {
        console.error('[Radio] Failed to restart:', error);
      }
    }
  });
  
  // Initialize TrackPlayer
  useEffect(() => {
    initializePlayer();
    
    return () => {
      // FIXED: Use cleanup instead of destroy
      trackPlayerService.cleanup();
    };
  }, []);
  
  // App state handling
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);
  
  const handleAppStateChange = (nextAppState: string) => {
    console.log('[Radio] App state changed to:', nextAppState);
    
    if (nextAppState === 'background') {
      console.log('[Radio] App went to background, music continues...');
    } else if (nextAppState === 'active') {
      console.log('[Radio] App became active');
    }
  };
  
  const initializePlayer = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[Radio] Initializing TrackPlayer...');
      
      // Setup the player
      await trackPlayerService.setupPlayer();
      
      // Add the radio track
      await trackPlayerService.addRadioTrack();
      
      setIsInitialized(true);
      setIsConnected(true);
      
      console.log('[Radio] TrackPlayer initialized successfully');
      
    } catch (error: any) {
      console.error('[Radio] Initialization failed:', error);
      setError(`Initialization failed: ${error.message}`);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePlayPause = async () => {
    try {
      if (!isInitialized) {
        console.log('[Radio] Player not initialized, initializing now...');
        await initializePlayer();
        return;
      }
      
      setError(null);
      
      console.log('[Radio] Current playback state:', currentState);
      
      if (isPlaying) {
        console.log('[Radio] Pausing...');
        await trackPlayerService.pause();
      } else {
        console.log('[Radio] Playing...');
        await trackPlayerService.play();
        setIsConnected(true);
      }
      
    } catch (error: any) {
      console.error('[Radio] Play/Pause error:', error);
      setError(`Control failed: ${error.message}`);
      setIsConnected(false);
      
      // Show user-friendly error
      Alert.alert(
        'Connection Error',
        `Unable to ${isPlaying ? 'pause' : 'play'} FM Ujjayanta Agartala.\n\nError: ${error.message}\n\nPlease check your internet connection and try again.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => handleRetry() }
        ]
      );
    }
  };
  
  const handleStop = async () => {
    try {
      console.log('[Radio] Stopping...');
      await trackPlayerService.stop();
    } catch (error: any) {
      console.error('[Radio] Stop error:', error);
      setError(`Stop failed: ${error.message}`);
    }
  };
  
  const handleVolumeToggle = async () => {
    try {
      const newMutedState = !isMuted;
      const newVolume = newMutedState ? 0 : volume;
      
      await trackPlayerService.setVolume(newVolume);
      setIsMuted(newMutedState);
      
      console.log('[Radio] Volume:', newMutedState ? 'muted' : 'unmuted');
    } catch (error: any) {
      console.error('[Radio] Volume toggle error:', error);
    }
  };
  
  const handleRetry = async () => {
    console.log('[Radio] Retrying connection...');
    setError(null);
    await initializePlayer();
  };
  
  // Get status text
  const getStatusText = () => {
    if (isLoading) return 'Initializing...';
    if (isBuffering) return 'Buffering...';
    if (isPlaying) return 'Live Broadcasting';
    if (isPaused) return 'Paused';
    if (isStopped) return 'Stopped';
    if (error) return 'Connection Failed';
    if (!isInitialized) return 'Not Ready';
    return 'Ready to Play';
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3b82f6', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🎵 Live Radio</Text>
          <View style={styles.connectionStatus}>
            {isConnected ? (
              <Wifi size={20} color="#fff" />
            ) : (
              <WifiOff size={20} color="#ff6b6b" />
            )}
            <Text style={styles.connectionText}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>
      </LinearGradient>
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Radio Station Info */}
        <View style={styles.stationInfo}>
          <Text style={styles.stationName}>{RADIO_CONFIG.name}</Text>
          <Text style={styles.stationFrequency}>{RADIO_CONFIG.frequency}</Text>
          <Text style={styles.stationDescription}>{RADIO_CONFIG.description}</Text>
        </View>
        
        {/* Audio Visualizer */}
        <View style={styles.visualizerContainer}>
          <CircularProgress isPlaying={isPlaying} size={250} />
          <View style={styles.waveOverlay}>
            <AudioWaveAnimation isPlaying={isPlaying} />
          </View>
        </View>
        
        {/* Status Display */}
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Headphones size={20} color="#6b7280" />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
          
          {/* Progress indicator for buffering */}
          {isBuffering && (
            <View style={styles.bufferingContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.bufferingText}>Connecting to stream...</Text>
            </View>
          )}
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={handleRetry}
              >
                <RefreshCw size={16} color="#fff" />
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          {/* Volume Control */}
          <TouchableOpacity
            style={[styles.controlButton, !isInitialized && styles.controlButtonDisabled]}
            onPress={handleVolumeToggle}
            disabled={!isInitialized}
          >
            {isMuted ? (
              <VolumeX size={24} color="#6b7280" />
            ) : (
              <Volume2 size={24} color="#3b82f6" />
            )}
          </TouchableOpacity>
          
          {/* Play/Pause Button */}
          <TouchableOpacity
            style={[styles.playButton, isLoading && styles.playButtonDisabled]}
            onPress={handlePlayPause}
            disabled={isLoading}
          >
            <LinearGradient
              colors={isPlaying ? ['#ef4444', '#dc2626'] : ['#10b981', '#059669']}
              style={styles.playButtonGradient}
            >
              {isLoading || isBuffering ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : isPlaying ? (
                <Pause size={32} color="#fff" />
              ) : (
                <Play size={32} color="#fff" />
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Stop Button */}
          <TouchableOpacity
            style={[styles.controlButton, !isInitialized && styles.controlButtonDisabled]}
            onPress={handleStop}
            disabled={!isInitialized}
          >
            <View style={styles.stopButton} />
          </TouchableOpacity>
        </View>
        
        {/* Stream Info */}
        <View style={styles.streamInfo}>
          <Text style={styles.streamTitle}>🎵 HLS Live Stream</Text>
          <Text style={styles.streamUrl}>{RADIO_CONFIG.streamUrl}</Text>
          <Text style={styles.streamNote}>
            Powered by react-native-track-player
          </Text>
        </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
    letterSpacing: 1.2,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  connectionText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  stationInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  stationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  stationFrequency: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 4,
  },
  stationDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  visualizerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  circularProgress: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 4,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  innerCircle: {
    width: '70%',
    height: '70%',
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    borderRadius: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveOverlay: {
    position: 'absolute',
    bottom: -20,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    gap: 4,
  },
  waveBar: {
    width: 6,
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  bufferingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bufferingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#3b82f6',
  },
  errorContainer: {
    marginTop: 12,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  playButtonDisabled: {
    opacity: 0.7,
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    width: 20,
    height: 20,
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  streamInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  streamTitle: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 6,
  },
  streamUrl: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 6,
  },
  streamNote: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});