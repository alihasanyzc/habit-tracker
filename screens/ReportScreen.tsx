import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Dimensions, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, {
  Rect, Path, Circle, Defs, LinearGradient as SvgGradient,
  Stop, G, Text as SvgText, Polygon,
} from 'react-native-svg';
import ScreenHeader from '../components/ScreenHeader';
import PlusAccessGate from '../components/PlusAccessGate';
import Dropdown from '../components/Dropdown';
import { ACCENT, useAppColors, useIsDark, type AppColors } from '../constants/colors';
import type { Habit, HabitEntry, UserPlan } from '../types/habit';
import { getHabitData } from '../utils/habitRepository';
import { getPlan } from '../utils/storage';
import {
  countCompletedHabitsForDate,
  getCompletionRateForRange,
  getDateKeysBetween,
  getDateKeysInMonth,
  getHabitStreak,
  getScheduledHabitsForDate,
  getTodayKey,
  getWeekDateKeys,
  parseDateKey,
} from '../utils/habitMetrics';
import { useLanguage } from '../providers/LanguageProvider';
import i18n from '../utils/i18n';

const W = Dimensions.get('window').width;
const CARD_W = W - 32;
const CHART_INNER = CARD_W - 32;

type StatCard = { value: string; label: string; accent: string };
type BarItem = { label: string; val: number };
type BarConfig = { items: BarItem[]; yMax: number; yTicks: number[]; defaultIdx: number };
type LineItem = { label: string; val: number };
type LineConfig = { items: LineItem[]; activeIdx: number };

function useThemedStyles() {
  const colors = useAppColors();
  const isDark = useIsDark();
  return useMemo(() => createStyles(colors, isDark), [colors, isDark]);
}

function buildBezierPath(
  points: { x: number; y: number }[],
  chartH: number
): { linePath: string; areaPath: string } {
  if (points.length < 2) return { linePath: '', areaPath: '' };

  let line = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const current = points[i];
    const controlPointX = (prev.x + current.x) / 2;
    line += ` C ${controlPointX} ${prev.y} ${controlPointX} ${current.y} ${current.x} ${current.y}`;
  }

  const last = points[points.length - 1];
  const first = points[0];
  const area = `${line} L ${last.x} ${chartH} L ${first.x} ${chartH} Z`;
  return { linePath: line, areaPath: area };
}

function buildAxis(values: number[]) {
  const maxValue = Math.max(0, ...values);
  const step = Math.max(1, Math.ceil(maxValue / 4));
  const yMax = Math.max(4, step * 4);

  return {
    yMax,
    yTicks: Array.from({ length: 4 }, (_, index) => step * (index + 1)),
  };
}

function countCompletedInRange(habits: Habit[], entries: HabitEntry[], startDate: string, endDate: string) {
  return getDateKeysBetween(startDate, endDate).reduce(
    (sum, dateKey) => sum + countCompletedHabitsForDate(habits, entries, dateKey),
    0
  );
}

function monthRange(year: number, month: number) {
  const dates = getDateKeysInMonth(year, month);
  return {
    start: dates[0],
    end: dates[dates.length - 1],
  };
}

function getTimelineStart(habits: Habit[], entries: HabitEntry[]) {
  const candidates = [...habits.map((habit) => habit.startDate), ...entries.map((entry) => entry.date)]
    .sort((left, right) => left.localeCompare(right));

  return candidates[0] ?? getTodayKey();
}

function buildStatCards(habits: Habit[], entries: HabitEntry[]): StatCard[] {
  const timelineStart = getTimelineStart(habits, entries);
  const today = getTodayKey();
  const overall = getCompletionRateForRange(habits, entries, timelineStart, today);
  const bestCurrentStreak = habits.reduce(
    (best, habit) => Math.max(best, getHabitStreak(habit, entries)),
    0
  );
  const completedTotal = entries.filter((entry) => entry.completed).length;
  const perfectDays = getDateKeysBetween(timelineStart, today).reduce((count, dateKey) => {
    const scheduled = getScheduledHabitsForDate(habits, dateKey).length;
    if (scheduled === 0) {
      return count;
    }

    return count + (countCompletedHabitsForDate(habits, entries, dateKey) === scheduled ? 1 : 0);
  }, 0);

  return [
    { value: `${bestCurrentStreak} ${i18n.t('common.days')}`, label: i18n.t('report.currentStreak'), accent: ACCENT.orange },
    { value: `%${overall.rate}`, label: i18n.t('report.completionRate'), accent: ACCENT.green },
    { value: completedTotal.toLocaleString(), label: i18n.t('report.completedHabits'), accent: ACCENT.brown },
    { value: perfectDays.toLocaleString(), label: i18n.t('report.perfectDays'), accent: ACCENT.pink },
  ];
}

