module.exports = {
  expo: {
    name: "RAISE",
    slug: "raise",
    version: "3.0.0",
    orientation: "portrait",
    icon: "./assets/images/AkashvaniLogo1.png",
    userInterfaceStyle: "automatic",
    owner: "amigos2026",
    scheme: "raise",
    splash: {
      image: "./assets/images/akashvanilogo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0,
      checkAutomatically: "ON_LOAD"
    },
    assetBundlePatterns: ["**/*"],
    android: {
      package: "com.subhra.raiseapp",
      versionCode: 3,
      minSdkVersion: 24,
      compileSdkVersion: 35,
      targetSdkVersion: 34,
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "WAKE_LOCK",
        "MODIFY_AUDIO_SETTINGS",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_MEDIA_PLAYBACK",
        "RECEIVE_BOOT_COMPLETED",
        "ACCESS_BACKGROUND_APP_REFRESH_SETTINGS",
        "SYSTEM_ALERT_WINDOW"
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/images/AkashvaniLogo1.png",
        backgroundColor: "#FFFFFF"
      },
      usesCleartextTraffic: true,
      networkSecurityConfig: "./network_security_config.xml",
      requestAudioFocus: true,
      allowBackup: true,
      largeHeap: true,
      metaData: {
        'com.google.android.exoplayer.ENABLE_HLS_SUPPORT': true
      }
    },
    plugins: [
      "expo-router",
      ["expo-build-properties", {
        android: {
          networkSecurityConfig: "./network_security_config.xml",
          usesCleartextTraffic: true,
          compileSdkVersion: 35,
          targetSdkVersion: 34
        }
      }]
    ],
    extra: {
      eas: {
        projectId: "4321e795-7072-4931-8e31-bc4a4a05a129"
      },
      apiUrl: process.env.API_URL || "http://117.247.79.184:8081"
      
      // REMOVED: Static radioStreams configuration
      // All streaming is now handled dynamically through channel streamKey from API
      // Previous radioStreams section removed:
      // radioStreams: {
      //   primary: "https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/playlist.m3u8",
      //   backup: "https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/chunklist.m3u8"
      // }
    }
  }
};
