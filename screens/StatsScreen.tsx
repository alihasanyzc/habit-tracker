import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── Renk Paleti ────────────────────────────────────────
const C = {
  bg: '#F6EFEA',
  white: '#FFFFFF',
  orange: '#FF8A1F',
  green: '#8FB339',
  text: '#1F1F1F',
  muted: '#7A7A7A',
  border: '#E6E6E6',
  tabBg: '#EFE5DD',
  dot: '#EFE5DD',
  dayMuted: '#A39590',
};

// ── Tipler ─────────────────────────────────────────────
type TabType = 'weekly' | 'monthly' | 'yearly';

const DAY_LABELS_LONG  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const SUN_IDX = 6;
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Seed'li sahte-rastgele ─────────────────────────────
function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}
function buildGrid(weeks: number, id: number, rate: number, skipWknd: boolean): boolean[][] {
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      if (skipWknd && d >= 5) return sr(id * 7777 + w * 7 + d) < 0.12;
      return sr(id * 1234 + w * 7 + d) < rate;
    })
  );
}

// ── Alışkanlık verisi ──────────────────────────────────
const HABITS = [
  { id: 1, name: 'Set Small Goals', emoji: '🎯', freq: 'Everyday',        color: '#FF8A1F', bgColor: '#FFF4EA', rate: 0.88, skipWknd: false, week: [true,true,true,true,true,true,false] },
  { id: 2, name: 'Meditation',      emoji: '😇', freq: '5 days per week', color: '#8FB339', bgColor: '#F4F8E6', rate: 0.68, skipWknd: true,  week: [true,true,true,false,true,false,false] },
  { id: 3, name: 'Work',            emoji: '🏆', freq: 'Everyday',        color: '#A35414', bgColor: '#F8EDE4', rate: 0.79, skipWknd: false, week: [true,true,true,true,true,true,false] },
  { id: 4, name: 'Sleep Over 8h',   emoji: '🥰', freq: 'Everyday',        color: '#E78AC3', bgColor: '#FDF0F8', rate: 0.72, skipWknd: false, week: [true,true,true,true,true,true,true] },
];

// ── Yardımcı: Ekran genişliğine göre kart içi genişlik ─
const SCREEN_W = Dimensions.get('window').width;
const CARD_INNER = SCREEN_W - 32 - 32; // padding + iç padding

