import etymologiesData from '../../../data/etymologies.json';
import wordsData from '../../../data/words.json';
import { Etymology, Word, EtymologyWithWords } from '../types';

// In a real app, this might fetch from an API or database
// For MVP, we read directly from JSON

export const etymologyService = {
  getAllEtymologies: async (): Promise<Etymology[]> => {
    // Simulate async
    return new Promise((resolve) => {
      setTimeout(() => resolve(etymologiesData as Etymology[]), 50);
    });
  },

  getEtymologyById: async (id: string): Promise<Etymology | undefined> => {
    const etym = (etymologiesData as Etymology[]).find((e) => e.id === id);
    return Promise.resolve(etym);
  },

  getWordsByEtymologyId: async (id: string): Promise<Word[]> => {
    const words = (wordsData as Word[]).filter((w) => w.etymology_id === id);
    return Promise.resolve(words.sort((a, b) => a.sort_order - b.sort_order));
  },

  getEtymologyWithWords: async (id: string): Promise<EtymologyWithWords | undefined> => {
    const etymology = await etymologyService.getEtymologyById(id);
    if (!etymology) return undefined;

    const words = await etymologyService.getWordsByEtymologyId(id);
    return { ...etymology, words };
  },
  
  getAllWords: async (): Promise<Word[]> => {
      return Promise.resolve(wordsData as Word[]);
  }
};
