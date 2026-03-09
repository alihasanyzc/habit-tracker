import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { useAppColors, useIsDark, type AppColors } from '../constants/colors';
import IconBox from '../components/IconBox';
import NavControl from '../components/NavControl';
import PillTabs from '../components/PillTabs';
import CardFooter from '../components/CardFooter';

type TabType = 'weekly' | 'monthly' | 'yearly';

const DAY_LABELS_LONG = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SUN_IDX = 6;
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const HABITS = [
  { id: 1, name: 'Su İç', icon: 'water', color: '#FF8A1F', bgColor: '#FFF4EA', rate: 0.88, week: [true, true, true, true, true, true, false] },
  { id: 2, name: 'Meditasyon', icon: 'meditation', color: '#8FB339', bgColor: '#F4F8E6', rate: 0.68, week: [true, true, true, false, true, false, false] },
  { id: 3, name: 'Egzersiz Yap', icon: 'run', color: '#A35414', bgColor: '#F8EDE4', rate: 0.79, week: [true, true, true, true, true, true, false] },
  { id: 4, name: '8 Saat Uyu', icon: 'sleep', color: '#E78AC3', bgColor: '#FDF0F8', rate: 0.72, week: [true, true, true, true, true, true, true] },
];

const SCREEN_W = Dimensions.get('window').width;
const CARD_INNER = SCREEN_W - 32 - 32;
const CARD_CONTENT_H = 82;

function useThemedStyles() {
  const colors = useAppColors();
  const isDark = useIsDark();
  return useMemo(() => createStyles(colors, isDark), [colors, isDark]);
}

function WeeklyCard({ habit }: { habit: typeof HABITS[number] }) {
  const colors = useAppColors();
  const styles = useThemedStyles();
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const mondayDiff = today.getDay() === 0 ? -6 : 1 - today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + mondayDiff + weekOffset * 7);
  const weekLabel = `${weekStart.getDate()} ${MONTH_NAMES_TR[weekStart.getMonth()].slice(0, 3)}`;

  const weekDone: boolean[] = weekOffset === 0
    ? habit.week
    : Array.from({ length: 7 }, (_, d) => sr(habit.id * 1234 + weekOffset * 7 + d) < habit.rate);

  const doneDays = weekDone.filter(Boolean).length;
  const circleSize = Math.floor((CARD_INNER - 6 * 6) / 7);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <IconBox icon={habit.icon} iconColor={habit.color} iconSize={22} size={42} borderRadius={13} bgColor={habit.bgColor} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{habit.name}</Text>
        </View>
        <NavControl label={weekLabel} onPrev={() => setWeekOffset(w => w - 1)} onNext={() => setWeekOffset(w => w + 1)} />
      </View>

      <View style={{ height: CARD_CONTENT_H, justifyContent: 'space-around' }}>
        <View style={[styles.dayRow, { marginBottom: 0 }]}>
          {DAY_LABELS_LONG.map((label, i) => (
            <View key={i} style={{ width: circleSize, alignItems: 'center' }}>
              <Text style={[styles.dayLabel, i === SUN_IDX && { color: colors.orange }]}>{label}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.dayRow, { marginBottom: 0 }]}>
          {weekDone.map((done, i) => (
            <View
              key={i}
              style={[
                styles.dayCircle,
                { width: circleSize, height: circleSize, borderRadius: circleSize / 2 },
                done
                  ? { backgroundColor: habit.color, borderWidth: 0 }
                  : { backgroundColor: 'transparent', borderWidth: 2, borderColor: i === SUN_IDX ? colors.orangeLight : colors.border },
              ]}
            />
          ))}
        </View>
      </View>

      <CardFooter done={doneDays} total={7} color={habit.color} bgColor={habit.bgColor} />
    </View>
  );
}

