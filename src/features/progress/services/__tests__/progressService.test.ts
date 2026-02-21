/**
 * progressService テスト
 *
 * 要件定義書に基づくテスト:
 * - US-05: 習得済み語源数・派生語彙数・学習ストリークをダッシュボードで確認
 * - S5: 進捗ダッシュボード — 習得済み語源数、単語数を数値化
 * - 10.2: 習熟度可視化（mikan準拠）
 *   - 4段階分布: 覚えた(4), ほぼ覚えた(3), うろ覚え(2), 苦手(1), 未学習(0)
 *
 * TDD Red Phase
 */
import { progressService } from '../progressService';
import { WordMastery } from '../../../etymology/services/wordMasteryRepository';

describe('progressService', () => {
  describe('calculateMasteryDistribution', () => {
    it('習熟度レベルごとの分布を返すこと', () => {
      const masteries: Record<string, WordMastery> = {
        w1: { wordId: 'w1', level: 4, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 5 },
        w2: { wordId: 'w2', level: 3, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 3 },
        w3: { wordId: 'w3', level: 2, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 1 },
        w4: { wordId: 'w4', level: 1, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 0 },
        w5: { wordId: 'w5', level: 4, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 4 },
      };
      const dist = progressService.calculateMasteryDistribution(masteries);
      expect(dist[4]).toBe(2); // 覚えた: 2語
      expect(dist[3]).toBe(1); // ほぼ覚えた: 1語
      expect(dist[2]).toBe(1); // うろ覚え: 1語
      expect(dist[1]).toBe(1); // 苦手: 1語
    });

    it('空のmasteriesで全て0を返すこと', () => {
      const dist = progressService.calculateMasteryDistribution({});
      expect(dist[0]).toBe(0);
      expect(dist[1]).toBe(0);
      expect(dist[2]).toBe(0);
      expect(dist[3]).toBe(0);
      expect(dist[4]).toBe(0);
    });

    it('全て同一レベルの場合に正しくカウントすること', () => {
      const masteries: Record<string, WordMastery> = {
        w1: { wordId: 'w1', level: 3, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 2 },
        w2: { wordId: 'w2', level: 3, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 2 },
        w3: { wordId: 'w3', level: 3, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 2 },
      };
      const dist = progressService.calculateMasteryDistribution(masteries);
      expect(dist[3]).toBe(3);
      expect(dist[1]).toBe(0);
      expect(dist[2]).toBe(0);
      expect(dist[4]).toBe(0);
    });
  });

  describe('calculateTotalStudied', () => {
    it('level > 0 の単語数を返すこと', () => {
      const masteries: Record<string, WordMastery> = {
        w1: { wordId: 'w1', level: 2, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 1 },
        w2: { wordId: 'w2', level: 0, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 0 },
        w3: { wordId: 'w3', level: 4, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 4 },
        w4: { wordId: 'w4', level: 1, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 0 },
      };
      expect(progressService.calculateTotalStudied(masteries)).toBe(3);
    });

    it('空のmasteriesで0を返すこと', () => {
      expect(progressService.calculateTotalStudied({})).toBe(0);
    });

    it('全て未学習(level=0)で0を返すこと', () => {
      const masteries: Record<string, WordMastery> = {
        w1: { wordId: 'w1', level: 0, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 0 },
        w2: { wordId: 'w2', level: 0, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 0 },
      };
      expect(progressService.calculateTotalStudied(masteries)).toBe(0);
    });

    it('全て学習済みで全単語数を返すこと', () => {
      const masteries: Record<string, WordMastery> = {
        w1: { wordId: 'w1', level: 1, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 0 },
        w2: { wordId: 'w2', level: 2, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 1 },
        w3: { wordId: 'w3', level: 3, nextReviewDate: null, lastReviewedDate: null, consecutiveCorrect: 2 },
      };
      expect(progressService.calculateTotalStudied(masteries)).toBe(3);
    });
  });
});
