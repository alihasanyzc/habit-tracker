import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { useAppColors, useIsDark, type AppColors } from '../constants/colors';

interface DropdownProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

export default function Dropdown({ options, value, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const colors = useAppColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  return (
    <View>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>{value}</Text>
        <Text style={[styles.btnText, { fontSize: 10 }]}>▾</Text>
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />
        <View style={styles.menu}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.item, opt === value && styles.itemActive]}
              onPress={() => { onChange(opt); setOpen(false); }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.itemText,
                opt === value && { color: colors.orange, fontWeight: '700' },
              ]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
}

function createStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    btnText: { fontSize: 13, fontWeight: '600', color: colors.text },
    menu: {
      position: 'absolute',
      bottom: 80,
      right: 16,
      backgroundColor: colors.surfaceElevated,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 160,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.28 : 0.1,
          shadowRadius: 16,
        },
        android: { elevation: 8 },
      }),
    },
    item: { paddingHorizontal: 16, paddingVertical: 10 },
    itemActive: { backgroundColor: colors.orangeBg },
    itemText: { fontSize: 13, color: colors.text },
  });
}
