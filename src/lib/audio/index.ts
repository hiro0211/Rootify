import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

// Options for speech (e.g., rate, pitch, voice)
type SpeechOptions = {
  language?: string;
  pitch?: number;
  rate?: number;
};

export const audio = {
  speak: (text: string, options: SpeechOptions = {}) => {
    Speech.speak(text, {
      language: options.language || 'en-US',
      pitch: options.pitch || 1.0,
      rate: options.rate || 0.9, // Slightly slower for learning
    });
  },
  stop: () => {
    Speech.stop();
  },
};

let correctSound: Audio.Sound | null = null;
let incorrectSound: Audio.Sound | null = null;

export const audioService = {
  preload: async () => {
    try {
      const { sound: correct } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/correct.wav')
      );
      correctSound = correct;

      const { sound: incorrect } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/incorrect.wav')
      );
      incorrectSound = incorrect;
    } catch {
      // Silently fail if sounds can't be loaded
    }
  },

  playCorrect: async () => {
    try {
      if (correctSound) {
        await correctSound.replayAsync();
      }
    } catch {
      // Silently fail if sound can't be played
    }
  },

  playIncorrect: async () => {
    try {
      if (incorrectSound) {
        await incorrectSound.replayAsync();
      }
    } catch {
      // Silently fail if sound can't be played
    }
  },

  unload: async () => {
    try {
      if (correctSound) {
        await correctSound.unloadAsync();
        correctSound = null;
      }
      if (incorrectSound) {
        await incorrectSound.unloadAsync();
        incorrectSound = null;
      }
    } catch {
      // Silently fail
    }
  },
};
