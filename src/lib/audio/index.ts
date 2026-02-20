import * as Speech from 'expo-speech';

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
