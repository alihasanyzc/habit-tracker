import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import CreateScreen from '../screens/CreateScreen';
import ReportScreen from '../screens/ReportScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// ── Renk Paleti ──────────────────────────────────────
const NAV_BG = '#FFFFFF';
const ACTIVE = '#FF8A1F';
const INACTIVE = '#7A7A7A';

// ── Sekme ikonları ────────────────────────────────────
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Stats: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  Report: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

// ── Özel Tab Bar ─────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: any) {
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
                <Ionicons name="add" size={26} color="#fff" />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>Ekle</Text>
            </TouchableOpacity>
          );
        }

        const labels: Record<string, string> = {
          Home: 'Ana Sayfa', Stats: 'İstatistik',
          Report: 'Rapor', Profile: 'Profil',
        };

        const iconName = icon && typeof icon === 'object'
          ? (isFocused ? icon.active : icon.inactive)
          : 'ellipse-outline';

        return (
          <TouchableOpacity key={route.key} onPress={onPress} style={styles.tab} activeOpacity={0.7}>
            <Ionicons name={iconName} size={21} color={isFocused ? ACTIVE : INACTIVE} />
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
    <View style={{ flex: 1, backgroundColor: '#F6EFEA', overflow: 'hidden' }}>
      <NavigationContainer>
        <Tab.Navigator
          tabBar={props => <CustomTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Stats" component={StatsScreen} />
          <Tab.Screen name="Create" component={CreateScreen} />
          <Tab.Screen name="Report" component={ReportScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

// ── Stiller ──────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: NAV_BG,
    paddingBottom: Platform.OS === 'ios' ? 16 : 10,
    paddingTop: 10,
    paddingHorizontal: 4,
    borderRadius: 30,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 28 : 14,
    overflow: 'visible',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 12 },
    }),
  },

  tab: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2,
  },

  tabIcon: { fontSize: 19, marginBottom: 2 },
  tabLabel: { fontSize: 8, color: INACTIVE, fontWeight: '400' },
  tabLabelActive: { color: ACTIVE, fontWeight: '700' },

  // Merkez buton
  centerTabWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2,
  },
  centerBtn: {
    position: 'absolute',
    bottom: 16,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: ACTIVE,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: ACTIVE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  centerBtnActive: { backgroundColor: '#E06B00' },

  homeIndicator: {
    display: 'none',
  },
});
