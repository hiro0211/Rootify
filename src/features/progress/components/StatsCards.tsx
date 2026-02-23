import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../shared/constants/colors';
import { SPACING } from '../../../shared/constants/spacing';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    totalLearned: number;
    streak: number;
    dailyGoal: number;
}

export function StatsCards({ totalLearned, streak, dailyGoal }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(46, 134, 193, 0.1)' }]}>
                    <Ionicons name="book" size={24} color={COLORS.SECONDARY} />
                </View>
                <Text style={styles.value}>{totalLearned}</Text>
                <Text style={styles.label}>学習済単語</Text>
            </View>
            <View style={styles.card}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
                    <Ionicons name="flame" size={24} color="#E74C3C" />
                </View>
                <Text style={styles.value}>{streak}</Text>
                <Text style={styles.label}>連続日数</Text>
            </View>
            <View style={styles.card}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(39, 174, 96, 0.1)' }]}>
                    <Ionicons name="flag" size={24} color={COLORS.SUCCESS || '#27AE60'} />
                </View>
                <Text style={styles.value}>{dailyGoal}</Text>
                <Text style={styles.label}>1日の目標</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    card: {
        flex: 1,
        backgroundColor: COLORS.CARD_BG,
        padding: SPACING.M,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    value: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.TEXT_MAIN,
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        color: COLORS.TEXT_SUB,
        fontWeight: '600',
    }
});
