import TrackPlayer, { Event, TrackType, State } from 'react-native-track-player';
import NetInfo from '@react-native-community/netinfo';

const streamUrl = 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/playlist.m3u8';

let remotePlayListener: any = null;
let remotePauseListener: any = null;
// Remove remoteStopListener - we only want Play/Pause controls
let playbackErrorListener: any = null;
let playbackStateListener: any = null;
let networkListener: any = null;

// Track when stream was last paused/stopped for fresh content logic
let lastStopTime: number | null = null;

// Network and retry state
let isNetworkAvailable = true;
let isWaitingForNetwork = false;
let retryCount = 0;
let maxRetries = 3;
let retryTimeout: number | null = null; // Fix: Use number type for React Native
let networkCheckInterval: number | null = null; // Fix: Use number type for React Native
let httpStatusRetryCount = 0;
let maxHttpStatusRetries = 5;

// App control state - track how stream was stopped
let wasStoppedFromApp = false;
let isStreamingActive = false;

// Helper function to check network connectivity
const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    console.log('[TrackPlayerService] Network state:', {
      isConnected: state.isConnected,
      type: state.type,
      isInternetReachable: state.isInternetReachable
    });
    
    return state.isConnected === true && state.isInternetReachable !== false;
  } catch (error) {
    console.error('[TrackPlayerService] Network check failed:', error);
    return false;
  }
};

// Helper function to resolve redirected URL for HTTPS HLS streams
const resolveRedirectedUrl = async (url: string): Promise<string> => {
  try {
    console.log('[TrackPlayerService] 🔍 Resolving HTTPS redirects for:', url);
    
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegurl, audio/x-mpegurl, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Connection': 'keep-alive',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
      }
    });

    if (response.ok) {
      const finalUrl = response.url;
      console.log('[TrackPlayerService] 📍 Original URL:', url);
      console.log('[TrackPlayerService] 📍 Resolved to:', finalUrl);
      
      if (finalUrl !== url) {
        console.log('[TrackPlayerService] ✅ Redirect detected and followed successfully');
      }
      
      return finalUrl;
    } else {
      console.warn('[TrackPlayerService] ⚠️ Failed to resolve redirects, status:', response.status);
      return url;
    }
  } catch (error) {
    console.error('[TrackPlayerService] ❌ Error resolving redirects:', error);
    return url;
  }
};

// Helper function to create fresh stream URL with cache busting and redirect resolution
const createFreshStreamUrl = async (): Promise<string> => {
  try {
    const resolvedUrl = await resolveRedirectedUrl(streamUrl);
    
    const url = new URL(resolvedUrl);
    url.searchParams.set('_t', Date.now().toString());
    url.searchParams.set('_cb', Math.random().toString(36).substring(2, 15));
    url.searchParams.set('_v', '3.0.0');
    
    const freshUrl = url.toString();
    console.log('[TrackPlayerService] 🆕 Created fresh stream URL:', freshUrl);
    return freshUrl;
  } catch (error) {
    console.error('[TrackPlayerService] ❌ Error creating fresh URL:', error);
    return `${streamUrl}?_t=${Date.now()}&_cb=${Math.random().toString(36).substring(2, 15)}`;
  }
};

// Helper function to properly stop and clear everything when stopped from app
const stopStreamAndClearControls = async (): Promise<void> => {
  try {
    console.log('[TrackPlayerService] 🛑 Stopping stream and clearing all controls...');
    
    // Mark as stopped from app
    wasStoppedFromApp = true;
    isStreamingActive = false;
    lastStopTime = Date.now();
    
    // Stop playback and clear queue completely
    await TrackPlayer.stop();
    await TrackPlayer.reset();
    
    // This should remove foreground notification and lock screen controls
    console.log('[TrackPlayerService] ✅ Stream stopped, controls should be cleared');
  } catch (error) {
    console.error('[TrackPlayerService] ❌ Error stopping stream and clearing controls:', error);
  }
};

