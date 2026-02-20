import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { EtymologyWithWords, Word } from '../../types';
import { COLORS } from '../../../shared/constants/colors';
import { SPACING } from '../../../shared/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

interface Props {
  data: EtymologyWithWords;
}

export function EtymologyTable({ data }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.container}>
        {/* Row 1: Prefix */}
        <View style={styles.row}>
          <View style={styles.headerCell}><Text style={styles.headerLabel}>接頭辞</Text></View>
          {data.words.map((word, index) => (
            <Animated.View key={`prefix-${index}`} entering={FadeIn.delay(0).duration(500)} style={styles.cell}>
              <Text style={styles.prefix}>{word.prefix}</Text>
              <Text style={styles.subText}>{word.prefix_meaning}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Row 2: Root */}
        <View style={styles.row}>
          <View style={styles.headerCell}><Text style={styles.headerLabel}>語根</Text></View>
          {data.words.map((word, index) => (
            <Animated.View key={`root-${index}`} entering={FadeIn.delay(300).duration(500)} style={styles.cell}>
              <Text style={styles.root}>{word.root}</Text>
              <Text style={styles.subTextRoot}>({word.root_meaning_ja})</Text>
            </Animated.View>
          ))}
        </View>

        {/* Arrow */}
        <View style={styles.row}>
           <View style={styles.headerCell}></View>
           {data.words.map((word, index) => (
            <Animated.View key={`arrow-${index}`} entering={FadeInDown.delay(600).duration(500)} style={styles.cell}>
              <Ionicons name="arrow-down" size={20} color={COLORS.ACCENT} />
            </Animated.View>
          ))}
        </View>

        {/* Row 3: Word */}
        <View style={styles.row}>
          <View style={styles.headerCell}><Text style={styles.headerLabel}>単語</Text></View>
          {data.words.map((word, index) => (
            <Animated.View key={`word-${index}`} entering={FadeIn.delay(900).duration(500)} style={styles.cell}>
              <Text style={styles.word}>{word.word}</Text>
            </Animated.View>
          ))}
        </View>

         {/* Row 4: Meaning */}
         <View style={styles.row}>
          <View style={styles.headerCell}><Text style={styles.headerLabel}>意味</Text></View>
          {data.words.map((word, index) => (
            <Animated.View key={`meaning-${index}`} entering={FadeIn.delay(1200).duration(500)} style={styles.cell}>
              <Text style={styles.meaning}>{word.meaning_ja}</Text>
            </Animated.View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginVertical: SPACING.M,
  },
  container: {
    paddingHorizontal: SPACING.M,
    paddingBottom: SPACING.M,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerCell: {
    width: 60,
    justifyContent: 'center',
  },
  headerLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SUB,
    fontWeight: '600',
  },
  cell: {
    width: 100,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  prefix: {
    color: COLORS.ACCENT,
    fontSize: 14,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 10,
    color: COLORS.TEXT_SUB,
  },
  subTextRoot: {
    fontSize: 10,
    color: COLORS.TEXT_MAIN,
     fontWeight: 'bold',
  },
  root: {
    color: COLORS.TEXT_MAIN,
    fontSize: 16,
    fontWeight: 'bold',
  },
  word: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  meaning: {
    color: COLORS.TEXT_MAIN,
    fontSize: 14,
    textAlign: 'center',
  },
});
