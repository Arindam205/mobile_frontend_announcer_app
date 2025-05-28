module.exports = {
  expo: {
    name: "RAISE",
    slug: "raise",
    version: "3.0.0",
    orientation: "portrait",
    icon: "./assets/images/AkashvaniLogo1.png",
    userInterfaceStyle: "automatic",
    owner: "amigos1997",
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
      versionCode: 3,
      minSdkVersion: 24, // CHANGED: From 23 to 24 to match your current APK
      compileSdkVersion: 35, // CHANGED: From 34 to 35 to match your current APK  
      targetSdkVersion: 34, // KEPT: Already matches your APK
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "WAKE_LOCK"
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/images/AkashvaniLogo1.png",
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
        projectId: "b2fea7ee-700c-404f-9ac8-10888a5bac79"
      },
      apiUrl: process.env.API_URL || "http://117.247.79.184:8081"
    },

    experiments: {
      typedRoutes: true
    }
  }
};
