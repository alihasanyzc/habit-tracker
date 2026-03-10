import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getThemedAccentSurface, useAppColors, useIsDark, type AppColors } from '../constants/colors';
import { getHabits } from '../utils/habitRepository';
import type { Habit } from '../types/habit';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, '0');
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function calcStreak(habit: Habit): number {
  // Gerçek streak verisi habitRepository'ye bağlandığında buraya entries geçilebilir.
  // Şimdilik createdAt -> bugün arası gün sayısını döndürür (demo).
  const start = new Date(habit.startDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

function streakLabel(days: number) {
  if (days >= 365) return `${Math.floor(days / 365)} yıl`;
  if (days >= 30) return `${Math.floor(days / 30)} ay`;
  return `${days} gün`;
}

// ─── HabitDetailCard ────────────────────────────────────────────────────────

function HabitDetailCard({ habit }: { habit: Habit }) {
  const colors = useAppColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const surface = useMemo(
    () => getThemedAccentSurface(habit.bgColor, colors, isDark, 0.9),
    [habit.bgColor, colors, isDark]
  );
  const streak = calcStreak(habit);
  const startLabel = formatDate(habit.startDate);
  const endLabel = habit.noEndDate ? 'Süresiz' : habit.endDate ? formatDate(habit.endDate) : 'Süresiz';

  return (
    <View style={[styles.card, { backgroundColor: surface }]}>
      {/* ── Üst satır: ikon + isim ── */}
      <View style={styles.cardTop}>
        <View style={[styles.iconBox, { backgroundColor: colors.translucentCard }]}>
          <MaterialCommunityIcons name={habit.icon as any} size={22} color={habit.iconColor} />
        </View>
        <Text style={styles.habitName} numberOfLines={1}>{habit.name}</Text>
      </View>

      {/* ── Alt satır: seri solda, tarih/süresiz sağda ── */}
      <View style={styles.metaRow}>
        <View style={styles.metaLeft}>
          <Text style={[styles.metaValue, { color: colors.orange }]}>{streakLabel(streak)}</Text>
          <Text style={styles.metaLabel}>Seri</Text>
        </View>
        <View style={styles.metaRight}>
          <Text style={styles.metaValue}>
            {habit.noEndDate ? 'Süresiz' : endLabel}
          </Text>
          <Text style={[styles.metaLabel, { textAlign: 'right' }]}>
            {habit.noEndDate ? '' : 'Bitiş'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── HabitScreen ────────────────────────────────────────────────────────────

export default function HabitScreen() {
  const colors = useAppColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getHabits().then(h => { if (active) setHabits(h); });
      return () => { active = false; };
    }, [])
  );

  const filtered = useMemo(() => {
    if (filter === 'active') return habits.filter(h => !h.completed);
    if (filter === 'done') return habits.filter(h => h.completed);
    return habits;
  }, [habits, filter]);

  const completedCount = habits.filter(h => h.completed).length;
  const total = habits.length;

  const FILTERS: { key: 'all' | 'active' | 'done'; label: string }[] = [
    { key: 'all', label: 'Tümü' },
    { key: 'active', label: 'Devam Eden' },
    { key: 'done', label: 'Tamamlanan' },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Başlık ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Alışkanlıklarım</Text>
          <Text style={styles.subtitle}>
            {completedCount}/{total} bugün tamamlandı
          </Text>
        </View>
        <View style={[styles.progressCircle, { borderColor: colors.orange }]}>
          <Text style={styles.progressPct}>
            {total > 0 ? Math.round((completedCount / total) * 100) : 0}%
          </Text>
        </View>
      </View>

      {/* ── Filtre pill'leri ── */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.75}
            style={[
              styles.filterPill,
              filter === f.key && { backgroundColor: colors.orange },
            ]}
          >
            <Text style={[
              styles.filterText,
              filter === f.key && { color: colors.white, fontWeight: '700' },
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Liste ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Alışkanlık bulunamadı</Text>
          </View>
        ) : (
          filtered.map(h => <HabitDetailCard key={h.id} habit={h} />)
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

function createStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
      backgroundColor: colors.bg,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 3,
    },
    progressCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 3,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bg,
    },
    progressPct: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.orange,
    },

    filterRow: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    filterPill: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.surfaceAlt,
    },
    filterText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.muted,
    },

    scroll: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scrollContent: {
      paddingTop: 12,
      paddingHorizontal: 16,
    },

    // ── Kart ──
    card: {
      borderRadius: 18,
      marginBottom: 8,
      padding: 10,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.18 : 0.07,
          shadowRadius: 8,
        },
        android: { elevation: 3 },
      }),
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    iconBox: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    habitName: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },

    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginTop: 10,
      paddingHorizontal: 2,
    },
    metaLeft: {
      alignItems: 'flex-start',
      gap: 1,
    },
    metaRight: {
      alignItems: 'flex-end',
      gap: 1,
    },
    metaValue: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    metaLabel: {
      fontSize: 10,
      color: colors.muted,
      fontWeight: '400',
    },

    emptyWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 80,
      gap: 12,
    },
    emptyText: {
      fontSize: 14,
      color: colors.muted,
    },
  });
}
