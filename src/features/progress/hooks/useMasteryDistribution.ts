import { useMasteryStore } from '../../etymology/stores/useMasteryStore';

export type MasteryDistributionItem = {
    level: 0 | 1 | 2 | 3 | 4;
    count: number;
    percentage: number;
};

export function useMasteryDistribution(totalWordsInApp: number = 800) {
    const { masteries } = useMasteryStore();

    const masteryArray = Object.values(masteries);
    const totalLearned = masteryArray.length;

    // Calculate counts for each level
    // level 0 represents unlearned (totalWords - learnedWords)
    const counts = {
        0: Math.max(0, totalWordsInApp - totalLearned),
        1: 0,
        2: 0,
        3: 0,
        4: 0,
    };

    masteryArray.forEach((mastery) => {
        if (mastery.level >= 1 && mastery.level <= 4) {
            counts[mastery.level as 1 | 2 | 3 | 4]++;
        }
    });

    // Calculate percentages and build array ordered from levels 4 down to 0
    const distribution: MasteryDistributionItem[] = [4, 3, 2, 1, 0].map(level => {
        const l = level as 0 | 1 | 2 | 3 | 4;
        const count = counts[l];
        // Avoid division by zero
        const percentage = totalWordsInApp > 0 ? Math.round((count / totalWordsInApp) * 100) : 0;

        return {
            level: l,
            count,
            percentage
        };
    });

    return {
        distribution,
        totalLearned
    };
}
