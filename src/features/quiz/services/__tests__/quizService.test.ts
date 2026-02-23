/**
 * quizService テスト
 *
 * 要件定義書に基づくテスト:
 * - US-02: 1セッション10問のクイズを完了
 * - 9.1: クイズモード仕様 — 語源別クイズ 10問
 * - 9.2: クイズ出題画面 — 問題生成・出題ロジック
 *
 * TDD Red Phase
 */
import { quizService } from '../quizService';

describe('quizService', () => {
  describe('generateQuestionsByEtymology', () => {
    it('語源IDから問題リストを生成できること', async () => {
      const questions = await quizService.generateQuestionsByEtymology('etym_tract');
      expect(questions).toBeDefined();
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
    });

    it('各問題にword, choices, correctIndex, etymologyが含まれること', async () => {
      const questions = await quizService.generateQuestionsByEtymology('etym_tract');
      questions.forEach((q) => {
        expect(q.word).toBeDefined();
        expect(q.word.id).toBeTruthy();
        expect(q.word.word).toBeTruthy();
        expect(q.choices).toBeDefined();
        expect(Array.isArray(q.choices)).toBe(true);
        expect(typeof q.correctIndex).toBe('number');
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.choices.length);
        expect(q.etymology).toBeDefined();
        expect(q.etymology.id).toBe('etym_tract');
      });
    });

    it('各問題に4つの選択肢があること', async () => {
      const questions = await quizService.generateQuestionsByEtymology('etym_tract');
      questions.forEach((q) => {
        expect(q.choices.length).toBe(4);
      });
    });

    it('correctIndexが正解の選択肢を指していること', async () => {
      const questions = await quizService.generateQuestionsByEtymology('etym_tract');
      questions.forEach((q) => {
        const correctChoice = q.choices[q.correctIndex];
        expect(correctChoice.isCorrect).toBe(true);
        expect(correctChoice.text).toBe(q.word.meaning_ja);
      });
    });

    it('語源に紐づく単語数がcount未満の場合、可能な限りのユニークな問題数が返されること', async () => {
      // Assuming 'etym_tract' has e.g. 5 words setup in the DB initially (or we mock it)
      // The old behavior was returning exactly 10 by repeating.
      // The new behavior is returning ONLY the distinct words.
      const questions = await quizService.generateQuestionsByEtymology('etym_tract', 10);

      const uniqueWordIds = new Set(questions.map(q => q.word.id));
      // Length equals the number of unique words returned, meaning no repetition
      expect(questions.length).toBe(uniqueWordIds.size);
    });

    it('count引数で問題数を指定できること（単語数が十分にある前提）', async () => {
      const questions = await quizService.generateQuestionsByEtymology('etym_tract', 3);
      expect(questions.length).toBe(3);
    });

    it('存在しない語源IDでエラーをスローすること', async () => {
      await expect(
        quizService.generateQuestionsByEtymology('nonexistent')
      ).rejects.toThrow('Etymology not found');
    });

    it('出題単語が指定語源の単語であること', async () => {
      const questions = await quizService.generateQuestionsByEtymology('etym_press');
      questions.forEach((q) => {
        expect(q.word.etymology_id).toBe('etym_press');
      });
    });
  });
});
