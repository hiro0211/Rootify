export const APP = {
  // Quiz timing delays (ms)
  QUIZ_CORRECT_DELAY: 800,
  QUIZ_INCORRECT_DELAY: 2000,

  // Total words available in the app
  TOTAL_WORDS: 800,

  // Spaced repetition
  SR_INTERVAL_MAX_DAYS: 30,
  SR_INTERVAL_MULTIPLIER: 2.5,
  SR_LEVEL_MAX: 4,

  // Progress threshold: % correct to not flag etymology as weak
  QUIZ_PASS_THRESHOLD: 0.8,
} as const;
