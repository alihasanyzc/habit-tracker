import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  DARK_COLORS,
  LIGHT_COLORS,
  useAppColors,
  useIsDark,
  type AppColors,
} from '../constants/colors';
import { useAppTheme } from '../providers/ThemeProvider';
import { useLanguage } from '../providers/LanguageProvider';
import type { ThemePreference } from '../utils/storage';

export default function ProfileThemeCard() {
  const colors = useAppColors();
  const isDark = useIsDark();
  const { themePreference, resolvedScheme, setThemePreference } = useAppTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const THEME_OPTIONS: Array<{
    value: ThemePreference;
    label: string;
    icon: React.ComponentProps<typeof Feather>['name'];
  }> = useMemo(() => [
    { value: 'light', label: t('theme.light'), icon: 'sun' },
    { value: 'dark', label: t('theme.dark'), icon: 'moon' },
    { value: 'system', label: t('theme.system'), icon: 'smartphone' },
  ], [t]);

  return (
    <View style={styles.card}>
      <View style={styles.optionsRow}>
        {THEME_OPTIONS.map((option) => {
          const isSelected = option.value === themePreference;
          const previewColors = option.value === 'dark'
            ? DARK_COLORS
            : option.value === 'light'
              ? LIGHT_COLORS
              : resolvedScheme === 'dark'
                ? DARK_COLORS
                : LIGHT_COLORS;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityLabel={t('theme.themeLabel', { option: option.label })}
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
              ]}
              onPress={() => void setThemePreference(option.value)}
            >
              <View
                style={[
                  styles.preview,
                  {
                    backgroundColor: previewColors.bg,
                    borderColor: isSelected ? colors.orange : colors.border,
                  },
                ]}
              >
                <View style={[styles.previewBar, { backgroundColor: previewColors.surface }]}>
                  <View style={[styles.previewDot, { backgroundColor: previewColors.orange }]} />
                  <View style={[styles.previewLine, { backgroundColor: previewColors.border }]} />
                </View>
                <View style={styles.previewBody}>
                  <View style={[styles.previewCard, { backgroundColor: previewColors.surfaceElevated }]} />
                  <View style={[styles.previewFooter, { backgroundColor: previewColors.surfaceAlt }]} />
                </View>
              </View>

              <View style={styles.optionFooter}>
                <Feather
                  name={option.icon}
                  size={14}
                  color={isSelected ? colors.orange : colors.muted}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    isSelected && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: AppColors, _isDark: boolean) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionsRow: {
      flexDirection: 'row',
      gap: 6,
    },
    option: {
      flex: 1,
      alignItems: 'center',
      padding: 8,
      borderRadius: 20,
      gap: 8,
    },
    optionSelected: {
      backgroundColor: colors.surfaceAlt,
    },
    preview: {
      width: '100%',
      height: 72,
      borderRadius: 14,
      borderWidth: 1,
      overflow: 'hidden',
    },
    previewBar: {
      height: 16,
      paddingHorizontal: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    previewDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
    },
    previewLine: {
      width: 20,
      height: 3,
      borderRadius: 2,
    },
    previewBody: {
      flex: 1,
      padding: 6,
      justifyContent: 'space-between',
    },
    previewCard: {
      height: 24,
      borderRadius: 8,
    },
    previewFooter: {
      height: 10,
      width: '70%',
      borderRadius: 5,
    },
    optionFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    optionLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    optionLabelSelected: {
      color: colors.orange,
    },
  });
}
