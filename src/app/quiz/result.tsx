import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../../shared/constants/colors';
import { SPACING } from '../../shared/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function QuizResultScreen() {
  const params = useLocalSearchParams();
  const correct = Number(params.correct) || 0;
  const total = Number(params.total) || 10;
  const percentage = Math.round((correct / total) * 100);
  
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isGreat = percentage >= 80;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + SPACING.L }]}>
      <View style={styles.content}>
        <Ionicons 
            name={isGreat ? "trophy" : "ribbon"} 
            size={80} 
            color={isGreat ? COLORS.WARNING : COLORS.PRIMARY} 
            style={{marginBottom: 24}}
        />
        
        <Text style={styles.title}>{isGreat ? 'Great Job!' : 'Good Effort!'}</Text>
        <Text style={styles.score}>{correct} / {total}</Text>
        <Text style={styles.percentage}>{percentage}% Correct</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
            style={[styles.button, { backgroundColor: COLORS.PRIMARY }]}
            onPress={() => router.replace('/(tabs)/')} // Back to home
        >
            <Text style={styles.buttonText}>ホームに戻る</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.L,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.TEXT_MAIN,
    marginBottom: 16,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 8,
  },
  percentage: {
    fontSize: 20,
    color: COLORS.TEXT_SUB,
  },
  actions: {
    gap: 16,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
