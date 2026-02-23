import { etymologyService } from '../../etymology/services/etymologyService';
import { QuizQuestion } from '../types';
import { quizChoiceEngine } from './quizChoiceEngine';

export const quizService = {
  generateQuestionsByEtymology: async (etymologyId: string, count: number = 10): Promise<QuizQuestion[]> => {
    const etymology = await etymologyService.getEtymologyById(etymologyId);
    if (!etymology) throw new Error('Etymology not found');

    const words = await etymologyService.getWordsByEtymologyId(etymologyId);
    if (words.length === 0) return [];

    const allWords = await etymologyService.getAllWords();

    // Shuffle words to make the quiz order different each time
    const shuffledWords = [...words].sort(() => 0.5 - Math.random());
    const selectedWords = shuffledWords.slice(0, count);

    const questions: QuizQuestion[] = [];

    for (const word of selectedWords) {
      const choices = quizChoiceEngine.generateChoices(word, allWords);
      questions.push({
        word,
        choices,
        correctIndex: choices.findIndex((c) => c.isCorrect),
        etymology,
      });
    }

    return questions;
  },
};
