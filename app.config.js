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
        "ACCESS_WIFI_STATE",
        "WAKE_LOCK",
        "MODIFY_AUDIO_SETTINGS",
        "FOREGROUND_SERVICE",
        "RECEIVE_BOOT_COMPLETED",
        "FOREGROUND_SERVICE_MEDIA_PLAYBACK",
        "READ_PHONE_STATE"
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/images/AkashvaniLogo1.png",
        backgroundColor: "#FFFFFF"
      },
      usesCleartextTraffic: true,
      networkSecurityConfig: "./network_security_config.xml",
      // Enhanced intent filters for better app integration
      intentFilters: [
        // Handle custom app scheme (existing)
        {
          action: "VIEW",
          data: [
            {
              scheme: "raise"
            },
            {
              scheme: "com.subhra.raiseapp"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        },
        // Handle HLS audio streams
        {
          action: "VIEW",
          data: [
            {
              mimeType: "application/vnd.apple.mpegurl"
            },
            {
              mimeType: "audio/x-mpegurl"
            },
            {
              mimeType: "audio/mpegurl"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        },
        // Handle audio streaming URLs
        {
          action: "VIEW",
          data: [
            {
              scheme: "https",
              host: "air.pc.cdn.bitgravity.com"
            },
            {
              scheme: "https", 
              host: "akashvani.gov.in"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        },
        // Handle sharing of audio content
        {
          action: "SEND",
          data: [
            {
              mimeType: "text/plain"
            }
          ],
          category: ["DEFAULT"]
        }
      ],
      // Enhanced audio configuration
      requestAudioFocus: true,
      // Support for different screen densities
      allowBackup: true,
      // Network optimizations
      largeHeap: true
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      [
        "expo-build-properties",
        {
          android: {
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            networkSecurityConfig: "./network_security_config.xml",
            // Enhanced memory management for audio streaming
            largeHeap: true,
            // Audio optimizations
            usesCleartextTraffic: true
          }
        }
      ],
      "./withNetworkSecurityConfig",
    ],
    extra: {
      eas: {
        projectId: "4321e795-7072-4931-8e31-bc4a4a05a129"
      },
      apiUrl: process.env.API_URL || "http://117.247.79.184:8081",
      // Enhanced radio streaming configuration
      radioStreams: {
        primary: "https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/playlist.m3u8",
        backup: "https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/chunklist.m3u8",
        // Additional backup streams can be added here
        fallback: "https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/index.m3u8"
      },
      // Environment-specific configurations
      environment: process.env.NODE_ENV || "production",
      // Audio player configuration
      audioConfig: {
        bufferSize: 2048,
        minBuffer: 15,
        maxBuffer: 50,
        playBuffer: 2.5,
        backBuffer: 0
      }
    },
    experiments: {
      typedRoutes: true
    }
  }
};