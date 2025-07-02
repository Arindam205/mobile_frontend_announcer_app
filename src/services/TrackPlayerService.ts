import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function() {
  // Handle remote controls from notification panel and lock screen
  
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });
  
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });
  
  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.stop();
  });
  
  // Handle playback state changes
  TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
    console.log('[Service] Playback state changed:', data.state);
  });
  
  // Handle playback errors with auto-recovery
  TrackPlayer.addEventListener(Event.PlaybackError, (data) => {
    console.error('[Service] Playback error:', data);
    
    // Auto-retry mechanism for live streams
    setTimeout(async () => {
      try {
        console.log('[Service] Attempting to recover from error...');
        await TrackPlayer.stop();
        await TrackPlayer.play();
      } catch (error) {
        console.error('[Service] Recovery failed:', error);
      }
    }, 2000);
  });
  
  // Handle when track ends (shouldn't happen for live streams)
  TrackPlayer.addEventListener(Event.PlaybackTrackChanged, (data) => {
    console.log('[Service] Track changed:', data);
  });
};