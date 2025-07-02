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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, Volume2, VolumeX, Radio as RadioIcon } from 'lucide-react-native';
import TrackPlayer, {
  Capability,
  State,
  usePlaybackState,
  Event,
} from 'react-native-track-player';

// Radio station data
const RADIO_STATION = {
  id: 'fm-ujjayanta-agartala',
  name: 'FM Ujjayanta Agartala',
  url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/playlist.m3u8',
  frequency: '103.7 FM',
  location: 'Agartala, Tripura',
};

// Audio visualizer component
const AudioVisualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  const bars = Array.from({ length: 5 }, () => useRef(new Animated.Value(0.3)).current);

  useEffect(() => {
    if (isPlaying) {
      const animations = bars.map((bar) => {
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

// Radio wave animation component
const RadioWaveAnimation = ({ isPlaying }: { isPlaying: boolean }) => {
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPlaying) {
      const createWaveAnimation = (value: Animated.Value) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: 1,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const anim1 = createWaveAnimation(wave1);
      const anim2 = createWaveAnimation(wave2);
      const anim3 = createWaveAnimation(wave3);

      anim1.start();
      setTimeout(() => anim2.start(), 400);
      setTimeout(() => anim3.start(), 800);

      return () => {
        anim1.stop();
        anim2.stop();
        anim3.stop();
      };
    } else {
      wave1.setValue(0);
      wave2.setValue(0);
      wave3.setValue(0);
    }
  }, [isPlaying]);

  const createWaveStyle = (wave: Animated.Value) => ({
    opacity: wave.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 0.4, 0],
    }),
    transform: [
      {
        scale: wave.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2.5],
        }),
      },
    ],
  });

  return (
    <View style={styles.waveContainer}>
      <Animated.View style={[styles.wave, createWaveStyle(wave1)]} />
      <Animated.View style={[styles.wave, createWaveStyle(wave2)]} />
      <Animated.View style={[styles.wave, createWaveStyle(wave3)]} />
    </View>
  );
};

