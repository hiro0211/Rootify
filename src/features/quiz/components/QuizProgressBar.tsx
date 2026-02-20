import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../../shared/constants/colors';

interface Props {
  total: number;
  current: number; // 0-indexed
  results: boolean[]; // true for correct, false for incorrect
}

export function QuizProgressBar({ total, current, results }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => {
        let backgroundColor: string = COLORS.BORDER;
        if (index < current) {
          backgroundColor = (results[index] ?? false) ? COLORS.SUCCESS : COLORS.ERROR;
        } else if (index === current) {
          backgroundColor = COLORS.SECONDARY; // Current question highlight
        }

        return (
          <View key={index} style={[styles.segment, { backgroundColor, flex: 1 }]} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 8,
    gap: 4,
    marginBottom: 16,
  },
  segment: {
    borderRadius: 4,
  },
});
