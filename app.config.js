// app.config.js
module.exports = {
  expo: {
    name: "RAISE",
    slug: "raise",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    owner: "arindam1996",
    
    // Keep minimal Android config
    android: {
      package: "com.yourcompany.announceapp",
      versionCode: 1,
    },
    
    // Use config plugins to manage native configuration
    plugins: [
      "expo-router",
      "expo-secure-store",
      [
        "expo-build-properties",
        {
          "android": {
            "usesCleartextTraffic": true,
            "networkSecurityConfigPath": "./network-security-config.xml"
          }
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "ffb88d52-5601-4488-9523-56b3ffcc99ed"
      }
    }
  }
};