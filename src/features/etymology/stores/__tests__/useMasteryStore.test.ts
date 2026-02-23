import { useMasteryStore } from '../useMasteryStore';
import { wordMasteryRepository } from '../../services/wordMasteryRepository';
import { calculateNextReview } from '../../../review/services/reviewService';

// Mock the repository and service
jest.mock('../../services/wordMasteryRepository', () => ({
    wordMasteryRepository: {
        getAll: jest.fn().mockResolvedValue({}),
        save: jest.fn().mockResolvedValue(undefined),
    }
}));

jest.mock('../../../review/services/reviewService', () => ({
    calculateNextReview: jest.fn().mockReturnValue({
        level: 2,
        nextReviewAt: new Date('2024-01-05T00:00:00.000Z'),
    })
}));

describe('useMasteryStore integration with reviewService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useMasteryStore.setState({ masteries: {}, isLoading: false });
    });

    it('updateMastery should use reviewService to calculate interval and level', async () => {
        const store = useMasteryStore.getState();
        await store.updateMastery('test-word-1', true);

        // Ensure calculateNextReview was called
        expect(calculateNextReview).toHaveBeenCalled();

        // Verify store was updated with values returned by calculateNextReview
        const updated = useMasteryStore.getState().masteries['test-word-1'];
        expect(updated).toBeDefined();
        expect(updated.level).toBe(2);
        expect(updated.nextReviewDate).toBe(new Date('2024-01-05T00:00:00.000Z').getTime());
    });

    it('updateMastery should track review interval days properly to pass to calculateNextReview', async () => {
        // Current state mock
        useMasteryStore.setState({
            masteries: {
                'test-word-2': {
                    wordId: 'test-word-2',
                    level: 2,
                    lastReviewedDate: new Date('2024-01-01T00:00:00.000Z').getTime(),
                    nextReviewDate: new Date('2024-01-04T00:00:00.000Z').getTime(),
                    consecutiveCorrect: 1,
                }
            }
        });

        const store = useMasteryStore.getState();
        await store.updateMastery('test-word-2', false);

        // The interval days passed to calculateNextReview should be 3 (from 1st to 4th)
        expect(calculateNextReview).toHaveBeenCalledWith(
            2,
            3,
            false,
            expect.any(Date)
        );
    });
});