function buildBarConfigs(habits: Habit[], entries: HabitEntry[]): Record<string, BarConfig> {
  const today = new Date();
  const todayKey = getTodayKey();
  const weekDates = getWeekDateKeys(todayKey);
  const weekItems = weekDates.map((dateKey) => ({
    label: `${parseDateKey(dateKey).getDate()}`,
    val: countCompletedHabitsForDate(habits, entries, dateKey),
  }));
  const weekAxis = buildAxis(weekItems.map((item) => item.val));

  const monthDates = getDateKeysInMonth(today.getFullYear(), today.getMonth());
  const monthChunks = Array.from({ length: Math.ceil(monthDates.length / 7) }, (_, index) =>
    monthDates.slice(index * 7, index * 7 + 7)
  );
  const monthItems = monthChunks.map((chunk, index) => ({
    label: `${i18n.t('report.weekAbbr')}${index + 1}`,
    val: chunk.reduce((sum, dateKey) => sum + countCompletedHabitsForDate(habits, entries, dateKey), 0),
  }));
  const monthAxis = buildAxis(monthItems.map((item) => item.val));

  const monthsChartShort = i18n.t('dates.monthsChartShort') as unknown as string[];
  const yearItems = Array.from({ length: 12 }, (_, month) => {
    const range = monthRange(today.getFullYear(), month);
    return {
      label: monthsChartShort[month],
      val: countCompletedInRange(habits, entries, range.start, range.end),
    };
  });
  const yearAxis = buildAxis(yearItems.map((item) => item.val));

  return {
    [i18n.t('report.thisWeek')]: {
      items: weekItems,
      yMax: weekAxis.yMax,
      yTicks: weekAxis.yTicks,
      defaultIdx: weekItems.length - 1,
    },
    [i18n.t('report.thisMonth')]: {
      items: monthItems,
      yMax: monthAxis.yMax,
      yTicks: monthAxis.yTicks,
      defaultIdx: monthItems.length - 1,
    },
    [i18n.t('report.thisYear')]: {
      items: yearItems,
      yMax: yearAxis.yMax,
      yTicks: yearAxis.yTicks,
      defaultIdx: new Date().getMonth(),
    },
  };
}

function buildLineConfigs(habits: Habit[], entries: HabitEntry[]): Record<string, LineConfig> {
  const now = new Date();
  const monthsChartShort = i18n.t('dates.monthsChartShort') as unknown as string[];
  const recentSixMonths = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const range = monthRange(date.getFullYear(), date.getMonth());
    return {
      label: monthsChartShort[date.getMonth()],
      val: getCompletionRateForRange(habits, entries, range.start, range.end).rate,
    };
  });

  const previousYear = now.getFullYear() - 1;
  const previousYearItems = Array.from({ length: 12 }, (_, month) => {
    const range = monthRange(previousYear, month);
    return {
      label: monthsChartShort[month],
      val: getCompletionRateForRange(habits, entries, range.start, range.end).rate,
    };
  });

  const timelineStart = parseDateKey(getTimelineStart(habits, entries));
  const currentQuarter = Math.floor(now.getMonth() / 3);
  const currentYear = now.getFullYear();
  const quarterItems: LineItem[] = [];
  let year = timelineStart.getFullYear();
  let quarter = Math.floor(timelineStart.getMonth() / 3);

  while (year < currentYear || (year === currentYear && quarter <= currentQuarter)) {
    const startMonth = quarter * 3;
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, startMonth + 3, 0);
    quarterItems.push({
      label: `${String(year).slice(-2)}${i18n.t('report.quarterAbbr')}${quarter + 1}`,
      val: getCompletionRateForRange(
        habits,
        entries,
        `${startDate.getFullYear()}-${`${startDate.getMonth() + 1}`.padStart(2, '0')}-01`,
        `${endDate.getFullYear()}-${`${endDate.getMonth() + 1}`.padStart(2, '0')}-${`${endDate.getDate()}`.padStart(2, '0')}`
      ).rate,
    });

    quarter += 1;
    if (quarter > 3) {
      quarter = 0;
      year += 1;
    }
  }

  return {
    [i18n.t('report.last6Months')]: {
      items: recentSixMonths,
      activeIdx: recentSixMonths.length - 1,
    },
    [i18n.t('report.lastYear')]: {
      items: previousYearItems,
      activeIdx: previousYearItems.length - 1,
    },
    [i18n.t('report.allTime')]: {
      items: quarterItems,
      activeIdx: quarterItems.length - 1,
    },
  };
}

