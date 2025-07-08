import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert 
} from 'react-native';
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

const streamUrl = 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/playlist.m3u8';

// Helper function to resolve redirected URL for HTTPS HLS streams
const resolveRedirectedUrl = async (url: string): Promise<string> => {
  try {
    console.log('[RadioScreen] 🔍 Resolving HTTPS redirects for:', url);
    
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow', // Follow all redirects
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegurl, audio/x-mpegurl, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Connection': 'keep-alive',
        'Referer': 'https://akashvani.gov.in/',
        'Origin': 'https://akashvani.gov.in',
      }
    });

    if (response.ok) {
      const finalUrl = response.url;
      console.log('[RadioScreen] 📍 Resolved URL:', finalUrl);
      
      if (finalUrl !== url) {
        console.log('[RadioScreen] ✅ Redirect detected and followed');
      }
      
      return finalUrl;
    } else {
      console.warn('[RadioScreen] ⚠️ Failed to resolve redirects, status:', response.status);
      return url;
    }
  } catch (error) {
    console.error('[RadioScreen] ❌ Error resolving redirects:', error);
    return url;
  }
};

// Helper function to create fresh stream URL
const createFreshStreamUrl = async (): Promise<string> => {
  try {
    const resolvedUrl = await resolveRedirectedUrl(streamUrl);
    
    const url = new URL(resolvedUrl);
    url.searchParams.set('_t', Date.now().toString());
    url.searchParams.set('_cb', Math.random().toString(36).substring(2, 15));
    url.searchParams.set('_v', '3.0.0');
    
    const freshUrl = url.toString();
    console.log('[RadioScreen] 🆕 Created fresh stream URL');
    return freshUrl;
  } catch (error) {
    console.error('[RadioScreen] ❌ Error creating fresh URL:', error);
    return `${streamUrl}?_t=${Date.now()}&_cb=${Math.random().toString(36).substring(2, 15)}`;
  }
};

const setupPlayer = async (): Promise<boolean> => {
  try {
    console.log('[RadioScreen] 🚀 Setting up enhanced TrackPlayer...');
    
    // Check if player is already running
    const isSetup = await TrackPlayer.isServiceRunning();
    if (isSetup) {
      console.log('[RadioScreen] Service already running. Resetting...');
      await TrackPlayer.reset();
    } else {
      console.log('[RadioScreen] Initializing player...');
      await TrackPlayer.setupPlayer({
        // Enhanced buffer configuration for live streams
        maxCacheSize: 1024 * 15, // 15 MB cache
        waitForBuffer: true,
        autoHandleInterruptions: true,
        autoUpdateMetadata: true,
      });
    }

    // Configure player options with ONLY Play/Pause capabilities (NO STOP)
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        // Remove Capability.Stop to avoid duplicate stop buttons
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        // Remove Capability.Stop to avoid duplicate stop buttons
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        // Remove Capability.Stop to avoid duplicate stop buttons
      ],
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification, // Remove notification when app is killed
        alwaysPauseOnInterruption: false,
      },
      // Enhanced notification styling
      color: 0x3b82f6,
      progressUpdateEventInterval: 5,
    });

    console.log('[RadioScreen] ✅ TrackPlayer setup completed');
    return true;
    
  } catch (error) {
    console.error('[RadioScreen] ❌ Setup error:', error);
    return false;
  }
};

