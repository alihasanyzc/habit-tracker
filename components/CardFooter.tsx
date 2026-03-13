import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getThemedAccentSurface, useAppColors, useIsDark, type AppColors } from '../constants/colors';
import { useLanguage } from '../providers/LanguageProvider';

interface CardFooterProps {
  done: number;
  total: number;
  unit?: string;
  color: string;
  bgColor: string;
}

export default function CardFooter({ done, total, unit, color, bgColor }: CardFooterProps) {
  const colors = useAppColors();
  const { t } = useLanguage();
  const resolvedUnit = unit ?? t('common.days');
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const pct = Math.round((done / total) * 100);
  const badgeBgColor = useMemo(
    () => getThemedAccentSurface(bgColor, colors, isDark, 0.72),
    [bgColor, colors, isDark]
  );
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{done}/{total} {resolvedUnit}</Text>
      <View style={[styles.badge, { backgroundColor: badgeBgColor }]}>
        <Text style={[styles.badgeText, { color }]}>{pct}%</Text>
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    text: { fontSize: 13, color: colors.muted, fontWeight: '600' },
    badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
    badgeText: { fontSize: 13, fontWeight: '700' },
  });
}
