import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../shared/constants/colors';

interface Props {
  current: number;
  goal: number;
}

export function DailyGoalProgress({ current, goal }: Props) {
  const percentage = Math.min(100, Math.round((current / goal) * 100));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>今日の目標</Text>
        <Text style={styles.progressText}>{current} / {goal} 問</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
      </View>
      {percentage >= 100 && (
        <Text style={styles.congrats}>目標達成！🎉</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.CARD_BG,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_MAIN,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.TEXT_SUB,
  },
  track: {
    height: 8,
    backgroundColor: COLORS.BORDER,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.SUCCESS,
  },
  congrats: {
    marginTop: 8,
    color: COLORS.SUCCESS,
    fontWeight: '600',
    textAlign: 'center',
  },
});
