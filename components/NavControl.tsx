import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../constants/colors';

interface NavControlProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function NavControl({ label, onPrev, onNext }: NavControlProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrev} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.arrow}>‹</Text>
      </TouchableOpacity>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{label}</Text>
      </View>
      <TouchableOpacity onPress={onNext} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  arrow: { fontSize: 18, fontWeight: '600', color: C.muted, paddingHorizontal: 2 },
  badge: {
    backgroundColor: C.tabBg,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: C.text, minWidth: 60, textAlign: 'center' },
});
