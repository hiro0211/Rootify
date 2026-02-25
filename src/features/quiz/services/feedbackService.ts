import { haptics } from '../../../lib/haptics';
import { audioService } from '../../../lib/audio';
import { useSettingsStore } from '../../settings/stores/useSettingsStore';

export const feedbackService = {
    playCorrect: async () => {
        const { hapticsEnabled, soundEnabled } = useSettingsStore.getState();
        const tasks: Promise<void>[] = [];

        if (hapticsEnabled) {
            tasks.push(haptics.success());
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
            tasks.push(haptics.error());
        }
        if (soundEnabled) {
            tasks.push(audioService.playIncorrect());
        }

        await Promise.all(tasks);
    },

    playSelection: async () => {
        const { hapticsEnabled } = useSettingsStore.getState();

        if (hapticsEnabled) {
            await haptics.light();
        }
    },
};
