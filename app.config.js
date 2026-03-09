// {
//   "expo": {
//     "name": "leaf-weighing-app",
//     "slug": "leaf-weighing-app",
//     "version": "1.0.0",
//     "orientation": "default",
//     "icon": "./assets/images/icon.png",
//     "userInterfaceStyle": "automatic",
//     "newArchEnabled": true,
//     "scheme": "leafweighingapp",
//     "splash": {
//       "image": "./assets/images/splash-icon.png",
//       "resizeMode": "cover",
//       "backgroundColor": "#000000",
//       "dark": {
//         "image": "./assets/images/splash-icon.png",
//         "resizeMode": "cover",
//         "backgroundColor": "#000000"
//       }
//     },
//     "ios": {
//       "supportsTablet": true,
//       "icon": "./assets/images/icon.png",
//       "bundleIdentifier": "com.ceybaseit.leafweighingapp",
//       "splash": {
//         "image": "./assets/images/splash-icon.png",
//         "resizeMode": "cover",
//         "backgroundColor": "#000000",
//         "tablet": {
//           "image": "./assets/images/splash-icon.png",
//           "resizeMode": "cover",
//           "backgroundColor": "#000000"
//         }
//       }
//     },
//     "android": {
//       "adaptiveIcon": {
//         "foregroundImage": "./assets/images/adaptive-icon.png",
//         "backgroundColor": "#ffffff"
//       },
//       "package": "com.ceybaseit.leafweighingapp",
//       "splash": {
//         "image": "./assets/images/splash-icon.png",
//         "resizeMode": "cover",
//         "backgroundColor": "#000000"
//       }
//     },
//     "web": {
//       "favicon": "./assets/images/favicon.png"
//     },
//     "plugins": [
//       [
//         "expo-splash-screen",
//         {
//           "image": "./assets/images/splash-icon.png",
//           "resizeMode": "cover",
//           "backgroundColor": "#000000",
//           "dark": {
//             "image": "./assets/images/splash-icon.png",
//             "resizeMode": "cover",
//             "backgroundColor": "#000000"
//           }
//         }
//       ]
//     ],
//     "experiments": {
//       "reactCompiler": true
//     },
//     "extra": {
//       "eas": {
//         "projectId": "a9ef9192-239e-4d9b-a933-2241ae8f7261"
//       }
//     }
//   }
// }

export default {
  expo: {
    name: "leaf-weighing-app",
    slug: "leaf-weighing-app",
    version: "1.0.0",
    orientation: "default",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    scheme: "leafweighingapp",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "cover",
      backgroundColor: "#000000",
      dark: {
        image: "./assets/images/splash-icon.png",
        resizeMode: "cover",
        backgroundColor: "#000000"
      }
    },
    ios: {
      supportsTablet: true,
      icon: "./assets/images/icon.png",
      bundleIdentifier: "com.ceybaseit.leafweighingapp",
      splash: {
        image: "./assets/images/splash-icon.png",
        resizeMode: "cover",
        backgroundColor: "#000000",
        tablet: {
          image: "./assets/images/splash-icon.png",
          resizeMode: "cover",
          backgroundColor: "#000000"
        }
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.ceybaseit.leafweighingapp",
      splash: {
        image: "./assets/images/splash-icon.png",
        resizeMode: "cover",
        backgroundColor: "#000000"
      }
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          resizeMode: "cover",
          backgroundColor: "#000000",
          dark: {
            image: "./assets/images/splash-icon.png",
            resizeMode: "cover",
            backgroundColor: "#000000"
          }
        }
      ]
    ],
    experiments: {
      reactCompiler: true
    },
    extra: {
      eas: {
        projectId: "a9ef9192-239e-4d9b-a933-2241ae8f7261"
      },
      apiUrl: process.env.API_URL || 'http://192.168.8.108:5000/api'
    }
  }
};