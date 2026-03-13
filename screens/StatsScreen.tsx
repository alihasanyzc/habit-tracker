import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../components/ScreenHeader';
import PlusAccessGate from '../components/PlusAccessGate';
import { useAppColors, useIsDark, type AppColors } from '../constants/colors';
import IconBox from '../components/IconBox';
import NavControl from '../components/NavControl';
import PillTabs from '../components/PillTabs';
import CardFooter from '../components/CardFooter';
import type { Habit, HabitEntry, UserPlan } from '../types/habit';
import { getHabitData } from '../utils/habitRepository';
import { getPlan } from '../utils/storage';
import {
  addDaysToKey,
  getDateKeysInMonth,
  getDateKeysInYear,
  getHabitStatusOnDate,
  getWeekDateKeys,
  getTodayKey,
  parseDateKey,
  type DayStatus,
} from '../utils/habitMetrics';
import { useLanguage } from '../providers/LanguageProvider';

type TabType = 'weekly' | 'monthly' | 'yearly';

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

function MonthlyCard({ habit, entries }: { habit: Habit; entries: HabitEntry[] }) {
  const colors = useAppColors();
  const styles = useThemedStyles();
  const { t } = useLanguage();
  const months = t('dates.months') as unknown as string[];
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((value) => value - 1);
      return;
    }

    setMonth((value) => value - 1);
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((value) => value + 1);
      return;
    }

    setMonth((value) => value + 1);
  };

  const dateKeys = getDateKeysInMonth(year, month);
  const statuses = dateKeys.map((dateKey) => getHabitStatusOnDate(habit, entries, dateKey));
  const doneDays = statuses.filter((status) => status === 'done').length;
  const totalDays = statuses.filter((status) => status !== 'inactive').length;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <IconBox icon={habit.icon} iconColor={habit.iconColor} iconSize={22} size={42} borderRadius={13} bgColor={habit.bgColor} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{habit.name}</Text>
        </View>
        <NavControl label={`${months[month]} ${year}`} onPrev={prevMonth} onNext={nextMonth} />
      </View>

      {(() => {
        const perRow = Math.ceil(dateKeys.length / 2);
        const gap = 4;
        const dotSize = Math.floor((CARD_INNER - (perRow - 1) * gap) / perRow);
        const row1 = statuses.slice(0, perRow);
        const row2 = statuses.slice(perRow);

        return (
          <View style={[styles.dotGrid, { height: CARD_CONTENT_H, justifyContent: 'center', paddingVertical: 0 }]}>
            <View style={[styles.dotRow, { gap }]}>
              {row1.map((status, index) => (
                <View
                  key={dateKeys[index]}
                  style={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    ...getStatusStyle(status, habit.iconColor, colors),
                  }}
                />
              ))}
            </View>
            <View style={[styles.dotRow, { gap }]}>
              {row2.map((status, index) => (
                <View
                  key={dateKeys[perRow + index]}
                  style={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    ...getStatusStyle(status, habit.iconColor, colors),
                  }}
                />
              ))}
            </View>
          </View>
        );
      })()}

      <CardFooter done={doneDays} total={totalDays} color={habit.iconColor} bgColor={habit.bgColor} />
    </View>
  );
}

