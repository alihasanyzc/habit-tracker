import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '../constants/colors';

interface CardFooterProps {
  done: number;
  total: number;
  unit?: string;
  color: string;
  bgColor: string;
}

export default function CardFooter({ done, total, unit = 'gün', color, bgColor }: CardFooterProps) {
  const pct = Math.round((done / total) * 100);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{done}/{total} {unit}</Text>
      <View style={[styles.badge, { backgroundColor: bgColor }]}>
        <Text style={[styles.badgeText, { color }]}>{pct}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  text: { fontSize: 13, color: C.muted, fontWeight: '600' },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 13, fontWeight: '700' },
});
