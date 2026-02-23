/**
 * useMasteryDistribution テスト
 *
 * Zustandストアをモックし、分布計算ロジックを検証する。
 * @testing-library/react-hooks に依存せず、直接テスト可能な構造。
 */

// useMasteryStoreをモック
const mockMasteries: Record<string, { word_id: string; level: number; next_review_at: string }> = {};

jest.mock('../../../etymology/stores/useMasteryStore', () => ({
    useMasteryStore: jest.fn(() => ({
        masteries: mockMasteries
    }))
}));

// モック設定後にインポート（モジュールキャッシュ対策）
import { useMasteryDistribution } from '../useMasteryDistribution';

describe('useMasteryDistribution', () => {
    beforeEach(() => {
        // Reset mock masteries
        Object.keys(mockMasteries).forEach(key => delete mockMasteries[key]);
    });

    it('calculates mastery distribution correctly from store data', () => {
        // Set mock data
        Object.assign(mockMasteries, {
            'word1': { word_id: 'word1', level: 4, next_review_at: '' },
            'word2': { word_id: 'word2', level: 4, next_review_at: '' },
            'word3': { word_id: 'word3', level: 3, next_review_at: '' },
            'word4': { word_id: 'word4', level: 1, next_review_at: '' },
        });

        const result = useMasteryDistribution(10);

        expect(result.totalLearned).toBe(4);
        expect(result.distribution).toEqual([
            { level: 4, count: 2, percentage: 20 },
            { level: 3, count: 1, percentage: 10 },
            { level: 2, count: 0, percentage: 0 },
            { level: 1, count: 1, percentage: 10 },
            { level: 0, count: 6, percentage: 60 },
        ]);
    });

    it('handles empty mastery data', () => {
        const result = useMasteryDistribution(5);

        expect(result.totalLearned).toBe(0);
        expect(result.distribution).toEqual([
            { level: 4, count: 0, percentage: 0 },
            { level: 3, count: 0, percentage: 0 },
            { level: 2, count: 0, percentage: 0 },
            { level: 1, count: 0, percentage: 0 },
            { level: 0, count: 5, percentage: 100 },
        ]);
    });
});