function MonthlyCard({ habit }: { habit: typeof HABITS[number] }) {
  const colors = useAppColors();
  const styles = useThemedStyles();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(value => value - 1);
    } else {
      setMonth(value => value - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(value => value + 1);
    } else {
      setMonth(value => value + 1);
    }
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const isDone = (dayNum: number) =>
    sr(habit.id * 1234 + year * 400 + month * 31 + dayNum) < habit.rate;

  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    num: i + 1,
    done: isDone(i + 1),
  }));
  const doneDays = days.filter(day => day.done).length;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <IconBox icon={habit.icon} iconColor={habit.color} iconSize={22} size={42} borderRadius={13} bgColor={habit.bgColor} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{habit.name}</Text>
        </View>
        <NavControl label={MONTH_NAMES_TR[month]} onPrev={prevMonth} onNext={nextMonth} />
      </View>

      {(() => {
        const perRow = Math.ceil(daysInMonth / 2);
        const gap = 4;
        const dotSize = Math.floor((CARD_INNER - (perRow - 1) * gap) / perRow);
        const row1 = days.slice(0, perRow);
        const row2 = days.slice(perRow);

        return (
          <View style={[styles.dotGrid, { height: CARD_CONTENT_H, justifyContent: 'center', paddingVertical: 0 }]}>
            <View style={[styles.dotRow, { gap }]}>
              {row1.map(day => (
                <View
                  key={day.num}
                  style={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    backgroundColor: day.done ? habit.color : colors.dot,
                  }}
                />
              ))}
            </View>
            <View style={[styles.dotRow, { gap }]}>
              {row2.map(day => (
                <View
                  key={day.num}
                  style={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    backgroundColor: day.done ? habit.color : colors.dot,
                  }}
                />
              ))}
            </View>
          </View>
        );
      })()}

      <CardFooter done={doneDays} total={daysInMonth} color={habit.color} bgColor={habit.bgColor} />
    </View>
  );
}

function YearlyCard({ habit, year, onYearChange }: {
  habit: typeof HABITS[number];
  year: number;
  onYearChange: (y: number) => void;
}) {
  const colors = useAppColors();
  const styles = useThemedStyles();
  const square = 7;
  const squareGap = 2;
  const cell = square + squareGap;

  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);
  const totalDays = Math.round((dec31.getTime() - jan1.getTime()) / 86400000) + 1;
  const rawStart = jan1.getDay();
  const startOffset = rawStart === 0 ? 6 : rawStart - 1;
  const totalSlots = startOffset + totalDays;
  const totalWeeks = Math.ceil(totalSlots / 7);

  const isDone = (dayOfYear: number) =>
    sr(habit.id * 1234 + year * 400 + dayOfYear) < habit.rate;

  const weeks: number[][] = Array.from({ length: totalWeeks }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const slot = weekIndex * 7 + dayIndex;
      const dayOfYear = slot - startOffset;
      return dayOfYear >= 0 && dayOfYear < totalDays ? dayOfYear : -1;
    })
  );

  const monthWeekStarts: number[] = [];
  for (let month = 0; month < 12; month++) {
    const firstOfMonth = new Date(year, month, 1);
    const dayOfYear = Math.round((firstOfMonth.getTime() - jan1.getTime()) / 86400000);
    const slot = dayOfYear + startOffset;
    monthWeekStarts.push(Math.floor(slot / 7));
  }

  let doneDays = 0;
  for (let day = 0; day < totalDays; day++) {
    if (isDone(day)) doneDays++;
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <IconBox icon={habit.icon} iconColor={habit.color} iconSize={22} size={42} borderRadius={13} bgColor={habit.bgColor} />
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
                <View key={monthIndex} style={{ width: (endWeek - startWeek) * cell }}>
                  <Text style={styles.monthLabel}>{MONTH_NAMES[monthIndex]}</Text>
                </View>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', gap: squareGap }}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={{ flexDirection: 'column', gap: squareGap }}>
                {week.map((dayOfYear, dayIndex) => (
                  <View
                    key={dayIndex}
                    style={{
                      width: square,
                      height: square,
                      borderRadius: square / 2,
                      backgroundColor: dayOfYear === -1 ? 'transparent' : (isDone(dayOfYear) ? habit.color : colors.dot),
                    }}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <CardFooter done={doneDays} total={totalDays} color={habit.color} bgColor={habit.bgColor} />
    </View>
  );
}

export default function StatsScreen() {
  const colors = useAppColors();
  const styles = useThemedStyles();
  const [activeTab, setActiveTab] = useState<TabType>('weekly');
  const [year, setYear] = useState(2025);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'weekly', label: 'Haftalık' },
    { key: 'monthly', label: 'Aylık' },
    { key: 'yearly', label: 'Yıllık' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="İstatistikler" subtitle="Alışkanlık takibi" />

      <View style={styles.tabWrap}>
        <PillTabs tabs={tabs} activeKey={activeTab} onChange={key => setActiveTab(key as TabType)} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'weekly' && HABITS.map(habit => (
          <WeeklyCard key={habit.id} habit={habit} />
        ))}

        {activeTab === 'monthly' && HABITS.map(habit => (
          <MonthlyCard key={habit.id} habit={habit} />
        ))}

        {activeTab === 'yearly' && HABITS.map(habit => (
          <YearlyCard key={habit.id} habit={habit} year={year} onYearChange={setYear} />
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
