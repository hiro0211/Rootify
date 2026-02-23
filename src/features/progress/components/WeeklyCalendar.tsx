import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../shared/constants/colors';
import { SPACING } from '../../../shared/constants/spacing';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    streak: number;
    lastStudyDate: string | null;
}

export function WeeklyCalendar({ streak, lastStudyDate }: Props) {
    // Simple representation logic based on current streak
    const days = ['月', '火', '水', '木', '金', '土', '日'];
    // Convert JS day (0=Sun, 1=Mon) to our array index
    const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

    const isCompletedToday = lastStudyDate === new Date().toISOString().split('T')[0];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>今週の学習記録</Text>
            <View style={styles.calendarRow}>
                {days.map((day, index) => {
                    // If we haven't studied today, actual streak visual should be shifted if index == todayIndex
                    const adjustedStreak = isCompletedToday ? streak : streak;

                    let isStudied = false;
                    if (isCompletedToday) {
                        isStudied = index <= todayIndex && index > todayIndex - adjustedStreak;
                    } else {
                        isStudied = index < todayIndex && index >= todayIndex - adjustedStreak;
                    }

                    const isFuture = index > todayIndex;
                    const isToday = index === todayIndex;

                    return (
                        <View key={day} style={styles.dayCol}>
                            <Text style={[styles.dayText, isToday && styles.todayText]}>{day}</Text>
                            <View style={[
                                styles.circle,
                                isStudied && styles.studiedCircle,
                                !isStudied && !isFuture && styles.missedCircle,
                                isFuture && styles.futureCircle,
                                isToday && !isStudied && styles.todayPendingCircle
                            ]}>
                                {isStudied && <Ionicons name="checkmark" size={16} color="#FFF" />}
                                {!isStudied && !isFuture && !isToday && <Ionicons name="close" size={16} color="#FFF" />}
                            </View>
                        </View>
                    );
                })}
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
    calendarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dayCol: {
        alignItems: 'center',
        gap: 8,
    },
    dayText: {
        fontSize: 12,
        color: '#BDC3C7',
        fontWeight: 'bold',
    },
    todayText: {
        color: COLORS.PRIMARY,
    },
    circle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    studiedCircle: {
        backgroundColor: COLORS.SUCCESS || '#27AE60',
    },
    missedCircle: {
        backgroundColor: '#E74C3C',
    },
    futureCircle: {
        backgroundColor: '#F5F5F5',
    },
    todayPendingCircle: {
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#E74C3C',
    }
});
