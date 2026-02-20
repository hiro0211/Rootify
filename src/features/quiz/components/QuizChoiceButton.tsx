import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { QuizChoice } from '../types';
import { COLORS } from '../../../shared/constants/colors';
import { SPACING } from '../../../shared/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring, withTiming, interpolateColor } from 'react-native-reanimated';

interface Props {
  choice: QuizChoice;
  onPress: () => void;
  disabled: boolean;
  state: 'idle' | 'selected' | 'correct' | 'incorrect' | 'missed'; // missed = correct answer but user picked wrong
}

export function QuizChoiceButton({ choice, onPress, disabled, state }: Props) {
  
  let backgroundColor = COLORS.CARD_BG;
  let borderColor = COLORS.BORDER;
  let textColor = COLORS.TEXT_MAIN;
  let iconName: keyof typeof Ionicons.glyphMap | null = null;
  let iconColor = COLORS.TEXT_MAIN;

  if (state === 'selected') {
    backgroundColor = COLORS.SECONDARY;
    borderColor = COLORS.SECONDARY;
    textColor = '#FFF';
  } else if (state === 'correct') {
    backgroundColor = COLORS.SUCCESS;
    borderColor = COLORS.SUCCESS;
    textColor = '#FFF';
    iconName = 'checkmark-circle';
    iconColor = '#FFF';
  } else if (state === 'incorrect') {
    backgroundColor = COLORS.ERROR;
    borderColor = COLORS.ERROR;
    textColor = '#FFF';
    iconName = 'close-circle';
    iconColor = '#FFF';
  } else if (state === 'missed') {
    backgroundColor = '#FFF';
    borderColor = COLORS.SUCCESS;
    textColor = COLORS.SUCCESS;
    iconName = 'checkmark-circle-outline';
    iconColor = COLORS.SUCCESS;
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor, borderColor }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: textColor }]}>{choice.text}</Text>
      {iconName && (
        <Ionicons name={iconName} size={24} color={iconColor} style={styles.icon} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.M,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: SPACING.S,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center text
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    position: 'absolute',
    right: 16,
  },
});
