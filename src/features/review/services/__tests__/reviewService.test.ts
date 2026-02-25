import { calculateNextReview, getReviewDueWords, ReviewResult } from '../reviewService';
import { WordMastery } from '../../../etymology/services/wordMasteryRepository';

describe('reviewService - Spaced Repetition Algorithm', () => {
    const baseDate = new Date('2023-10-01T12:00:00Z');

    describe('When the user answers CORRECTLY', () => {
        it('should set an initial interval of 1 day for a new word (level 0)', () => {
            const result: ReviewResult = calculateNextReview(0, null, true, baseDate);
            expect(result.level).toBe(1);

            const expectedDate = new Date(baseDate);
            expectedDate.setDate(expectedDate.getDate() + 1);
            expect(result.nextReviewAt.toISOString()).toBe(expectedDate.toISOString());
        });

        it('should multiply the interval by 2.5 (rounded up) for subsequent correct answers (e.g., 1 day -> 3 days)', () => {
            const result: ReviewResult = calculateNextReview(1, 1, true, baseDate);
            expect(result.level).toBe(2);

            const expectedDate = new Date(baseDate);
            expectedDate.setDate(expectedDate.getDate() + 3); // Math.ceil(1 * 2.5) = 3
            expect(result.nextReviewAt.toISOString()).toBe(expectedDate.toISOString());
        });

        it('should progress correctly from 3 days -> 8 days', () => {
            const result: ReviewResult = calculateNextReview(2, 3, true, baseDate);
            expect(result.level).toBe(3);

            const expectedDate = new Date(baseDate);
            expectedDate.setDate(expectedDate.getDate() + 8); // Math.ceil(3 * 2.5) = 8
            expect(result.nextReviewAt.toISOString()).toBe(expectedDate.toISOString());
        });

        it('should cap the interval at a maximum of 30 days', () => {
            const result: ReviewResult = calculateNextReview(4, 20, true, baseDate);
            // Level caps at 4
            expect(result.level).toBe(4);

            const expectedDate = new Date(baseDate);
            expectedDate.setDate(expectedDate.getDate() + 30); // Math.ceil(20 * 2.5) = 50 -> capped at 30
            expect(result.nextReviewAt.toISOString()).toBe(expectedDate.toISOString());
        });
    });

    describe('When the user answers INCORRECTLY', () => {
        it('should reset the interval to 1 day and drop the level to 1 (苦手)', () => {
            const result: ReviewResult = calculateNextReview(3, 8, false, baseDate);
            expect(result.level).toBe(1);

            const expectedDate = new Date(baseDate);
            expectedDate.setDate(expectedDate.getDate() + 1);
            expect(result.nextReviewAt.toISOString()).toBe(expectedDate.toISOString());
        });

        it('should keep the level at 1 and interval at 1 day if already at minimums', () => {
            const result: ReviewResult = calculateNextReview(0, null, false, baseDate);
            expect(result.level).toBe(1);

            const expectedDate = new Date(baseDate);
            expectedDate.setDate(expectedDate.getDate() + 1);
            expect(result.nextReviewAt.toISOString()).toBe(expectedDate.toISOString());
        });
    });
});

describe('getReviewDueWords', () => {
    it('returns wordIds whose nextReviewDate is in the past', () => {
        const now = Date.now();
        const masteries: Record<string, WordMastery> = {
            word_1: { wordId: 'word_1', level: 2, nextReviewDate: now - 1000, lastReviewedDate: now - 100000, consecutiveCorrect: 1 },
            word_2: { wordId: 'word_2', level: 3, nextReviewDate: now + 100000, lastReviewedDate: now - 50000, consecutiveCorrect: 2 },
            word_3: { wordId: 'word_3', level: 1, nextReviewDate: now - 5000, lastReviewedDate: now - 200000, consecutiveCorrect: 0 },
        };
        const result = getReviewDueWords(masteries);
        expect(result).toContain('word_1');
        expect(result).toContain('word_3');
        expect(result).not.toContain('word_2');
        expect(result).toHaveLength(2);
    });

    it('returns empty array when no words are due', () => {
        const now = Date.now();
        const masteries: Record<string, WordMastery> = {
            word_1: { wordId: 'word_1', level: 2, nextReviewDate: now + 100000, lastReviewedDate: now - 50000, consecutiveCorrect: 1 },
        };
        expect(getReviewDueWords(masteries)).toEqual([]);
    });

    it('excludes words with null nextReviewDate', () => {
        const masteries: Record<string, WordMastery> = {
            word_1: { wordId: 'word_1', level: 0, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 0 },
        };
        expect(getReviewDueWords(masteries)).toEqual([]);
    });

    it('returns empty array for empty masteries', () => {
        expect(getReviewDueWords({})).toEqual([]);
    });
});
