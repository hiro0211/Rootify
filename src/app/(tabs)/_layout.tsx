import { Tabs } from 'expo-router';
import { TabBar } from '../../shared/components/TabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
        }}
      />
      <Tabs.Screen
        name="etymology"
        options={{
          title: '語源',
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'クイズ',
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: '学習データ',
        }}
      />
       <Tabs.Screen
        name="settings"
        options={{
            title: '設定',
        }}
      />
    </Tabs>
  );
}
