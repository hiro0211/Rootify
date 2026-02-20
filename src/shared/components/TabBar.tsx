import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Icons mapping
        let iconName: keyof typeof Ionicons.glyphMap = 'home';
        if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
        else if (route.name === 'etymology') iconName = isFocused ? 'book' : 'book-outline';
        else if (route.name === 'quiz') iconName = isFocused ? 'game-controller' : 'game-controller-outline';
        else if (route.name === 'progress') iconName = isFocused ? 'stats-chart' : 'stats-chart-outline';
        else if (route.name === 'settings') iconName = isFocused ? 'settings' : 'settings-outline';


        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            // @ts-expect-error: tabBarTestID might not be in the type definition
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? COLORS.PRIMARY : COLORS.TEXT_SUB}
            />
            <Text style={[styles.label, { color: isFocused ? COLORS.PRIMARY : COLORS.TEXT_SUB }]}>
              {label as string}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.CARD_BG,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
});
