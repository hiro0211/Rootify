import * as Haptics from 'expo-haptics';
import { feedbackService } from '../feedbackService';

jest.mock('expo-haptics', () => ({
    notificationAsync: jest.fn(),
    impactAsync: jest.fn(),
    NotificationFeedbackType: {
        Success: 'Success',
        Error: 'Error',
    },
    ImpactFeedbackStyle: {
        Light: 'Light',
        Medium: 'Medium',
        Heavy: 'Heavy',
    }
}));

describe('feedbackService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('playCorrect plays a success haptic notification', async () => {
        await feedbackService.playCorrect();
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
    });

    it('playIncorrect plays an error haptic notification', async () => {
        await feedbackService.playIncorrect();
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Error);
    });
});