function YearlyCard({ habit, entries, year, onYearChange }: {
  habit: Habit;
  entries: HabitEntry[];
  year: number;
  onYearChange: (year: number) => void;
}) {
  const colors = useAppColors();
  const styles = useThemedStyles();
  const { t } = useLanguage();
  const MONTH_NAMES = t('dates.monthsShort') as unknown as string[];
  const square = 7;
  const squareGap = 2;
  const cell = square + squareGap;

  const dateKeys = getDateKeysInYear(year);
  const jan1 = new Date(year, 0, 1);
  const rawStart = jan1.getDay();
  const startOffset = rawStart === 0 ? 6 : rawStart - 1;
  const totalSlots = startOffset + dateKeys.length;
  const totalWeeks = Math.ceil(totalSlots / 7);
  const statuses = dateKeys.map((dateKey) => getHabitStatusOnDate(habit, entries, dateKey));
  const doneDays = statuses.filter((status) => status === 'done').length;
  const totalDays = statuses.filter((status) => status !== 'inactive').length;

  const weeks: number[][] = Array.from({ length: totalWeeks }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const slot = weekIndex * 7 + dayIndex;
      const dayOfYear = slot - startOffset;
      return dayOfYear >= 0 && dayOfYear < dateKeys.length ? dayOfYear : -1;
    })
  );

  const monthWeekStarts: number[] = [];
  for (let month = 0; month < 12; month += 1) {
    const firstOfMonth = new Date(year, month, 1);
    const dayOfYear = Math.round((firstOfMonth.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000));
    const slot = dayOfYear + startOffset;
    monthWeekStarts.push(Math.floor(slot / 7));
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <IconBox icon={habit.icon} iconColor={habit.iconColor} iconSize={22} size={42} borderRadius={13} bgColor={habit.bgColor} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{habit.name}</Text>
        </View>
        <NavControl label={String(year)} onPrev={() => onYearChange(year - 1)} onNext={() => onYearChange(year + 1)} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: CARD_CONTENT_H }}>
        <View>
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            {monthWeekStarts.map((startWeek, monthIndex) => {
              const endWeek = monthIndex < 11 ? monthWeekStarts[monthIndex + 1] : totalWeeks;
              return (
                <View key={MONTH_NAMES[monthIndex]} style={{ width: (endWeek - startWeek) * cell }}>
                  <Text style={styles.monthLabel}>{MONTH_NAMES[monthIndex]}</Text>
                </View>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', gap: squareGap }}>
            {weeks.map((week, weekIndex) => (
              <View key={`${habit.id}-${year}-${weekIndex}`} style={{ flexDirection: 'column', gap: squareGap }}>
                {week.map((dayOfYear, dayIndex) => {
                  const status = dayOfYear === -1 ? 'inactive' : statuses[dayOfYear];

                  return (
                    <View
                      key={dayIndex}
                      style={{
                        width: square,
                        height: square,
                        borderRadius: square / 2,
                        ...getStatusStyle(status, habit.iconColor, colors, dayIndex === SUN_IDX),
                      }}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

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
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('weekly');
  const [year, setYear] = useState(new Date().getFullYear());

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadScreen = async () => {
        const [currentPlan, data] = await Promise.all([getPlan(), getHabitData()]);
        if (!isActive) {
          return;
        }

        setPlan(currentPlan);
        setHabits(data.habits);
        setEntries(data.entries);
      };

      void loadScreen();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const tabs: { key: TabType; label: string }[] = [
    { key: 'weekly', label: t('stats.weekly') },
    { key: 'monthly', label: t('stats.monthly') },
    { key: 'yearly', label: t('stats.yearly') },
  ];
  const isLockedTab = plan !== 'plus' && (activeTab === 'monthly' || activeTab === 'yearly');

  if (plan === null) {
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
      <ScreenHeader title="İstatistikler" subtitle="Kayıtlı verilerden üretilen görünüm" />

      <View style={styles.tabWrap}>
        <PillTabs tabs={tabs} activeKey={activeTab} onChange={(key) => setActiveTab(key as TabType)} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!isLockedTab && habits.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t('stats.noData')}</Text>
            <Text style={styles.emptyText}>{t('stats.noDataDesc')}</Text>
          </View>
        )}

        {isLockedTab && (
          <PlusAccessGate
            embedded
            title="İstatistikler"
            subtitle="Kayıtlı verilerden üretilen görünüm"
            lockedTitle="Aylık ve yıllık istatistikler Plus üyeliğe dahil"
            lockedDescription="Haftalık görünüm açık. Aylık ve yıllık kırılımları görmek için Plus planına geçmen gerekiyor."
            benefits={[
              'Aylık görünümde daha geniş ilerleme takibi',
              'Yıllık görünümde uzun dönem alışkanlık analizi',
              'Tüm premium istatistik özelliklerine doğrudan erişim',
            ]}
          />
        )}

        {!isLockedTab && activeTab === 'weekly' && habits.map((habit) => (
          <WeeklyCard key={habit.id} habit={habit} entries={entries} />
        ))}

        {!isLockedTab && activeTab === 'monthly' && habits.map((habit) => (
          <MonthlyCard key={habit.id} habit={habit} entries={entries} />
        ))}

        {!isLockedTab && activeTab === 'yearly' && habits.map((habit) => (
          <YearlyCard key={habit.id} habit={habit} entries={entries} year={year} onYearChange={setYear} />
        ))}

        <View style={{ height: 24, backgroundColor: colors.bg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    tabWrap: { paddingHorizontal: 16, paddingBottom: 16 },
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
    dotGrid: {
      paddingVertical: 6,
      gap: 4,
    },
    dotRow: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    monthLabel: { fontSize: 9, fontWeight: '600', color: colors.dayMuted },
  });
}
