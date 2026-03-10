import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  DARK_COLORS,
  LIGHT_COLORS,
  useAppColors,
  useIsDark,
  type AppColors,
} from '../constants/colors';
import { useAppTheme } from '../providers/ThemeProvider';
import type { ThemePreference } from '../utils/storage';

const THEME_OPTIONS: Array<{
  value: ThemePreference;
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
}> = [
  { value: 'light', label: 'Açık', icon: 'sun' },
  { value: 'dark', label: 'Koyu', icon: 'moon' },
  { value: 'system', label: 'Sistem', icon: 'smartphone' },
];

export default function ProfileThemeCard() {
  const colors = useAppColors();
  const isDark = useIsDark();
  const { width } = useWindowDimensions();
  const { themePreference, resolvedScheme, setThemePreference } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const isCompact = width < 380;
  const activeThemeLabel = themePreference === 'system'
    ? `Sistem (${resolvedScheme === 'dark' ? 'Koyu' : 'Açık'})`
    : themePreference === 'dark'
      ? 'Koyu'
      : 'Açık';

  return (
    <View style={styles.themeCard}>
      <View style={styles.themeCardHeader}>
        <View style={[styles.themeHero, { backgroundColor: colors.surfaceAlt }]}>
          <View style={[styles.themeHeroOrb, styles.themeHeroSun]} />
          <View style={[styles.themeHeroOrb, styles.themeHeroMoon, { backgroundColor: colors.bg }]} />
        </View>

        <View style={styles.themeCardCopy}>
          <Text style={styles.themeCardTitle}>Uygulama Teması</Text>
          <Text style={styles.themeCardSubtitle}>Şu an: {activeThemeLabel}</Text>
        </View>

        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>Aktif</Text>
        </View>
      </View>

      <Text style={styles.themeHint}>
        Tercihin hemen uygulanır. Sistem seçeneği cihaz ayarını takip eder.
      </Text>

      <View style={[styles.themeOptionsRow, isCompact && styles.themeOptionsRowCompact]}>
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
              accessibilityLabel={`${option.label} tema seçeneği`}
              accessibilityHint="Uygulama temasını değiştirir"
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [
                styles.themeOption,
                isCompact && styles.themeOptionCompact,
                isCompact && option.value === 'system' && styles.themeOptionCompactWide,
                isSelected && styles.themeOptionSelected,
                pressed && styles.themeOptionPressed,
              ]}
              onPress={() => {
                void setThemePreference(option.value);
              }}
            >
              <View
                style={[
                  styles.themePreview,
                  {
                    backgroundColor: previewColors.bg,
                    borderColor: previewColors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.themePreviewTopBar,
                    { backgroundColor: previewColors.surface },
                  ]}
                >
                  <View style={[styles.themePreviewDot, { backgroundColor: previewColors.orange }]} />
                  <View style={[styles.themePreviewLine, { backgroundColor: previewColors.border }]} />
                </View>

                <View style={styles.themePreviewBody}>
                  <View
                    style={[
                      styles.themePreviewCard,
                      { backgroundColor: previewColors.surfaceElevated },
                    ]}
                  />
                  <View
                    style={[
                      styles.themePreviewFooter,
                      { backgroundColor: previewColors.surfaceAlt },
                    ]}
                  />
                </View>

                {option.value === 'system' && (
                  <View
                    style={[
                      styles.systemBadge,
                      {
                        backgroundColor: previewColors.surfaceElevated,
                        borderColor: previewColors.border,
                      },
                    ]}
                  >
                    <Feather name="smartphone" size={10} color={previewColors.text} />
                  </View>
                )}
              </View>

              <View style={styles.themeOptionFooter}>
                <Feather
                  name={option.icon}
                  size={15}
                  color={isSelected ? colors.orange : colors.muted}
                />
                <Text
                  style={[
                    styles.themeOptionLabel,
                    isSelected && styles.themeOptionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </View>

              {isSelected && (
                <View style={styles.selectedCheck}>
                  <Feather name="check" size={12} color={colors.white} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    themeCard: {
      backgroundColor: colors.surface,
      borderRadius: 28,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadowSoft,
      shadowOpacity: isDark ? 0.14 : 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: isDark ? 0 : 2,
    },
    themeCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    themeHero: {
      width: 50,
      height: 50,
      borderRadius: 18,
      marginRight: 14,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    themeHeroOrb: {
      position: 'absolute',
      borderRadius: 999,
    },
    themeHeroSun: {
      width: 20,
      height: 20,
      backgroundColor: colors.orangeLight,
      top: 11,
      left: 10,
    },
    themeHeroMoon: {
      width: 28,
      height: 28,
      bottom: 8,
      right: 8,
      borderWidth: 5,
      borderColor: colors.orange,
    },
    themeCardCopy: {
      flex: 1,
    },
    themeCardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    themeCardSubtitle: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 3,
    },
    activeBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: colors.softInfoBg,
    },
    activeBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.orangeDark,
    },
    themeHint: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.muted,
      marginBottom: 16,
    },
    themeOptionsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    themeOptionsRowCompact: {
      flexWrap: 'wrap',
    },
    themeOption: {
      flex: 1,
      borderRadius: 20,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
      position: 'relative',
    },
    themeOptionCompact: {
      minWidth: '48%',
    },
    themeOptionCompactWide: {
      minWidth: '100%',
    },
    themeOptionSelected: {
      backgroundColor: colors.softInfoBg,
      borderColor: colors.orange,
    },
    themeOptionPressed: {
      opacity: 0.88,
    },
    themePreview: {
      height: 84,
      borderRadius: 16,
      borderWidth: 1,
      overflow: 'hidden',
      marginBottom: 10,
    },
    themePreviewTopBar: {
      height: 18,
      paddingHorizontal: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    themePreviewDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    themePreviewLine: {
      width: 24,
      height: 4,
      borderRadius: 2,
    },
    themePreviewBody: {
      flex: 1,
      padding: 8,
      justifyContent: 'space-between',
    },
    themePreviewCard: {
      height: 32,
      borderRadius: 10,
    },
    themePreviewFooter: {
      height: 12,
      width: '72%',
      borderRadius: 6,
    },
    systemBadge: {
      position: 'absolute',
      right: 6,
      bottom: 6,
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeOptionFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      minHeight: 20,
    },
    themeOptionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    themeOptionLabelSelected: {
      color: colors.orangeDark,
    },
    selectedCheck: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.orange,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
