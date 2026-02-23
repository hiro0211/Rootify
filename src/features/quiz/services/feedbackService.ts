import * as Haptics from 'expo-haptics';

export const feedbackService = {
    playCorrect: async () => {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.warn('Haptics not supported or failed', error);
        }
    },
    playIncorrect: async () => {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (error) {
            console.warn('Haptics not supported or failed', error);
        }
    },
    playSelection: async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
            console.warn('Haptics not supported or failed', error);
        }
    }
};