// Helper function to pause stream but keep controls (when paused from notification/lock screen)
const pauseStreamKeepControls = async (): Promise<void> => {
  try {
    console.log('[TrackPlayerService] ⏸️ Pausing stream but keeping controls...');
    
    // Mark as NOT stopped from app (paused from controls)
    wasStoppedFromApp = false;
    isStreamingActive = false;
    lastStopTime = Date.now();
    
    // Pause playback but don't reset queue - this keeps notification
    await TrackPlayer.pause();
    
    console.log('[TrackPlayerService] ✅ Stream paused, controls preserved');
  } catch (error) {
    console.error('[TrackPlayerService] ❌ Error pausing stream:', error);
  }
};

// Helper function to refresh stream with fresh URL (redirect-resolved)
const refreshStreamWithFreshUrl = async (): Promise<boolean> => {
  try {
    console.log('[TrackPlayerService] 🔄 Refreshing stream with fresh redirect-resolved URL...');
    await TrackPlayer.pause();
    await TrackPlayer.reset();
    
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
    
    console.log('[TrackPlayerService] ✅ Stream refreshed with redirect-resolved URL');
    return true;
  } catch (error) {
    console.error('[TrackPlayerService] ❌ Stream refresh failed:', error);
    return false;
  }
};

// Helper function to add initial track with redirect resolution
const addInitialTrackWithRedirectResolution = async () => {
  const queue = await TrackPlayer.getQueue();
  if (queue.length === 0) {
    console.log('[TrackPlayerService] 📁 Adding initial track with redirect resolution...');
    
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
};

// Enhanced error classification
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

const isNetworkError = (error: any): boolean => {
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

// Focused HTTP status error recovery with redirect resolution
const recoverFromHttpStatusError = async (): Promise<boolean> => {
  if (httpStatusRetryCount >= maxHttpStatusRetries) {
    console.log('[TrackPlayerService] 🛑 Max HTTP status retries reached');
    httpStatusRetryCount = 0;
    return false;
  }

  httpStatusRetryCount++;
  console.log(`[TrackPlayerService] 🔧 HTTP Status recovery attempt ${httpStatusRetryCount}/${maxHttpStatusRetries}`);

  try {
    const hasNetwork = await checkNetworkConnectivity();
    if (!hasNetwork) {
      console.log('[TrackPlayerService] 📡 No network during HTTP status recovery');
      return false;
    }

    const success = await refreshStreamWithFreshUrl();
    
    if (success) {
      const currentState = await TrackPlayer.getPlaybackState();
      if (currentState.state !== State.Playing) {
        await TrackPlayer.play();
        isStreamingActive = true;
      }
      
      console.log('[TrackPlayerService] ✅ HTTP status recovery successful');
      httpStatusRetryCount = 0;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[TrackPlayerService] ❌ HTTP status recovery failed:', error);
    return false;
  }
};

// General retry logic with exponential backoff
const attemptGeneralRecovery = async (): Promise<void> => {
  if (retryTimeout) {
    clearTimeout(retryTimeout);
    retryTimeout = null;
  }

  if (retryCount >= maxRetries) {
    console.log('[TrackPlayerService] 🛑 Max general retries reached');
    retryCount = 0;
    return;
  }

  retryCount++;
  const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 30000);
  
  console.log(`[TrackPlayerService] ⏳ General retry attempt ${retryCount}/${maxRetries} in ${delay}ms`);
  
  retryTimeout = setTimeout(async () => {
    try {
      const hasNetwork = await checkNetworkConnectivity();
      if (!hasNetwork) {
        console.log('[TrackPlayerService] 📡 No network during general retry');
        isNetworkAvailable = false;
        isWaitingForNetwork = true;
        startNetworkRecoveryMonitoring();
        return;
      }

      const success = await refreshStreamWithFreshUrl();
      
      if (success) {
        const currentState = await TrackPlayer.getPlaybackState();
        if (currentState.state !== State.Playing) {
          await TrackPlayer.play();
          isStreamingActive = true;
        }
        
        console.log('[TrackPlayerService] ✅ General recovery successful');
        retryCount = 0;
      } else {
        await attemptGeneralRecovery();
      }
    } catch (error) {
      console.error('[TrackPlayerService] ❌ General recovery attempt failed:', error);
      await attemptGeneralRecovery();
    }
  }, delay) as any; // Type assertion to handle React Native setTimeout
};

// Network recovery monitoring
const startNetworkRecoveryMonitoring = () => {
  if (networkCheckInterval) {
    clearInterval(networkCheckInterval);
  }

  console.log('[TrackPlayerService] 📡 Starting network recovery monitoring...');
  
  networkCheckInterval = setInterval(async () => {
    try {
      const hasNetwork = await checkNetworkConnectivity();
      
      if (hasNetwork && isWaitingForNetwork) {
        console.log('[TrackPlayerService] 📡 Network restored! Attempting recovery...');
        
        clearInterval(networkCheckInterval!);
        networkCheckInterval = null;
        isWaitingForNetwork = false;
        isNetworkAvailable = true;
        
        const success = await refreshStreamWithFreshUrl();
        if (success) {
          await TrackPlayer.play();
          isStreamingActive = true;
          console.log('[TrackPlayerService] ✅ Auto-recovery after network restoration successful');
        }
      }
    } catch (error) {
      console.error('[TrackPlayerService] ❌ Network monitoring error:', error);
    }
  }, 5000) as any; // Type assertion to handle React Native setInterval
};

// Cleanup function
const cleanup = () => {
  if (retryTimeout) {
    clearTimeout(retryTimeout);
    retryTimeout = null;
  }
  
  if (networkCheckInterval) {
    clearInterval(networkCheckInterval);
    networkCheckInterval = null;
  }
  
  isWaitingForNetwork = false;
  retryCount = 0;
  httpStatusRetryCount = 0;
};

// Expose functions for app to call
global.trackPlayerServiceControls = {
  stopFromApp: stopStreamAndClearControls,
  startStream: async () => {
    wasStoppedFromApp = false;
    isStreamingActive = true;
    await addInitialTrackWithRedirectResolution();
    await TrackPlayer.play();
  }
};

module.exports = async function () {
  console.log('[TrackPlayerService] 🚀 Complete optimized HTTPS HLS service initialized');

  // Remove existing listeners
  if (remotePlayListener) remotePlayListener.remove();
  if (remotePauseListener) remotePauseListener.remove();
  // Remove remoteStopListener since we only want Play/Pause
  if (playbackErrorListener) playbackErrorListener.remove();
  if (playbackStateListener) playbackStateListener.remove();
  if (networkListener) networkListener.remove();

  cleanup();

  // Network monitoring
  networkListener = NetInfo.addEventListener(state => {
    const wasConnected = isNetworkAvailable;
    isNetworkAvailable = state.isConnected === true && state.isInternetReachable !== false;
    
    console.log('[TrackPlayerService] 📡 Network state changed:', {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      wasConnected,
      nowConnected: isNetworkAvailable
    });
    
    if (!wasConnected && isNetworkAvailable && isWaitingForNetwork) {
      console.log('[TrackPlayerService] 📡 Network restored via listener');
      
      if (networkCheckInterval) {
        clearInterval(networkCheckInterval);
        networkCheckInterval = null;
      }
      
      isWaitingForNetwork = false;
      
      setTimeout(async () => {
        try {
          const success = await refreshStreamWithFreshUrl();
          if (success) {
            await TrackPlayer.play();
            isStreamingActive = true;
            console.log('[TrackPlayerService] ✅ Auto-recovery via network listener successful');
          }
        } catch (error) {
          console.error('[TrackPlayerService] ❌ Recovery via network listener failed:', error);
        }
      }, 1000);
    }
  });

  // **MAIN ERROR HANDLER** - Complete error handling with redirect resolution
  playbackErrorListener = TrackPlayer.addEventListener(Event.PlaybackError, async (event) => {
    console.error('[TrackPlayerService] 🚨 Playback Error:', {
      code: event.code,
      message: event.message,
    });
    
    // **Priority 1: HTTP Status Errors** (main focus for HTTPS streams)
    if (isHttpStatusError(event)) {
      console.log('[TrackPlayerService] 🎯 HTTP status error detected - applying redirect resolution fix');
      
      const delay = Math.min(1000 * httpStatusRetryCount, 5000);
      
      setTimeout(async () => {
        const success = await recoverFromHttpStatusError();
        if (!success && httpStatusRetryCount < maxHttpStatusRetries) {
          console.log('[TrackPlayerService] 🔄 Retrying HTTP status recovery...');
        }
      }, delay);
      
      return;
    }
    
    // **Priority 2: Behind live window** (use same redirect resolution)
    if (isBehindLiveWindowError(event)) {
      console.log('[TrackPlayerService] ⏰ Behind live window - refreshing with redirect resolution');
      const success = await refreshStreamWithFreshUrl();
      if (success) {
        await TrackPlayer.play();
        isStreamingActive = true;
      }
      return;
    }
    
    // **Priority 3: Network errors**
    const hasNetwork = await checkNetworkConnectivity();
    if (!hasNetwork || isNetworkError(event)) {
      console.log('[TrackPlayerService] 📡 Network error detected');
      isNetworkAvailable = false;
      isWaitingForNetwork = true;
      startNetworkRecoveryMonitoring();
      return;
    }
    
    // **Priority 4: General errors** - also use redirect resolution
    console.log('[TrackPlayerService] ⚠️ General error - applying redirect resolution as fallback');
    await attemptGeneralRecovery();
  });

  // Track playback state changes
  playbackStateListener = TrackPlayer.addEventListener(Event.PlaybackState, async (event) => {
    console.log('[TrackPlayerService] 🎵 Playback State Changed:', event.state);
    
    if (event.state === 'paused' || event.state === 'stopped') {
      isStreamingActive = false;
      lastStopTime = Date.now();
      console.log('[TrackPlayerService] ⏸️ Stream paused/stopped, recording timestamp');
    } else if (event.state === 'playing') {
      isStreamingActive = true;
      retryCount = 0;
      httpStatusRetryCount = 0;
      cleanup();
      console.log('[TrackPlayerService] ▶️ Playing successfully - reset all retry counters');
    }
  });

  // Remote play with 10-second rule and redirect resolution
  remotePlayListener = TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    console.log('[TrackPlayerService] 🎮 Remote play event');
    
    try {
      const hasNetwork = await checkNetworkConnectivity();
      if (!hasNetwork) {
        console.log('[TrackPlayerService] 📡 No network for remote play');
        isNetworkAvailable = false;
        isWaitingForNetwork = true;
        startNetworkRecoveryMonitoring();
        return;
      }

      // 10-second rule: refresh if stopped for more than 10 seconds
      const needsFreshContent = lastStopTime && (Date.now() - lastStopTime) > 10000;
      
      if (needsFreshContent) {
        console.log('[TrackPlayerService] ⏰ Stream stopped for >10s, refreshing with redirect resolution...');
        const refreshSuccess = await refreshStreamWithFreshUrl();
        if (!refreshSuccess) {
          await addInitialTrackWithRedirectResolution();
        }
      } else {
        await addInitialTrackWithRedirectResolution();
      }
      
      await TrackPlayer.play();
      isStreamingActive = true;
      wasStoppedFromApp = false; // Playing from remote controls
      console.log('[TrackPlayerService] ✅ Remote play completed');
    } catch (error) {
      console.error('[TrackPlayerService] ❌ Remote play error:', error);
      const success = await refreshStreamWithFreshUrl();
      if (success) {
        await TrackPlayer.play();
        isStreamingActive = true;
      }
    }
  });

  // Remote pause - keeps notification persistent (same behavior as stop for live radio)
  remotePauseListener = TrackPlayer.addEventListener(Event.RemotePause, async () => {
    console.log('[TrackPlayerService] ⏸️ Remote pause event (keeping notification visible)');
    await pauseStreamKeepControls();
  });

  // Note: No remote stop listener needed - we only want Play/Pause in lock screen controls

  // Initialize with redirect resolution
  try {
    const hasNetwork = await checkNetworkConnectivity();
    if (hasNetwork) {
      await addInitialTrackWithRedirectResolution();
      console.log('[TrackPlayerService] ✅ Initial track added with redirect resolution');
    } else {
      console.log('[TrackPlayerService] 📡 No network during initialization');
      isNetworkAvailable = false;
    }
  } catch (error) {
    console.error('[TrackPlayerService] ❌ Initialization failed:', error);
  }
};