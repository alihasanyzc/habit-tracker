import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Dimensions, Platform, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, {
  Rect, Path, Circle, Defs, LinearGradient as SvgGradient,
  Stop, G, Text as SvgText, Polygon,
} from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { getTimeOfDay, buildBezierPath } from '../utils/helpers';
import { AnimatedTimeIcon } from '../components';

const C = Colors;
const W = Dimensions.get('window').width;
const CARD_W = W - 32;
const CHART_INNER = CARD_W - 32;

// ── Özet Kart Verileri ─────────────────────────────────
const STAT_CARDS = [
  { value: '226 gün', label: 'Mevcut seri', accent: C.orange },
  { value: '%89', label: 'Tamamlama oranı', accent: C.green },
  { value: '3.268', label: 'Tamamlanan alışkanlık', accent: C.brown },
  { value: '307', label: 'Mükemmel gün toplamı', accent: C.pink },
];

// ── Bar Chart Dönem Verileri ───────────────────────────
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

// ── Area Chart Dönem Verileri ──────────────────────────
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

// ════════════════════════════════════════════════════════
// DROPDOWN BİLEŞENİ
// ════════════════════════════════════════════════════════
function Dropdown({ options, value, onChange }: {
  options: string[]; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        style={styles.dropBtn}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.dropBtnText}>{value}</Text>
        <Text style={[styles.dropBtnText, { fontSize: 10 }]}>▾</Text>
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />
        <View style={styles.dropMenu}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.dropItem, opt === value && styles.dropItemActive]}
              onPress={() => { onChange(opt); setOpen(false); }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.dropItemText,
                opt === value && { color: C.orange, fontWeight: '700' },
              ]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
}

// ════════════════════════════════════════════════════════
// ÇUBUK GRAFİK
// ════════════════════════════════════════════════════════
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
  const N = config.items.length;
  const SVG_W = Math.max(CHART_INNER, Y_AXIS_W + N * 45 + 16);
  const PLOT_W = SVG_W - Y_AXIS_W - 16;
  const GAP = PLOT_W / (N * 1.6);
  const BAR_W = (PLOT_W - GAP * (N - 1)) / N;

  const barX = (i: number) => Y_AXIS_W + i * (BAR_W + GAP);
  const barH = (val: number) => (val / config.yMax) * PLOT_H * progress;
  const barY = (val: number) => TOP_PAD + (PLOT_H - barH(val));

  return (
    <Svg width={SVG_W} height={BAR_H}>
      {/* Y axis ticks */}
      {config.yTicks.map((t) => {
        const ty = TOP_PAD + PLOT_H - (t / config.yMax) * PLOT_H;
        return (
          <G key={t}>
            <SvgText
              x={Y_AXIS_W - 4} y={ty + 4}
              textAnchor="end" fontSize={10} fill={C.axisTick}
            >
              {t}
            </SvgText>
          </G>
        );
      })}

      {/* Bars */}
      {config.items.map((item, i) => {
        const bx = barX(i);
        const bh = barH(item.val);
        const by = barY(item.val);
        const isAct = i === activeIdx;
        const cx = bx + BAR_W / 2;

        return (
          <G key={i}>
            <Rect
              x={bx} y={by} width={BAR_W} height={bh}
              rx={6} ry={6}
              fill={isAct ? C.orange : C.orangeLight}
              onPress={() => onBarPress(i)}
            />
            {/* X label */}
            <SvgText
              x={cx}
              y={TOP_PAD + PLOT_H + X_AXIS_H - 4}
              textAnchor="middle"
              fontSize={N > 7 ? 9 : 11}
              fill={C.muted}
            >
              {item.label}
            </SvgText>
            {/* Pin tooltip */}
            {isAct && (
              <G>
                <Rect
                  x={cx - 27} y={by - PIN_H - 6}
                  width={54} height={PIN_H - 4}
                  rx={12} ry={12}
                  fill="white"
                />
                <SvgText
                  x={cx} y={by - PIN_H + 12}
                  textAnchor="middle" fontSize={15} fontWeight="800" fill={C.orange}
                >
                  {item.val}
                </SvgText>
                <SvgText
                  x={cx} y={by - PIN_H + 26}
                  textAnchor="middle" fontSize={9} fill={C.axisTick}
                >
                  alışkanlık
                </SvgText>
                <Polygon
                  points={`${cx - 5},${by - 6} ${cx + 5},${by - 6} ${cx},${by - 1}`}
                  fill="white"
                />
              </G>
            )}
          </G>
        );
      })}
    </Svg>
  );
}

