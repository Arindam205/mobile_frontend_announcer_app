// app.config.js
const config = {
  expo: {
    name: "RAISE",
    slug: "raise",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    owner: "arindam1996",
    developmentClient: {
      silentLaunch: false
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ff5722" // Changed to orange color for testing
      },
      package: "com.yourcompany.announceapp",
      versionCode: 1,
      permissions: ["INTERNET"],
      usesCleartextTraffic: true // Allow cleartext (HTTP) traffic
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      // Removed: expo-splash-screen plugin
      "expo-font",
      "expo-secure-store"
    ],
    extra: {
      eas: {
        projectId: "ffb88d52-5601-4488-9523-56b3ffcc99ed"
      }
    }
  }
};

module.exports = config;