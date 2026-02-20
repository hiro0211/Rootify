import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../shared/constants/colors';
import { TYPOGRAPHY } from '../../../shared/constants/typography';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  streak: number;
}

export function StreakDisplay({ streak }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="flame" size={32} color={COLORS.WARNING} />
      <Text style={styles.count}>{streak}</Text>
      <Text style={styles.label}>日連続</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: COLORS.CARD_BG,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 16,
  },
  count: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.TEXT_MAIN,
    marginHorizontal: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.TEXT_SUB,
  },
});
