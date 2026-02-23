import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import QuizPlayScreen from '../play';
import { useRouter } from 'expo-router';
// Mock useQuizSession to avoid complex state initialization in simple UI test
jest.mock('../../../features/quiz/hooks/useQuizSession', () => ({
    useQuizSession: () => ({
        currentQuestion: { word: { word: 'test' }, choices: [] },
        currentIndex: 0,
        total: 10,
        isLoading: false,
        isFinished: false,
        handleAnswer: jest.fn(),
        selectedChoiceIndex: null,
        results: [],
    })
}));
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: () => ({ etymologyId: 'etym_ject' })
}));
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 })
}));

describe('QuizPlayScreen', () => {
    it('途中で中断するためのクローズ(X)ボタンが存在すること', () => {
        const { getByTestId } = render(<QuizPlayScreen />);
        expect(getByTestId('close-quiz-button')).toBeTruthy();
    });

    it('クローズボタンを押すとホームまたは前の画面に戻ること', () => {
        const mockBack = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
        const { getByTestId } = render(<QuizPlayScreen />);

        fireEvent.press(getByTestId('close-quiz-button'));
        expect(mockBack).toHaveBeenCalled();
    });
});
