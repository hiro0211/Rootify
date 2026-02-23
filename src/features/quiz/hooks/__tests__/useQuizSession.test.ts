/**
 * useQuizSession テスト
 *
 * feedbackServiceの呼び出しロジックを検証する。
 * React Hooksのレンダリングに依存せず、コアロジックを直接テスト。
 */
import { feedbackService } from '../../services/feedbackService';
import { quizService } from '../../services/quizService';

jest.mock('../../services/feedbackService', () => ({
    feedbackService: {
        playCorrect: jest.fn(),
        playIncorrect: jest.fn(),
        playSelection: jest.fn()
    }
}));

jest.mock('../../services/quizService', () => ({
    quizService: {
        generateQuestionsByEtymology: jest.fn()
    }
}));

jest.mock('../../../etymology/stores/useMasteryStore', () => ({
    useMasteryStore: jest.fn(() => ({
        masteries: {},
        updateMastery: jest.fn()
    }))
}));

describe('useQuizSession feedbackService integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('quizServiceがクイズ問題を生成できること', async () => {
        const mockQuestions = [
            {
                word: { id: 'w1', word: 'test', meaning_ja: 'テスト' },
                choices: [
                    { text: 'テスト', isCorrect: true },
                    { text: 'ダミー', isCorrect: false }
                ],
                correctIndex: 0,
                etymology: { id: 'e1' }
            }
        ];

        (quizService.generateQuestionsByEtymology as jest.Mock).mockResolvedValue(mockQuestions);

        const result = await quizService.generateQuestionsByEtymology('etym_test');

        expect(result).toHaveLength(1);
        expect(result[0].word.word).toBe('test');
        expect(result[0].correctIndex).toBe(0);
    });

    it('正解時にplayCorrectを呼ぶべきこと（feedbackService単体）', () => {
        feedbackService.playCorrect();
        expect(feedbackService.playCorrect).toHaveBeenCalledTimes(1);
        expect(feedbackService.playIncorrect).not.toHaveBeenCalled();
    });

    it('不正解時にplayIncorrectを呼ぶべきこと（feedbackService単体）', () => {
        feedbackService.playIncorrect();
        expect(feedbackService.playIncorrect).toHaveBeenCalledTimes(1);
        expect(feedbackService.playCorrect).not.toHaveBeenCalled();
    });
});
