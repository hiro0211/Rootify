export type ReviewResult = {
    level: number;
    nextReviewAt: Date;
};

/**
 * Calculates the next review date and new mastery level based on the Spaced Repetition Algorithm.
 * 
 * Rules:
 * - Initial interval: 1 day.
 * - Correct answer multiplier: current interval × 2.5 (round up).
 * - Incorrect answer: Reset interval to 1 day.
 * - Maximum interval: 30 days.
 * - Max level: 4. Min level (once learned): 1.
 *
 * @param currentLevel The current mastery level of the word (0-4). 0 means unlearned.
 * @param currentIntervalDays The current interval in days assigned to the word. Null if new.
 * @param isCorrect Whether the user answered the quiz correctly.
 * @param baseDate The date to calculate from (defaults to now).
 */
export function calculateNextReview(
    currentLevel: number,
    currentIntervalDays: number | null,
    isCorrect: boolean,
    baseDate: Date = new Date()
): ReviewResult {
    let newLevel = currentLevel;
    let newInterval = currentIntervalDays || 0;

    if (isCorrect) {
        if (newLevel < 4) newLevel += 1;
        newInterval = newInterval === 0 ? 1 : Math.ceil(newInterval * 2.5);
        if (newInterval > 30) newInterval = 30;
    } else {
        newLevel = 1;
        newInterval = 1;
    }

    const nextReviewAt = new Date(baseDate);
    nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

    return {
        level: newLevel,
        nextReviewAt,
    };
}