// ════════════════════════════════════════════════════════
// ALAN GRAFİK
// ════════════════════════════════════════════════════════
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
  const N = config.items.length;
  const SVG_W = Math.max(CHART_INNER, LY_AXIS_W + (N - 1) * 55 + 32);
  const LPLOT_W = SVG_W - LY_AXIS_W - 32;
  const step = LPLOT_W / Math.max(N - 1, 1);

  const toY = (val: number) => LTOP_PAD + LPLOT_H - (val / 100) * LPLOT_H;
  const pts = config.items.map((d, i) => ({
    x: LY_AXIS_W + i * step,
    y: toY(d.val),
  }));

  const { linePath, areaPath } = buildBezierPath(pts, LTOP_PAD + LPLOT_H);

  return (
    <Svg width={SVG_W} height={LINE_H}>
      <Defs>
        <SvgGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={C.orange} stopOpacity={0.22} />
          <Stop offset="1" stopColor={C.orange} stopOpacity={0.02} />
        </SvgGradient>
      </Defs>

      {/* Y axis % label */}
      <SvgText
        x={LY_AXIS_W - 4} y={LTOP_PAD + 4}
        textAnchor="end" fontSize={10} fill={C.axisTick}
      >
        100%
      </SvgText>

      {/* Area fill */}
      <Path d={areaPath} fill="url(#areaFill)" />
      {/* Line */}
      <Path d={linePath} stroke={C.orange} strokeWidth={2.5} fill="none" strokeLinecap="round" />

      {/* Dots */}
      {pts.map((pt, i) => {
        const isAct = i === activeIdx;
        const item = config.items[i];
        return (
          <G key={i}>
            {isAct ? (
              <>
                <Circle cx={pt.x} cy={pt.y} r={20} fill={C.orange} opacity={0.12} />
                <Circle cx={pt.x} cy={pt.y} r={8} fill={C.orange} />
                {/* Badge */}
                <Rect
                  x={pt.x - 26} y={pt.y - 46}
                  width={52} height={26}
                  rx={13} ry={13}
                  fill={C.orange}
                />
                <SvgText
                  x={pt.x} y={pt.y - 28}
                  textAnchor="middle" fontSize={12} fontWeight="700" fill="white"
                >
                  {item.val}%
                </SvgText>
              </>
            ) : (
              <>
                <Circle cx={pt.x} cy={pt.y} r={4} fill="white" />
                <Circle cx={pt.x} cy={pt.y} r={4} fill="none" stroke={C.orangeLight} strokeWidth={2} />
              </>
            )}
            {/* Transparent touch target */}
            <Rect
              x={pt.x - 16} y={pt.y - 16}
              width={32} height={32}
              fill="transparent"
              onPress={() => onDotPress(i)}
            />
            {/* X label */}
            <SvgText
              x={pt.x} y={LTOP_PAD + LPLOT_H + LX_AXIS_H - 4}
              textAnchor="middle" fontSize={N > 8 ? 9 : 11} fill={C.muted}
            >
              {item.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

// ════════════════════════════════════════════════════════
// ANA BİLEŞEN
// ════════════════════════════════════════════════════════
export default function ReportScreen() {
  const timeOfDay = getTimeOfDay();
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
    }, [chartAnim]),
  );

  const handleBarPeriod = (v: string) => {
    Animated.sequence([
      Animated.timing(barScaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(barScaleAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    setBarPeriod(v);
    setActiveBarIdx(BAR_DATA[v].defaultIdx);
  };

  const handleLinePeriod = (v: string) => {
    Animated.sequence([
      Animated.timing(lineScaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(lineScaleAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    setLinePeriod(v);
    setActiveLineIdx(LINE_DATA[v].activeIdx);
  };

  const barConfig = BAR_DATA[barPeriod];
  const lineConfig = LINE_DATA[linePeriod];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Başlık ──────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Raporlar</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.statGrid}>
          {STAT_CARDS.map((c, i) => (
            <View
              key={i}
              style={[
                styles.statCard,
                { backgroundColor: i % 2 === 0 ? C.bg : C.cardCream },
              ]}
            >
              <Text style={[styles.statValue, { color: c.accent }]}>{c.value}</Text>
              <Text style={styles.statLabel}>{c.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Tamamlanan Alışkanlıklar</Text>
            <Dropdown
              options={['Bu Hafta', 'Bu Ay', 'Bu Yıl']}
              value={barPeriod}
              onChange={handleBarPeriod}
            />
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
            { marginBottom: 24 },
            {
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

// ── Stiller ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  greeting: { fontSize: 24, fontWeight: '700', color: C.text, lineHeight: 30 },

  // Özet kartlar
  statGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 8, marginBottom: 14,
  },
  statCard: {
    width: (W - 40) / 2,
    borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: C.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  statValue: { fontSize: 18, fontWeight: '800', lineHeight: 24 },
  statLabel: { fontSize: 11, color: C.muted, marginTop: 2 },

  // Grafik kartı
  chartCard: {
    backgroundColor: C.bg, borderRadius: 20,
    padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: C.border,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },
  chartHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  chartTitle: { fontSize: 16, fontWeight: '700', color: C.text },

  // Dropdown
  dropBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: C.cardCream,
    borderWidth: 1.5, borderColor: C.border,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  dropBtnText: { fontSize: 13, fontWeight: '600', color: C.text },
  dropMenu: {
    position: 'absolute', bottom: 80, right: 16,
    backgroundColor: C.bg, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    minWidth: 160, overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16 },
      android: { elevation: 8 },
    }),
  },
  dropItem: { paddingHorizontal: 16, paddingVertical: 10 },
  dropItemActive: { backgroundColor: C.orangeBg },
  dropItemText: { fontSize: 13, color: C.text },
});
