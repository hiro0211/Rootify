import { WordMastery } from '../../etymology/services/wordMasteryRepository';

export const progressService = {
  calculateMasteryDistribution: (masteries: Record<string, WordMastery>) => {
    const distribution = {
      0: 0, // Unstudied (needs total count)
      1: 0, // Weak
      2: 0, // So-so
      3: 0, // Good
      4: 0, // Mastered
    };

    Object.values(masteries).forEach((m) => {
      if (m.level >= 1 && m.level <= 4) {
        distribution[m.level as 1|2|3|4]++;
      }
    });

    return distribution;
  },

  calculateTotalStudied: (masteries: Record<string, WordMastery>) => {
      return Object.values(masteries).filter(m => m.level > 0).length;
  }
};
