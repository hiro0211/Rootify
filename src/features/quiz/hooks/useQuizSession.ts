import { useState, useEffect, useRef } from 'react';
import { QuizQuestion, QuizSessionResult } from '../types';
import { quizService } from '../services/quizService';
import { feedbackService } from '../services/feedbackService';
import { useMasteryStore } from '../../etymology/stores/useMasteryStore';

export function useQuizSession(etymologyId: string | undefined) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [sessionResult, setSessionResult] = useState<QuizSessionResult | null>(null);

  const updateMastery = useMasteryStore((state) => state.updateMastery);

  useEffect(() => {
    const init = async () => {
      try {
        if (!etymologyId) {
          // If no ID, maybe random? MVP requires ID for "By Etymology"
          // For now, load a default or error
          console.error("No etymology ID provided");
          return;
        }
        const qs = await quizService.generateQuestionsByEtymology(etymologyId);
        setQuestions(qs);
        setStartTime(Date.now());
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [etymologyId]);

  const handleAnswer = async (choiceIndex: number) => {
    if (selectedChoiceIndex !== null) return; // Prevent double tap

    setSelectedChoiceIndex(choiceIndex);
    const currentQ = questions[currentIndex];
    const correct = choiceIndex === currentQ.correctIndex;
    setIsCorrect(correct);

    // Feedback
    if (correct) {
      feedbackService.playCorrect();
    } else {
      feedbackService.playIncorrect();
    }

    // Update Mastery
    await updateMastery(currentQ.word.id, correct);

    // Update session stats
    const newResults = [...results, correct];
    setResults(newResults);

    // Delay for next question
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedChoiceIndex(null);
        setIsCorrect(null);
      } else {
        finishSession(newResults);
      }
    }, correct ? 800 : 2000); // Longer delay for incorrect to see the right answer (visual feedback)
  };

  const finishSession = (finalResults: boolean[]) => {
    const endTime = Date.now();
    const correctCount = finalResults.filter((r) => r).length;

    // Identify weak etymologies (just the current one for this mode)
    const weakEtymologies = correctCount < questions.length * 0.8 ? [etymologyId!] : [];

    setSessionResult({
      totalQuestions: questions.length,
      correctCount,
      timeSpentSec: (endTime - startTime) / 1000,
      answers: [], // Populate if needed
      weakEtymologies,
    });
    setIsFinished(true);
  };

  return {
    questions,
    currentQuestion: questions[currentIndex],
    currentIndex,
    isLoading,
    isFinished,
    handleAnswer,
    selectedChoiceIndex,
    isCorrect,
    results,
    sessionResult,
    total: questions.length,
  };
}
