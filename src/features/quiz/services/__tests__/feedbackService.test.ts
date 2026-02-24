import { feedbackService } from '../feedbackService';
import { haptics } from '../../../../lib/haptics';

jest.mock('../../../../lib/haptics', () => ({
    haptics: {
        success: jest.fn(),
        error: jest.fn(),
        light: jest.fn(),
    }
}));

describe('feedbackService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('playCorrect calls haptics.success', async () => {
        await feedbackService.playCorrect();
        expect(haptics.success).toHaveBeenCalled();
    });

    it('playIncorrect calls haptics.error', async () => {
        await feedbackService.playIncorrect();
        expect(haptics.error).toHaveBeenCalled();
    });

    it('playSelection calls haptics.light', async () => {
        await feedbackService.playSelection();
        expect(haptics.light).toHaveBeenCalled();
    });
});
