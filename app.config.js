// app.config.js
const config = {
  expo: {
    name: "RAISE",
    slug: "raise",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    owner: "arindam1996",
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.yourcompany.announceapp",
      versionCode: 1,
      // Explicitly add INTERNET permission
      permissions: [
        "INTERNET"
      ],
      // Enhanced network security config
      config: {
        networkSecurityConfig: {
          domainCleartext: [
            "192.168.0.101",
            "localhost",
            "127.0.0.1",
            "10.0.2.2" // Android emulator localhost
          ]
        }
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      "expo-font",
      "expo-secure-store"
    ],
    experiments: {
      typedRoutes: true
    },
    // Force development mode for better error reporting
    developmentClient: true,
    extra: {
      eas: {
        projectId: "ffb88d52-5601-4488-9523-56b3ffcc99ed"
      }
    }
  }
};

module.exports = config;