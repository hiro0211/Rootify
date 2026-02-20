import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Etymology } from '../types';
import { COLORS } from '../../../shared/constants/colors';
import { SPACING } from '../../../shared/constants/spacing';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  etymology: Etymology;
  onPress: () => void;
  isLocked?: boolean;
}

export function EtymologyTreeCard({ etymology, onPress, isLocked }: Props) {
  return (
    <TouchableOpacity 
      style={[styles.card, isLocked && styles.cardLocked]} 
      onPress={onPress}
      disabled={isLocked}
    >
      <View style={styles.header}>
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{etymology.category}</Text>
        </View>
        {isLocked && <Ionicons name="lock-closed" size={16} color={COLORS.TEXT_SUB} />}
      </View>
      
      <Text style={styles.root}>{etymology.root}</Text>
      <Text style={styles.meaning}>{etymology.root_meaning_ja}</Text>
      
      <View style={styles.footer}>
        <Text style={styles.description} numberOfLines={2}>
            {etymology.description_ja}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 12,
    padding: SPACING.M,
    margin: SPACING.XS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 140,
  },
  cardLocked: {
    opacity: 0.6,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  badgeText: {
    fontSize: 10,
    color: COLORS.TEXT_SUB,
  },
  root: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  meaning: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ACCENT,
    marginBottom: 8,
  },
  footer: {
    marginTop: 'auto',
  },
  description: {
    fontSize: 12,
    color: COLORS.TEXT_SUB,
  },
});