const BAR_H = 200;
const Y_AXIS_W = 28;
const X_AXIS_H = 20;
const PIN_H = 46;
const TOP_PAD = PIN_H + 10;
const PLOT_H = BAR_H - TOP_PAD - X_AXIS_H;

function BarChartSvg({ config, activeIdx, onBarPress, progress = 1 }: {
  config: BarConfig;
  activeIdx: number;
  onBarPress: (index: number) => void;
  progress?: number;
}) {
  const colors = useAppColors();
  const itemCount = config.items.length;
  const svgWidth = Math.max(CHART_INNER, Y_AXIS_W + itemCount * 45 + 16);
  const plotWidth = svgWidth - Y_AXIS_W - 16;
  const gap = plotWidth / Math.max(itemCount * 1.6, 1);
  const barWidth = itemCount > 0 ? (plotWidth - gap * (itemCount - 1)) / itemCount : plotWidth;

  const barX = (index: number) => Y_AXIS_W + index * (barWidth + gap);
  const barHeight = (value: number) => config.yMax > 0 ? (value / config.yMax) * PLOT_H * progress : 0;
  const barY = (value: number) => TOP_PAD + (PLOT_H - barHeight(value));

  return (
    <Svg width={svgWidth} height={BAR_H}>
      {config.yTicks.map((tick) => {
        const tickY = TOP_PAD + PLOT_H - (tick / config.yMax) * PLOT_H;
        return (
          <G key={tick}>
            <SvgText
              x={Y_AXIS_W - 4}
              y={tickY + 4}
              textAnchor="end"
              fontSize={10}
              fill={colors.axisTick}
            >
              {tick}
            </SvgText>
          </G>
        );
      })}

      {config.items.map((item, index) => {
        const x = barX(index);
        const height = barHeight(item.val);
        const y = barY(item.val);
        const isActive = index === activeIdx;
        const centerX = x + barWidth / 2;

        return (
          <G key={item.label}>
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={height}
              rx={6}
              ry={6}
              fill={isActive ? colors.orange : colors.orangeLight}
              onPress={() => onBarPress(index)}
            />
            <SvgText
              x={centerX}
              y={TOP_PAD + PLOT_H + X_AXIS_H - 4}
              textAnchor="middle"
              fontSize={itemCount > 7 ? 9 : 11}
              fill={colors.muted}
            >
              {item.label}
            </SvgText>
            {isActive && (
              <G>
                <Rect
                  x={centerX - 27}
                  y={y - PIN_H - 6}
                  width={54}
                  height={PIN_H - 4}
                  rx={12}
                  ry={12}
                  fill={colors.surface}
                />
                <SvgText
                  x={centerX}
                  y={y - PIN_H + 12}
                  textAnchor="middle"
                  fontSize={15}
                  fontWeight="800"
                  fill={colors.orange}
                >
                  {item.val}
                </SvgText>
                <SvgText
                  x={centerX}
                  y={y - PIN_H + 26}
                  textAnchor="middle"
                  fontSize={9}
                  fill={colors.axisTick}
                >
                  {i18n.t('report.habitLabel')}
                </SvgText>
                <Polygon
                  points={`${centerX - 5},${y - 6} ${centerX + 5},${y - 6} ${centerX},${y - 1}`}
                  fill={colors.surface}
                />
              </G>
            )}
          </G>
        );
      })}
    </Svg>
  );
}

const LINE_H = 200;
const LY_AXIS_W = 32;
const LX_AXIS_H = 20;
const LTOP_PAD = 50;
const LPLOT_H = LINE_H - LTOP_PAD - LX_AXIS_H;

