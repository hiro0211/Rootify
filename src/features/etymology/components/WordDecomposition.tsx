import { View, Text, StyleSheet } from 'react-native';
import { Word } from '../types';
import { COLORS } from '../../../shared/constants/colors';
import { SPACING } from '../../../shared/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface Props {
  word: Word;
}

export function WordDecomposition({ word }: Props) {
  return (
    <View style={styles.container}>
      <Animated.Text entering={FadeIn.delay(100)} style={styles.word}>{word.word}</Animated.Text>
      <Animated.Text entering={FadeIn.delay(200)} style={styles.pronunciation}>/{word.pronunciation}/</Animated.Text>
      
      <View style={styles.diagram}>
        {/* Prefix */}
        {word.prefix && (
            <Animated.View entering={FadeIn.delay(300)} style={styles.partContainer}>
                <View style={[styles.partBox, { backgroundColor: '#FDEEF4', borderColor: COLORS.ACCENT }]}>
                    <Text style={[styles.partText, { color: COLORS.ACCENT }]}>{word.prefix}</Text>
                </View>
                <Text style={[styles.partMeaning, { color: COLORS.ACCENT }]}>{word.prefix_meaning}</Text>
            </Animated.View>
        )}
        
        {word.prefix && <Animated.View entering={FadeIn.delay(350)}><Text style={styles.plus}>+</Text></Animated.View>}

        {/* Root */}
        <Animated.View entering={FadeIn.delay(400)} style={styles.partContainer}>
            <View style={[styles.partBox, { backgroundColor: '#F0F0F0', borderColor: COLORS.TEXT_MAIN }]}>
                <Text style={[styles.partText, { color: COLORS.TEXT_MAIN }]}>{word.root}</Text>
            </View>
            <Text style={[styles.partMeaning, { color: COLORS.TEXT_MAIN }]}>{word.root_meaning_ja}</Text>
        </Animated.View>

        {word.suffix && <Animated.View entering={FadeIn.delay(450)}><Text style={styles.plus}>+</Text></Animated.View>}

        {/* Suffix */}
        {word.suffix && (
             <Animated.View entering={FadeIn.delay(500)} style={styles.partContainer}>
                <View style={[styles.partBox, { backgroundColor: '#F5F5F5', borderColor: COLORS.TEXT_SUB }]}>
                    <Text style={[styles.partText, { color: COLORS.TEXT_SUB }]}>{word.suffix}</Text>
                </View>
                <Text style={[styles.partMeaning, { color: COLORS.TEXT_SUB }]}>{word.suffix_meaning}</Text>
            </Animated.View>
        )}
      </View>

      <Animated.View entering={SlideInDown.delay(600).springify()} style={styles.result}>
        <Ionicons name="arrow-down" size={24} color={COLORS.ACCENT} style={{marginBottom: 8}} />
        <Text style={styles.combined}>{word.combined_meaning}</Text>
        <Text style={styles.meaning}>{word.meaning_ja}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: SPACING.L,
  },
  word: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.TEXT_MAIN,
    marginBottom: 4,
  },
  pronunciation: {
    fontSize: 16,
    color: COLORS.TEXT_SUB,
    marginBottom: 24,
  },
  diagram: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  partContainer: {
    alignItems: 'center',
  },
  partBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 3,
    marginBottom: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  partText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  partMeaning: {
    fontSize: 12,
    fontWeight: '600',
  },
  plus: {
    fontSize: 20,
    color: COLORS.BORDER,
    marginHorizontal: 4,
    marginTop: 8,
  },
  result: {
    alignItems: 'center',
    backgroundColor: '#FDEEF4',
    padding: SPACING.L,
    borderRadius: 16,
    width: '100%',
  },
  combined: {
    fontSize: 16,
    color: COLORS.ACCENT,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  meaning: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_MAIN,
  },
});
