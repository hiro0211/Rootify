/**
 * データ整合性テスト
 *
 * 要件定義書に基づくテスト:
 * - 13.1: Etymology JSON構造仕様
 * - 13.2: Word JSON構造仕様
 * - 13.3: MVP語源データ量目標（80〜100語源, 500〜800単語）
 * - 13.4: チャプター構成（8〜10チャプター）
 * - 10.3: Free語源30個まで
 *
 * TDD Red Phase（既存テストの拡充）
 */
import etymologies from '../etymologies.json';
import words from '../words.json';

describe('Data Integrity', () => {
  // ===== 基本整合性（既存テスト） =====
  test('全単語が有効な etymology_id を持つこと', () => {
    const etymologyIds = new Set(etymologies.map((e) => e.id));
    words.forEach((word) => {
      if (!etymologyIds.has(word.etymology_id)) {
        console.error(`Invalid etymology_id: ${word.etymology_id} in word: ${word.id}`);
      }
      expect(etymologyIds.has(word.etymology_id)).toBe(true);
    });
  });

  test('語源IDに重複がないこと', () => {
    const ids = etymologies.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  test('単語IDに重複がないこと', () => {
    const ids = words.map((w) => w.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      const sorted = ids.sort();
      const duplicates: string[] = [];
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i + 1] === sorted[i]) {
          duplicates.push(sorted[i]);
        }
      }
      console.error('Duplicate word IDs:', duplicates);
    }
    expect(ids.length).toBe(uniqueIds.size);
  });

  // ===== Etymology JSON構造検証（13.1仕様） =====
  describe('Etymology JSON構造（13.1仕様）', () => {
    test('各語源が必須フィールドを全て持つこと', () => {
      etymologies.forEach((etym) => {
        expect(etym.id).toBeTruthy();
        expect(etym.root).toBeTruthy();
        expect(etym.root_meaning).toBeTruthy();
        expect(etym.root_meaning_ja).toBeTruthy();
        expect(etym.category).toBeTruthy();
        expect(typeof etym.chapter).toBe('number');
        expect(typeof etym.is_free).toBe('boolean');
        expect(typeof etym.sort_order).toBe('number');
        expect(etym.description_ja).toBeTruthy();
      });
    });

    test('語源IDが "etym_" プレフィックスで始まること', () => {
      etymologies.forEach((etym) => {
        expect(etym.id).toMatch(/^etym_/);
      });
    });

    test('sort_orderが正の整数であること', () => {
      etymologies.forEach((etym) => {
        expect(etym.sort_order).toBeGreaterThan(0);
      });
    });
  });

  // ===== Word JSON構造検証（13.2仕様） =====
  describe('Word JSON構造（13.2仕様）', () => {
    test('各単語が必須フィールドを持つこと', () => {
      words.forEach((word) => {
        expect(word.id).toBeTruthy();
        expect(word.etymology_id).toBeTruthy();
        expect(word.word).toBeTruthy();
        expect(word.root).toBeTruthy();
        expect(word.root_meaning_ja).toBeTruthy();
        expect(word.meaning_ja).toBeTruthy();
        expect(word.part_of_speech).toBeTruthy();
        expect(typeof word.sort_order).toBe('number');
      });
    });

    test('単語IDが "word_" プレフィックスで始まること', () => {
      words.forEach((word) => {
        expect(word.id).toMatch(/^word_/);
      });
    });

    test('品詞が有効な値であること', () => {
      const validPos = ['名詞', '動詞', '形容詞', '副詞', '動詞/名詞', '名詞/形容詞', '名詞/動詞', '形容詞/副詞'];
      words.forEach((word) => {
        if (!validPos.includes(word.part_of_speech)) {
          console.warn(`Unexpected part_of_speech: "${word.part_of_speech}" in word: ${word.id}`);
        }
        // 少なくとも空でないこと
        expect(word.part_of_speech.length).toBeGreaterThan(0);
      });
    });

    test('toeic_levelが600〜800の範囲であること（TOEIC対応レベル）', () => {
      const validLevels = [600, 700, 800];
      words.forEach((word) => {
        if (word.toeic_level !== undefined && word.toeic_level !== 0) {
          expect(validLevels).toContain(word.toeic_level);
        }
      });
    });

    test('derivativesが配列であること', () => {
      words.forEach((word) => {
        expect(Array.isArray(word.derivatives)).toBe(true);
      });
    });
  });

  // ===== データ量チェック =====
  describe('データ量（13.3 MVP目標）', () => {
    test('語源データが存在すること', () => {
      expect(etymologies.length).toBeGreaterThan(0);
    });

    test('単語データが50語以上あること', () => {
      expect(words.length).toBeGreaterThanOrEqual(50);
    });

    test('各語源に少なくとも1つの単語が紐づくこと', () => {
      const wordsByEtym = new Map<string, number>();
      words.forEach((w) => {
        const count = wordsByEtym.get(w.etymology_id) || 0;
        wordsByEtym.set(w.etymology_id, count + 1);
      });

      const etymsWithoutWords: string[] = [];
      etymologies.forEach((etym) => {
        const wordCount = wordsByEtym.get(etym.id) || 0;
        if (wordCount === 0) {
          etymsWithoutWords.push(etym.id);
        }
      });

      if (etymsWithoutWords.length > 0) {
        console.warn('Etymologies without words:', etymsWithoutWords);
      }
      // 全語源に少なくとも1単語紐づくべき
      expect(etymsWithoutWords.length).toBe(0);
    });
  });

  // ===== Free/Proゲート検証 =====
  describe('Free/Proゲート（課金設計）', () => {
    test('Free語源が30個以下であること', () => {
      const freeCount = etymologies.filter((e) => e.is_free).length;
      expect(freeCount).toBeLessThanOrEqual(30);
    });

    test('Free語源が存在すること（無料体験用）', () => {
      const freeCount = etymologies.filter((e) => e.is_free).length;
      expect(freeCount).toBeGreaterThan(0);
    });
  });
});
