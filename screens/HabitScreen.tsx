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
      {/* ── Üst satır: ikon + isim + tamamlanma rozeti ── */}
      <View style={styles.cardTop}>
        <View style={[styles.iconBox, { backgroundColor: colors.translucentCard }]}>
          <MaterialCommunityIcons name={habit.icon as any} size={22} color={habit.iconColor} />
        </View>

        <Text style={styles.habitName} numberOfLines={1}>{habit.name}</Text>

        {habit.completed && (
          <View style={[styles.doneBadge, { backgroundColor: colors.softSuccessBg }]}>
            <Ionicons name="checkmark-circle" size={16} color={colors.green} />
          </View>
        )}
      </View>

      {/* ── Divider ── */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* ── Alt satır: 3 bilgi kutusu ── */}
      <View style={styles.metaRow}>
        {/* Streak */}
        <View style={styles.metaItem}>
          <View style={[styles.metaIconWrap, { backgroundColor: colors.orangeBg }]}>
            <Ionicons name="flame" size={14} color={colors.orange} />
          </View>
          <Text style={styles.metaValue}>{streakLabel(streak)}</Text>
          <Text style={styles.metaLabel}>Seri</Text>
        </View>

        {/* Başlangıç tarihi */}
        <View style={[styles.metaItem, styles.metaItemBordered, { borderColor: colors.border }]}>
          <View style={[styles.metaIconWrap, { backgroundColor: colors.purpleLight }]}>
            <Ionicons name="calendar-outline" size={14} color={colors.purple} />
          </View>
          <Text style={styles.metaValue}>{startLabel}</Text>
          <Text style={styles.metaLabel}>Başlangıç</Text>
        </View>

        {/* Bitiş tarihi */}
        <View style={styles.metaItem}>
          <View style={[styles.metaIconWrap, { backgroundColor: colors.softInfoBg }]}>
            <Ionicons name="flag-outline" size={14} color={colors.orangeDark} />
          </View>
          <Text style={styles.metaValue}>{endLabel}</Text>
          <Text style={styles.metaLabel}>Bitiş</Text>
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
            <Ionicons name="list-outline" size={48} color={colors.border} />
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
      backgroundColor: colors.screen,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
      backgroundColor: colors.screen,
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
    doneBadge: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      borderRadius: 14,
    },
    doneBadgeText: {
      fontSize: 11,
      fontWeight: '600',
    },

    divider: {
      height: 1,
      marginVertical: 8,
      marginHorizontal: 2,
    },

    metaRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    metaItem: {
      flex: 1,
      alignItems: 'center',
      gap: 3,
    },
    metaItemBordered: {
      borderLeftWidth: 1,
      borderRightWidth: 1,
    },
    metaIconWrap: {
      width: 24,
      height: 24,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
    },
    metaValue: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    metaLabel: {
      fontSize: 10,
      color: colors.muted,
      fontWeight: '400',
      textAlign: 'center',
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
