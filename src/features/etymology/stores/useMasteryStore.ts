import { create } from 'zustand';
import { WordMastery, wordMasteryRepository } from '../services/wordMasteryRepository';

interface MasteryState {
  masteries: Record<string, WordMastery>;
  isLoading: boolean;
  loadMasteries: () => Promise<void>;
  updateMastery: (wordId: string, isCorrect: boolean) => Promise<void>;
  getMastery: (wordId: string) => WordMastery | undefined;
}

export const useMasteryStore = create<MasteryState>((set, get) => ({
  masteries: {},
  isLoading: true,

  loadMasteries: async () => {
    set({ isLoading: true });
    const data = await wordMasteryRepository.getAll();
    set({ masteries: data, isLoading: false });
  },

  updateMastery: async (wordId: string, isCorrect: boolean) => {
    const current = get().masteries[wordId] || {
      wordId,
      level: 0,
      nextReviewDate: null,
      lastReviewedDate: null,
      consecutiveCorrect: 0,
    };

    // Simple SRS logic for MVP
    // Correct: Level up, increase interval
    // Incorrect: Reset to Level 1 (not 0, as they've seen it)
    let newLevel = current.level;
    let newConsecutive = current.consecutiveCorrect;
    
    if (isCorrect) {
      newLevel = Math.min(4, current.level + 1);
      newConsecutive += 1;
    } else {
      newLevel = 1;
      newConsecutive = 0;
    }

    // Interval calculation (mock)
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    let interval = oneDay;
    if (newLevel === 2) interval = 3 * oneDay;
    if (newLevel === 3) interval = 7 * oneDay;
    if (newLevel === 4) interval = 30 * oneDay;

    const nextDate = now + interval;

    const updated: WordMastery = {
      ...current,
      level: newLevel,
      consecutiveCorrect: newConsecutive,
      lastReviewedDate: now,
      nextReviewDate: nextDate,
    };

    // Optimistic update
    set((state) => ({
      masteries: { ...state.masteries, [wordId]: updated },
    }));

    // Persist
    await wordMasteryRepository.save(updated);
  },

  getMastery: (wordId: string) => get().masteries[wordId],
}));
