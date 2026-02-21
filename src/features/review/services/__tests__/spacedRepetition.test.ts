/**
 * spacedRepetition テスト
 *
 * 要件定義書に基づくテスト:
 * - 9.5: 間隔反復アルゴリズム
 *   - 初回間隔: 1日
 *   - 正解後の間隔倍率: ×2.5（1日→3日→7日→30日）
 *   - 不正解後: 間隔リセット（翌日再出題 → level 1）
 *   - 最大間隔: 30日
 *   - 出題対象: next_review_at ≦ 現在日時
 * - US-04: 忘れかけた単語が最適なタイミングで復習クイズに再登場
 * - PR1: 間隔反復アルゴリズムで忘れかけたタイミングに自動で復習
 *
 * TDD Red Phase
 */
import { spacedRepetition } from '../spacedRepetition';
import { WordMastery } from '../../../etymology/services/wordMasteryRepository';

describe('spacedRepetition', () => {
  describe('INTERVALS 定数', () => {
    it('LEVEL_1 が 1日（86400000ms）であること', () => {
      expect(spacedRepetition.INTERVALS.LEVEL_1).toBe(1 * 24 * 60 * 60 * 1000);
    });

    it('LEVEL_2 が 3日であること', () => {
      expect(spacedRepetition.INTERVALS.LEVEL_2).toBe(3 * 24 * 60 * 60 * 1000);
    });

    it('LEVEL_3 が 7日であること', () => {
      expect(spacedRepetition.INTERVALS.LEVEL_3).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it('LEVEL_4 が 30日であること（最大間隔 = 30日）', () => {
      expect(spacedRepetition.INTERVALS.LEVEL_4).toBe(30 * 24 * 60 * 60 * 1000);
    });
  });

  describe('calculateNextReview', () => {
    // ===== 正解時のレベルアップ =====
    it('level 0 で正解 → level 1 になること', () => {
      const result = spacedRepetition.calculateNextReview(0, true);
      expect(result.level).toBe(1);
    });

    it('level 1 で正解 → level 2 になること', () => {
      const result = spacedRepetition.calculateNextReview(1, true);
      expect(result.level).toBe(2);
    });

    it('level 2 で正解 → level 3 になること', () => {
      const result = spacedRepetition.calculateNextReview(2, true);
      expect(result.level).toBe(3);
    });

    it('level 3 で正解 → level 4 になること', () => {
      const result = spacedRepetition.calculateNextReview(3, true);
      expect(result.level).toBe(4);
    });

    it('level 4 で正解 → level 4 のままであること（最大レベル）', () => {
      const result = spacedRepetition.calculateNextReview(4, true);
      expect(result.level).toBe(4);
    });

    // ===== 不正解時のリセット =====
    it('level 2 で不正解 → level 1 にリセットされること', () => {
      const result = spacedRepetition.calculateNextReview(2, false);
      expect(result.level).toBe(1);
    });

    it('level 3 で不正解 → level 1 にリセットされること', () => {
      const result = spacedRepetition.calculateNextReview(3, false);
      expect(result.level).toBe(1);
    });

    it('level 4 で不正解 → level 1 にリセットされること', () => {
      const result = spacedRepetition.calculateNextReview(4, false);
      expect(result.level).toBe(1);
    });

    // ===== 次回復習日の計算 =====
    it('level 1 の nextDate が約1日後であること', () => {
      const before = Date.now();
      const result = spacedRepetition.calculateNextReview(0, true); // → level 1
      const after = Date.now();
      const expected = spacedRepetition.INTERVALS.LEVEL_1;
      expect(result.nextDate).toBeGreaterThanOrEqual(before + expected);
      expect(result.nextDate).toBeLessThanOrEqual(after + expected);
    });

    it('level 2 の nextDate が約3日後であること', () => {
      const before = Date.now();
      const result = spacedRepetition.calculateNextReview(1, true); // → level 2
      const after = Date.now();
      const expected = spacedRepetition.INTERVALS.LEVEL_2;
      expect(result.nextDate).toBeGreaterThanOrEqual(before + expected);
      expect(result.nextDate).toBeLessThanOrEqual(after + expected);
    });

    it('level 3 の nextDate が約7日後であること', () => {
      const before = Date.now();
      const result = spacedRepetition.calculateNextReview(2, true); // → level 3
      const after = Date.now();
      const expected = spacedRepetition.INTERVALS.LEVEL_3;
      expect(result.nextDate).toBeGreaterThanOrEqual(before + expected);
      expect(result.nextDate).toBeLessThanOrEqual(after + expected);
    });

    it('level 4 の nextDate が約30日後であること', () => {
      const before = Date.now();
      const result = spacedRepetition.calculateNextReview(3, true); // → level 4
      const after = Date.now();
      const expected = spacedRepetition.INTERVALS.LEVEL_4;
      expect(result.nextDate).toBeGreaterThanOrEqual(before + expected);
      expect(result.nextDate).toBeLessThanOrEqual(after + expected);
    });

    it('不正解時の nextDate が約1日後であること（翌日再出題）', () => {
      const before = Date.now();
      const result = spacedRepetition.calculateNextReview(3, false); // → level 1
      const after = Date.now();
      const expected = spacedRepetition.INTERVALS.LEVEL_1;
      expect(result.nextDate).toBeGreaterThanOrEqual(before + expected);
      expect(result.nextDate).toBeLessThanOrEqual(after + expected);
    });
  });

  describe('getReviewDueWords', () => {
    it('復習期限が過ぎた単語のIDリストを返すこと', () => {
      const now = Date.now();
      const masteries: Record<string, WordMastery> = {
        word_1: {
          wordId: 'word_1',
          level: 2,
          nextReviewDate: now - 1000, // 期限切れ
          lastReviewedDate: now - 100000,
          consecutiveCorrect: 1,
        },
        word_2: {
          wordId: 'word_2',
          level: 3,
          nextReviewDate: now + 100000, // まだ先
          lastReviewedDate: now - 50000,
          consecutiveCorrect: 2,
        },
        word_3: {
          wordId: 'word_3',
          level: 1,
          nextReviewDate: now - 5000, // 期限切れ
          lastReviewedDate: now - 200000,
          consecutiveCorrect: 0,
        },
      };

      const result = spacedRepetition.getReviewDueWords(masteries);
      expect(result).toContain('word_1');
      expect(result).toContain('word_3');
      expect(result).not.toContain('word_2');
      expect(result).toHaveLength(2);
    });

    it('復習対象がない場合は空配列を返すこと', () => {
      const now = Date.now();
      const masteries: Record<string, WordMastery> = {
        word_1: {
          wordId: 'word_1',
          level: 2,
          nextReviewDate: now + 100000,
          lastReviewedDate: now - 50000,
          consecutiveCorrect: 1,
        },
      };
      const result = spacedRepetition.getReviewDueWords(masteries);
      expect(result).toEqual([]);
    });

    it('nextReviewDate が null の単語は対象外であること', () => {
      const masteries: Record<string, WordMastery> = {
        word_1: {
          wordId: 'word_1',
          level: 0,
          nextReviewDate: null,
          lastReviewedDate: null,
          consecutiveCorrect: 0,
        },
      };
      const result = spacedRepetition.getReviewDueWords(masteries);
      expect(result).toEqual([]);
    });

    it('空のmasteries辞書で空配列を返すこと', () => {
      const result = spacedRepetition.getReviewDueWords({});
      expect(result).toEqual([]);
    });
  });
});
