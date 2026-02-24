import * as Haptics from 'expo-haptics';
import { audioService } from '../../../lib/audio';
import { useSettingsStore } from '../../settings/stores/useSettingsStore';

export const feedbackService = {
    playCorrect: async () => {
        const { hapticsEnabled, soundEnabled } = useSettingsStore.getState();
        const tasks: Promise<void>[] = [];

        if (hapticsEnabled) {
            tasks.push(
                Promise.resolve(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)).catch(() => {})
            );
        }
        if (soundEnabled) {
            tasks.push(audioService.playCorrect());
        }

        await Promise.all(tasks);
    },

    playIncorrect: async () => {
        const { hapticsEnabled, soundEnabled } = useSettingsStore.getState();
        const tasks: Promise<void>[] = [];

        if (hapticsEnabled) {
            tasks.push(
                Promise.resolve(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)).catch(() => {})
            );
        }
        if (soundEnabled) {
            tasks.push(audioService.playIncorrect());
        }

        await Promise.all(tasks);
    },

    playSelection: async () => {
        const { hapticsEnabled } = useSettingsStore.getState();

        if (hapticsEnabled) {
            try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch {
                // Silently fail
            }
        }
    },
};
