import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import { ACCENT, useAppColors, type AppColors } from '../constants/colors';

// ── Menü Öğeleri ───────────────────────────────────────
const MENU_ITEMS = [
  { icon: 'settings', label: 'Tercihler', accent: ACCENT.orange },
  { icon: 'user', label: 'Kişisel Bilgiler', accent: ACCENT.green },
  { icon: 'credit-card', label: 'Ödeme Yöntemleri', accent: ACCENT.brown },
  { icon: 'star', label: 'Faturalandırma ve Abonelik', accent: ACCENT.pink },
  { icon: 'shield', label: 'Hesap ve Güvenlik', accent: ACCENT.orange },
  { icon: 'link', label: 'Bağlı Hesaplar', accent: ACCENT.green },
  { icon: 'eye', label: 'Uygulama Görünümü', accent: ACCENT.brown },
  { icon: 'bar-chart-2', label: 'Veri ve İstatistikler', accent: ACCENT.pink },
];

// ════════════════════════════════════════════════════════
// ANA BİLEŞEN
// ════════════════════════════════════════════════════════
export default function ProfileScreen() {
  const colors = useAppColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Başlık ──────────────────────────────────── */}
      <ScreenHeader title="Profil" subtitle="Hesap ayarları ve tercihler" />

      {/* ── Menü Listesi ──────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {MENU_ITEMS.map((item, idx) => {
          const isLast = idx === MENU_ITEMS.length - 1;
          return (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                !isLast && styles.menuItemBorder,
              ]}
              activeOpacity={0.6}
            >
              {/* İkon kutusu */}
              <View style={[styles.iconBox, { backgroundColor: colors.surfaceAlt }]}>
                <Feather name={item.icon as any} size={20} color={item.accent} />
              </View>

              {/* Etiket */}
              <Text style={styles.menuLabel}>{item.label}</Text>

              {/* Chevron */}
              <Feather name="chevron-right" size={22} color={colors.chevron} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

    </SafeAreaView>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    scroll: { flex: 1 },

    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 22,
      paddingVertical: 15,
    },
    menuItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
      flexShrink: 0,
    },
    menuLabel: { flex: 1, fontSize: 16, fontWeight: '500', color: colors.text },
  });
}
