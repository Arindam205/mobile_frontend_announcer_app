import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode,
  Event,
} from 'react-native-track-player';

class TrackPlayerService {
  private static instance: TrackPlayerService;
  private isSetup = false;

  static getInstance(): TrackPlayerService {
    if (!TrackPlayerService.instance) {
      TrackPlayerService.instance = new TrackPlayerService();
    }
    return TrackPlayerService.instance;
  }

  async setupPlayer() {
    if (this.isSetup) {
      console.log('[TrackPlayerService] Already setup, skipping...');
      return;
    }

    try {
      console.log('[TrackPlayerService] Setting up player...');
      
      await TrackPlayer.setupPlayer({
        // Configure for live streaming
        waitForBuffer: true,
        maxCacheSize: 1024 * 10, // 10MB cache for better streaming
      });

      await TrackPlayer.updateOptions({
        // Capabilities
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
        
        // Behavior when app is killed
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        
        // Media controls appearance
        progressUpdateEventInterval: 2,
      });

      this.isSetup = true;
      console.log('[TrackPlayerService] Setup completed successfully');
      
    } catch (error) {
      console.error('[TrackPlayerService] Setup failed:', error);
      throw error;
    }
  }

  async addRadioTrack() {
    try {
      console.log('[TrackPlayerService] Adding radio track...');
      
      // Clear any existing tracks
      await TrackPlayer.reset();
      
      // Add the radio stream
      await TrackPlayer.add({
        id: 'fm-ujjayanta-agartala',
        url: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/playlist.m3u8',
        title: 'FM Ujjayanta Agartala',
        artist: 'All India Radio - Agartala',
        description: '102.8 FM - Live Broadcasting',
        artwork: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/All_India_Radio_Logo.svg/1200px-All_India_Radio_Logo.svg.png',
        
        // Live stream specific properties
        isLiveStream: true,
        
        // Additional metadata
        album: 'Live Radio',
        genre: 'Radio',
        date: new Date().toISOString(),
      });

      // Set repeat mode for continuous streaming
      await TrackPlayer.setRepeatMode(RepeatMode.Track);
      
      console.log('[TrackPlayerService] Radio track added successfully');
      
    } catch (error) {
      console.error('[TrackPlayerService] Failed to add radio track:', error);
      throw error;
    }
  }

  async play() {
    try {
      console.log('[TrackPlayerService] Starting playback...');
      await TrackPlayer.play();
    } catch (error) {
      console.error('[TrackPlayerService] Play failed:', error);
      throw error;
    }
  }

  async pause() {
    try {
      console.log('[TrackPlayerService] Pausing playback...');
      await TrackPlayer.pause();
    } catch (error) {
      console.error('[TrackPlayerService] Pause failed:', error);
      throw error;
    }
  }

  async stop() {
    try {
      console.log('[TrackPlayerService] Stopping playback...');
      await TrackPlayer.stop();
    } catch (error) {
      console.error('[TrackPlayerService] Stop failed:', error);
      throw error;
    }
  }

  async setVolume(volume: number) {
    try {
      await TrackPlayer.setVolume(volume);
    } catch (error) {
      console.error('[TrackPlayerService] Set volume failed:', error);
      throw error;
    }
  }

  async destroy() {
    try {
      console.log('[TrackPlayerService] Destroying player...');
      // FIXED: Use reset() instead of destroy()
      await TrackPlayer.reset();
      await TrackPlayer.stop();
      this.isSetup = false;
    } catch (error) {
      console.error('[TrackPlayerService] Destroy failed:', error);
    }
  }

  // Additional utility methods
  async getCurrentTrack() {
    try {
      return await TrackPlayer.getActiveTrack();
    } catch (error) {
      console.error('[TrackPlayerService] Get current track failed:', error);
      return null;
    }
  }

  async getState() {
    try {
      return await TrackPlayer.getPlaybackState();
    } catch (error) {
      console.error('[TrackPlayerService] Get state failed:', error);
      return null;
    }
  }

  // Cleanup method for component unmount
  async cleanup() {
    try {
      console.log('[TrackPlayerService] Cleaning up...');
      await TrackPlayer.reset();
      this.isSetup = false;
    } catch (error) {
      console.error('[TrackPlayerService] Cleanup failed:', error);
    }
  }
}

export default TrackPlayerService;