import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScreenHeader from '../components/ScreenHeader';
import { getThemedAccentSurface, useAppColors, useIsDark, type AppColors } from '../constants/colors';
import { deleteHabit, getHabitData } from '../utils/habitRepository';
import { getHabitStreak } from '../utils/habitMetrics';
import { useToast } from '../components/ToastProvider';
import type { Habit, HabitEntry } from '../types/habit';
import { useLanguage } from '../providers/LanguageProvider';

const SCREEN_W = Dimensions.get('window').width;
const ACTION_WIDTH = 72;
const ACTIONS_TOTAL = ACTION_WIDTH * 2;

// ─── Swipeable Card ─────────────────────────────────────────────────────────

function HabitDetailCard({
  habit,
  entries,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  entries: HabitEntry[];
  onEdit: (h: Habit) => void;
  onDelete: (h: Habit) => void;
}) {
  const colors = useAppColors();
  const isDark = useIsDark();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const surface = useMemo(
    () => getThemedAccentSurface(habit.bgColor, colors, isDark, 0.8),
    [habit.bgColor, colors, isDark]
  );
  const streak = getHabitStreak(habit, entries);

  const translateX = useRef(new Animated.Value(0)).current;
  const startX = useRef(0);
  const currentX = useRef(0);

  const onTouchStart = (e: any) => {
    startX.current = e.nativeEvent.pageX;
  };

  const onTouchMove = (e: any) => {
    const dx = e.nativeEvent.pageX - startX.current;
    const clamped = Math.max(-ACTIONS_TOTAL, Math.min(0, dx + currentX.current));
    translateX.setValue(clamped);
  };

  const onTouchEnd = (e: any) => {
    const dx = e.nativeEvent.pageX - startX.current;
    const next = dx + currentX.current;
    const target = next < -ACTIONS_TOTAL / 2 ? -ACTIONS_TOTAL : 0;
    currentX.current = target;
    Animated.spring(translateX, {
      toValue: target,
      useNativeDriver: true,
      tension: 180,
      friction: 22,
    }).start();
  };

  const closeSwipe = () => {
    currentX.current = 0;
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 180,
      friction: 22,
    }).start();
  };

  return (
    <View style={styles.cardWrap}>
      {/* ── Action buttons behind the card ── */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.orange }]}
          activeOpacity={0.8}
          onPress={() => { closeSwipe(); onEdit(habit); }}
        >
          <MaterialCommunityIcons name="pencil-outline" size={20} color="#FFF" />
          <Text style={styles.actionLabel}>{t('common.edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.red }]}
          activeOpacity={0.8}
          onPress={() => { closeSwipe(); onDelete(habit); }}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FFF" />
          <Text style={styles.actionLabel}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Card (slides left) ── */}
      <Animated.View
        style={[styles.card, { backgroundColor: surface, transform: [{ translateX }] }]}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderStart={onTouchStart}
        onResponderMove={onTouchMove}
        onResponderRelease={onTouchEnd}
      >
        <View style={styles.emojiBox}>
          <MaterialCommunityIcons name={habit.icon as any} size={22} color={habit.iconColor} />
        </View>
        <Text style={styles.habitName} numberOfLines={1}>{habit.name}</Text>
        <View style={styles.rightBlock}>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={12} color={colors.orange} />
            <Text style={styles.streakValue}>{streak}</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── HabitScreen ────────────────────────────────────────────────────────────

export default function HabitScreen() {
  const colors = useAppColors();
  const isDark = useIsDark();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { showToast } = useToast();
  const navigation = useNavigation<any>();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

  const reload = useCallback(() => {
    getHabitData().then((data) => {
      setHabits(data.habits);
      setEntries(data.entries);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getHabitData().then((data) => {
        if (!active) return;
        setHabits(data.habits);
        setEntries(data.entries);
      });
      return () => { active = false; };
    }, [])
  );

  const handleDelete = useCallback((habit: Habit) => {
    Alert.alert(
      t('habit.deleteHabit'),
      t('habit.deleteConfirm', { name: habit.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteHabit(habit.id);
            reload();
            showToast({ type: 'success', title: t('habit.deleted'), message: t('habit.deletedMsg', { name: habit.name }) });
          },
        },
      ]
    );
  }, [reload, showToast]);

  const handleEdit = useCallback((habit: Habit) => {
    navigation.navigate('Create', { habit });
  }, [navigation]);

  const filtered = useMemo(() => {
    if (filter === 'active') return habits.filter(h => !h.completed);
    if (filter === 'done') return habits.filter(h => h.completed);
    return habits;
  }, [habits, filter]);

  const completedCount = habits.filter(h => h.completed).length;
  const total = habits.length;

  const FILTERS: { key: 'all' | 'active' | 'done'; label: string }[] = [
    { key: 'all', label: t('habit.all') },
    { key: 'active', label: t('habit.active') },
    { key: 'done', label: t('habit.done') },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader
        title={t('habit.myHabits')}
        subtitle={t('habit.completedToday', { completed: completedCount, total })}
      />

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

      {/* ── Swipe ipucu ── */}
      {total > 0 && (
        <Text style={styles.swipeHint}>{t('habit.swipeHint')}</Text>
      )}

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
          filtered.map(h => (
            <HabitDetailCard
              key={h.id}
              habit={h}
              entries={entries}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

function createStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.bg,
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

    swipeHint: {
      fontSize: 11,
      color: colors.muted,
      textAlign: 'center',
      marginBottom: 4,
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
      overflow: 'hidden',
      borderRadius: 16,
      marginHorizontal: 0,
    },
    actionsRow: {
      position: 'absolute',
      right: 16,
      top: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'stretch',
      borderRadius: 16,
      overflow: 'hidden',
    },
    actionBtn: {
      width: ACTION_WIDTH,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
    },
    actionLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: '#FFF',
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
