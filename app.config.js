// app.config.js
module.exports = {
  expo: {
    name: "RAISE",
    slug: "raise",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    owner: "subhra1997",
    scheme: "raise", // Added scheme property
    
    splash: {
      image: "./assets/images/akashvanilogo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    
    updates: {
      fallbackToCacheTimeout: 0,
      checkAutomatically: "ON_LOAD"
    },
    
    assetBundlePatterns: [
      "**/*"
    ],
    
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.announceapp"
    },
    
    android: {
      package: "com.yourcompany.announceapp",
      versionCode: 1,
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      }
    },
    
    web: {
      favicon: "./assets/images/favicon.png"
    },
    
    plugins: [
      "expo-router",
      "expo-secure-store",
      "react-native-svg"
    ],
    
    extra: {
      eas: {
        projectId: "3690391d-4cb2-4f13-8206-2cb13e19f1f5"
      },
      apiUrl: process.env.API_URL || "http://192.168.0.101:8080",
    },
    
    experiments: {
      typedRoutes: true
    }
  }
};