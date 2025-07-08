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

const streamUrl = 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/playlist.m3u8';

const setupPlayer = async (): Promise<boolean> => {
  try {
    // Check if player is already running
    const isSetup = await TrackPlayer.isServiceRunning();
    if (isSetup) {
      console.log('[TrackPlayer] Service already running. Resetting...');
      await TrackPlayer.reset();
    } else {
      console.log('[TrackPlayer] Initializing player...');
      await TrackPlayer.setupPlayer({
        // Use default buffer settings to avoid conflicts
        maxCacheSize: 1024 * 10, // 10 MB cache for streaming
        waitForBuffer: true, // Wait for buffer before playing
      });
    }

    // Configure player options - Persistent notification and proper background behavior
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause, // Use Pause instead of Stop - we'll make it act as stop
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause, // Use Pause instead of Stop
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause, // Use Pause instead of Stop
      ],
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback, // Keep service alive
        alwaysPauseOnInterruption: false,
      },
      // Make notification persistent and non-dismissible
      color: 0x0066cc, // Notification color
      progressUpdateEventInterval: 1,
    });

    console.log(`[TrackPlayer] Adding HLS stream: ${streamUrl}`);
    await TrackPlayer.add({
      id: 'akashvani-hls',
      url: streamUrl,
      title: 'Akashvani Radio',
      artist: 'All India Radio',
      artwork: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/All_India_Radio_Logo.svg/1200px-All_India_Radio_Logo.svg.png',
      type: TrackType.HLS,
      isLiveStream: true,
      duration: 0,
    });

    console.log('[TrackPlayer] HLS stream added successfully');
    return true;
  } catch (error) {
    console.error('[TrackPlayer] Setup error:', error);
    return false;
  }
};

