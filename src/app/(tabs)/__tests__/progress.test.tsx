import React from 'react';
import { render } from '@testing-library/react-native';
import ProgressScreen from '../progress';
import { useUserStore } from '../../../features/auth/stores/useUserStore';
import { useMasteryDistribution } from '../../../features/progress/hooks/useMasteryDistribution';

jest.mock('../../../features/auth/stores/useUserStore', () => ({
    useUserStore: jest.fn()
}));

jest.mock('../../../features/progress/hooks/useMasteryDistribution', () => ({
    useMasteryDistribution: jest.fn()
}));

jest.mock('expo-router', () => ({
    useRouter: jest.fn()
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 })
}));

describe('ProgressScreen', () => {
    beforeEach(() => {
        (useUserStore as unknown as jest.Mock).mockReturnValue({
            streak: 5,
            lastStudyDate: '2023-10-10',
            dailyGoal: 20
        });

        (useMasteryDistribution as jest.Mock).mockReturnValue({
            distribution: [
                { level: 4, count: 10, percentage: 10 },
                { level: 3, count: 20, percentage: 20 },
                { level: 2, count: 0, percentage: 0 },
                { level: 1, count: 5, percentage: 5 },
                { level: 0, count: 65, percentage: 65 },
            ],
            totalLearned: 35
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders StatsCards with correct values', () => {
        const { getByText } = render(<ProgressScreen />);

        // Check if total learned is displayed
        expect(getByText('35')).toBeTruthy();
        expect(getByText('学習済単語')).toBeTruthy();

        // Check if streak is displayed
        expect(getByText('5')).toBeTruthy();
        expect(getByText('連続日数')).toBeTruthy();

        // Check if daily goal is displayed
        expect(getByText('20')).toBeTruthy();
        expect(getByText('1日の目標')).toBeTruthy();
    });

    it('renders WeeklyCalendar title', () => {
        const { getByText } = render(<ProgressScreen />);
        expect(getByText('今週の学習記録')).toBeTruthy();
    });

    it('renders MasteryChart elements', () => {
        const { getByText } = render(<ProgressScreen />);
        expect(getByText('単語定着度レポート')).toBeTruthy();
        expect(getByText('覚えた')).toBeTruthy();
        expect(getByText('ほぼ覚えた')).toBeTruthy();
        expect(getByText('苦手')).toBeTruthy();
        expect(getByText('未学習')).toBeTruthy();
    });
});
