import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import HomeScreen   from '../screens/HomeScreen';
import StatsScreen  from '../screens/StatsScreen';
import CreateScreen from '../screens/CreateScreen';
import ReportScreen from '../screens/ReportScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// ── Renk Paleti ──────────────────────────────────────
const NAV_BG   = '#EFE5DD';
const ACTIVE   = '#FF8A1F';
const INACTIVE = '#7A7A7A';

// ── Sekme ikonları (emoji bazlı, bağımlılık yok) ────
const ICONS: Record<string, string> = {
  Home:    '⊞',
  Stats:   '📈',
  Create:  '+',
  Report:  '📊',
  Profile: '📖',
};

// ── Özel Tab Bar ─────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const isCenter  = route.name === 'Create';
        const icon      = ICONS[route.name] ?? '○';

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
                <Text style={styles.centerIcon}>{icon}</Text>
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive, { marginTop: -16 }]}>
                Oluştur
              </Text>
            </TouchableOpacity>
          );
        }

        const labels: Record<string, string> = {
          Home: 'Ana Sayfa', Stats: 'İstatistik',
          Report: 'Rapor', Profile: 'Profil',
        };

        return (
          <TouchableOpacity key={route.key} onPress={onPress} style={styles.tab} activeOpacity={0.7}>
            {isFocused && <View style={styles.activeIndicator} />}
            <Text style={[styles.tabIcon, { color: isFocused ? ACTIVE : INACTIVE }]}>{icon}</Text>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {labels[route.name] ?? route.name}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Home indicator */}
      <View style={styles.homeIndicator} />
    </View>
  );
}

// ── Navigator ────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Home"    component={HomeScreen} />
        <Tab.Screen name="Stats"   component={StatsScreen} />
        <Tab.Screen name="Create"  component={CreateScreen} />
        <Tab.Screen name="Report"  component={ReportScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ── Stiller ──────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: NAV_BG,
    paddingBottom: Platform.OS === 'ios' ? 22 : 12,
    paddingTop: 10,
    paddingHorizontal: 4,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 12 },
    }),
  },

  tab: {
    flex: 1, alignItems: 'center', justifyContent: 'flex-end',
    paddingBottom: 2, position: 'relative',
  },

  activeIndicator: {
    position: 'absolute', top: 0,
    width: 44, height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255,138,31,0.12)',
  },

  tabIcon:  { fontSize: 22, marginBottom: 3 },
  tabLabel: { fontSize: 10, color: INACTIVE, fontWeight: '400' },
  tabLabelActive: { color: ACTIVE, fontWeight: '700' },

  // Merkez buton
  centerTabWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  centerBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: ACTIVE,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
    transform: [{ translateY: -18 }],
    ...Platform.select({
      ios: { shadowColor: ACTIVE, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10 },
      android: { elevation: 8 },
    }),
  },
  centerBtnActive: { backgroundColor: '#E06B00' },
  centerIcon: { fontSize: 28, color: '#fff', lineHeight: 32, fontWeight: '300' },

  // Home indicator
  homeIndicator: {
    position: 'absolute', bottom: 6, left: '50%',
    marginLeft: -60,
    width: 120, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(163,84,20,0.18)',
  },
});