// ════════════════════════════════════════════════════════
// HAFTALIK KART
// ════════════════════════════════════════════════════════
function WeeklyCard({ habit }: { habit: typeof HABITS[number] }) {
  const pct = Math.round((habit.week.filter(Boolean).length / 7) * 100);
  const circleSize = Math.floor((CARD_INNER - 6 * 6) / 7); // 6 boşluk

  return (
    <View style={styles.card}>
      {/* Başlık satırı */}
      <View style={styles.cardHeader}>
        <View style={[styles.emojiBox, { backgroundColor: habit.bgColor }]}>
          <Text style={styles.emojiText}>{habit.emoji}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{habit.name}</Text>
          <Text style={styles.cardFreq}>{habit.freq}</Text>
        </View>
        <View style={[styles.pctBadge, { backgroundColor: habit.bgColor }]}>
          <Text style={[styles.pctText, { color: habit.color }]}>{pct}%</Text>
        </View>
      </View>

      {/* Gün etiketleri */}
      <View style={styles.dayRow}>
        {DAY_LABELS_LONG.map((lbl, i) => (
          <View key={i} style={{ width: circleSize, alignItems: 'center' }}>
            <Text style={[styles.dayLabel, i === SUN_IDX && { color: C.orange }]}>{lbl}</Text>
          </View>
        ))}
      </View>

      {/* Günlük daireler */}
      <View style={styles.dayRow}>
        {habit.week.map((done, i) => (
          <View key={i} style={[
            styles.dayCircle,
            { width: circleSize, height: circleSize, borderRadius: circleSize / 2 },
            done
              ? { backgroundColor: habit.color, borderWidth: 0 }
              : { backgroundColor: 'transparent', borderWidth: 2, borderColor: i === SUN_IDX ? '#FFC58A' : C.border },
          ]}>
            {done && <Text style={styles.checkMark}>✓</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

// ════════════════════════════════════════════════════════
// AYLIK KART — nokta grid
// ════════════════════════════════════════════════════════
function MonthlyCard({ habit }: { habit: typeof HABITS[number] }) {
  const WEEKS = 20;
  const DOT = 10;
  const GAP = 4;
  const grid = buildGrid(WEEKS, habit.id, habit.rate, habit.skipWknd);

  return (
    <View style={styles.card}>
      {/* Başlık */}
      <View style={styles.cardHeader}>
        <View style={[styles.emojiBox, { backgroundColor: habit.bgColor }]}>
          <Text style={styles.emojiText}>{habit.emoji}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{habit.name}</Text>
          <Text style={styles.cardFreq}>{habit.freq}</Text>
        </View>
        <View style={[styles.pctBadge, { backgroundColor: habit.bgColor }]}>
          <Text style={[styles.pctText, { color: habit.color }]}>
            {Math.round(habit.rate * 100)}%
          </Text>
        </View>
      </View>

      {/* Ayırıcı */}
      <View style={styles.separator} />

      {/* Başlık satırı */}
      <View style={styles.monthlyHeadRow}>
        <Text style={styles.monthlyTitle}>Aylık Görünüm</Text>
        <Text style={styles.monthlySubtitle}>Son {WEEKS} hafta</Text>
      </View>

      {/* Nokta grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {DAY_LABELS_SHORT.map((lbl, dayIdx) => (
            <View key={dayIdx} style={[styles.dotRow, { marginBottom: GAP }]}>
              <Text style={[
                styles.dotDayLabel,
                dayIdx === SUN_IDX && { color: C.orange },
              ]}>{lbl}</Text>
              {grid.map((week, wIdx) => (
                <View key={wIdx} style={[
                  { width: DOT, height: DOT, borderRadius: DOT / 2, marginRight: GAP },
                  { backgroundColor: week[dayIdx] ? habit.color : C.dot },
                ]} />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════
// YILLIK KART — GitHub Heatmap
// ════════════════════════════════════════════════════════
function YearlyCard({ habit, year, onYearChange }: {
  habit: typeof HABITS[number];
  year: number;
  onYearChange: (y: number) => void;
}) {
  const WEEKS = 52;
  const SQ = 7;
  const SQ_GAP = 2;
  const CELL = SQ + SQ_GAP;
  const grid = buildGrid(WEEKS, habit.id + year * 100, habit.rate, habit.skipWknd);
  const monthStarts = [0, 4, 9, 13, 17, 22, 26, 30, 35, 39, 43, 48];

  return (
    <View style={styles.card}>
      {/* Başlık */}
      <View style={styles.cardHeader}>
        <View style={[styles.emojiBox, { backgroundColor: habit.bgColor }]}>
          <Text style={styles.emojiText}>{habit.emoji}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{habit.name}</Text>
          <Text style={styles.cardFreq}>{habit.freq}</Text>
        </View>
        {/* Yıl seçici */}
        <View style={styles.yearPicker}>
          <TouchableOpacity onPress={() => onYearChange(year - 1)} style={styles.yearArrow}>
            <Text style={styles.yearArrowText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.yearBadge}>
            <Text style={styles.yearText}>{year}</Text>
          </View>
          <TouchableOpacity onPress={() => onYearChange(year + 1)} style={styles.yearArrow}>
            <Text style={styles.yearArrowText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Heatmap */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
        <View>
          {/* Ay etiketleri */}
          <View style={{ flexDirection: 'row', marginLeft: 16, marginBottom: 4 }}>
            {monthStarts.map((startWeek, mIdx) => {
              const endWeek = mIdx < 11 ? monthStarts[mIdx + 1] : WEEKS;
              return (
                <View key={mIdx} style={{ width: (endWeek - startWeek) * CELL }}>
                  <Text style={styles.monthLabel}>{MONTH_NAMES[mIdx]}</Text>
                </View>
              );
            })}
          </View>

          {/* Grid */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            {/* Gün etiketleri */}
            <View style={{ marginRight: 4 }}>
              {['M','','W','','F','','S'].map((d, i) => (
                <View key={i} style={{ height: SQ, marginBottom: SQ_GAP, width: 12, justifyContent: 'center' }}>
                  <Text style={[styles.heatDayLabel, i === 6 && { color: habit.color }]}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Haftalar */}
            <View style={{ flexDirection: 'row', gap: SQ_GAP }}>
              {grid.map((week, wIdx) => (
                <View key={wIdx} style={{ flexDirection: 'column', gap: SQ_GAP }}>
                  {week.map((done, dIdx) => (
                    <View key={dIdx} style={{
                      width: SQ, height: SQ, borderRadius: 1.5,
                      backgroundColor: done ? habit.color : C.dot,
                    }} />
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            <Text style={styles.legendLabel}>Az</Text>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={{
                width: SQ, height: SQ, borderRadius: 1.5, marginLeft: SQ_GAP,
                backgroundColor: i === 0 ? C.dot : habit.color,
                opacity: i === 0 ? 1 : 0.3 + i * 0.14,
              }} />
            ))}
            <Text style={[styles.legendLabel, { marginLeft: SQ_GAP }]}>Çok</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ════════════════════════════════════════════════════════
// ANA BİLEŞEN
// ════════════════════════════════════════════════════════
export default function StatsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('weekly');
  const [year, setYear] = useState(2025);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'weekly',  label: 'Haftalık' },
    { key: 'monthly', label: 'Aylık'    },
    { key: 'yearly',  label: 'Yıllık'   },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Başlık */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>İstatistikler</Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabWrap}>
        <View style={styles.tabContainer}>
          {tabs.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setActiveTab(t.key)}
              activeOpacity={0.8}
              style={[
                styles.tabBtn,
                activeTab === t.key && styles.tabBtnActive,
              ]}
            >
              <Text style={[
                styles.tabLabel,
                activeTab === t.key && styles.tabLabelActive,
              ]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* İçerik */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'weekly' && HABITS.map(h => (
          <WeeklyCard key={h.id} habit={h} />
        ))}

        {activeTab === 'monthly' && HABITS.map(h => (
          <MonthlyCard key={h.id} habit={h} />
        ))}

        {activeTab === 'yearly' && HABITS.map(h => (
          <YearlyCard key={h.id} habit={h} year={year} onYearChange={setYear} />
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Stiller ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.text },

  // Tab
  tabWrap: { paddingHorizontal: 16, paddingBottom: 16 },
  tabContainer: {
    flexDirection: 'row', backgroundColor: C.tabBg,
    borderRadius: 50, padding: 4, gap: 2,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 46, alignItems: 'center' },
  tabBtnActive: {
    backgroundColor: C.orange,
    ...Platform.select({
      ios: { shadowColor: C.orange, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6 },
      android: { elevation: 4 },
    }),
  },
  tabLabel: { fontSize: 13, fontWeight: '700', color: C.muted },
  tabLabelActive: { color: C.white },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  // Kart
  card: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  emojiBox: {
    width: 42, height: 42, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10, flexShrink: 0,
  },
  emojiText: { fontSize: 22 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: C.text },
  cardFreq: { fontSize: 12, color: C.muted, marginTop: 2 },
  pctBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  pctText: { fontSize: 13, fontWeight: '700' },

  // Haftalık
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayLabel: { fontSize: 11, fontWeight: '600', color: C.muted, textAlign: 'center' },
  dayCircle: { alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: C.white, fontSize: 12, fontWeight: '700' },

  // Aylık
  separator: { height: 1, backgroundColor: C.tabBg, marginBottom: 2 },
  monthlyHeadRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
  },
  monthlyTitle: { fontSize: 13, fontWeight: '700', color: C.text },
  monthlySubtitle: { fontSize: 11, color: C.muted },
  dotRow: { flexDirection: 'row', alignItems: 'center' },
  dotDayLabel: { width: 14, fontSize: 10, fontWeight: '600', color: C.dayMuted, marginRight: 6 },

  // Yıllık
  yearPicker: { flexDirection: 'row', alignItems: 'center' },
  yearArrow: { paddingHorizontal: 6, paddingVertical: 2 },
  yearArrowText: { fontSize: 20, color: C.muted },
  yearBadge: { backgroundColor: '#F6EFEA', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  yearText: { fontSize: 13, fontWeight: '700', color: C.text },
  monthLabel: { fontSize: 9, fontWeight: '600', color: C.dayMuted },
  heatDayLabel: { fontSize: 8, fontWeight: '600', color: '#BBBBBB', textAlign: 'right' },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, justifyContent: 'flex-end' },
  legendLabel: { fontSize: 9, color: C.dayMuted },
});
