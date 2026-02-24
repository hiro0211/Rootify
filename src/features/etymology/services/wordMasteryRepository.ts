import { storage } from '../../../lib/storage';

export interface WordMastery {
  wordId: string;
  level: number; // 0: Unstudied, 1: Weak, 2: So-so, 3: Good, 4: Mastered
  nextReviewDate: number | null; // Timestamp
  lastReviewedDate: number | null;
  consecutiveCorrect: number;
}

const STORAGE_KEY = 'wordroot_word_mastery';

export const wordMasteryRepository = {
  getAll: async (): Promise<Record<string, WordMastery>> => {
    const data = await storage.getItem<Record<string, WordMastery>>(STORAGE_KEY);
    return data || {};
  },

  saveAll: async (data: Record<string, WordMastery>): Promise<void> => {
    await storage.setItem(STORAGE_KEY, data);
  },

  getById: async (wordId: string): Promise<WordMastery | null> => {
    const all = await wordMasteryRepository.getAll();
    return all[wordId] || null;
  },

  save: async (mastery: WordMastery): Promise<void> => {
    const all = await wordMasteryRepository.getAll();
    all[mastery.wordId] = mastery;
    await wordMasteryRepository.saveAll(all);
  },
  
  // Batch update
  saveBatch: async (masteries: WordMastery[]): Promise<void> => {
    const all = await wordMasteryRepository.getAll();
    masteries.forEach(m => {
        all[m.wordId] = m;
    });
    await wordMasteryRepository.saveAll(all);
  }
};
