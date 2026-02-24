import { haptics } from '../../../lib/haptics';

export const feedbackService = {
    playCorrect: async () => { await haptics.success(); },
    playIncorrect: async () => { await haptics.error(); },
    playSelection: async () => { await haptics.light(); },
};
