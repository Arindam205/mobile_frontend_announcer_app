import TrackPlayer, { Event } from 'react-native-track-player';

const streamUrl = 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/playlist.m3u8';

let remotePlayListener: any = null;
let remotePauseListener: any = null;

module.exports = async function () {
  console.log('[TrackPlayerService] Service initialized');

  // Remove existing listeners if any
  if (remotePlayListener) {
    remotePlayListener.remove();
  }
  if (remotePauseListener) {
    remotePauseListener.remove();
  }

  // Handle remote play from lock screen/notification
  remotePlayListener = TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    console.log('[TrackPlayerService] Remote play event');
    try {
      // Check if queue is empty and re-add track if needed
      const queue = await TrackPlayer.getQueue();
      if (queue.length === 0) {
        console.log('[TrackPlayerService] Queue empty, adding track...');
        await TrackPlayer.add({
          id: 'akashvani-hls',
          url: streamUrl,
          title: 'Akashvani Radio',
          artist: 'All India Radio',
          artwork: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/All_India_Radio_Logo.svg/1200px-All_India_Radio_Logo.svg.png',
          isLiveStream: true,
          duration: 0,
        });
      }
      await TrackPlayer.play();
      console.log('[TrackPlayerService] Remote play completed');
    } catch (error) {
      console.error('[TrackPlayerService] Remote play error:', error);
    }
  });

  // Handle remote pause from lock screen/notification - this keeps notification persistent
  remotePauseListener = TrackPlayer.addEventListener(Event.RemotePause, async () => {
    console.log('[TrackPlayerService] Remote pause event (keeping notification visible)');
    try {
      await TrackPlayer.pause();
      // Using pause() instead of stop() keeps the notification visible
      // This is perfect for live radio where pause = stop but notification stays
      console.log('[TrackPlayerService] Remote pause completed, notification preserved');
    } catch (error) {
      console.error('[TrackPlayerService] Remote pause error:', error);
    }
  });
};