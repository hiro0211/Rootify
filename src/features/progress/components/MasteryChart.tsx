import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../shared/constants/colors';
import { SPACING } from '../../../shared/constants/spacing';
import { MasteryDistributionItem } from '../hooks/useMasteryDistribution';

interface Props {
    distribution: MasteryDistributionItem[];
    totalInSystem: number;
}

const MASTERY_COLORS = {
    4: '#27AE60', // 覚えた (Green)
    3: '#F39C12', // ほぼ覚えた (Orange)
    2: '#E67E22', // うろ覚え (Dark Orange)
    1: '#E74C3C', // 苦手 (Red)
    0: '#BDC3C7', // 未学習 (Gray)
};

const MASTERY_LABELS = {
    4: '覚えた',
    3: 'ほぼ覚えた',
    2: 'うろ覚え',
    1: '苦手',
    0: '未学習',
};

export function MasteryChart({ distribution, totalInSystem }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>単語定着度レポート</Text>

            {/* Stacked Bar */}
            <View style={styles.barContainer}>
                {distribution.map((item) => (
                    item.percentage > 0 && (
                        <View
                            key={item.level}
                            style={[
                                styles.barSegment,
                                {
                                    width: `${item.percentage}%`,
                                    backgroundColor: MASTERY_COLORS[item.level]
                                }
                            ]}
                        />
                    )
                ))}
                {/* Fill the rest if there's floating point loss summing to <100% implicitly by background */}
            </View>

            {/* Legend & Details */}
            <View style={styles.legendContainer}>
                {distribution.map((item) => (
                    <View key={item.level} style={styles.legendRow}>
                        <View style={styles.legendLeft}>
                            <View style={[styles.legendDot, { backgroundColor: MASTERY_COLORS[item.level] }]} />
                            <Text style={styles.legendLabel}>{MASTERY_LABELS[item.level]}</Text>
                        </View>
                        <View style={styles.legendRight}>
                            <Text style={styles.legendCount}>{item.count}語</Text>
                            <Text style={styles.legendPercent}>({item.percentage}%)</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.CARD_BG,
        padding: SPACING.L,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.TEXT_MAIN,
        marginBottom: 16,
    },
    barContainer: {
        height: 16,
        flexDirection: 'row',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#F0F0F0',
        marginBottom: 20,
    },
    barSegment: {
        height: '100%',
    },
    legendContainer: {
        gap: 12,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    legendLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendLabel: {
        fontSize: 14,
        color: COLORS.TEXT_MAIN,
        fontWeight: '500',
    },
    legendRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: 80,
        justifyContent: 'flex-end',
    },
    legendCount: {
        fontSize: 14,
        color: COLORS.TEXT_MAIN,
        fontWeight: 'bold',
    },
    legendPercent: {
        fontSize: 12,
        color: COLORS.TEXT_SUB,
        width: 36,
        textAlign: 'right',
    }
});
