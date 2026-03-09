import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { C } from '../constants/colors';

interface DropdownProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

export default function Dropdown({ options, value, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
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
                opt === value && { color: C.orange, fontWeight: '700' },
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

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.bg,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  btnText: { fontSize: 13, fontWeight: '600', color: C.text },
  menu: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    backgroundColor: C.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    minWidth: 160,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  item: { paddingHorizontal: 16, paddingVertical: 10 },
  itemActive: { backgroundColor: C.orangeBg },
  itemText: { fontSize: 13, color: C.text },
});
