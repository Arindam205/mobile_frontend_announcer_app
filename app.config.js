// app.config.js
module.exports = {
  expo: {
    name: "RAISE",
    slug: "raise",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    owner: "subhra1996",
    
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
      "expo-secure-store"
    ],
    
    extra: {
      eas: {
        projectId: "6edc8404-dd27-4a4e-b84f-3d5d26fbcf56"
      },
      apiUrl: process.env.API_URL || "http://192.168.0.101:8080",
    },
    
    experiments: {
      typedRoutes: true
    }
  }
};