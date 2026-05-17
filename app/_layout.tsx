import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { initializePrices } from '@/lib/defaultPrices';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    AlfaSlabOne_Regular: require('../assets/fonts/AlfaSlabOne_Regular.ttf'),
    DMSans_Regular: require('../assets/fonts/DMSans_Regular.ttf'),
    DMSans_Medium: require('../assets/fonts/DMSans_Medium.ttf'),
    DMSans_Bold: require('../assets/fonts/DMSans_Bold.ttf'),
    Pacifico_Regular: require('../assets/fonts/Pacifico_Regular.ttf'),
    SpecialElite_Regular: require('../assets/fonts/SpecialElite_Regular.ttf'),
  });

  useEffect(() => {
    initializePrices();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          animationDuration: 300,
          gestureEnabled: true,
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="nueva" />
        <Stack.Screen name="resumen" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true, title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
