import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  isPro: boolean;
  streak: number;
  lastStudyDate: string | null; // YYYY-MM-DD
  dailyGoal: number; // questions per day
  nickname: string;
  setProStatus: (status: boolean) => void;
  incrementStreak: (today: string) => void;
  updateDailyGoal: (goal: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isPro: false,
      streak: 0,
      lastStudyDate: null,
      dailyGoal: 10,
      nickname: 'Guest',

      setProStatus: (status) => set({ isPro: status }),

      incrementStreak: (today) => {
        const { lastStudyDate, streak } = get();
        if (lastStudyDate === today) return; // Already counted

        // Check if yesterday (simplified for MVP)
        // In real app, check date diff
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        if (lastStudyDate === yesterday) {
            set({ streak: streak + 1, lastStudyDate: today });
        } else {
            // Reset if missed a day (or first time)
            set({ streak: 1, lastStudyDate: today });
        }
      },
      
      updateDailyGoal: (goal) => set({ dailyGoal: goal }),
    }),
    {
      name: 'wordroot-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
