import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Word } from '../types';
import { COLORS } from '../../../shared/constants/colors';
import { SPACING } from '../../../shared/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { audio } from '../../../lib/audio';
import { useMasteryStore } from '../stores/useMasteryStore';

interface Props {
  word: Word;
  onPress: () => void;
}

export function WordCard({ word, onPress }: Props) {
  const mastery = useMasteryStore((state) => state.getMastery(word.id));
  const masteryLevel = mastery?.level || 0;

  const getMasteryIcon = () => {
    if (masteryLevel === 4) return { name: 'checkmark-circle' as const, color: COLORS.SUCCESS };
    if (masteryLevel === 3) return { name: 'ellipse' as const, color: COLORS.WARNING };
    if (masteryLevel === 2) return { name: 'ellipse-outline' as const, color: COLORS.WARNING };
    return { name: 'ellipse-outline' as const, color: COLORS.BORDER };
  };

  const icon = getMasteryIcon();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.wordRow}>
            <Text style={styles.word}>{word.word}</Text>
            <TouchableOpacity onPress={() => audio.speak(word.word)} hitSlop={10}>
                <Ionicons name="volume-medium" size={18} color={COLORS.TEXT_SUB} style={{marginLeft: 8}}/>
            </TouchableOpacity>
        </View>
        <Ionicons name={icon.name} size={18} color={icon.color} />
      </View>
      
      <Text style={styles.pronunciation}>/{word.pronunciation}/</Text>
      
      <View style={styles.decomposition}>
        <Text style={styles.partPrefix}>{word.prefix}</Text>
        <Text style={styles.partRoot}>{word.root}</Text>
        <Text style={styles.partSuffix}>{word.suffix}</Text>
        <Ionicons name="arrow-forward" size={12} color={COLORS.ACCENT} style={{marginHorizontal: 4}} />
        <Text style={styles.combined}>{word.combined_meaning}</Text>
      </View>

      <Text style={styles.meaning}>
        <Text style={styles.pos}>{word.part_of_speech} </Text>
        {word.meaning_ja}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 12,
    padding: SPACING.M,
    marginVertical: SPACING.XS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  word: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_MAIN,
  },
  pronunciation: {
    fontSize: 12,
    color: COLORS.TEXT_SUB,
    marginBottom: 8,
  },
  decomposition: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  partPrefix: { color: COLORS.ACCENT },
  partRoot: { fontWeight: 'bold' },
  partSuffix: { color: COLORS.TEXT_SUB },
  combined: { color: COLORS.ACCENT, fontSize: 12 },
  meaning: {
    fontSize: 14,
    color: COLORS.TEXT_MAIN,
    fontWeight: '500',
  },
  pos: {
    fontSize: 12,
    color: COLORS.TEXT_SUB,
    fontWeight: 'normal',
    marginRight: 4,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 4,
    borderRadius: 4,
  }
});
