import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { useSettingsStore } from '../../features/settings/stores/useSettingsStore';
import { COLORS } from '../../shared/constants/colors';
import { SPACING } from '../../shared/constants/spacing';

export default function SettingsScreen() {
  const { 
    notificationsEnabled, setNotifications,
    soundEnabled, setSound,
    hapticsEnabled, setHaptics
  } = useSettingsStore();

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );

  const renderRow = (label: string, value: boolean, onValueChange: (v: boolean) => void) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch 
        value={value} 
        onValueChange={onValueChange}
        trackColor={{ false: '#DDD', true: COLORS.SUCCESS }}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {renderSection('一般', (
        <>
           {renderRow('学習リマインダー', notificationsEnabled, setNotifications)}
           <View style={styles.divider} />
           {renderRow('効果音', soundEnabled, setSound)}
           <View style={styles.divider} />
           {renderRow('触覚フィードバック', hapticsEnabled, setHaptics)}
        </>
      ))}

       {renderSection('アカウント', (
        <View style={styles.row}>
            <Text style={styles.label}>現在のプラン</Text>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>Free</Text>
            </View>
        </View>
      ))}

      <Text style={styles.version}>WordRoot v1.0.0 (MVP)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.L,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: COLORS.TEXT_SUB,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 12,
    paddingHorizontal: SPACING.M,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
  },
  label: {
    fontSize: 16,
    color: COLORS.TEXT_MAIN,
  },
  badge: {
    backgroundColor: COLORS.BORDER,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.TEXT_SUB,
    fontWeight: 'bold',
  },
  version: {
    textAlign: 'center',
    color: COLORS.TEXT_SUB,
    fontSize: 12,
    marginTop: 20,
  },
});
