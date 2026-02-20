import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEtymologyList } from '../../features/etymology/hooks/useEtymologyList';
import { EtymologyTreeCard } from '../../features/etymology/components/EtymologyTreeCard';
import { COLORS } from '../../shared/constants/colors';
import { SPACING } from '../../shared/constants/spacing';

export default function EtymologyListScreen() {
  const router = useRouter();
  const { etymologies, isLoading } = useEtymologyList();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={etymologies}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <EtymologyTreeCard
            etymology={item}
            onPress={() => router.push(`/etymology/${item.id}`)}
            isLocked={!item.is_free} // Use real Pro check later
          />
        )}
      />
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
  listContent: {
    padding: SPACING.S,
  },
});
