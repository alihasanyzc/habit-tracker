import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import CreateScreen from '../screens/CreateScreen';
import HabitScreen from '../screens/HabitScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAppColors, useIsDark, type AppColors } from '../constants/colors';
import { useLanguage } from '../providers/LanguageProvider';

const Tab = createBottomTabNavigator();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Stats: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  Habit: { active: 'list', inactive: 'list-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

function CustomTabBar({ state, navigation }: any) {
  const colors = useAppColors();
  const isDark = useIsDark();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const isCenter = route.name === 'Create';
        const icon = ICONS[route.name] ?? '○';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isCenter) {
          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={styles.centerTabWrap} activeOpacity={0.85}>
              <View style={[styles.centerBtn, isFocused && styles.centerBtnActive]}>
                <Ionicons name="add" size={26} color={colors.white} />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{t('navigation.add')}</Text>
            </TouchableOpacity>
          );
        }

        const labels: Record<string, string> = {
          Home: t('navigation.home'),
          Stats: t('navigation.statistics'),
          Habit: t('navigation.habits'),
          Profile: t('navigation.profile'),
        };

        const iconName = icon && typeof icon === 'object'
          ? (isFocused ? icon.active : icon.inactive)
          : 'ellipse-outline';

        return (
          <TouchableOpacity key={route.key} onPress={onPress} style={styles.tab} activeOpacity={0.7}>
            <Ionicons name={iconName} size={21} color={isFocused ? colors.orange : colors.muted} />
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {labels[route.name] ?? route.name}
            </Text>
          </TouchableOpacity>
        );
      })}

      <View style={styles.homeIndicator} />
    </View>
  );
}

export default function AppNavigator() {
  const colors = useAppColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const navigationTheme = useMemo<Theme>(() => ({
    ...(isDark ? DarkTheme : DefaultTheme),
    dark: isDark,
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.orange,
      background: colors.bg,
      card: colors.navBg,
      text: colors.text,
      border: colors.border,
      notification: colors.orange,
    },
    fonts: isDark ? DarkTheme.fonts : DefaultTheme.fonts,
  }), [colors, isDark]);

  return (
    <View style={styles.root}>
      <NavigationContainer theme={navigationTheme}>
        <Tab.Navigator
          tabBar={props => <CustomTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            animation: 'shift',
            sceneStyle: { backgroundColor: colors.bg },
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Stats" component={StatsScreen} />
          <Tab.Screen name="Create" component={CreateScreen} />
          <Tab.Screen name="Habit" component={HabitScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

function createStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.bg,
      overflow: 'hidden',
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: colors.navBg,
      paddingBottom: Platform.OS === 'ios' ? 16 : 10,
      paddingTop: 10,
      paddingHorizontal: 4,
      borderRadius: 30,
      marginHorizontal: 16,
      marginBottom: Platform.OS === 'ios' ? 28 : 14,
      overflow: 'visible',
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowSoft,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.28 : 0.12,
          shadowRadius: 16,
        },
        android: { elevation: 12 },
      }),
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    tabLabel: {
      fontSize: 8,
      color: colors.muted,
      fontWeight: '400',
    },
    tabLabelActive: {
      color: colors.orange,
      fontWeight: '700',
    },
    centerTabWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: 2,
    },
    centerBtn: {
      position: 'absolute',
      bottom: 16,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.orange,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.orange,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.4,
          shadowRadius: 8,
        },
        android: { elevation: 8 },
      }),
    },
    centerBtnActive: { backgroundColor: colors.orangeDark },
    homeIndicator: {
      display: 'none',
    },
  });
}
