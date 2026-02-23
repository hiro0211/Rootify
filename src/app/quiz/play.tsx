import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuizSession } from '../../features/quiz/hooks/useQuizSession';
import { QuizProgressBar } from '../../features/quiz/components/QuizProgressBar';
import { QuizWordDisplay } from '../../features/quiz/components/QuizWordDisplay';
import { QuizChoiceButton } from '../../features/quiz/components/QuizChoiceButton';
import { COLORS } from '../../shared/constants/colors';
import { SPACING } from '../../shared/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';

export default function QuizPlayScreen() {
  const { etymologyId } = useLocalSearchParams<{ etymologyId: string }>();
  // Handle array case
  const eId = Array.isArray(etymologyId) ? etymologyId[0] : etymologyId;

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    currentQuestion,
    currentIndex,
    total,
    isLoading,
    isFinished,
    handleAnswer,
    selectedChoiceIndex,
    results,
    sessionResult,
  } = useQuizSession(eId || 'etym_tract'); // Fallback for testing

  const handleClose = () => {
    Alert.alert(
      "クイズを終了しますか？",
      "現在の進捗は保存されません",
      [
        { text: "キャンセル", style: "cancel" },
        { text: "終了", style: "destructive", onPress: () => router.back() }
      ]
    );
  };

  useEffect(() => {
    if (isFinished && sessionResult) {
      // Serialize complex object to pass via params or store in global state
      // For MVP, passing simple params
      router.replace({
        pathname: '/quiz/result',
        params: {
          correct: sessionResult.correctCount,
          total: sessionResult.totalQuestions,
        }
      });
    }
  }, [isFinished, sessionResult]);

  if (isLoading || !currentQuestion) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.M, paddingBottom: insets.bottom + SPACING.M }]}>

      {/* Header / Progress */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.progressText}>Q {currentIndex + 1} / {total}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            testID="close-quiz-button"
          >
            <Ionicons name="close" size={28} color={COLORS.TEXT_SUB} />
          </TouchableOpacity>
        </View>
        <QuizProgressBar total={total} current={currentIndex} results={results} />
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <QuizWordDisplay word={currentQuestion.word} />
      </View>

      {/* Choices */}
      <View style={styles.choicesContainer}>
        {currentQuestion.choices.map((choice, index) => {
          let state: 'idle' | 'selected' | 'correct' | 'incorrect' | 'missed' = 'idle';

          if (selectedChoiceIndex !== null) {
            // User has answered
            if (index === selectedChoiceIndex) {
              // This is the button user clicked
              state = choice.isCorrect ? 'correct' : 'incorrect';
            } else if (choice.isCorrect) {
              // This is the correct answer, but user didn't click it
              state = 'missed';
            } else {
              // Unselected distractor
              state = 'idle'; // Or disabled/dimmed
            }
          }

          return (
            <QuizChoiceButton
              key={index}
              choice={choice}
              onPress={() => handleAnswer(index)}
              disabled={selectedChoiceIndex !== null}
              state={state}
            />
          );
        })}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: SPACING.L,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.TEXT_SUB,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  choicesContainer: {
    paddingBottom: 24,
  },
});
