import TrackPlayer, { Event, State } from 'react-native-track-player';

module.exports = async function() {
  console.log('[RadioService] Live radio service started');

  // Handle remote controls from notification panel and lock screen
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    console.log('[RadioService] Remote play triggered');
    try {
      await TrackPlayer.play();
    } catch (error) {
      console.error('[RadioService] Error in remote play:', error);
    }
  });
  
  // For live radio, pause = stop (no buffering, just stop the stream)
  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    console.log('[RadioService] Remote pause triggered - stopping live stream');
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
    } catch (error) {
      console.error('[RadioService] Error in remote pause/stop:', error);
    }
  });
  
  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    console.log('[RadioService] Remote stop triggered');
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
    } catch (error) {
      console.error('[RadioService] Error in remote stop:', error);
    }
  });

  // No next/previous for live radio - remove these listeners
  // Live radio only needs play/stop functionality

  // Handle playback state changes for live streams
  TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
    console.log('[RadioService] Playback state changed:', data.state);
    
    switch (data.state) {
      case State.Connecting:
      case State.Buffering:
        console.log('[RadioService] Connecting to live stream...');
        break;
      case State.Playing:
        console.log('[RadioService] Live stream connected and playing');
        break;
      case State.Stopped:
        console.log('[RadioService] Live stream stopped');
        break;
      case State.Error:
        console.log('[RadioService] Live stream error occurred');
        break;
      default:
        console.log('[RadioService] Stream state:', data.state);
    }
  });
  
  // Enhanced error handling with auto-recovery for live streams
  TrackPlayer.addEventListener(Event.PlaybackError, async (data) => {
    console.error('[RadioService] Live stream error:', data);
    
    // Auto-retry mechanism for live streams
    setTimeout(async () => {
      try {
        console.log('[RadioService] Attempting to recover live stream...');
        
        // Stop current stream
        await TrackPlayer.stop();
        await TrackPlayer.reset();
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if we have tracks to retry
        const queue = await TrackPlayer.getQueue();
        if (queue.length === 0) {
          console.log('[RadioService] No tracks in queue, recovery requires manual restart');
          return;
        }
        
        // Retry connection
        await TrackPlayer.play();
        console.log('[RadioService] Live stream recovery attempt completed');
        
      } catch (error) {
        console.error('[RadioService] Recovery failed:', error);
        
        // Final cleanup on failed recovery
        setTimeout(async () => {
          try {
            console.log('[RadioService] Final cleanup after failed recovery');
            await TrackPlayer.stop();
            await TrackPlayer.reset();
          } catch (finalError) {
            console.error('[RadioService] Final cleanup failed:', finalError);
          }
        }, 5000);
      }
    }, 3000);
  });
  
  // Handle when live stream ends unexpectedly
  TrackPlayer.addEventListener(Event.PlaybackTrackChanged as any, (data) => {
    console.log('[RadioService] Track changed:', data);
    
    if (data.nextTrack === undefined) {
      console.log('[RadioService] Live stream ended unexpectedly - may need reconnection');
    }
  });

  // Handle metadata updates from live radio stream
  TrackPlayer.addEventListener(Event.PlaybackMetadataReceived as any, (data) => {
    console.log('[RadioService] Live stream metadata:', data);
    // This shows current program/song info from the radio station
  });

  // Handle audio focus changes and interruptions - for live radio: stop completely
  TrackPlayer.addEventListener(Event.RemoteDuck, async (data) => {
    console.log('[RadioService] Audio focus change:', data);
    
    if (data.paused || data.permanent) {
      // Any audio interruption = stop the live stream completely
      console.log('[RadioService] Stopping live stream due to audio interruption');
      try {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
      } catch (error) {
        console.error('[RadioService] Error stopping on audio interruption:', error);
      }
    }
    // Note: We don't auto-resume live streams - user must manually restart
  });

  console.log('[RadioService] Live radio service initialized with all event listeners');
};