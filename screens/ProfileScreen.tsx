import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';

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

// ── Yüz Avatar (SVG) ───────────────────────────────────
function FaceAvatar() {
  return (
    <Svg width={32} height={32} viewBox="0 0 32 32">
      <Circle cx={16} cy={16} r={13} fill="#FFE4C8" />
      <Circle cx={12} cy={14} r={1.8} fill="#5C3D1E" />
      <Circle cx={20} cy={14} r={1.8} fill="#5C3D1E" />
      <Path
        d="M11.5 19.5 Q16 23 20.5 19.5"
        stroke="#5C3D1E" strokeWidth={1.6}
        strokeLinecap="round" fill="none"
      />
    </Svg>
  );
}

// ════════════════════════════════════════════════════════
// ANA BİLEŞEN
// ════════════════════════════════════════════════════════
export default function ProfileScreen() {
  const [name, setName] = useState('Budi');
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const startEditing = () => {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <View style={styles.root}>

      {/* ── Gradient Header ─────────────────────────── */}
      <LinearGradient
        colors={[C.cream, C.beige, C.beigeDeep]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradHeader}
      >
        <SafeAreaView edges={['top']}>
          {/* Profil Satırı */}
          <View style={styles.profileRow}>

            {/* Avatar */}
            <View style={styles.avatar}>
              <FaceAvatar />
            </View>

            {/* İsim + düzenle */}
            <View style={styles.nameWrap}>
              {editing ? (
                <TextInput
                  ref={inputRef}
                  value={name}
                  onChangeText={setName}
                  onBlur={() => setEditing(false)}
                  onSubmitEditing={() => setEditing(false)}
                  style={styles.nameInput}
                  returnKeyType="done"
                  autoFocus
                />
              ) : (
                <TouchableOpacity
                  style={styles.nameRow}
                  onPress={startEditing}
                  activeOpacity={0.7}
                >
                  <Text style={styles.nameText}>{name}</Text>
                  <Feather name="edit-2" size={15} color={C.text} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              )}
            </View>

            {/* Ayarlar ikonu */}
            <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
              <Feather name="settings" size={24} color={C.text} />
            </TouchableOpacity>

          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Beyaz Kart (Menü Listesi) ───────────────── */}
      <View style={styles.menuCard}>
        <ScrollView
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
      </View>

    </View>
  );
}

// ── Stiller ────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Gradient header
  gradHeader: {
    paddingBottom: 28,
    zIndex: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 14,
    gap: 14,
  },

  avatar: {
    width: 58, height: 58, borderRadius: 29,
    borderWidth: 2.5, borderColor: C.beige,
    backgroundColor: C.cream,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    ...Platform.select({
      ios: { shadowColor: '#A35414', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.18, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },

  nameWrap: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameText: { fontSize: 20, fontWeight: '700', color: C.text },
  editIcon: { fontSize: 15 },
  nameInput: {
    fontSize: 20, fontWeight: '700', color: C.text,
    borderBottomWidth: 2, borderBottomColor: C.orange,
    paddingVertical: 2, paddingHorizontal: 0,
    minWidth: 100,
  },

  settingsBtn: { padding: 6, flexShrink: 0 },
  settingsIcon: { fontSize: 22 },

  // Menü kartı
  menuCard: {
    flex: 1,
    backgroundColor: C.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -18,
    paddingTop: 10,
    ...Platform.select({
      ios: { shadowColor: C.beige, shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.5, shadowRadius: 16 },
      android: { elevation: 6 },
    }),
  },

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
  menuEmoji: { fontSize: 18 },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '500', color: C.text },
  chevron: { fontSize: 22, color: C.chevron, fontWeight: '300' },
});
