import TrackPlayer, { Event, TrackType, State } from 'react-native-track-player';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Only persist channelId!
const STORAGE_KEYS = {
  LAST_PLAYING_CHANNEL: 'lastPlayingChannelId',
  WAS_STOPPED_FROM_APP: 'wasStoppedFromApp',
};

let remotePlayListener: any = null;
let remotePauseListener: any = null;
let playbackErrorListener: any = null;
let playbackStateListener: any = null;
let networkListener: any = null;

let lastStopTime: number | null = null;
let isNetworkAvailable = true;
let isWaitingForNetwork = false;
let retryCount = 0;
const maxRetries = 3;
let retryTimeout: number | null = null;
let networkCheckInterval: number | null = null;
let httpStatusRetryCount = 0;
const maxHttpStatusRetries = 5;

let wasStoppedFromApp = false;
let isStreamingActive = false;
let currentChannelId: number | null = null;

// Utility: get last playing channelId from storage
const getLastPlayingChannelId = async (): Promise<number | null> => {
  try {
    const id = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PLAYING_CHANNEL);
    return id ? parseInt(id, 10) : null;
  } catch {
    return null;
  }
};

// Utility: Save stopped-from-app state
const saveAppStopState = async (stoppedFromApp: boolean) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WAS_STOPPED_FROM_APP, stoppedFromApp.toString());
    wasStoppedFromApp = stoppedFromApp;
  } catch {}
};

const loadAppStopState = async (): Promise<boolean> => {
  try {
    const state = await AsyncStorage.getItem(STORAGE_KEYS.WAS_STOPPED_FROM_APP);
    wasStoppedFromApp = state === 'true';
    return wasStoppedFromApp;
  } catch {
    return false;
  }
};

const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
  } catch {
    return false;
  }
};

// For all cases where you need the current streamKey, **get it from global.appChannels** by channelId
const getStreamKeyForChannel = async (channelId: number | null): Promise<string | null> => {
  try {
    // Make sure your app (HomeScreen) sets this global object on mount/update!
    // Example:
    // (global as any).appChannels = stationData?.channels;
    if (!channelId || !(global as any).appChannels) return null;
    const channelList = (global as any).appChannels as Array<{ channelId: number, streamKey?: string }>;
    const channel = channelList.find((c) => c.channelId === channelId);
    return channel && channel.streamKey ? channel.streamKey : null;
  } catch {
    return null;
  }
};

// -- Utility for cache busting
const createFreshStreamUrl = async (baseUrl: string): Promise<string> => {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('_t', Date.now().toString());
    url.searchParams.set('_cb', Math.random().toString(36).substring(2, 15));
    url.searchParams.set('_v', '3.0.0');
    return url.toString();
  } catch {
    return `${baseUrl}?_t=${Date.now()}&_cb=${Math.random().toString(36).substring(2, 15)}`;
  }
};

// -- FULL STOP & RESET from app
const stopStreamAndClearControls = async (): Promise<void> => {
  try {
    await saveAppStopState(true);
    isStreamingActive = false;
    lastStopTime = Date.now();
    await TrackPlayer.stop();
    await TrackPlayer.reset();
  } catch {}
};

// -- PAUSE, keep controls (from lockscreen/notification)
const pauseStreamKeepControls = async (): Promise<void> => {
  try {
    await saveAppStopState(false);
    isStreamingActive = false;
    lastStopTime = Date.now();
    await TrackPlayer.pause();
  } catch {}
};

