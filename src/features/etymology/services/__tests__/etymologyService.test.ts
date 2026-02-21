/**
 * etymologyService テスト
 *
 * 要件定義書に基づくテスト:
 * - US-01: 語源パーツごとに関連単語をツリー形式で学習できること
 * - S1: 語源学習モード — 語源パーツごとに関連単語をツリー表示
 * - 13.1/13.2: Etymology/Word JSON構造の仕様
 *
 * TDD Red Phase: テストを先に記述し、期待する振る舞いを定義
 */
import { etymologyService } from '../etymologyService';
import etymologiesData from '../../../../data/etymologies.json';
import wordsData from '../../../../data/words.json';

describe('etymologyService', () => {
  // ===== getAllEtymologies =====
  describe('getAllEtymologies', () => {
    it('全語源データを返すこと', async () => {
      const result = await etymologyService.getAllEtymologies();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(etymologiesData.length);
    });

    it('各語源が必須フィールドを持つこと（13.1 JSON構造仕様）', async () => {
      const result = await etymologyService.getAllEtymologies();
      result.forEach((etym) => {
        expect(etym.id).toBeTruthy();
        expect(etym.root).toBeTruthy();
        expect(etym.root_meaning_ja).toBeTruthy();
        expect(etym.category).toBeTruthy();
        expect(typeof etym.chapter).toBe('number');
        expect(typeof etym.is_free).toBe('boolean');
        expect(typeof etym.sort_order).toBe('number');
        expect(etym.description_ja).toBeTruthy();
      });
    });

    it('Free語源が30個以下であること（課金設計: Free語源30個まで）', async () => {
      const result = await etymologyService.getAllEtymologies();
      const freeCount = result.filter((e) => e.is_free).length;
      expect(freeCount).toBeLessThanOrEqual(30);
      expect(freeCount).toBeGreaterThan(0);
    });
  });

  // ===== getEtymologyById =====
  describe('getEtymologyById', () => {
    it('存在するIDで語源を取得できること', async () => {
      const result = await etymologyService.getEtymologyById('etym_tract');
      expect(result).toBeDefined();
      expect(result!.id).toBe('etym_tract');
      expect(result!.root).toBe('-tract');
      expect(result!.root_meaning_ja).toBe('引く');
    });

    it('存在しないIDでundefinedを返すこと', async () => {
      const result = await etymologyService.getEtymologyById('nonexistent_id');
      expect(result).toBeUndefined();
    });
  });

  // ===== getWordsByEtymologyId =====
  describe('getWordsByEtymologyId', () => {
    it('語源IDに紐づく単語リストを返すこと（US-01: 関連単語をツリー形式で学習）', async () => {
      const result = await etymologyService.getWordsByEtymologyId('etym_tract');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      // 全単語がetym_tractに紐づくこと
      result.forEach((word) => {
        expect(word.etymology_id).toBe('etym_tract');
      });
    });

    it('sort_order順にソートされていること', async () => {
      const result = await etymologyService.getWordsByEtymologyId('etym_tract');
      for (let i = 1; i < result.length; i++) {
        expect(result[i].sort_order).toBeGreaterThanOrEqual(result[i - 1].sort_order);
      }
    });

    it('存在しない語源IDで空配列を返すこと', async () => {
      const result = await etymologyService.getWordsByEtymologyId('nonexistent');
      expect(result).toEqual([]);
    });

    it('各単語が13.2 Word JSON構造に準拠すること', async () => {
      const result = await etymologyService.getWordsByEtymologyId('etym_tract');
      result.forEach((word) => {
        expect(word.id).toBeTruthy();
        expect(word.word).toBeTruthy();
        expect(word.etymology_id).toBeTruthy();
        expect(word.root).toBeTruthy();
        expect(word.root_meaning_ja).toBeTruthy();
        expect(word.meaning_ja).toBeTruthy();
        expect(word.part_of_speech).toBeTruthy();
        expect(typeof word.sort_order).toBe('number');
      });
    });
  });

  // ===== getEtymologyWithWords =====
  describe('getEtymologyWithWords', () => {
    it('語源と関連単語を統合して返すこと', async () => {
      const result = await etymologyService.getEtymologyWithWords('etym_tract');
      expect(result).toBeDefined();
      expect(result!.id).toBe('etym_tract');
      expect(result!.root).toBe('-tract');
      expect(Array.isArray(result!.words)).toBe(true);
      expect(result!.words.length).toBeGreaterThan(0);
    });

    it('存在しないIDでundefinedを返すこと', async () => {
      const result = await etymologyService.getEtymologyWithWords('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  // ===== getAllWords =====
  describe('getAllWords', () => {
    it('全単語データを返すこと', async () => {
      const result = await etymologyService.getAllWords();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(wordsData.length);
    });

    it('MVP目標: 500〜800単語（13.3仕様）に向けた進捗を確認', async () => {
      const result = await etymologyService.getAllWords();
      // 現在のデータ量を確認（最終的には500以上を目指す）
      expect(result.length).toBeGreaterThanOrEqual(50);
    });
  });
});
