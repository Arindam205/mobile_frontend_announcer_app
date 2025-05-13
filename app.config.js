module.exports = {
  expo: {
    name: "RAISE",
    slug: "raise",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    owner: "arindam1996",
    
    android: {
      package: "com.yourcompany.announceapp",
      versionCode: 1,
      permissions: ["INTERNET"]
    },
    
    plugins: [
      "expo-router",
      "expo-secure-store"
    ],
    
    extra: {
      eas: {
        projectId: "ffb88d52-5601-4488-9523-56b3ffcc99ed"
      }
    }
  }
};