// -- Add track and play for a channelId (ALWAYS resolve streamKey dynamically!)
const playChannelById = async (channelId: number | null): Promise<boolean> => {
  if (!channelId) return false;
  try {
    const streamKey = await getStreamKeyForChannel(channelId);
    if (!streamKey) return false;
    await TrackPlayer.pause();
    await TrackPlayer.reset();
    const freshUrl = await createFreshStreamUrl(streamKey);
    await TrackPlayer.add({
      id: `channel-${channelId}-${Date.now()}`,
      url: freshUrl,
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
    await TrackPlayer.play();
    isStreamingActive = true;
    await saveAppStopState(false);
    currentChannelId = channelId;
    return true;
  } catch (e) {
    return false;
  }
};

// -- HTTP Status error logic
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

// -- Retry & Recovery Logic --
const recoverFromHttpStatusError = async (): Promise<boolean> => {
  if (httpStatusRetryCount >= maxHttpStatusRetries) {
    httpStatusRetryCount = 0;
    return false;
  }
  httpStatusRetryCount++;
  const lastId = await getLastPlayingChannelId();
  return playChannelById(lastId);
};
const attemptGeneralRecovery = async (): Promise<void> => {
  if (retryTimeout) {
    clearTimeout(retryTimeout);
    retryTimeout = null;
  }
  if (retryCount >= maxRetries) {
    retryCount = 0;
    return;
  }
  retryCount++;
  const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 30000);
  retryTimeout = setTimeout(async () => {
    const hasNetwork = await checkNetworkConnectivity();
    if (!hasNetwork) {
      isNetworkAvailable = false;
      isWaitingForNetwork = true;
      startNetworkRecoveryMonitoring();
      return;
    }
    const lastId = await getLastPlayingChannelId();
    const ok = await playChannelById(lastId);
    if (!ok) await attemptGeneralRecovery();
    else retryCount = 0;
  }, delay) as any;
};
const startNetworkRecoveryMonitoring = () => {
  if (networkCheckInterval) clearInterval(networkCheckInterval);
  networkCheckInterval = setInterval(async () => {
    const hasNetwork = await checkNetworkConnectivity();
    if (hasNetwork && isWaitingForNetwork) {
      clearInterval(networkCheckInterval!);
      networkCheckInterval = null;
      isWaitingForNetwork = false;
      isNetworkAvailable = true;
      const lastId = await getLastPlayingChannelId();
      await playChannelById(lastId);
    }
  }, 5000) as any;
};
const cleanup = () => {
  if (retryTimeout) clearTimeout(retryTimeout);
  if (networkCheckInterval) clearInterval(networkCheckInterval);
  isWaitingForNetwork = false;
  retryCount = 0;
  httpStatusRetryCount = 0;
};

// -- Expose service controls (start/stop)
(global as any).trackPlayerServiceControls = {
  stopFromApp: stopStreamAndClearControls,
  startStream: async (channelId?: number) => {
    // If no id provided, use last played from storage.
    const idToPlay = channelId || await getLastPlayingChannelId();
    await playChannelById(idToPlay);
  }
};

module.exports = async function () {
  if (remotePlayListener) remotePlayListener.remove();
  if (remotePauseListener) remotePauseListener.remove();
  if (playbackErrorListener) playbackErrorListener.remove();
  if (playbackStateListener) playbackStateListener.remove();
  if (networkListener) networkListener.remove();
  cleanup();
  await loadAppStopState();

  // -- Listen to NetInfo for network recovery
  networkListener = NetInfo.addEventListener(state => {
    const wasConnected = isNetworkAvailable;
    isNetworkAvailable = state.isConnected === true && state.isInternetReachable !== false;
    if (!wasConnected && isNetworkAvailable && isWaitingForNetwork) {
      if (networkCheckInterval) {
        clearInterval(networkCheckInterval);
        networkCheckInterval = null;
      }
      isWaitingForNetwork = false;
      setTimeout(async () => {
        const lastId = await getLastPlayingChannelId();
        await playChannelById(lastId);
      }, 1000);
    }
  });

  // -- Main error handler with robust retry/recovery
  playbackErrorListener = TrackPlayer.addEventListener(Event.PlaybackError, async (event) => {
    if (isHttpStatusError(event)) {
      setTimeout(async () => { await recoverFromHttpStatusError(); }, Math.min(1000 * httpStatusRetryCount, 5000));
      return;
    }
    if (isBehindLiveWindowError(event)) {
      const lastId = await getLastPlayingChannelId();
      await playChannelById(lastId);
      return;
    }
    const hasNetwork = await checkNetworkConnectivity();
    if (!hasNetwork || isNetworkError(event)) {
      isNetworkAvailable = false;
      isWaitingForNetwork = true;
      startNetworkRecoveryMonitoring();
      return;
    }
    await attemptGeneralRecovery();
  });

  playbackStateListener = TrackPlayer.addEventListener(Event.PlaybackState, async (event) => {
    if (event.state === 'paused' || event.state === 'stopped') {
      isStreamingActive = false;
      lastStopTime = Date.now();
    } else if (event.state === 'playing') {
      isStreamingActive = true;
      retryCount = 0;
      httpStatusRetryCount = 0;
      cleanup();
    }
  });

  // -- Remote play: always resumes using lastPlayedChannelId, after >10s will get streamKey from global
  remotePlayListener = TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    const hasNetwork = await checkNetworkConnectivity();
    if (!hasNetwork) {
      isNetworkAvailable = false;
      isWaitingForNetwork = true;
      startNetworkRecoveryMonitoring();
      return;
    }
    const wasStoppedFromAppState = await loadAppStopState();
    if (wasStoppedFromAppState) {
      // Only resume from within the app, not remote controls.
      return;
    }
    const needsFreshContent = lastStopTime && (Date.now() - lastStopTime) > 10000;
    const lastId = await getLastPlayingChannelId();
    if (needsFreshContent) {
      await playChannelById(lastId);
    } else {
      const queue = await TrackPlayer.getQueue();
      if (queue.length === 0) {
        await playChannelById(lastId);
      }
      await TrackPlayer.play();
    }
    isStreamingActive = true;
    await saveAppStopState(false);
  });

  remotePauseListener = TrackPlayer.addEventListener(Event.RemotePause, async () => {
    await pauseStreamKeepControls();
  });

  // -- Optionally, auto-initialize with last channel if desired:
  try {
    const hasNetwork = await checkNetworkConnectivity();
    if (hasNetwork) {
      const lastId = await getLastPlayingChannelId();
      if (lastId) currentChannelId = lastId;
    } else {
      isNetworkAvailable = false;
    }
  } catch { }
};
