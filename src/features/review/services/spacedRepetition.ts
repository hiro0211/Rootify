import { WordMastery } from '../../etymology/services/wordMasteryRepository';

export const spacedRepetition = {
  // Constants for intervals (in milliseconds)
  INTERVALS: {
    LEVEL_1: 1 * 24 * 60 * 60 * 1000,
    LEVEL_2: 3 * 24 * 60 * 60 * 1000,
    LEVEL_3: 7 * 24 * 60 * 60 * 1000,
    LEVEL_4: 30 * 24 * 60 * 60 * 1000,
  },

  calculateNextReview: (currentLevel: number, isCorrect: boolean): { level: number; nextDate: number | null } => {
    let newLevel = currentLevel;
    
    if (isCorrect) {
      newLevel = Math.min(4, currentLevel + 1);
    } else {
      newLevel = 1; // Reset to 1 (Weak)
    }

    const now = Date.now();
    let interval = 0;

    switch (newLevel) {
      case 1: interval = spacedRepetition.INTERVALS.LEVEL_1; break;
      case 2: interval = spacedRepetition.INTERVALS.LEVEL_2; break;
      case 3: interval = spacedRepetition.INTERVALS.LEVEL_3; break;
      case 4: interval = spacedRepetition.INTERVALS.LEVEL_4; break;
      default: interval = spacedRepetition.INTERVALS.LEVEL_1;
    }

    return {
      level: newLevel,
      nextDate: now + interval,
    };
  },

  getReviewDueWords: (masteries: Record<string, WordMastery>): string[] => {
      const now = Date.now();
      return Object.values(masteries)
        .filter(m => m.nextReviewDate !== null && m.nextReviewDate <= now)
        .map(m => m.wordId);
  }
};
