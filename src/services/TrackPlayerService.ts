import TrackPlayer, { Event, State } from 'react-native-track-player';

let isServiceRunning = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

module.exports = async function() {
  console.log('[RadioService] Live radio service started');
  isServiceRunning = true;

  // Enhanced remote control handling for live radio
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    console.log('[RadioService] Remote play triggered');
    try {
      const state = await TrackPlayer.getPlaybackState();
      
      if (state.state === State.Stopped || state.state === State.None) {
        // If completely stopped, we need to reload the stream
        console.log('[RadioService] Stream was stopped, checking for tracks');
        const queue = await TrackPlayer.getQueue();
        
        if (queue.length === 0) {
          console.log('[RadioService] No tracks in queue, cannot resume from remote');
          return;
        }
      }
      
      await TrackPlayer.play();
      reconnectAttempts = 0; // Reset on successful play
    } catch (error) {
      console.error('[RadioService] Error in remote play:', error);
      handleRemoteError();
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
      reconnectAttempts = 0; // Reset attempts on intentional stop
    } catch (error) {
      console.error('[RadioService] Error in remote stop:', error);
    }
  });

  // Enhanced playback state monitoring
  TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
    console.log('[RadioService] Playback state changed:', data.state);
    
    switch (data.state) {
      case State.Connecting:
      case State.Buffering:
        console.log('[RadioService] Connecting to live stream...');
        break;
      case State.Playing:
        console.log('[RadioService] Live stream connected and playing');
        reconnectAttempts = 0; // Reset on successful connection
        break;
      case State.Stopped:
        console.log('[RadioService] Live stream stopped');
        break;
      case State.Error:
        console.log('[RadioService] Live stream error occurred');
        handleStreamError();
        break;
      default:
        console.log('[RadioService] Stream state:', data.state);
    }
  });
  
  // Enhanced error handling with intelligent retry logic
  TrackPlayer.addEventListener(Event.PlaybackError, async (data) => {
    console.error('[RadioService] Live stream error:', data);
    handleStreamError();
  });

  // Handle stream quality events (if available)
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
    console.log('[RadioService] Playback queue ended - this should not happen for live streams');
    // For live streams, this might indicate a connection issue
    handleStreamError();
  });
  
  // Handle when live stream ends unexpectedly
  TrackPlayer.addEventListener(Event.PlaybackTrackChanged, (data) => {
    console.log('[RadioService] Track changed:', data);
    
    if (data.nextTrack === undefined && data.track !== undefined) {
      console.log('[RadioService] Live stream ended unexpectedly - may need reconnection');
      handleStreamError();
    }
  });

  // Enhanced metadata handling for live radio
  TrackPlayer.addEventListener(Event.PlaybackMetadataReceived, (data) => {
    console.log('[RadioService] Live stream metadata received:', data);
    
    // Extract useful information from metadata
    if (data.title) {
      console.log('[RadioService] Now playing:', data.title);
    }
    if (data.artist) {
      console.log('[RadioService] Artist/Station:', data.artist);
    }
    if (data.album) {
      console.log('[RadioService] Album/Program:', data.album);
    }
  });

  // Enhanced audio focus handling for live radio
  TrackPlayer.addEventListener(Event.RemoteDuck, async (data) => {
    console.log('[RadioService] Audio focus change:', data);
    
    if (data.permanent) {
      // Permanent interruption - stop completely
      console.log('[RadioService] Permanent audio interruption - stopping stream');
      try {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
      } catch (error) {
        console.error('[RadioService] Error stopping on permanent interruption:', error);
      }
    } else if (data.paused) {
      // Temporary interruption - pause for now, but don't reset
      console.log('[RadioService] Temporary audio interruption - pausing stream');
      try {
        await TrackPlayer.pause();
      } catch (error) {
        console.error('[RadioService] Error pausing on temporary interruption:', error);
      }
    } else {
      // Audio focus regained - resume if we were playing
      console.log('[RadioService] Audio focus regained - attempting to resume');
      try {
        const state = await TrackPlayer.getPlaybackState();
        if (state.state === State.Paused) {
          await TrackPlayer.play();
        }
      } catch (error) {
        console.error('[RadioService] Error resuming after interruption:', error);
      }
    }
  });

  // Handle headphones disconnect
  TrackPlayer.addEventListener(Event.PlaybackError, async (data) => {
    if (data.code === 'headphones_disconnected') {
      console.log('[RadioService] Headphones disconnected - pausing stream');
      try {
        await TrackPlayer.pause();
      } catch (error) {
        console.error('[RadioService] Error handling headphone disconnect:', error);
      }
    }
  });

  console.log('[RadioService] Live radio service initialized with enhanced event listeners');

  // Cleanup function
  return () => {
    console.log('[RadioService] Service cleanup initiated');
    isServiceRunning = false;
    reconnectAttempts = 0;
  };
};

// Enhanced error handling functions
async function handleStreamError() {
  if (!isServiceRunning) {
    console.log('[RadioService] Service not running, skipping error handling');
    return;
  }

  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log('[RadioService] Max reconnection attempts reached, giving up');
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
    } catch (error) {
      console.error('[RadioService] Error during final cleanup:', error);
    }
    return;
  }

  reconnectAttempts++;
  console.log(`[RadioService] Stream error - attempting reconnection ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
  
  // Exponential backoff for reconnection
  const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 10000);
  
  setTimeout(async () => {
    try {
      console.log('[RadioService] Attempting to recover live stream...');
      
      // Get current state
      const state = await TrackPlayer.getPlaybackState();
      console.log('[RadioService] Current state before recovery:', state.state);
      
      // Stop current stream
      await TrackPlayer.stop();
      await TrackPlayer.reset();
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if we have tracks to retry
      const queue = await TrackPlayer.getQueue();
      if (queue.length === 0) {
        console.log('[RadioService] No tracks in queue after reset, recovery requires manual restart');
        return;
      }
      
      // Retry connection
      await TrackPlayer.play();
      console.log('[RadioService] Live stream recovery attempt completed');
      
    } catch (error) {
      console.error('[RadioService] Recovery attempt failed:', error);
      
      // If recovery fails, try again or give up
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => handleStreamError(), 2000);
      } else {
        console.log('[RadioService] All recovery attempts failed, performing final cleanup');
        try {
          await TrackPlayer.stop();
          await TrackPlayer.reset();
        } catch (finalError) {
          console.error('[RadioService] Final cleanup failed:', finalError);
        }
      }
    }
  }, backoffDelay);
}

async function handleRemoteError() {
  console.log('[RadioService] Remote control error detected');
  
  try {
    const state = await TrackPlayer.getPlaybackState();
    
    if (state.state === State.Error) {
      handleStreamError();
    }
  } catch (error) {
    console.error('[RadioService] Error checking state after remote error:', error);
  }
}

// Export utility functions for external use
export const RadioServiceUtils = {
  getServiceStatus: () => isServiceRunning,
  getReconnectAttempts: () => reconnectAttempts,
  resetReconnectAttempts: () => { reconnectAttempts = 0; },
  forceReconnect: () => handleStreamError(),
};