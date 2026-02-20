import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Word } from '../../features/etymology/types';
import { etymologyService } from '../../features/etymology/services/etymologyService';
import { WordDecomposition } from '../../features/etymology/components/WordDecomposition';
import { COLORS } from '../../shared/constants/colors';
import { SPACING } from '../../shared/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { audio } from '../../lib/audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const wordId = Array.isArray(id) ? id[0] : id;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWord = async () => {
      try {
        const words = await etymologyService.getAllWords();
        const found = words.find(w => w.id === wordId);
        if (found) setWord(found);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (wordId) fetchWord();
  }, [wordId]);

  if (loading || !word) {
      return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.PRIMARY}/></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 100}}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.TEXT_MAIN} />
            </TouchableOpacity>
        </View>

        <WordDecomposition word={word} />

        <View style={styles.section}>
            <View style={styles.row}>
                <Text style={styles.label}>品詞</Text>
                <Text style={styles.value}>{word.part_of_speech}</Text>
            </View>
             <View style={styles.row}>
                <Text style={styles.label}>意味</Text>
                <Text style={styles.value}>{word.meaning_ja}</Text>
            </View>
             {word.meaning_sub_ja && (
                <View style={styles.row}>
                    <Text style={styles.label}>サブ意味</Text>
                    <Text style={styles.value}>{word.meaning_sub_ja}</Text>
                </View>
             )}
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>例文</Text>
            <View style={styles.exampleCard}>
                <Text style={styles.exampleEn}>{word.example_en}</Text>
                <Text style={styles.exampleJa}>{word.example_ja}</Text>
                <TouchableOpacity 
                    style={styles.speakButton}
                    onPress={() => audio.speak(word.example_en)}
                >
                     <Ionicons name="volume-medium" size={18} color={COLORS.PRIMARY} />
                     <Text style={styles.speakText}>再生</Text>
                </TouchableOpacity>
            </View>
        </View>

        {word.derivatives.length > 0 && (
             <View style={styles.section}>
                <Text style={styles.sectionTitle}>派生語</Text>
                {word.derivatives.map((d, i) => (
                    <View key={i} style={styles.derivativeRow}>
                        <Text style={styles.derivativeWord}>{d.word}</Text>
                        <Text style={styles.derivativePos}>({d.pos})</Text>
                        <Text style={styles.derivativeMeaning}>{d.meaning}</Text>
                    </View>
                ))}
            </View>
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  center: {flex:1, justifyContent:'center', alignItems:'center'},
  header: {
      padding: SPACING.M,
      alignItems: 'flex-end',
  },
  closeButton: {
      padding: 8,
      backgroundColor: '#EEE',
      borderRadius: 20,
  },
  section: {
      padding: SPACING.L,
      borderTopWidth: 1,
      borderTopColor: COLORS.BORDER,
  },
  row: {
      flexDirection: 'row',
      marginBottom: 8,
  },
  label: {
      width: 80,
      color: COLORS.TEXT_SUB,
      fontSize: 14,
  },
  value: {
      flex: 1,
      color: COLORS.TEXT_MAIN,
      fontSize: 14,
      fontWeight: '500',
  },
  sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: COLORS.TEXT_MAIN,
      marginBottom: 12,
  },
  exampleCard: {
      backgroundColor: COLORS.CARD_BG,
      padding: SPACING.M,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: COLORS.PRIMARY,
  },
  exampleEn: {
      fontSize: 16,
      color: COLORS.TEXT_MAIN,
      marginBottom: 8,
      lineHeight: 22,
  },
  exampleJa: {
      fontSize: 14,
      color: COLORS.TEXT_SUB,
  },
  speakButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      alignSelf: 'flex-start',
  },
  speakText: {
      color: COLORS.PRIMARY,
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
  },
  derivativeRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: 8,
  },
  derivativeWord: {
      fontSize: 16,
      fontWeight: 'bold',
      color: COLORS.TEXT_MAIN,
      marginRight: 8,
  },
  derivativePos: {
      fontSize: 12,
      color: COLORS.TEXT_SUB,
      marginRight: 8,
  },
  derivativeMeaning: {
      fontSize: 14,
      color: COLORS.TEXT_MAIN,
  },
});
