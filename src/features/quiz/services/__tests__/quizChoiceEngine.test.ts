/**
 * quizChoiceEngine テスト
 *
 * 要件定義書に基づくテスト:
 * - 9.2: 4択選択肢の生成ロジック
 *   - 正解: 出題単語の meaning_ja
 *   - 誤答1: 同一語根の別単語の意味（最優先）
 *   - 誤答2: 同一チャプターの別語根の単語の意味
 *   - 誤答3: ランダムな別単語の意味
 *   - 重複排除
 *   - 4択をランダムシャッフル
 *
 * TDD Red Phase: テストを先に記述
 */
import { quizChoiceEngine } from '../quizChoiceEngine';
import { Word } from '../../../etymology/types';

// テスト用のモックデータ
const createMockWord = (overrides: Partial<Word>): Word => ({
  id: 'word_test',
  etymology_id: 'etym_test',
  word: 'test',
  pronunciation: 'test',
  prefix: 'pre-',
  prefix_meaning: '前に',
  prefix_meaning_en: 'before',
  root: '-test',
  root_meaning_ja: 'テスト',
  suffix: '',
  suffix_meaning: '',
  combined_meaning: 'テスト',
  meaning_ja: 'テストする',
  meaning_sub_ja: '',
  part_of_speech: '動詞',
  derivatives: [],
  example_en: 'This is a test.',
  example_ja: 'これはテストです。',
  toeic_level: 600,
  sort_order: 1,
  ...overrides,
});

const correctWord = createMockWord({
  id: 'word_attract',
  etymology_id: 'etym_tract',
  word: 'attract',
  root: '-tract',
  meaning_ja: '引きつける',
  part_of_speech: '動詞',
});

const sameRootWord = createMockWord({
  id: 'word_extract',
  etymology_id: 'etym_tract',
  word: 'extract',
  root: '-tract',
  meaning_ja: '抽出する',
  part_of_speech: '動詞',
});

const samePosWord = createMockWord({
  id: 'word_express',
  etymology_id: 'etym_press',
  word: 'express',
  root: '-press',
  meaning_ja: '表現する',
  part_of_speech: '動詞',
});

const randomWord1 = createMockWord({
  id: 'word_project',
  etymology_id: 'etym_ject',
  word: 'project',
  root: '-ject',
  meaning_ja: '計画する',
  part_of_speech: '動詞',
});

const randomWord2 = createMockWord({
  id: 'word_attraction',
  etymology_id: 'etym_tract',
  word: 'attraction',
  root: '-tract',
  meaning_ja: '魅力',
  part_of_speech: '名詞',
});

const allWords = [correctWord, sameRootWord, samePosWord, randomWord1, randomWord2];

describe('quizChoiceEngine', () => {
  describe('generateChoices', () => {
    it('4つの選択肢を生成すること', () => {
      const choices = quizChoiceEngine.generateChoices(correctWord, allWords);
      expect(choices).toHaveLength(4);
    });

    it('正解の選択肢が1つだけ含まれること', () => {
      const choices = quizChoiceEngine.generateChoices(correctWord, allWords);
      const correctChoices = choices.filter((c) => c.isCorrect);
      expect(correctChoices).toHaveLength(1);
    });

    it('正解の選択肢のテキストが出題単語の meaning_ja であること（9.2仕様）', () => {
      const choices = quizChoiceEngine.generateChoices(correctWord, allWords);
      const correct = choices.find((c) => c.isCorrect)!;
      expect(correct.text).toBe(correctWord.meaning_ja);
      expect(correct.wordId).toBe(correctWord.id);
    });

    it('不正解の選択肢が3つ含まれること', () => {
      const choices = quizChoiceEngine.generateChoices(correctWord, allWords);
      const incorrectChoices = choices.filter((c) => !c.isCorrect);
      expect(incorrectChoices).toHaveLength(3);
    });

    it('同じwordIdの選択肢が重複しないこと（重複排除仕様）', () => {
      const choices = quizChoiceEngine.generateChoices(correctWord, allWords);
      const wordIds = choices.map((c) => c.wordId);
      const uniqueIds = new Set(wordIds);
      expect(wordIds.length).toBe(uniqueIds.size);
    });

    it('正解の選択肢位置がランダムであること（シャッフル仕様）', () => {
      // 複数回実行して位置が固定でないことを確認
      const positions: number[] = [];
      for (let i = 0; i < 20; i++) {
        const choices = quizChoiceEngine.generateChoices(correctWord, allWords);
        const correctIndex = choices.findIndex((c) => c.isCorrect);
        positions.push(correctIndex);
      }
      // 全て同じ位置ではないこと（確率的に20回で同一位置は極めて低い）
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBeGreaterThan(1);
    });

    it('候補が少ない場合でも正常に動作すること', () => {
      const fewWords = [correctWord, sameRootWord];
      const choices = quizChoiceEngine.generateChoices(correctWord, fewWords);
      // 2単語しかないので4択は作れないが、エラーにならないこと
      expect(choices.length).toBeGreaterThanOrEqual(2);
      expect(choices.length).toBeLessThanOrEqual(4);
      const correct = choices.find((c) => c.isCorrect);
      expect(correct).toBeDefined();
    });

    it('同一語根の単語が誤答に含まれること（最優先ルール）', () => {
      // 十分な候補がある場合
      const choices = quizChoiceEngine.generateChoices(correctWord, allWords);
      const incorrectWordIds = choices
        .filter((c) => !c.isCorrect)
        .map((c) => c.wordId);
      // sameRootWord か randomWord2 (共に -tract) が含まれるべき
      const hasSameRoot = incorrectWordIds.some(
        (id) => id === sameRootWord.id || id === randomWord2.id
      );
      expect(hasSameRoot).toBe(true);
    });
  });
});
