import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../components/ScreenHeader';
import { useAppColors, useIsDark, type AppColors } from '../constants/colors';
import IconBox from '../components/IconBox';
import NavControl from '../components/NavControl';
import CardFooter from '../components/CardFooter';
import type { Habit, HabitEntry } from '../types/habit';
import { getHabitData } from '../utils/habitRepository';
import {
  addDaysToKey,
  getHabitStatusOnDate,
  getWeekDateKeys,
  getTodayKey,
  parseDateKey,
  type DayStatus,
} from '../utils/habitMetrics';
import { useLanguage } from '../providers/LanguageProvider';

const SUN_IDX = 6;

const SCREEN_W = Dimensions.get('window').width;
const CARD_INNER = SCREEN_W - 32 - 32;
const CARD_CONTENT_H = 82;

function useThemedStyles() {
  const colors = useAppColors();
  const isDark = useIsDark();
  return useMemo(() => createStyles(colors, isDark), [colors, isDark]);
}

function getStatusStyle(status: DayStatus, accentColor: string, colors: ReturnType<typeof useAppColors>, isSunday?: boolean) {
  if (status === 'done') {
    return {
      backgroundColor: accentColor,
      borderWidth: 0,
      opacity: 1,
    };
  }

  if (status === 'inactive') {
    return {
      backgroundColor: colors.dot,
      borderWidth: 0,
      opacity: 0.35,
    };
  }

  return {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: isSunday ? colors.orangeLight : colors.border,
    opacity: 1,
  };
}

function WeeklyCard({ habit, entries }: { habit: Habit; entries: HabitEntry[] }) {
  const colors = useAppColors();
  const styles = useThemedStyles();
  const { t } = useLanguage();
  const [weekOffset, setWeekOffset] = useState(0);
  const anchor = addDaysToKey(getTodayKey(), weekOffset * 7);
  const weekDates = getWeekDateKeys(anchor);
  const weekStart = parseDateKey(weekDates[0]);
  const monthsShort = t('dates.monthsShort') as unknown as string[];
  const weekLabel = `${weekStart.getDate()} ${monthsShort[weekStart.getMonth()]}`;
  const statuses = weekDates.map((dateKey) => getHabitStatusOnDate(habit, entries, dateKey));
  const doneDays = statuses.filter((status) => status === 'done').length;
  const totalDays = statuses.filter((status) => status !== 'inactive').length;
  const circleSize = Math.floor((CARD_INNER - 6 * 6) / 7);
  const dayLabels = t('dates.weekdaysShort') as unknown as string[];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <IconBox icon={habit.icon} iconColor={habit.iconColor} iconSize={22} size={42} borderRadius={13} bgColor={habit.bgColor} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{habit.name}</Text>
        </View>
        <NavControl label={weekLabel} onPrev={() => setWeekOffset((value) => value - 1)} onNext={() => setWeekOffset((value) => value + 1)} />
      </View>

      <View style={{ height: CARD_CONTENT_H, justifyContent: 'space-around' }}>
        <View style={[styles.dayRow, { marginBottom: 0 }]}>
          {dayLabels.map((label, index) => (
            <View key={label} style={{ width: circleSize, alignItems: 'center' }}>
              <Text style={[styles.dayLabel, index === SUN_IDX && { color: colors.orange }]}>{label}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.dayRow, { marginBottom: 0 }]}>
          {statuses.map((status, index) => (
            <View
              key={weekDates[index]}
              style={[
                styles.dayCircle,
                { width: circleSize, height: circleSize, borderRadius: circleSize / 2 },
                getStatusStyle(status, habit.iconColor, colors, index === SUN_IDX),
              ]}
            />
          ))}
        </View>
      </View>

      <CardFooter done={doneDays} total={totalDays} color={habit.iconColor} bgColor={habit.bgColor} />
    </View>
  );
}

export default function StatsScreen() {
  const colors = useAppColors();
  const styles = useThemedStyles();
  const { t } = useLanguage();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [isReady, setIsReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadScreen = async () => {
        const data = await getHabitData();
        if (!isActive) {
          return;
        }

        setHabits(data.habits);
        setEntries(data.entries);
        setIsReady(true);
      };

      void loadScreen();

      return () => {
        isActive = false;
      };
    }, [])
  );

  if (!isReady) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title={t('stats.statistics')} subtitle={t('stats.subtitle')} />
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}></Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={t('stats.statistics')} subtitle={t('stats.subtitle')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {habits.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t('stats.noData')}</Text>
            <Text style={styles.emptyText}>{t('stats.noDataDesc')}</Text>
          </View>
        )}

        {habits.map((habit) => (
          <WeeklyCard key={habit.id} habit={habit} entries={entries} />
        ))}

        <View style={{ height: 24, backgroundColor: colors.bg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
    loadingState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    loadingText: {
      fontSize: 14,
      color: colors.muted,
    },
    emptyState: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 20,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    emptyText: {
      fontSize: 13,
      color: colors.muted,
      lineHeight: 18,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 16,
      marginBottom: 14,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowSoft,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.24 : 0.07,
          shadowRadius: 10,
        },
        android: { elevation: 3 },
      }),
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 15, fontWeight: '700', color: colors.text },
    dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    dayLabel: { fontSize: 11, fontWeight: '600', color: colors.muted, textAlign: 'center' },
    dayCircle: { alignItems: 'center', justifyContent: 'center' },
  });
}
