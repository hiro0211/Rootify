import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../../features/auth/stores/useUserStore';
import { useMasteryDistribution } from '../../features/progress/hooks/useMasteryDistribution';
import { StatsCards } from '../../features/progress/components/StatsCards';
import { WeeklyCalendar } from '../../features/progress/components/WeeklyCalendar';
import { MasteryChart } from '../../features/progress/components/MasteryChart';
import { COLORS } from '../../shared/constants/colors';
import { SPACING } from '../../shared/constants/spacing';

export default function ProgressScreen() {
    const insets = useSafeAreaInsets();
    const { streak, lastStudyDate, dailyGoal } = useUserStore();

    // Total words in the system (normally fetched from an API or JSON, hardcoded for MVP size)
    const TOTAL_WORDS = 800;
    const { distribution, totalLearned } = useMasteryDistribution(TOTAL_WORDS);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.L, paddingBottom: insets.bottom + 100 }]}
        >
            <Text style={styles.headerTitle}>学習データ</Text>

            <StatsCards
                totalLearned={totalLearned}
                streak={streak}
                dailyGoal={dailyGoal}
            />

            <View style={styles.section}>
                <WeeklyCalendar streak={streak} lastStudyDate={lastStudyDate} />
            </View>

            <View style={styles.section}>
                <MasteryChart distribution={distribution} totalInSystem={TOTAL_WORDS} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    content: {
        padding: SPACING.L,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.TEXT_MAIN,
        marginBottom: SPACING.L,
    },
    section: {
        marginTop: 24,
    }
});
