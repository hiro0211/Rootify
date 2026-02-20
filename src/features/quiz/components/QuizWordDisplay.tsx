import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Word } from '../../etymology/types';
import { COLORS } from '../../../shared/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { audio } from '../../../lib/audio';
import { useEffect } from 'react';

interface Props {
  word: Word;
  autoPlayAudio?: boolean;
}

export function QuizWordDisplay({ word, autoPlayAudio = true }: Props) {
  
  useEffect(() => {
    if (autoPlayAudio) {
      audio.speak(word.word);
    }
  }, [word, autoPlayAudio]);

  return (
    <View style={styles.container}>
      <Text style={styles.word}>{word.word}</Text>
      <TouchableOpacity 
        style={styles.speaker}
        onPress={() => audio.speak(word.word)}
      >
        <Ionicons name="volume-high" size={24} color={COLORS.PRIMARY} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  word: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.TEXT_MAIN,
    marginBottom: 16,
  },
  speaker: {
    padding: 12,
    backgroundColor: '#EBF5FB',
    borderRadius: 24,
  },
});
