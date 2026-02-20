import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../features/auth/stores/useUserStore';
import { StreakDisplay } from '../../features/progress/components/StreakDisplay';
import { DailyGoalProgress } from '../../features/progress/components/DailyGoalProgress';
import { COLORS } from '../../shared/constants/colors';
import { SPACING } from '../../shared/constants/spacing';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { streak, dailyGoal } = useUserStore();
  
  // Mock current progress for MVP
  const currentProgress = 3; 

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.L }]}
    >
      <Text style={styles.greeting}>Good Morning, Guest</Text>
      <Text style={styles.subtitle}>今日も語源の根っこを育てましょう🌱</Text>

      <StreakDisplay streak={streak} />
      
      <DailyGoalProgress current={currentProgress} goal={dailyGoal} />

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.mainAction}
          onPress={() => router.push('/quiz/play')}
        >
          <Text style={styles.actionTitle}>今日のクイズ</Text>
          <Text style={styles.actionSubtitle}>まずは10問挑戦する</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryAction}
          onPress={() => router.push('/(tabs)/etymology')}
        >
          <Text style={styles.secondaryActionText}>新しい語源を探す</Text>
        </TouchableOpacity>
      </View>
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_MAIN,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SUB,
    marginBottom: SPACING.L,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  mainAction: {
    backgroundColor: COLORS.PRIMARY,
    padding: 20,
    borderRadius: 16,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  secondaryAction: {
    padding: 16,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: COLORS.SECONDARY,
    fontWeight: '600',
    fontSize: 16,
  },
});