export default function RadioScreen() {
  const playbackState = usePlaybackState();
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastStopTime, setLastStopTime] = useState<number | null>(null);

  // Separate function to get fresh stream without removing notification
  const refreshStreamForFreshContent = async (): Promise<boolean> => {
    try {
      console.log('[TrackPlayer] Refreshing stream for fresh content...');
      await TrackPlayer.pause(); // Use pause instead of stop
      await TrackPlayer.reset();
      
      // Re-add track with fresh connection
      await TrackPlayer.add({
        id: `akashvani-hls-${Date.now()}`, // Fresh ID
        url: streamUrl,
        title: 'Akashvani Radio',
        artist: 'All India Radio',
        artwork: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/All_India_Radio_Logo.svg/1200px-All_India_Radio_Logo.svg.png',
        type: TrackType.HLS,
        isLiveStream: true,
        duration: 0,
      });
      
      console.log('[TrackPlayer] Stream refreshed for fresh content');
      return true;
    } catch (error) {
      console.error('[TrackPlayer] Stream refresh error:', error);
      return false;
    }
  };

  // Handle track player events with behind-live-window error recovery
  useTrackPlayerEvents([Event.PlaybackError, Event.PlaybackState], async (event) => {
    if (event.type === Event.PlaybackError) {
      console.error('[TrackPlayer] Playback Error:', event);
      
      // Handle "behind live window" error specifically
      if (event.code === 'android-behind-live-window') {
        console.log('[TrackPlayer] Behind live window - refreshing stream...');
        setErrorMessage('Reconnecting to live stream...');
        
        try {
          // Refresh stream to get fresh live content
          const success = await refreshStreamForFreshContent();
          if (success) {
            console.log('[TrackPlayer] Successfully refreshed, starting playback...');
            await TrackPlayer.play();
            setErrorMessage(''); // Clear error message
            console.log('[TrackPlayer] Auto-recovery successful');
          } else {
            setErrorMessage('Failed to reconnect to live stream');
          }
        } catch (error) {
          console.error('[TrackPlayer] Error recovering from behind-live-window:', error);
          setErrorMessage('Failed to reconnect to live stream');
        }
      } else {
        setErrorMessage('Stream playback failed. Please try again.');
      }
      setIsLoading(false);
    }
    
    if (event.type === Event.PlaybackState) {
      console.log('[TrackPlayer] Playback State Changed:', event.state);
      if (event.state === State.Playing || event.state === State.Paused) {
        setIsLoading(false);
      }
      
      // Track when stream was paused for fresh content logic
      if (event.state === State.Paused) {
        setLastStopTime(Date.now());
      }
    }
  });

  useEffect(() => {
    const initializePlayer = async () => {
      setIsLoading(true);
      const success = await setupPlayer();
      setIsPlayerReady(success);
      setIsLoading(false);
      
      if (!success) {
        setErrorMessage('Failed to initialize audio player');
      }
    };

    initializePlayer();

    // Cleanup on unmount - only for navigation, not app kill
    return () => {
      console.log('[TrackPlayer] Component unmounting...');
      // Don't reset here - let Android system handle notification cleanup when app is killed
      // For navigation, we want to keep the service and notification running
    };
  }, []);

  const togglePlayback = async () => {
    if (!isPlayerReady) {
      Alert.alert('Error', 'Player not ready yet');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      
      const currentState = await TrackPlayer.getPlaybackState();
      console.log('[TrackPlayer] Current state:', currentState);

      if (currentState.state === State.Playing) {
        console.log('[TrackPlayer] Pausing stream (acting as stop for live radio)...');
        await TrackPlayer.pause(); // Use PAUSE instead of STOP to keep notification
        
        // 🔥 FIXED: Use pause() instead of stop() to keep notification persistent
        // Pause keeps the notification visible, stop() removes it after few seconds
        console.log('[TrackPlayer] Stream paused, notification preserved');
        
      } else {
        console.log('[TrackPlayer] Starting stream...');
        
        // Check if we need fresh content (stopped for more than 10 seconds)
        const needsFreshContent = lastStopTime && (Date.now() - lastStopTime) > 10000;
        
        if (needsFreshContent) {
          console.log('[TrackPlayer] Stream stopped for >10s, refreshing for fresh content...');
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
            console.log('[TrackPlayer] Queue empty, re-adding track...');
            await TrackPlayer.add({
              id: 'akashvani-hls',
              url: streamUrl,
              title: 'Akashvani Radio',
              artist: 'All India Radio',
              artwork: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/All_India_Radio_Logo.svg/1200px-All_India_Radio_Logo.svg.png',
              type: TrackType.HLS,
              isLiveStream: true,
              duration: 0,
            });
          }
        }
        
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error('[TrackPlayer] Toggle playback error:', error);
      setErrorMessage('Failed to control playback');
      setIsLoading(false);
    }
  };

  const getPlaybackStatusText = (): string => {
    if (isLoading) return '⏳ Loading...';
    
    switch (playbackState?.state) {
      case State.Playing:
        return '🔴 Live - Now Playing';
      case State.Paused:
        return '⏹️ Stopped'; // Show "Stopped" for paused state in live radio
      case State.Buffering:
        return '⏳ Buffering...';
      case State.Loading:
        return '⏳ Loading stream...';
      default:
        return '⚪ Ready';
    }
  };

  const getButtonText = (): string => {
    if (isLoading) return 'Loading...';
    
    return playbackState?.state === State.Playing ? 'Stop Stream' : 'Play Stream';
  };

  const isPlaying = playbackState?.state === State.Playing;
  const canPlay = isPlayerReady && !isLoading;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎙️ Akashvani FM</Text>
      <Text style={styles.subtitle}>All India Radio - Live Stream</Text>
      
      {!isPlayerReady ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Initializing player...</Text>
        </View>
      ) : (
        <View style={styles.playerContainer}>
          <Text style={styles.status}>{getPlaybackStatusText()}</Text>
          
          {/* Show live indicator when playing - no position display */}
          {isPlaying && (
            <Text style={styles.streamInfo}>
              📡 Live Streaming
            </Text>
          )}
          
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
          
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
  streamInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  controlsContainer: {
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#d32f2f',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});