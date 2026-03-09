import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppColors } from '../constants/colors';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  textColor?: string;
  mutedColor?: string;
}

// ── Ortak başlık bileşeni ──
export default function ScreenHeader({
  title,
  subtitle,
  textColor,
  mutedColor,
}: ScreenHeaderProps) {
  const colors = useAppColors();

  return (
    <View style={styles.header}>
      <View>
        <Text style={[styles.title, { color: textColor ?? colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: mutedColor ?? colors.muted }]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
  },
});
