import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gymbro.app',
  appName: 'GymBro',
  webDir: 'dist',
  server: {
    // Utilise l'app buildée localement (pas le serveur Vercel)
    // Pour le dev uniquement, commenter en production
    // url: 'https://gymbro-lyart.vercel.app',
    // cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0A0A0F',
    scrollEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0A0A0F',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0A0A0F',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
