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
import Dropdown from '../components/Dropdown';
import { ACCENT, useAppColors, useIsDark, type AppColors } from '../constants/colors';

const W = Dimensions.get('window').width;
const CARD_W = W - 32;
const CHART_INNER = CARD_W - 32;

const STAT_CARDS = [
  { value: '226 gün', label: 'Mevcut seri', accent: ACCENT.orange },
  { value: '%89', label: 'Tamamlama oranı', accent: ACCENT.green },
  { value: '3.268', label: 'Tamamlanan alışkanlık', accent: ACCENT.brown },
  { value: '307', label: 'Mükemmel gün toplamı', accent: ACCENT.pink },
];

type BarItem = { label: string; val: number };
type BarConfig = { items: BarItem[]; yMax: number; yTicks: number[]; defaultIdx: number };

const BAR_DATA: Record<string, BarConfig> = {
  'Bu Hafta': {
    items: [
      { label: '16', val: 6 }, { label: '17', val: 7 }, { label: '18', val: 5 },
      { label: '19', val: 6 }, { label: '20', val: 5 }, { label: '21', val: 7 },
      { label: '22', val: 4 },
    ],
    yMax: 8, yTicks: [2, 4, 6, 8], defaultIdx: 2,
  },
  'Bu Ay': {
    items: [
      { label: 'H1', val: 29 }, { label: 'H2', val: 38 },
      { label: 'H3', val: 23 }, { label: 'H4', val: 33 },
    ],
    yMax: 45, yTicks: [10, 20, 30, 40], defaultIdx: 1,
  },
  'Bu Yıl': {
    items: [
      { label: 'Oca', val: 118 }, { label: 'Şub', val: 96 }, { label: 'Mar', val: 130 },
      { label: 'Nis', val: 108 }, { label: 'May', val: 142 }, { label: 'Haz', val: 122 },
      { label: 'Tem', val: 138 }, { label: 'Ağu', val: 115 }, { label: 'Eyl', val: 110 },
      { label: 'Eki', val: 128 }, { label: 'Kas', val: 105 }, { label: 'Ara', val: 145 },
    ],
    yMax: 160, yTicks: [50, 100, 150], defaultIdx: 4,
  },
};

type LineItem = { label: string; val: number };
type LineConfig = { items: LineItem[]; activeIdx: number };

const LINE_DATA: Record<string, LineConfig> = {
  'Son 6 Ay': {
    items: [
      { label: 'Eyl', val: 65 }, { label: 'Eki', val: 58 }, { label: 'Kas', val: 72 },
      { label: 'Ara', val: 68 }, { label: 'Oca', val: 72 }, { label: 'Şub', val: 75 },
    ],
    activeIdx: 4,
  },
  'Geçen Yıl': {
    items: [
      { label: 'M', val: 55 }, { label: 'N', val: 62 }, { label: 'M', val: 68 },
      { label: 'H', val: 70 }, { label: 'T', val: 75 }, { label: 'A', val: 68 },
      { label: 'E', val: 65 }, { label: 'E', val: 58 }, { label: 'K', val: 72 },
      { label: 'A', val: 68 }, { label: 'O', val: 72 }, { label: 'Ş', val: 75 },
    ],
    activeIdx: 10,
  },
  'Tüm Zamanlar': {
    items: [
      { label: '23Ç1', val: 45 }, { label: '23Ç2', val: 58 }, { label: '23Ç3', val: 62 },
      { label: '23Ç4', val: 70 }, { label: '24Ç1', val: 68 }, { label: '24Ç2', val: 75 },
      { label: '24Ç3', val: 72 }, { label: '24Ç4', val: 80 }, { label: '25Ç1', val: 78 },
      { label: '25Ç2', val: 85 }, { label: '25Ç3', val: 82 }, { label: '25Ç4', val: 89 },
    ],
    activeIdx: 9,
  },
};

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
  for (let i = 1; i < points.length; i++) {
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

const BAR_H = 200;
const Y_AXIS_W = 28;
const X_AXIS_H = 20;
const PIN_H = 46;
const TOP_PAD = PIN_H + 10;
const PLOT_H = BAR_H - TOP_PAD - X_AXIS_H;

function BarChartSvg({ config, activeIdx, onBarPress, progress = 1 }: {
  config: BarConfig;
  activeIdx: number;
  onBarPress: (i: number) => void;
  progress?: number;
}) {
  const colors = useAppColors();
  const itemCount = config.items.length;
  const svgWidth = Math.max(CHART_INNER, Y_AXIS_W + itemCount * 45 + 16);
  const plotWidth = svgWidth - Y_AXIS_W - 16;
  const gap = plotWidth / (itemCount * 1.6);
  const barWidth = (plotWidth - gap * (itemCount - 1)) / itemCount;

  const barX = (index: number) => Y_AXIS_W + index * (barWidth + gap);
  const barHeight = (value: number) => (value / config.yMax) * PLOT_H * progress;
  const barY = (value: number) => TOP_PAD + (PLOT_H - barHeight(value));

  return (
    <Svg width={svgWidth} height={BAR_H}>
      {config.yTicks.map(tick => {
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
          <G key={index}>
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
                  alışkanlık
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
  onDotPress: (i: number) => void;
}) {
  const colors = useAppColors();
  const itemCount = config.items.length;
  const svgWidth = Math.max(CHART_INNER, LY_AXIS_W + (itemCount - 1) * 55 + 32);
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
          <G key={index}>
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
  const [barPeriod, setBarPeriod] = useState('Bu Hafta');
  const [linePeriod, setLinePeriod] = useState('Son 6 Ay');
  const [activeBarIdx, setActiveBarIdx] = useState(BAR_DATA['Bu Hafta'].defaultIdx);
  const [activeLineIdx, setActiveLineIdx] = useState(LINE_DATA['Son 6 Ay'].activeIdx);

  const chartAnim = useRef(new Animated.Value(0)).current;
  const barScaleAnim = useRef(new Animated.Value(1)).current;
  const lineScaleAnim = useRef(new Animated.Value(1)).current;
  const [chartProgress, setChartProgress] = useState(0);

  useEffect(() => {
    const id = chartAnim.addListener(({ value }) => setChartProgress(value));
    return () => chartAnim.removeListener(id);
  }, [chartAnim]);

  useFocusEffect(
    useCallback(() => {
      chartAnim.setValue(0);
      Animated.timing(chartAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }).start();
    }, [chartAnim])
  );

  const handleBarPeriod = (value: string) => {
    Animated.sequence([
      Animated.timing(barScaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(barScaleAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    setBarPeriod(value);
    setActiveBarIdx(BAR_DATA[value].defaultIdx);
  };

  const handleLinePeriod = (value: string) => {
    Animated.sequence([
      Animated.timing(lineScaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(lineScaleAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    setLinePeriod(value);
    setActiveLineIdx(LINE_DATA[value].activeIdx);
  };

  const barConfig = BAR_DATA[barPeriod];
  const lineConfig = LINE_DATA[linePeriod];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Raporlar" subtitle="Haftalık ve aylık özet" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statGrid}>
          {STAT_CARDS.map((card, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={[styles.statValue, { color: card.accent }]}>{card.value}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Tamamlanan Alışkanlıklar</Text>
            <Dropdown options={['Bu Hafta', 'Bu Ay', 'Bu Yıl']} value={barPeriod} onChange={handleBarPeriod} />
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
            <Text style={styles.chartTitle}>Alışkanlık Tamamlama Oranı</Text>
            <Dropdown
              options={['Son 6 Ay', 'Geçen Yıl', 'Tüm Zamanlar']}
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
