import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';

// ── Renk Paleti ────────────────────────────────────────
const C = {
  bg: '#F6EFEA',
  cream: '#F6EFEA',
  beige: '#EFE5DD',
  beigeDeep: '#E3D5CC',
  orange: '#FF8A1F',
  green: '#8FB339',
  brown: '#A35414',
  pink: '#E78AC3',
  text: '#1F1F1F',
  muted: '#7A7A7A',
  border: '#E6E6E6',
  chevron: '#BBBBBB',
};

// ── Menü Öğeleri ───────────────────────────────────────
const MENU_ITEMS = [
  { icon: 'settings', label: 'Tercihler', accent: C.orange },
  { icon: 'user', label: 'Kişisel Bilgiler', accent: C.green },
  { icon: 'credit-card', label: 'Ödeme Yöntemleri', accent: C.brown },
  { icon: 'star', label: 'Faturalandırma ve Abonelik', accent: C.pink },
  { icon: 'shield', label: 'Hesap ve Güvenlik', accent: C.orange },
  { icon: 'link', label: 'Bağlı Hesaplar', accent: C.green },
  { icon: 'eye', label: 'Uygulama Görünümü', accent: C.brown },
  { icon: 'bar-chart-2', label: 'Veri ve İstatistikler', accent: C.pink },
];

// ════════════════════════════════════════════════════════
// ANA BİLEŞEN
// ════════════════════════════════════════════════════════
export default function ProfileScreen() {
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
              <View style={[styles.iconBox, { backgroundColor: C.cream }]}>
                <Feather name={item.icon as any} size={20} color={item.accent} />
              </View>

              {/* Etiket */}
              <Text style={styles.menuLabel}>{item.label}</Text>

              {/* Chevron */}
              <Feather name="chevron-right" size={22} color={C.chevron} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

    </SafeAreaView>
  );
}

// ── Stiller ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 15,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14, flexShrink: 0,
  },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '500', color: C.text },
});
