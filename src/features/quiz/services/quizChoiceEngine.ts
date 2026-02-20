import { Word } from '../../etymology/types';
import { QuizChoice } from '../types';

export const quizChoiceEngine = {
  generateChoices: (correctWord: Word, allWords: Word[]): QuizChoice[] => {
    const choices: QuizChoice[] = [];

    // 1. Add correct answer
    choices.push({
      text: correctWord.meaning_ja,
      wordId: correctWord.id,
      isCorrect: true,
    });

    // 2. Add distractors (3 items)
    // Strategy:
    // - 1 same root (high priority)
    // - 1 same part of speech (medium priority)
    // - 1 random (low priority)

    const otherWords = allWords.filter((w) => w.id !== correctWord.id);
    
    // Shuffle helper
    const shuffle = <T>(array: T[]): T[] => {
      return array.sort(() => Math.random() - 0.5);
    };

    const sameRoot = otherWords.filter((w) => w.root === correctWord.root);
    const samePos = otherWords.filter((w) => w.part_of_speech === correctWord.part_of_speech);
    
    // Add same root distractor if available
    if (sameRoot.length > 0) {
      const distractor = shuffle(sameRoot)[0];
      choices.push({
        text: distractor.meaning_ja,
        wordId: distractor.id,
        isCorrect: false,
      });
    }

    // Add same POS distractor
    const remainingForPos = otherWords.filter(w => !choices.find(c => c.wordId === w.id));
    const samePosFiltered = remainingForPos.filter(w => w.part_of_speech === correctWord.part_of_speech);
    
    if (samePosFiltered.length > 0) {
        const distractor = shuffle(samePosFiltered)[0];
        choices.push({
            text: distractor.meaning_ja,
            wordId: distractor.id,
            isCorrect: false,
        });
    }

    // Fill remaining with random
    while (choices.length < 4) {
        const candidates = otherWords.filter(w => !choices.find(c => c.wordId === w.id));
        if (candidates.length === 0) break; // Should not happen with enough data
        const distractor = shuffle(candidates)[0];
        choices.push({
            text: distractor.meaning_ja,
            wordId: distractor.id,
            isCorrect: false,
        });
    }

    // 3. Shuffle choices
    return shuffle(choices);
  },
};
