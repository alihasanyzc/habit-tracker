import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useAppColors, useIsDark, type AppColors } from '../constants/colors';

interface PillTabsProps {
  tabs: { key: string; label: string }[];
  activeKey: string;
  onChange: (key: string) => void;
}

export default function PillTabs({ tabs, activeKey, onChange }: PillTabsProps) {
  const colors = useAppColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

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

function createStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.tabBg,
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
      backgroundColor: colors.orange,
      ...Platform.select({
        ios: {
          shadowColor: colors.orange,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: isDark ? 0.28 : 0.35,
          shadowRadius: 6,
        },
        android: { elevation: 4 },
      }),
    },
    label: { fontSize: 13, fontWeight: '700', color: colors.muted },
    labelActive: { color: colors.white },
  });
}