function AreaChartSvg({ config, activeIdx, onDotPress }: {
  config: LineConfig;
  activeIdx: number;
  onDotPress: (index: number) => void;
}) {
  const colors = useAppColors();
  const itemCount = config.items.length;
  const svgWidth = Math.max(CHART_INNER, LY_AXIS_W + Math.max(itemCount - 1, 1) * 55 + 32);
  const plotWidth = svgWidth - LY_AXIS_W - 32;
  const step = plotWidth / Math.max(itemCount - 1, 1);
  const toY = (value: number) => LTOP_PAD + LPLOT_H - (value / 100) * LPLOT_H;
  const points = config.items.map((item, index) => ({
    x: LY_AXIS_W + index * step,
    y: toY(item.val),
  }));
  const { linePath, areaPath } = buildBezierPath(points, LTOP_PAD + LPLOT_H);

  return (
    <Svg width={svgWidth} height={LINE_H}>
      <Defs>
        <SvgGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.orange} stopOpacity={0.22} />
          <Stop offset="1" stopColor={colors.orange} stopOpacity={0.02} />
        </SvgGradient>
      </Defs>

      <SvgText
        x={LY_AXIS_W - 4}
        y={LTOP_PAD + 4}
        textAnchor="end"
        fontSize={10}
        fill={colors.axisTick}
      >
        100%
      </SvgText>

      <Path d={areaPath} fill="url(#areaFill)" />
      <Path d={linePath} stroke={colors.orange} strokeWidth={2.5} fill="none" strokeLinecap="round" />

      {points.map((point, index) => {
        const isActive = index === activeIdx;
        const item = config.items[index];
        return (
          <G key={item.label}>
            {isActive ? (
              <>
                <Circle cx={point.x} cy={point.y} r={20} fill={colors.orange} opacity={0.12} />
                <Circle cx={point.x} cy={point.y} r={8} fill={colors.orange} />
                <Rect
                  x={point.x - 26}
                  y={point.y - 46}
                  width={52}
                  height={26}
                  rx={13}
                  ry={13}
                  fill={colors.orange}
                />
                <SvgText
                  x={point.x}
                  y={point.y - 28}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight="700"
                  fill={colors.white}
                >
                  {item.val}%
                </SvgText>
              </>
            ) : (
              <>
                <Circle cx={point.x} cy={point.y} r={4} fill={colors.surface} />
                <Circle cx={point.x} cy={point.y} r={4} fill="none" stroke={colors.orangeLight} strokeWidth={2} />
              </>
            )}
            <Rect
              x={point.x - 16}
              y={point.y - 16}
              width={32}
              height={32}
              fill="transparent"
              onPress={() => onDotPress(index)}
            />
            <SvgText
              x={point.x}
              y={LTOP_PAD + LPLOT_H + LX_AXIS_H - 4}
              textAnchor="middle"
              fontSize={itemCount > 8 ? 9 : 11}
              fill={colors.muted}
            >
              {item.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

export default function ReportScreen() {
  const styles = useThemedStyles();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const statCards = useMemo(() => buildStatCards(habits, entries), [habits, entries]);
  const barConfigs = useMemo(() => buildBarConfigs(habits, entries), [habits, entries]);
  const lineConfigs = useMemo(() => buildLineConfigs(habits, entries), [habits, entries]);
  const { t } = useLanguage();
  const [barPeriod, setBarPeriod] = useState(i18n.t('report.thisWeek'));
  const [linePeriod, setLinePeriod] = useState(i18n.t('report.last6Months'));
  const [activeBarIdx, setActiveBarIdx] = useState(0);
  const [activeLineIdx, setActiveLineIdx] = useState(0);

  const chartAnim = useRef(new Animated.Value(0)).current;
  const barScaleAnim = useRef(new Animated.Value(1)).current;
  const lineScaleAnim = useRef(new Animated.Value(1)).current;
  const [chartProgress, setChartProgress] = useState(0);

  useEffect(() => {
    const id = chartAnim.addListener(({ value }) => setChartProgress(value));
    return () => chartAnim.removeListener(id);
  }, [chartAnim]);

  useEffect(() => {
    setActiveBarIdx(barConfigs[barPeriod]?.defaultIdx ?? 0);
  }, [barConfigs, barPeriod]);

  useEffect(() => {
    setActiveLineIdx(lineConfigs[linePeriod]?.activeIdx ?? 0);
  }, [lineConfigs, linePeriod]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadScreen = async () => {
        const currentPlan = await getPlan();
        if (!isActive) {
          return;
        }

        setPlan(currentPlan);

        if (currentPlan !== 'plus') {
          return;
        }

        const data = await getHabitData();
        if (!isActive) {
          return;
        }

        setHabits(data.habits);
        setEntries(data.entries);
      };

      void loadScreen();

      chartAnim.setValue(0);
      Animated.timing(chartAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }).start();

      return () => {
        isActive = false;
      };
    }, [chartAnim])
  );

  const handleBarPeriod = (value: string) => {
    Animated.sequence([
      Animated.timing(barScaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(barScaleAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    setBarPeriod(value);
  };

  const handleLinePeriod = (value: string) => {
    Animated.sequence([
      Animated.timing(lineScaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(lineScaleAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    setLinePeriod(value);
  };

  const barConfig = barConfigs[barPeriod] ?? { items: [], yMax: 4, yTicks: [1, 2, 3, 4], defaultIdx: 0 };
  const lineConfig = lineConfigs[linePeriod] ?? { items: [], activeIdx: 0 };

  if (plan !== null && plan !== 'plus') {
    return (
      <PlusAccessGate
        title={t('report.reports')}
        subtitle={t('report.subtitle')}
        lockedTitle={t('gate.reportsLockedTitle')}
        lockedDescription={t('gate.reportsLockedDesc')}
        benefits={[
          t('gate.reportsBenefit1'),
          t('gate.reportsBenefit2'),
          t('gate.reportsBenefit3'),
        ]}
      />
    );
  }

  if (plan === null) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title={t('report.reports')} subtitle={t('report.subtitle')} />
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>{t('report.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={t('report.reports')} subtitle={t('report.subtitle')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {habits.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t('report.noData')}</Text>
            <Text style={styles.emptyText}>{t('report.noDataDesc')}</Text>
          </View>
        )}

        <View style={styles.statGrid}>
          {statCards.map((card) => (
            <View key={card.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: card.accent }]}>{card.value}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>{t('report.completedHabitsChart')}</Text>
            <Dropdown options={[t('report.thisWeek'), t('report.thisMonth'), t('report.thisYear')]} value={barPeriod} onChange={handleBarPeriod} />
          </View>
          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ opacity: barScaleAnim, transform: [{ scale: barScaleAnim }] }}
          >
            <BarChartSvg
              config={barConfig}
              activeIdx={activeBarIdx}
              onBarPress={setActiveBarIdx}
              progress={chartProgress}
            />
          </Animated.ScrollView>
        </View>

        <Animated.View
          style={[
            styles.chartCard,
            {
              marginBottom: 24,
              opacity: chartAnim,
              transform: [{
                scale: chartAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }),
              }],
            },
          ]}
        >
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>{t('report.completionRateChart')}</Text>
            <Dropdown
              options={[t('report.last6Months'), t('report.lastYear'), t('report.allTime')]}
              value={linePeriod}
              onChange={handleLinePeriod}
            />
          </View>
          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ opacity: lineScaleAnim, transform: [{ scale: lineScaleAnim }] }}
          >
            <AreaChartSvg config={lineConfig} activeIdx={activeLineIdx} onDotPress={setActiveLineIdx} />
          </Animated.ScrollView>
        </Animated.View>
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
      borderRadius: 18,
      padding: 18,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 4,
    },
    emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
    emptyText: { fontSize: 13, color: colors.muted, lineHeight: 18 },
    statGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 14,
    },
    statCard: {
      width: (W - 40) / 2,
      borderRadius: 14,
      padding: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowSoft,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.24 : 0.05,
          shadowRadius: 8,
        },
        android: { elevation: 2 },
      }),
    },
    statValue: { fontSize: 18, fontWeight: '800', lineHeight: 24 },
    statLabel: { fontSize: 11, color: colors.muted, marginTop: 2 },
    chartCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowSoft,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.24 : 0.05,
          shadowRadius: 10,
        },
        android: { elevation: 3 },
      }),
    },
    chartHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    chartTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  });
}
