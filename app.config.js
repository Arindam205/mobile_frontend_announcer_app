// // app.config.js
// module.exports = {
//   expo: {
//     name: "RAISE",
//     slug: "raise",
//     version: "2.0.0",
//     orientation: "portrait",
//     icon: "./assets/images/icon.png",
//     userInterfaceStyle: "automatic",
//     // IMPORTANT: Replace "YOUR_EXPO_USERNAME" with your actual username from `eas whoami`
//     owner: "amigos1996", // Replace this with your actual Expo username
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
    
//     assetBundlePatterns: [
//       "**/*"
//     ],
    
//     ios: {
//       supportsTablet: true,
//       bundleIdentifier: "com.subhra.raiseapp"
//     },
    
//     android: {
//       package: "com.subhra.raiseapp",
//       versionCode: 1,
//       permissions: [
//         "INTERNET",
//         "ACCESS_NETWORK_STATE",
//         "WAKE_LOCK"
//       ],
//       adaptiveIcon: {
//         foregroundImage: "./assets/images/adaptive-icon.png",
//         backgroundColor: "#FFFFFF"
//       },
//       // Allow HTTP traffic for your production server
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
//             enableShrinkResourcesInReleaseBuilds: true,
//             // Reference to network security config in root directory
//             networkSecurityConfig: "./network_security_config.xml"
//           }
//         }
//       ]
//     ],
    
//     extra: {
//       eas: {
//         // IMPORTANT: Replace "YOUR_PROJECT_ID" with your actual project ID from `eas project:init`
//         projectId: "d6c362af-d27f-4d29-a7e5-864406861c12" // Replace this with your actual project ID
//       },
//       // This is what your app will use as API URL
//       apiUrl: process.env.API_URL || "http://117.247.79.184:8081",
//     },
    
//     experiments: {
//       typedRoutes: true
//     }
//   }
// };

// app.config.js

module.exports = {
  expo: {
    name: "RAISE",
    slug: "raise",
    version: "2.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    owner: "amigos1996",
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

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.subhra.raiseapp"
    },

    android: {
      package: "com.subhra.raiseapp",
      versionCode: 1,
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "WAKE_LOCK"
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      },
      usesCleartextTraffic: true // Still required here as fallback
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
            enableShrinkResourcesInReleaseBuilds: true
          }
        }
      ],
      "./withNetworkSecurityConfig" // 👈 custom plugin added here
    ],

    extra: {
      eas: {
        projectId: "d6c362af-d27f-4d29-a7e5-864406861c12"
      },
      apiUrl: process.env.API_URL || "http://117.247.79.184:8081"
    },

    experiments: {
      typedRoutes: true
    }
  }
};
