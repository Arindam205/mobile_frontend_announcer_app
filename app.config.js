// module.exports = {
//   expo: {
//     name: "RAISE",
//     slug: "raise",
//     version: "3.0.0",
//     orientation: "portrait",
//     icon: "./assets/images/AkashvaniLogo1.png",
//     userInterfaceStyle: "automatic",
//     owner: "amigos2025",
//     scheme: "raise",

//     splash: {
//       image: "./assets/images/akashvanilogo.png",
//       resizeMode: "contain",
//       backgroundColor: "#ffffff"
//     },

//     updates: {
//       fallbackToCacheTimeout: 0,
//       checkAutomatically: "ON_LOAD"
//     },

//     assetBundlePatterns: ["**/*"],

//     ios: {
//       supportsTablet: true,
//       bundleIdentifier: "com.subhra.raiseapp"
//     },

//     android: {
//       package: "com.subhra.raiseapp",
//       versionCode: 3,
//       minSdkVersion: 24,
//       compileSdkVersion: 35,
//       targetSdkVersion: 34,
//       permissions: [
//         "INTERNET",
//         "ACCESS_NETWORK_STATE",
//         "ACCESS_WIFI_STATE",
//         "WAKE_LOCK",
//         "MODIFY_AUDIO_SETTINGS",
//         "FOREGROUND_SERVICE",
//         "RECEIVE_BOOT_COMPLETED"
//       ],
//       adaptiveIcon: {
//         foregroundImage: "./assets/images/AkashvaniLogo1.png",
//         backgroundColor: "#FFFFFF"
//       },
//       usesCleartextTraffic: true
//     },

//     web: {
//       favicon: "./assets/images/favicon.png"
//     },

//     plugins: [
//       "expo-router",
//       "expo-secure-store",
//       [
//         "expo-build-properties",
//         {
//           android: {
//             enableProguardInReleaseBuilds: true,
//             enableShrinkResourcesInReleaseBuilds: true
//           }
//         }
//       ],
//       "./withNetworkSecurityConfig",
//     ],

//     extra: {
//       eas: {
//         projectId: "b579b573-0095-4e48-bea0-55e331828e05"
//       },
//       apiUrl: process.env.API_URL || "http://117.247.79.184:8081"
//     },

//     experiments: {
//       typedRoutes: true
//     }
//   }
// };

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
      networkSecurityConfig: "./network_security_config.xml"
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
            networkSecurityConfig: "./network_security_config.xml"
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
      radioStreams: {
        primary: "https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/playlist.m3u8",
        backup: "http://air.pc.cdn.bitgravity.com/air/live/pbaudio130/playlist.m3u8",
        chunklist: "https://air.pc.cdn.bitgravity.com/air/live/pbaudio130/chunklist.m3u8"
      }
    },
    experiments: {
      typedRoutes: true
    }
  }
};