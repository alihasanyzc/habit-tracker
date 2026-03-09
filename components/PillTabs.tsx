import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { C } from '../constants/colors';

interface PillTabsProps {
  tabs: { key: string; label: string }[];
  activeKey: string;
  onChange: (key: string) => void;
}

export default function PillTabs({ tabs, activeKey, onChange }: PillTabsProps) {
  return (
    <View style={styles.container}>
      {tabs.map((t) => (
        <TouchableOpacity
          key={t.key}
          onPress={() => onChange(t.key)}
          activeOpacity={0.8}
          style={[styles.tab, activeKey === t.key && styles.tabActive]}
        >
          <Text style={[styles.label, activeKey === t.key && styles.labelActive]}>
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: C.tabBg,
    borderRadius: 50,
    padding: 4,
    gap: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 46,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: C.orange,
    ...Platform.select({
      ios: {
        shadowColor: C.orange,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  label: { fontSize: 13, fontWeight: '700', color: C.muted },
  labelActive: { color: C.white },
});