export default function RadioScreen() {
  const playbackState = usePlaybackState();
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastStopTime, setLastStopTime] = useState<number | null>(null);
  const [networkStatus, setNetworkStatus] = useState<{
    isConnected: boolean;
    type: string;
  }>({ isConnected: true, type: 'unknown' });

  // Network monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected === true && state.isInternetReachable !== false;
      
      setNetworkStatus({
        isConnected,
        type: state.type || 'unknown'
      });

      console.log('[RadioScreen] 📡 Network status changed:', {
        isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable
      });

      // Clear network-related error messages when network returns
      if (isConnected && (errorMessage.includes('network') || errorMessage.includes('connection'))) {
        setErrorMessage('');
      }
    });

    return () => unsubscribe();
  }, [errorMessage]);

  // Function to refresh stream with redirect resolution
  const refreshStreamForFreshContent = async (): Promise<boolean> => {
    try {
      console.log('[RadioScreen] 🔄 Refreshing stream with redirect resolution...');
      await TrackPlayer.pause();
      await TrackPlayer.reset();
      
      // Get fresh URL with redirects resolved
      const freshStreamUrl = await createFreshStreamUrl();
      
      await TrackPlayer.add({
        id: `akashvani-hls-${Date.now()}`,
        url: freshStreamUrl,
        title: 'Akashvani Radio',
        artist: 'All India Radio',
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
      
      console.log('[RadioScreen] ✅ Stream refreshed with redirect resolution');
      return true;
    } catch (error) {
      console.error('[RadioScreen] ❌ Stream refresh error:', error);
      return false;
    }
  };

  // Check network connectivity
  const checkNetworkConnectivity = async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected === true && state.isInternetReachable !== false;
    } catch (error) {
      console.error('[RadioScreen] Network check failed:', error);
      return false;
    }
  };

  // Enhanced error classification
  const isNetworkRelatedError = (error: any): boolean => {
    const networkErrorCodes = [
      'ERR_NETWORK_CHANGED', 'ERR_INTERNET_DISCONNECTED', 'ERR_CONNECTION_REFUSED',
      'ERR_CONNECTION_TIMED_OUT', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET',
      'Network Error'
    ];

    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code?.toLowerCase() || '';

    return networkErrorCodes.some(code => 
      errorMessage.includes(code.toLowerCase()) || errorCode.includes(code.toLowerCase())
    );
  };

  const isHttpStatusError = (error: any): boolean => {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code?.toLowerCase() || '';

    return (
      errorCode.includes('android-io-bad-http-status') ||
      errorCode.includes('error_code_io_bad_http_status') ||
      errorCode.includes('io-bad-http-status') ||
      errorMessage.includes('bad http status') ||
      errorMessage.includes('response code:') ||
      errorMessage.includes('http error')
    );
  };

  const isBehindLiveWindowError = (error: any): boolean => {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code?.toLowerCase() || '';

    return (
      errorCode.includes('android-behind-live-window') ||
      errorMessage.includes('behind live window')
    );
  };

  // Enhanced track player events with comprehensive error handling
  useTrackPlayerEvents([Event.PlaybackError, Event.PlaybackState], async (event) => {
    if (event.type === Event.PlaybackError) {
      console.error('[RadioScreen] 🚨 Playback Error:', event);
      
      // Check current network status first
      const hasNetwork = await checkNetworkConnectivity();
      
      // **Priority 1: Network-related errors**
      if (!hasNetwork || isNetworkRelatedError(event)) {
        console.log('[RadioScreen] 📡 Network-related error detected');
        setErrorMessage('Network connection lost. The stream will automatically resume when connection is restored.');
        // Let the service handle background recovery
        setIsLoading(false);
        return;
      }
      
      // **Priority 2: HTTP Status errors** (main focus for HTTPS streams)
      if (isHttpStatusError(event)) {
        console.log('[RadioScreen] 🎯 HTTP status error detected - applying redirect resolution');
        setErrorMessage('Reconnecting to stream...');
        
        try {
          const success = await refreshStreamForFreshContent();
          if (success) {
            console.log('[RadioScreen] Starting playback after redirect resolution...');
            await TrackPlayer.play();
            setErrorMessage(''); // Clear error message
            console.log('[RadioScreen] ✅ HTTP status error recovery successful');
          } else {
            setErrorMessage('Failed to reconnect to stream. Please try again.');
          }
        } catch (error) {
          console.error('[RadioScreen] ❌ HTTP status error recovery failed:', error);
          setErrorMessage('Failed to reconnect to stream. Please try again.');
        }
        setIsLoading(false);
        return;
      }
      
      // **Priority 3: Behind live window errors**
      if (isBehindLiveWindowError(event)) {
        console.log('[RadioScreen] ⏰ Behind live window - refreshing with redirect resolution');
        setErrorMessage('Reconnecting to live stream...');
        
        try {
          const success = await refreshStreamForFreshContent();
          if (success) {
            console.log('[RadioScreen] Starting playback after live window recovery...');
            await TrackPlayer.play();
            setErrorMessage(''); // Clear error message
            console.log('[RadioScreen] ✅ Behind live window recovery successful');
          } else {
            setErrorMessage('Failed to reconnect to live stream');
          }
        } catch (error) {
          console.error('[RadioScreen] ❌ Behind live window recovery failed:', error);
          setErrorMessage('Failed to reconnect to live stream');
        }
        setIsLoading(false);
        return;
      }
      
      // **Priority 4: General errors**
      console.log('[RadioScreen] ⚠️ General playback error');
      setErrorMessage('Stream playback failed. Please try again.');
      setIsLoading(false);
    }
    
    if (event.type === Event.PlaybackState) {
      console.log('[RadioScreen] 🎵 Playback State Changed:', event.state);
      
      // IMPORTANT FIX: Always clear loading state on any state change
      setIsLoading(false);
      
      // Track when stream was paused for fresh content logic
      if (event.state === State.Paused || event.state === State.Stopped) {
        setLastStopTime(Date.now());
      }

      // Clear error message when successfully playing
      if (event.state === State.Playing && errorMessage) {
        setErrorMessage('');
      }
    }
  });

  // Enhanced player initialization
  useEffect(() => {
    const initializeEnhancedPlayer = async () => {
      setIsLoading(true);
      
      // Check network first
      const hasNetwork = await checkNetworkConnectivity();
      if (!hasNetwork) {
        setIsLoading(false);
        setErrorMessage('No internet connection. Please check your network and try again.');
        setIsPlayerReady(false);
        return;
      }

      const success = await setupPlayer();
      setIsPlayerReady(success);
      setIsLoading(false);
      
      if (!success) {
        setErrorMessage('Failed to initialize audio player');
      }
    };

    initializeEnhancedPlayer();

    // Cleanup on unmount
    return () => {
      console.log('[RadioScreen] Component unmounting...');
      // Call the service control to properly stop and clear controls
      if ((global as any).trackPlayerServiceControls?.stopFromApp) {
        (global as any).trackPlayerServiceControls.stopFromApp();
      }
    };
  }, []);

  // FIXED: Enhanced playback toggle with proper loading state management
  const togglePlayback = async () => {
    if (!isPlayerReady) {
      Alert.alert('Error', 'Player not ready yet');
      return;
    }

    // Check network before attempting to play
    const hasNetwork = await checkNetworkConnectivity();
    if (!hasNetwork) {
      setErrorMessage('No internet connection. Please check your network and try again.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      
      const currentState = await TrackPlayer.getPlaybackState();
      console.log('[RadioScreen] Current state:', currentState);

      if (currentState.state === State.Playing) {
        console.log('[RadioScreen] ⏸️ Stopping stream from app (should clear notification)...');
        
        // Call the service control to properly stop and clear controls when stopped from app
        if ((global as any).trackPlayerServiceControls?.stopFromApp) {
          await (global as any).trackPlayerServiceControls.stopFromApp();
        } else {
          // Fallback if service controls are not available
          await TrackPlayer.stop();
          await TrackPlayer.reset();
        }
        
        // IMPORTANT FIX: Immediately clear loading state after stopping
        setIsLoading(false);
        console.log('[RadioScreen] ✅ Stream stopped from app, notification should be cleared');
        
      } else {
        console.log('[RadioScreen] ▶️ Starting stream...');
        
        // **10-second rule**: Check if we need fresh content
        const needsFreshContent = lastStopTime && (Date.now() - lastStopTime) > 10000;
        
        if (needsFreshContent) {
          console.log('[RadioScreen] ⏰ Stream stopped for >10s, refreshing for fresh content...');
          const refreshSuccess = await refreshStreamForFreshContent();
          if (!refreshSuccess) {
            setErrorMessage('Failed to refresh stream');
            setIsLoading(false);
            return;
          }
        } else {
          // Check if queue is empty and re-add track if needed
          const queue = await TrackPlayer.getQueue();
          if (queue.length === 0) {
            console.log('[RadioScreen] 📁 Queue empty, adding track with redirect resolution...');
            
            const freshStreamUrl = await createFreshStreamUrl();
            
            await TrackPlayer.add({
              id: `akashvani-hls-${Date.now()}`,
              url: freshStreamUrl,
              title: 'Akashvani Radio',
              artist: 'All India Radio',
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
          }
        }
        
        // Call the service control to start stream (this will show notification)
        if ((global as any).trackPlayerServiceControls?.startStream) {
          await (global as any).trackPlayerServiceControls.startStream();
        } else {
          // Fallback if service controls are not available
          await TrackPlayer.play();
        }
        
        // Loading state will be cleared by the playback state event listener
        console.log('[RadioScreen] ✅ Playback started');
      }
    } catch (error) {
      console.error('[RadioScreen] ❌ Toggle playback error:', error);
      
      // Enhanced error handling
      const hasNetwork = await checkNetworkConnectivity();
      if (!hasNetwork) {
        setErrorMessage('Network connection lost during playback');
      } else if (isNetworkRelatedError(error)) {
        setErrorMessage('Network connection unstable. Please check your connection.');
      } else if (isHttpStatusError(error)) {
        setErrorMessage('Stream connection issue. Retrying...');
        // Try to recover immediately
        try {
          const success = await refreshStreamForFreshContent();
          if (success) {
            await TrackPlayer.play();
            setErrorMessage('');
          }
        } catch (recoveryError) {
          setErrorMessage('Failed to reconnect to stream');
        }
      } else {
        setErrorMessage('Failed to control playback');
      }
      setIsLoading(false);
    }
  };

  // Enhanced status text with network awareness
  const getPlaybackStatusText = (): string => {
    if (!networkStatus.isConnected) {
      return '📡 No Internet Connection';
    }
    
    if (isLoading) return '⏳ Loading...';
    
    switch (playbackState?.state) {
      case State.Playing:
        return '🔴 Live - Now Playing';
      case State.Paused:
      case State.Stopped:
        return '⏹️ Stopped';
      case State.Buffering:
        return '⏳ Buffering...';
      case State.Loading:
        return '⏳ Loading stream...';
      default:
        return '⚪ Ready';
    }
  };

  // Enhanced button text with network awareness
  const getButtonText = (): string => {
    if (!networkStatus.isConnected) {
      return 'No Internet';
    }
    
    if (isLoading) return 'Loading...';
    
    return playbackState?.state === State.Playing ? 'Stop Stream' : 'Play Stream';
  };

  // Enhanced playability check
  const isPlaying = playbackState?.state === State.Playing;
  const canPlay = isPlayerReady && !isLoading && networkStatus.isConnected;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎙️ Akashvani FM</Text>
      <Text style={styles.subtitle}>All India Radio - Live Stream</Text>
      
      {/* Enhanced Network Status Indicator */}
      {!networkStatus.isConnected && (
        <View style={styles.networkStatusContainer}>
          <Text style={styles.networkStatusText}>
            📡 Network: {networkStatus.type} - Disconnected
          </Text>
          <Text style={styles.networkStatusSubtext}>
            Stream will resume automatically when connection is restored
          </Text>
        </View>
      )}
      
      {!isPlayerReady ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Initializing enhanced player...</Text>
        </View>
      ) : (
        <View style={styles.playerContainer}>
          <Text style={styles.status}>{getPlaybackStatusText()}</Text>
          
          {/* Enhanced live indicator */}
          {isPlaying && networkStatus.isConnected && (
            <View style={styles.liveIndicatorContainer}>
              <View style={styles.liveIndicator} />
              <Text style={styles.streamInfo}>📡 Live Streaming</Text>
            </View>
          )}
          
          {/* Enhanced error display */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
          
          {/* Enhanced controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={[
                styles.playButton, 
                !canPlay && styles.disabledButton,
                isPlaying && styles.stopButton
              ]}
              onPress={togglePlayback}
              disabled={!canPlay}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.playButtonText}>
                  {isPlaying ? '⏹️' : '▶️'} {getButtonText()}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Stream quality indicator */}
          {isPlaying && (
            <View style={styles.qualityContainer}>
              <Text style={styles.qualityText}>
                🎵 HLS • Enhanced Quality • Auto-Reconnect
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  networkStatusContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  networkStatusText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  networkStatusSubtext: {
    color: '#856404',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  playerContainer: {
    alignItems: 'center',
    width: '100%',
  },
  status: {
    fontSize: 18,
    marginBottom: 15,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  liveIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    backgroundColor: '#22c55e',
    borderRadius: 4,
    marginRight: 8,
  },
  streamInfo: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    lineHeight: 20,
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  playButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#0066cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  stopButton: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: '#9ca3af',
    shadowColor: '#9ca3af',
  },
  qualityContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 10,
  },
  qualityText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
    textAlign: 'center',
  },
});