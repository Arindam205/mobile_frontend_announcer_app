import React, { useEffect, useState, useRef } from 'react';
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
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radio, ChevronRight, Play, Pause, WifiOff, AlertCircle } from 'lucide-react-native';
import { api } from '../../src/api/config';
import { LinearGradient } from 'expo-linear-gradient';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

// Interfaces
interface Channel {
  channelId: number;
  channelName: string;
  frequencyDetails: string;
  description: string;
  streamKey?: string;
}
interface Language { languageId: number; languageName: string; }
interface StationResponse {
  stationId: string;
  stationName: string;
  channels: Channel[];
  languages: Language[];
}

const STORAGE_KEYS = {
  LAST_PLAYING_CHANNEL: 'lastPlayingChannelId',
  USER_STOPPED_PLAYBACK: 'userStoppedPlayback', // NEW: Track if user explicitly stopped
};

const ErrorToast = ({ visible, message, type = 'error', onDismiss }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -50, duration: 300, useNativeDriver: true }),
        ]).start(onDismiss);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible]);
  if (!visible) return null;
  const getToastStyle = () => {
    switch (type) {
      case 'warning': return { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' };
      case 'info': return { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' };
      default: return { backgroundColor: '#FEE2E2', borderColor: '#EF4444' };
    }
  };
  const getIconColor = () => {
    switch (type) {
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
      default: return '#EF4444';
    }
  };
  return (
    <Animated.View style={[styles.errorToast, getToastStyle(), { opacity: fadeAnim, transform: [{ translateY }] }]}>
      {type === 'error' && <WifiOff size={20} color={getIconColor()} />}
      {type === 'warning' && <AlertCircle size={20} color={getIconColor()} />}
      <Text style={[styles.errorToastText, { color: getIconColor() }]}>{message}</Text>
    </Animated.View>
  );
};

const EnhancedChannelCard = ({
  channel, index, onChannelSelect, onStreamToggle, isCurrentlyPlaying, isCurrentlyBuffering, stationName, isLastPlayedChannel
}: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (isCurrentlyBuffering) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else { 
      scaleAnim.setValue(1); 
    }
  }, [isCurrentlyBuffering]);
  
  useEffect(() => {
    if (isCurrentlyPlaying) {
      Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
      ).start();
    } else { 
      rotateAnim.setValue(0); 
    }
  }, [isCurrentlyPlaying]);
  
  const gradients: [string, string][] = [
    ['#2563eb', '#1d4ed8'], ['#0ea5e9', '#0369a1'], ['#3b82f6', '#2563eb'], ['#0c4a6e', '#082f49']
  ];
  const gradientColors = gradients[index % gradients.length];
  
  const handlePlayButtonPress = (e: any) => {
    e.stopPropagation(); // Prevent card press when clicking play button
    if (channel.streamKey) onStreamToggle(channel); 
  };

  const handleCardPress = () => {
    // Always navigate to rating selection when clicking card body
    onChannelSelect(channel, stationName);
  };
  
  return (
    <Animated.View style={[styles.channelCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handleCardPress} style={styles.cardTouchable} activeOpacity={0.8}>
        <LinearGradient colors={gradientColors} style={styles.gradientBackground} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.channelContent}>
            <View style={styles.channelInfo}>
              <Animated.View style={[styles.radioIconContainer, {
                transform: [{ rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }]
              }]}>
                <Radio size={24} color="rgba(255,255,255,0.8)" />
              </Animated.View>
              <Text style={styles.channelName}>{channel.channelName}</Text>
            </View>
            <Text style={styles.channelFrequency}>{channel.frequencyDetails}</Text>
            <View style={styles.stationBadge}>
              <Text style={styles.stationName}>{stationName}</Text>
              {isLastPlayedChannel && (
                <Text style={styles.lastPlayedText}>• Last Played</Text>
              )}
            </View>
          </View>
          <View style={styles.actionContainer}>
            {channel.streamKey ? (
              <Pressable
                style={styles.playButtonContainer}
                onPress={handlePlayButtonPress}
                android_ripple={{ color: 'rgba(59,130,246,0.14)', radius: 32 }}
              >
                <LinearGradient
                  colors={['#2563eb', '#60a5fa']}
                  start={{ x: 0.25, y: 0.2 }}
                  end={{ x: 0.75, y: 1 }}
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      borderRadius: 28,
                      opacity: 0.95,
                    },
                  ]}
                />
                <View style={{
                  position: 'absolute',
                  top: 6, left: 10, right: 10,
                  height: 18,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.33)',
                  opacity: 0.7,
                  zIndex: 2,
                }}/>
                {/* Show loader only in play button when buffering */}
                {isCurrentlyBuffering ? (
                  <ActivityIndicator size={24} color="#fff" />
                ) : isCurrentlyPlaying ? (
                  <Pause size={28} color="white" fill="white" style={{ zIndex: 3 }} />
                ) : (
                  <Play size={28} color="white" fill="white" style={{ zIndex: 3 }} />
                )}
              </Pressable>
            ) : (
              <ChevronRight size={24} color="white" style={styles.chevronIcon} />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const [stationData, setStationData] = useState<StationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPlayingChannel, setCurrentPlayingChannel] = useState<number | null>(null);
  const [lastPlayedChannelId, setLastPlayedChannelId] = useState<number | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [networkConnected, setNetworkConnected] = useState(true);
  const [errorToast, setErrorToast] = useState({ visible: false, message: '', type: 'error' as 'error' | 'warning' | 'info' });
  
  // Track loading states for individual channels (only for play button)
  const [loadingChannels, setLoadingChannels] = useState<Set<number>>(new Set());
  
  const router = useRouter();
  const { setSelectedChannelData } = useChannel();
  const playbackState = usePlaybackState();

  useEffect(() => { loadLastPlayedChannel(); }, []);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected === true && state.isInternetReachable !== false;
      setNetworkConnected(isConnected);
      if (!isConnected) showErrorToast('No internet connection. Please check your network.', 'error');
    });
    return () => unsubscribe();
  }, []);

  // FIXED: Proper back button handling for home screen
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        console.log('[HomeScreen] Back button pressed on home screen');
        
        if (Platform.OS === 'android') {
          BackHandler.exitApp();
        }
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      return () => {
        backHandler.remove();
      };
    }, [])
  );

  // FIXED: Properly sync state when returning to home screen - maintain current state
  useFocusEffect(
    useCallback(() => {
      console.log('[HomeScreen] Screen focused, syncing with TrackPlayer...');
      
      const handleScreenFocus = async () => {
        try {
          // Always sync with current TrackPlayer state - don't change anything
          await syncWithTrackPlayerOnly();
          
        } catch (error) {
          console.error('[HomeScreen] Error in screen focus handling:', error);
        }
      };
      
      handleScreenFocus();
      
      return () => {
        console.log('[HomeScreen] Screen unfocused');
      };
    }, [])
  );

  // ENHANCED: Better TrackPlayer event handling
  useTrackPlayerEvents([Event.PlaybackError, Event.PlaybackState, Event.PlaybackTrackChanged], async (event) => {
    console.log('[HomeScreen] TrackPlayer event:', event.type);
    
    if (event.type === Event.PlaybackError) {
      console.log('[HomeScreen] Playback error occurred');
      setIsBuffering(false);
      setLoadingChannels(new Set()); // Clear all loading states
      showErrorToast('Streaming error occurred. Please try again.', 'error');
    }
    
    if (event.type === Event.PlaybackState) {
      console.log('[HomeScreen] Playback state changed to:', event.state);
      switch (event.state) {
        case State.Playing:
          console.log('[HomeScreen] State: Playing - clearing buffering immediately');
          setIsBuffering(false);
          setLoadingChannels(new Set()); // Clear loading states immediately
          break;
        case State.Paused:
        case State.Stopped:
          console.log('[HomeScreen] State: Paused/Stopped - clearing buffering');
          setIsBuffering(false);
          setLoadingChannels(new Set()); // Clear loading states
          break;
        case State.Buffering:
        case State.Loading:
        case State.Connecting:
          console.log('[HomeScreen] State: Buffering/Loading/Connecting - setting buffering');
          setIsBuffering(true);
          // Don't clear loadingChannels here, let them persist until playing
          break;
        case State.Ready:
          console.log('[HomeScreen] State: Ready - clearing buffering but keeping notification');
          // Track is ready but might not be playing yet
          setIsBuffering(false);
          break;
        default:
          setIsBuffering(false);
      }
      
      // Faster sync for immediate UI updates
      setTimeout(() => {
        syncWithTrackPlayerOnly();
      }, 50);
    }
    
    if (event.type === Event.PlaybackTrackChanged) {
      console.log('[HomeScreen] Track changed event');
      setTimeout(() => {
        syncWithTrackPlayerOnly();
      }, 100);
    }
  });

  useEffect(() => {
    initializePlayer();
    return () => {
      if ((global as any).trackPlayerServiceControls?.stopFromApp) {
        (global as any).trackPlayerServiceControls.stopFromApp();
      }
    };
  }, []);

  const initializePlayer = async () => {
    try {
      const isSetup = await TrackPlayer.isServiceRunning();
      if (!isSetup) {
        await TrackPlayer.setupPlayer({ maxCacheSize: 1024 * 15, waitForBuffer: true, autoHandleInterruptions: true, autoUpdateMetadata: true, });
        await TrackPlayer.updateOptions({
          capabilities: [Capability.Play, Capability.Pause],
          compactCapabilities: [Capability.Play, Capability.Pause],
          notificationCapabilities: [Capability.Play, Capability.Pause],
          android: { appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification, alwaysPauseOnInterruption: false, },
          color: 0x3b82f6,
          progressUpdateEventInterval: 5,
        });
      }
    } catch (error) { }
  };
  
  const showErrorToast = (message: string, type: 'error' | 'warning' | 'info' = 'error') => setErrorToast({ visible: true, message, type });
  const hideErrorToast = () => setErrorToast(prev => ({ ...prev, visible: false }));

  // Load last played channelId
  const loadLastPlayedChannel = async () => {
    try {
      const lastChannelId = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PLAYING_CHANNEL);
      if (lastChannelId) setLastPlayedChannelId(parseInt(lastChannelId, 10));
    } catch (error) { }
  };
  
  // Save last played channelId
  const saveLastPlayedChannel = async (channelId: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_PLAYING_CHANNEL, channelId.toString());
      setLastPlayedChannelId(channelId);
    } catch (error) { }
  };

  // NEW: Save user stopped state
  const saveUserStoppedState = async (stopped: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_STOPPED_PLAYBACK, stopped.toString());
    } catch (error) { }
  };

  // Helper to create fresh HLS URL
  const createFreshStreamUrl = async (baseUrl: string): Promise<string> => {
    try {
      const url = new URL(baseUrl);
      url.searchParams.set('_t', Date.now().toString());
      url.searchParams.set('_cb', Math.random().toString(36).substring(2, 15));
      url.searchParams.set('_v', '3.0.0');
      return url.toString();
    } catch (error) {
      return `${baseUrl}?_t=${Date.now()}&_cb=${Math.random().toString(36).substring(2, 15)}`;
    }
  };

  // FIXED: Only sync with existing TrackPlayer state, maintain whatever state exists
  const syncWithTrackPlayerOnly = async () => {
    try {
      const playbackState = await TrackPlayer.getPlaybackState();
      const queue = await TrackPlayer.getQueue();
      
      console.log('[HomeScreen] Syncing - Current TrackPlayer state:', playbackState.state);
      console.log('[HomeScreen] Syncing - Current queue length:', queue.length);
      
      if (queue.length > 0) {
        const currentTrack = queue[0];
        console.log('[HomeScreen] Syncing - Current track:', currentTrack);
        
        if (currentTrack.id && currentTrack.id.startsWith('channel-')) {
          const channelIdMatch = currentTrack.id.match(/channel-(\d+)-/);
          if (channelIdMatch) {
            const playingChannelId = parseInt(channelIdMatch[1], 10);
            console.log('[HomeScreen] Syncing - Found channel ID:', playingChannelId);
            
            // FIXED: Only update UI to match actual TrackPlayer state
            setCurrentPlayingChannel(playingChannelId);
            await saveLastPlayedChannel(playingChannelId);
            
            // Sync buffering state accurately
            if ((playbackState.state as State) === State.Loading || 
                (playbackState.state as State) === State.Buffering ||
                (playbackState.state as State) === State.Connecting) {
              console.log('[HomeScreen] Syncing - Setting buffering state');
              setIsBuffering(true);
              setLoadingChannels(prev => new Set([...prev, playingChannelId]));
            } else {
              console.log('[HomeScreen] Syncing - Clearing buffering state');
              setIsBuffering(false);
              setLoadingChannels(prev => {
                const newSet = new Set(prev);
                newSet.delete(playingChannelId);
                return newSet;
              });
            }
          }
        }
      } else {
        // No track in queue - clear current playing
        console.log('[HomeScreen] Syncing - No track in queue');
        setCurrentPlayingChannel(null);
        setIsBuffering(false);
        setLoadingChannels(new Set());
      }
    } catch (error) {
      console.error('[HomeScreen] Error syncing with TrackPlayer:', error);
      // Don't change state on error - keep existing state
    }
  };

  // FIXED: Better stream toggle handler with seamless notification and loading
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
      
      // If playing or buffering the same channel, stop it
      if (currentPlayingChannel === channel.channelId && 
          (currentState.state === State.Playing || currentState.state === State.Buffering || currentState.state === State.Loading)) {
        console.log('[HomeScreen] Stopping current channel:', channel.channelId);
        
        // Clear states immediately
        setCurrentPlayingChannel(null);
        setIsBuffering(false);
        setLoadingChannels(new Set());
        
        // Mark as user-stopped to prevent auto-resume
        await saveUserStoppedState(true);
        
        if ((global as any).trackPlayerServiceControls?.stopFromApp) {
          await (global as any).trackPlayerServiceControls.stopFromApp();
        } else {
          await TrackPlayer.stop();
          await TrackPlayer.reset();
        }
        return;
      }
      
      // Starting new channel
      console.log('[HomeScreen] Starting channel:', channel.channelId);
      
      // FIXED: Set states in correct order to show seamless loading
      setCurrentPlayingChannel(channel.channelId);
      setIsBuffering(true);
      setLoadingChannels(prev => new Set([...prev, channel.channelId]));
      
      // Save channelId and clear user-stopped flag before starting
      await saveLastPlayedChannel(channel.channelId);
      await saveUserStoppedState(false);
      
      // FIXED: Don't stop/reset if there's already a track playing to maintain notification
      const queue = await TrackPlayer.getQueue();
      const needsReset = queue.length === 0 || currentState.state === State.Stopped;
      
      if (needsReset) {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
      } else {
        // Just pause to keep notification alive
        await TrackPlayer.pause();
        await TrackPlayer.reset();
      }
      
      // Create and add new track
      const freshStreamUrl = await createFreshStreamUrl(channel.streamKey);
      await TrackPlayer.add({
        id: `channel-${channel.channelId}-${Date.now()}`,
        url: freshStreamUrl,
        title: channel.channelName,
        artist: stationData?.stationName || 'All India Radio',
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
      
      // Start playing
      await TrackPlayer.play();
      
      // Force a sync after starting (reduced timeout for faster feedback)
      setTimeout(() => {
        syncWithTrackPlayerOnly();
      }, 500);
      
    } catch (error) {
      console.error('[HomeScreen] Error in handleStreamToggle:', error);
      setIsBuffering(false);
      setLoadingChannels(prev => {
        const newSet = new Set(prev);
        newSet.delete(channel.channelId);
        return newSet;
      });
      setCurrentPlayingChannel(null);
      showErrorToast('Failed to start streaming. Please try again.', 'error');
    }
  };

  // Fetch channels
  const fetchChannels = async () => {
    try {
      setLoading(true); setError(null);
      const response = await api.get('/api/stations/my-channels');
      if (response.status >= 200 && response.status < 300){
        const enhancedChannels = response.data.channels.map((channel: Channel) => ({
          ...channel,
          stationName: response.data.stationName
        }));
        
        (global as any).appChannels = enhancedChannels;
        (global as any).appStationName = response.data.stationName;
        
        setStationData(response.data);
        
        // Only sync existing state, don't auto-resume
        setTimeout(() => {
          syncWithTrackPlayerOnly();
        }, 500);
        
      } 
      else if (response.status >= 400 && response.status < 500) setError(response.data?.message || 'Failed to load channels');
      else setError(`Unexpected server response: ${response.status}`);
    } catch (error: any) {
      setError('Failed to load channels. Please try again later.');
    } finally { setLoading(false); }
  };

  // Navigation for channel rating
  const handleChannelSelect = (channel: Channel, stationName: string) => {
    setSelectedChannelData(channel, stationName);
    router.push('/(app)/rating-selection');
  };
  
  useEffect(() => { fetchChannels(); }, []);

  const isChannelPlaying = (channelId: number) => currentPlayingChannel === channelId && playbackState?.state === State.Playing;
  const isChannelBuffering = (channelId: number) => {
    // FIXED: Show loading if channel is explicitly loading OR if it's the current channel and buffering
    return loadingChannels.has(channelId) || (currentPlayingChannel === channelId && isBuffering);
  };
  const isLastPlayedChannelLabel = (channelId: number) => lastPlayedChannelId === channelId;

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
    <ErrorToast visible={errorToast.visible} message={errorToast.message} type={errorToast.type} onDismiss={hideErrorToast} />
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Live Radio & Ratings</Text>
      <Text style={styles.subheading}>Stream live • Rate content • Tap cards to evaluate</Text>
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
              stationName={stationData.stationName}
              isLastPlayedChannel={isLastPlayedChannelLabel(channel.channelId)}
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
  container: { flex: 1, backgroundColor: '#f4f4f4', },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6b7280', },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, },
  errorText: { textAlign: 'center', fontSize: 16, color: '#ef4444', marginBottom: 20, },
  retryButton: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, },
  retryButtonText: { color: 'white', fontSize: 16, fontWeight: '600', },
  scrollContent: { padding: 16, },
  heading: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8, },
  subheading: { fontSize: 16, color: '#6b7280', marginBottom: 24, },
  channelsContainer: { gap: 16, },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50, },
  emptyText: { fontSize: 18, color: '#6b7280', },
  channelCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, },
  cardTouchable: { borderRadius: 16, overflow: 'hidden', },
  gradientBackground: { flexDirection: 'row', alignItems: 'center', padding: 20, height: 120, },
  channelContent: { flex: 1, },
  channelInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, },
  radioIconContainer: { marginRight: 12, },
  channelName: { fontSize: 20, fontWeight: 'bold', color: 'white', marginLeft: 12, },
  channelFrequency: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginLeft: 36, marginTop: 4, },
  stationBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, alignSelf: 'flex-start', marginTop: 12, flexDirection: 'row', alignItems: 'center', },
  stationName: { fontSize: 13, color: 'white', fontWeight: '500', },
  lastPlayedText: { fontSize: 11, color: '#EF4444', fontWeight: '600', marginLeft: 4, },
  actionContainer: { justifyContent: 'center', alignItems: 'center', },
  playButtonContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    elevation: 6,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    overflow: 'visible',
    margin: 0,
  },
  chevronIcon: { marginLeft: 5, },
  errorToast: { position: 'absolute', top: 20, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, zIndex: 1000, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, },
  errorToastText: { marginLeft: 12, fontSize: 14, fontWeight: '500', flex: 1, },
});