import { create } from 'zustand';
import { WordMastery, wordMasteryRepository } from '../services/wordMasteryRepository';
import { calculateNextReview } from '../../review/services/reviewService';

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

    // Calculate current interval
    let currentIntervalDays: number | null = null;
    const oneDay = 24 * 60 * 60 * 1000;
    if (current.lastReviewedDate && current.nextReviewDate) {
      currentIntervalDays = Math.round((current.nextReviewDate - current.lastReviewedDate) / oneDay);
    }

    const { level: newLevel, nextReviewAt } = calculateNextReview(
      current.level,
      currentIntervalDays,
      isCorrect,
      new Date()
    );

    let newConsecutive = current.consecutiveCorrect;
    if (isCorrect) {
      newConsecutive += 1;
    } else {
      newConsecutive = 0;
    }

    const updated: WordMastery = {
      ...current,
      level: newLevel,
      consecutiveCorrect: newConsecutive,
      lastReviewedDate: Date.now(),
      nextReviewDate: nextReviewAt.getTime(),
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
