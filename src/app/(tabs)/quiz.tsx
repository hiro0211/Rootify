import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../shared/constants/colors';
import { SPACING } from '../../shared/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useEtymologyList } from '../../features/etymology/hooks/useEtymologyList';

export default function QuizSelectionScreen() {
  const router = useRouter();
  const { etymologies } = useEtymologyList();

  const renderCard = (title: string, sub: string, icon: keyof typeof Ionicons.glyphMap, color: string, onPress: () => void, isLocked = false) => (
    <TouchableOpacity 
        style={[styles.card, isLocked && styles.locked]} 
        onPress={onPress}
        disabled={isLocked}
    >
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#FFF" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{sub}</Text>
      </View>
      {isLocked ? (
          <Ionicons name="lock-closed" size={20} color={COLORS.TEXT_SUB} />
      ) : (
          <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SUB} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>クイズモード</Text>
      
      <Text style={styles.sectionTitle}>デイリー</Text>
      {renderCard(
          "今日の復習", 
          "忘却曲線に基づく最適な復習", 
          "refresh", 
          COLORS.SUCCESS, 
          () => router.push({ pathname: '/quiz/play', params: { mode: 'review' } }) // Logic for review needed in play
      )}

      <Text style={styles.sectionTitle}>語源別 (チャプター1)</Text>
      {/* For MVP, just listing a few or linking to etymology list */}
      {etymologies.slice(0, 3).map(etym => (
           renderCard(
            `${etym.root} (${etym.root_meaning_ja})`, 
            `${etym.category}の語源`, 
            "pricetag", 
            COLORS.SECONDARY, 
            () => router.push({ pathname: '/quiz/play', params: { etymologyId: etym.id } })
          )
      ))}
      
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/etymology')}>
             <Text style={styles.link}>すべての語源を見る</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>スペシャル (Pro)</Text>
       {renderCard(
          "ミックスクイズ", 
          "全範囲からランダム出題", 
          "shuffle", 
          COLORS.WARNING, 
          () => {},
          true
      )}
      {renderCard(
          "まとめテスト", 
          "20問の実力試し", 
          "document-text", 
          COLORS.ACCENT, 
          () => {},
          true
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    padding: SPACING.L,
  },
  headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.TEXT_MAIN,
      marginBottom: 24,
  },
  sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: COLORS.TEXT_SUB,
      marginBottom: 12,
      marginTop: 12,
  },
  card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.CARD_BG,
      padding: SPACING.M,
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
  },
  locked: {
      opacity: 0.6,
      backgroundColor: '#F5F5F5',
  },
  iconBox: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
  },
  textContainer: {
      flex: 1,
  },
  cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: COLORS.TEXT_MAIN,
      marginBottom: 4,
  },
  cardSub: {
      fontSize: 12,
      color: COLORS.TEXT_SUB,
  },
  link: {
      textAlign: 'center',
      color: COLORS.SECONDARY,
      fontWeight: '600',
  },
});
