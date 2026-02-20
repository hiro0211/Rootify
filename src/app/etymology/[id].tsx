import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEtymologyDetail } from '../../features/etymology/hooks/useEtymologyDetail';
import { EtymologyTable } from '../../features/etymology/components/EtymologyTable';
import { WordCard } from '../../features/etymology/components/WordCard';
import { COLORS } from '../../shared/constants/colors';
import { SPACING } from '../../shared/constants/spacing';
import { Ionicons } from '@expo/vector-icons';

export default function EtymologyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // This is a workaround for expo-router 3.x type issue or just generic handling
  const etymologyId = Array.isArray(id) ? id[0] : id; 
  const { data, isLoading } = useEtymologyDetail(etymologyId!);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (isLoading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 }]}>
        <View style={styles.header}>
            <Text style={styles.root}>{data.root}</Text>
            <Text style={styles.rootMeaning}> = {data.root_meaning_ja}</Text>
        </View>
        <Text style={styles.description}>{data.description_ja}</Text>

        <Text style={styles.sectionTitle}>構造マップ</Text>
        <EtymologyTable data={data} />

        <Text style={styles.sectionTitle}>収録単語 ({data.words.length})</Text>
        {data.words.map((word) => (
          <WordCard 
            key={word.id} 
            word={word} 
            onPress={() => router.push(`/etymology/word/${word.id}`)}
          />
        ))}
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + SPACING.M }]}>
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => router.push({
            pathname: '/quiz/play',
            params: { etymologyId: data.id }
          })}
        >
          <Text style={styles.ctaText}>この語源でクイズに挑戦</Text>
          <Ionicons name="game-controller" size={20} color="#FFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.L,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  root: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  rootMeaning: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.TEXT_MAIN,
  },
  description: {
    fontSize: 14,
    color: COLORS.TEXT_SUB,
    marginBottom: 24,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_MAIN,
    marginBottom: 12,
    marginTop: 24,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: SPACING.L,
    paddingTop: SPACING.M,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  ctaButton: {
    backgroundColor: COLORS.SECONDARY,
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.SECONDARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