export default function RadioScreen() {
  const playbackState = usePlaybackState();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTrackPlayerReady, setIsTrackPlayerReady] = useState(false);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Initialize track player
  useEffect(() => {
    setupTrackPlayer();
    setupEventListeners();
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
      cleanupTrackPlayer();
    };
  }, []);

  // Pulse animation for the radio icon
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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
  }, []);

  // Rotation animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const setupTrackPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer({
        waitForBuffer: false,        // Start immediately when first segment ready
        autoHandleInterruptions: true,
        maxCacheSize: 1024,         // Optimized for faster start
      });

      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
        ],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
        ],
        progressUpdateEventInterval: 2,
      });

      setIsTrackPlayerReady(true);
      console.log('[Radio] TrackPlayer setup completed');
    } catch (error) {
      console.error('[Radio] Error setting up track player:', error);
    }
  };

  const setupEventListeners = () => {
    const playbackStateListener = TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
      console.log('[Radio] Playback state changed:', data.state);
      
      if (data.state === State.Playing) {
        setIsLoading(false);
      } else if (data.state === State.Error) {
        console.log('[Radio] Playback error, retrying...');
        setTimeout(retryConnection, 1000); // Auto-retry after 1 second
      }
    });

    const errorListener = TrackPlayer.addEventListener(Event.PlaybackError, (data) => {
      console.error('[Radio] Playback error:', data);
      setTimeout(retryConnection, 1000); // Auto-retry after 1 second
    });

    return () => {
      playbackStateListener.remove();
      errorListener.remove();
    };
  };

  const cleanupTrackPlayer = async () => {
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
      console.log('[Radio] TrackPlayer cleaned up');
    } catch (error) {
      console.error('[Radio] Error cleaning up track player:', error);
    }
  };

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      checkPlaybackStatus();
    }
  };

  const checkPlaybackStatus = async () => {
    try {
      const state = await TrackPlayer.getPlaybackState();
      if (state.state === State.Error) {
        retryConnection();
      }
    } catch (error) {
      console.error('[Radio] Error checking playback status:', error);
    }
  };

  const addTrack = async () => {
    try {
      await TrackPlayer.reset();
      
      await TrackPlayer.add({
        id: RADIO_STATION.id,
        url: RADIO_STATION.url,
        title: RADIO_STATION.name,
        artist: RADIO_STATION.location,
        isLiveStream: true,
        headers: {
          'User-Agent': 'RadioApp/1.0',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
        },
      });
      
      console.log('[Radio] Track added successfully');
    } catch (error) {
      console.error('[Radio] Error adding track:', error);
      throw error;
    }
  };

  const handlePlayPause = async () => {
    if (!isTrackPlayerReady) return;

    try {
      const state = await TrackPlayer.getPlaybackState();
      
      if (state.state === State.Playing) {
        await TrackPlayer.pause();
        setIsLoading(false);
      } else {
        setIsLoading(true);
        
        const queue = await TrackPlayer.getQueue();
        if (queue.length === 0) {
          await addTrack();
        }
        
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error('[Radio] Error in play/pause:', error);
      setIsLoading(false);
      // Auto-retry on error
      setTimeout(retryConnection, 1000);
    }
  };

  const retryConnection = async () => {
    if (!isTrackPlayerReady) return;
    
    console.log('[Radio] Retrying connection...');
    
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsLoading(true);
      await addTrack();
      await TrackPlayer.play();
    } catch (error) {
      console.error('[Radio] Error during retry:', error);
      // Keep retrying
      setTimeout(retryConnection, 2000);
    }
  };

  const handleStop = async () => {
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
      setIsLoading(false);
    } catch (error) {
      console.error('[Radio] Error stopping:', error);
    }
  };

  const toggleMute = async () => {
    try {
      const volume = isMuted ? 1 : 0;
      await TrackPlayer.setVolume(volume);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('[Radio] Error toggling mute:', error);
    }
  };

  const isPlaying = playbackState?.state === State.Playing;
  const isBuffering = playbackState?.state === State.Buffering || playbackState?.state === State.Connecting;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Live Radio</Text>
          <Text style={styles.headerSubtitle}>Now Playing</Text>
        </View>
      </LinearGradient>

      <View style={styles.playerContainer}>
        {/* Radio Station Info */}
        <View style={styles.stationInfo}>
          <Text style={styles.stationName}>{RADIO_STATION.name}</Text>
          <Text style={styles.stationFrequency}>{RADIO_STATION.frequency}</Text>
          <Text style={styles.stationLocation}>{RADIO_STATION.location}</Text>
        </View>

        {/* Main Player Visual */}
        <View style={styles.playerVisual}>
          <RadioWaveAnimation isPlaying={isPlaying} />
          
          <Animated.View
            style={[
              styles.radioIconContainer,
              {
                transform: [
                  { scale: pulseAnim },
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
            <LinearGradient
              colors={isPlaying ? ['#10b981', '#059669'] : ['#6b7280', '#4b5563']}
              style={styles.radioIconGradient}
            >
              <RadioIcon size={48} color="white" />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Audio Visualizer */}
        <AudioVisualizer isPlaying={isPlaying} />

        {/* Status Text - Simple */}
        <View style={styles.statusContainer}>
          {isLoading || isBuffering ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.statusText}>Connecting...</Text>
            </View>
          ) : isPlaying ? (
            <Text style={styles.statusText}>🔴 Live</Text>
          ) : (
            <Text style={styles.statusText}>Ready to Play</Text>
          )}
        </View>

        {/* Controls - Moved up */}
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
            style={[
              styles.playButton,
              isPlaying && styles.playButtonActive
            ]}
            onPress={handlePlayPause}
            activeOpacity={0.8}
            disabled={!isTrackPlayerReady}
          >
            <LinearGradient
              colors={isPlaying ? ['#ef4444', '#dc2626'] : ['#3b82f6', '#2563eb']}
              style={styles.playButtonGradient}
            >
              {isLoading || isBuffering ? (
                <ActivityIndicator size="large" color="white" />
              ) : isPlaying ? (
                <Pause size={32} color="white" />
              ) : (
                <Play size={32} color="white" />
              )}
            </LinearGradient>
          </TouchableOpacity>

          {isPlaying && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleStop}
              activeOpacity={0.7}
            >
              <View style={styles.stopButton} />
            </TouchableOpacity>
          )}
        </View>

        {/* Live Indicator */}
        {isPlaying && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE BROADCAST</Text>
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
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  playerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  stationInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  stationName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  stationFrequency: {
    fontSize: 18,
    fontWeight: '500',
    color: '#3b82f6',
    marginBottom: 4,
  },
  stationLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  playerVisual: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  waveContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  radioIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  radioIconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  statusContainer: {
    marginBottom: 40,
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#10b981',
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 40,
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
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
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
  stopButton: {
    width: 20,
    height: 20,
    backgroundColor: '#6b7280',
    borderRadius: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
    letterSpacing: 1,
  },
});