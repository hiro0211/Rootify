import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  setNotifications: (enabled: boolean) => void;
  setSound: (enabled: boolean) => void;
  setHaptics: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      soundEnabled: true,
      hapticsEnabled: true,
      setNotifications: (enabled) => set({ notificationsEnabled: enabled }),
      setSound: (enabled) => set({ soundEnabled: enabled }),
      setHaptics: (enabled) => set({ hapticsEnabled: enabled }),
    }),
    {
      name: 'wordroot-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
