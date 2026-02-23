import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useUserStore } from '../features/auth/stores/useUserStore';
import { useMasteryStore } from '../features/etymology/stores/useMasteryStore';
import { COLORS } from '../shared/constants/colors';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Add custom fonts here if needed, for now we rely on system fonts
  });

  const loadMasteries = useMasteryStore((state) => state.loadMasteries);

  useEffect(() => {
    // Initialize stores
    loadMasteries();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/index" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="etymology/[id]" options={{ headerShown: true, title: 'Details', headerBackTitle: '', headerTintColor: COLORS.PRIMARY }} />
        <Stack.Screen name="etymology/word/[id]" options={{ presentation: 'modal', headerBackTitle: '' }} />
        <Stack.Screen name="quiz/play" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="quiz/result" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </View>
  );
}
