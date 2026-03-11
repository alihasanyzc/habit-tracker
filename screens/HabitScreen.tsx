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
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getThemedAccentSurface, useAppColors, useIsDark, type AppColors } from '../constants/colors';
import { getHabits } from '../utils/habitRepository';
import type { Habit } from '../types/habit';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  const dd = d.getDate().toString().padStart(2, '0');
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
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
    () => getThemedAccentSurface(habit.bgColor, colors, isDark, 0.8),
    [habit.bgColor, colors, isDark]
  );
  const streak = calcStreak(habit);
  const startLabel = formatDate(habit.startDate);
  const endLabel = habit.noEndDate ? 'Süresiz' : habit.endDate ? formatDate(habit.endDate) : 'Süresiz';
  const hasEnd = !habit.noEndDate && !!habit.endDate;

  return (
    <View style={styles.cardWrap}>
      <View style={[styles.card, { backgroundColor: surface }]}>
        {/* ── İkon ── */}
        <View style={styles.emojiBox}>
          <MaterialCommunityIcons name={habit.icon as any} size={22} color={habit.iconColor} />
        </View>

        {/* ── İsim (flex: 1, ortada) ── */}
        <Text style={styles.habitName} numberOfLines={1}>{habit.name}</Text>

        {/* ── Sağ blok: üstte 🔥 sayı, altta tarih bilgisi ── */}
        <View style={styles.rightBlock}>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={12} color={colors.orange} />
            <Text style={styles.streakValue}>{streak}</Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateValue}>
              {startLabel} - {hasEnd ? endLabel : 'Süresiz'}
            </Text>
          </View>
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
      paddingTop: 8,
      paddingBottom: 10,
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
    },

    // ── Kart ──
    cardWrap: {
      paddingHorizontal: 16,
      marginBottom: 7,
    },
    card: {
      borderRadius: 16,
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? 0.14 : 0.06,
          shadowRadius: 6,
        },
        android: { elevation: 2 },
      }),
    },
    emojiBox: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: colors.translucentCard,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    habitName: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    rightBlock: {
      alignItems: 'flex-end',
      gap: 4,
      flexShrink: 0,
    },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: colors.orangeBg,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 20,
    },
    streakValue: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.orange,
    },
    dateBlock: {
      alignItems: 'flex-end',
      gap: 1,
    },
    dateRow: {
      fontSize: 10,
      color: colors.muted,
    },
    dateLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.muted,
    },
    dateValue: {
      fontSize: 10,
      fontWeight: '500',
      color: colors.muted,
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
