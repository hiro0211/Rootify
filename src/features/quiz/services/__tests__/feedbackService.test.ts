import { feedbackService } from '../feedbackService';
import { haptics } from '../../../../lib/haptics';

// Mock haptics (from lib/haptics)
jest.mock('../../../../lib/haptics', () => ({
    haptics: {
        success: jest.fn(),
        error: jest.fn(),
        light: jest.fn(),
    }
}));

// Mock audioService
const mockPlayCorrect = jest.fn();
const mockPlayIncorrect = jest.fn();
jest.mock('../../../../lib/audio', () => ({
    audio: {},
    audioService: {
        playCorrect: () => mockPlayCorrect(),
        playIncorrect: () => mockPlayIncorrect(),
    },
}));

// Mock useSettingsStore
const mockGetState = jest.fn();
jest.mock('../../../settings/stores/useSettingsStore', () => ({
    useSettingsStore: {
        getState: () => mockGetState(),
    },
}));

describe('feedbackService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPlayCorrect.mockReset();
        mockPlayIncorrect.mockReset();
    });

    describe('playCorrect', () => {
        it('plays haptic and sound when both enabled', async () => {
            mockGetState.mockReturnValue({ soundEnabled: true, hapticsEnabled: true });
            await feedbackService.playCorrect();
            expect(haptics.success).toHaveBeenCalled();
            expect(mockPlayCorrect).toHaveBeenCalledTimes(1);
        });

        it('plays haptic only when soundEnabled=false', async () => {
            mockGetState.mockReturnValue({ soundEnabled: false, hapticsEnabled: true });
            await feedbackService.playCorrect();
            expect(haptics.success).toHaveBeenCalled();
            expect(mockPlayCorrect).not.toHaveBeenCalled();
        });

        it('plays sound only when hapticsEnabled=false', async () => {
            mockGetState.mockReturnValue({ soundEnabled: true, hapticsEnabled: false });
            await feedbackService.playCorrect();
            expect(haptics.success).not.toHaveBeenCalled();
            expect(mockPlayCorrect).toHaveBeenCalledTimes(1);
        });

        it('plays neither when both disabled', async () => {
            mockGetState.mockReturnValue({ soundEnabled: false, hapticsEnabled: false });
            await feedbackService.playCorrect();
            expect(haptics.success).not.toHaveBeenCalled();
            expect(mockPlayCorrect).not.toHaveBeenCalled();
        });
    });

    describe('playIncorrect', () => {
        it('plays haptic and sound when both enabled', async () => {
            mockGetState.mockReturnValue({ soundEnabled: true, hapticsEnabled: true });
            await feedbackService.playIncorrect();
            expect(haptics.error).toHaveBeenCalled();
            expect(mockPlayIncorrect).toHaveBeenCalledTimes(1);
        });

        it('plays haptic only when soundEnabled=false', async () => {
            mockGetState.mockReturnValue({ soundEnabled: false, hapticsEnabled: true });
            await feedbackService.playIncorrect();
            expect(haptics.error).toHaveBeenCalled();
            expect(mockPlayIncorrect).not.toHaveBeenCalled();
        });

        it('plays sound only when hapticsEnabled=false', async () => {
            mockGetState.mockReturnValue({ soundEnabled: true, hapticsEnabled: false });
            await feedbackService.playIncorrect();
            expect(haptics.error).not.toHaveBeenCalled();
            expect(mockPlayIncorrect).toHaveBeenCalledTimes(1);
        });

        it('plays neither when both disabled', async () => {
            mockGetState.mockReturnValue({ soundEnabled: false, hapticsEnabled: false });
            await feedbackService.playIncorrect();
            expect(haptics.error).not.toHaveBeenCalled();
            expect(mockPlayIncorrect).not.toHaveBeenCalled();
        });
    });

    describe('playSelection', () => {
        it('plays impact haptic when hapticsEnabled=true', async () => {
            mockGetState.mockReturnValue({ soundEnabled: true, hapticsEnabled: true });
            await feedbackService.playSelection();
            expect(haptics.light).toHaveBeenCalled();
        });

        it('does not play haptic when hapticsEnabled=false', async () => {
            mockGetState.mockReturnValue({ soundEnabled: false, hapticsEnabled: false });
            await feedbackService.playSelection();
            expect(haptics.light).not.toHaveBeenCalled();
        });
    });
});
