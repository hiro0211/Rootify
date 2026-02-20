import { Word, Etymology } from '../etymology/types';

export interface QuizChoice {
  text: string; // Japanese meaning
  wordId: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  word: Word;
  choices: QuizChoice[];
  correctIndex: number; // 0-3
  etymology: Etymology;
}

export interface QuizSessionResult {
  totalQuestions: number;
  correctCount: number;
  timeSpentSec: number;
  answers: QuizAnswerRecord[];
  weakEtymologies: string[];
}

export interface QuizAnswerRecord {
  wordId: string;
  isCorrect: boolean;
  timeTaken: number;
}
