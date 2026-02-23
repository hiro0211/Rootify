import { calculateNextReview, ReviewResult } from '../reviewService';

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
