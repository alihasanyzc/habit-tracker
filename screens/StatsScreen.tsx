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
const MONTH_NAMES_TR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

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

// ── Tarih formatlama ─────────────────────────────────
function fmtDate(d: Date) {
  const day = d.getDate();
  const mon = MONTH_NAMES_TR[d.getMonth()].slice(0, 3);
  const yr = d.getFullYear();
  return `${day} ${mon} ${yr}`;
}

function dateLabel(start: Date, end?: Date) {
  if (end) return `${fmtDate(start)} — ${fmtDate(end)}`;
  return `${fmtDate(start)} — Devam ediyor`;
}

// ── Alışkanlık verisi ──────────────────────────────────
const HABITS = [
  { id: 1, name: 'Set Small Goals', emoji: '🎯', startDate: new Date(2025, 0, 15), endDate: undefined,              color: '#FF8A1F', bgColor: '#FFF4EA', rate: 0.88, skipWknd: false, week: [true,true,true,true,true,true,false] },
  { id: 2, name: 'Meditation',      emoji: '😇', startDate: new Date(2025, 2, 1),  endDate: new Date(2025, 8, 30),  color: '#8FB339', bgColor: '#F4F8E6', rate: 0.68, skipWknd: true,  week: [true,true,true,false,true,false,false] },
  { id: 3, name: 'Work',            emoji: '🏆', startDate: new Date(2025, 1, 10), endDate: undefined,              color: '#A35414', bgColor: '#F8EDE4', rate: 0.79, skipWknd: false, week: [true,true,true,true,true,true,false] },
  { id: 4, name: 'Sleep Over 8h',   emoji: '🥰', startDate: new Date(2025, 3, 1),  endDate: new Date(2026, 3, 1),   color: '#E78AC3', bgColor: '#FDF0F8', rate: 0.72, skipWknd: false, week: [true,true,true,true,true,true,true] },
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
          <Text style={styles.cardFreq}>{dateLabel(habit.startDate, habit.endDate)}</Text>
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
// AYLIK KART — gerçek takvim nokta grid
// ════════════════════════════════════════════════════════
function MonthlyCard({ habit }: { habit: typeof HABITS[number] }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear]   = useState(now.getFullYear());

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isDone = (dayNum: number) =>
    sr(habit.id * 1234 + year * 400 + month * 31 + dayNum) < habit.rate;

  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    num: i + 1,
    done: isDone(i + 1),
  }));

  const doneDays = days.filter(d => d.done).length;
  const pct = Math.round((doneDays / daysInMonth) * 100);

  return (
    <View style={styles.mCard}>
      {/* Üst satır: emoji+isim solda, ay nav sağda */}
      <View style={styles.mCardTop}>
        <View style={[styles.emojiBoxSm, { backgroundColor: habit.bgColor }]}>
          <Text style={{ fontSize: 16 }}>{habit.emoji}</Text>
        </View>
        <Text style={styles.mCardName} numberOfLines={1}>{habit.name}</Text>
        <View style={styles.mMonthNav}>
          <TouchableOpacity onPress={prevMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.mNavArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.mNavLabel}>{MONTH_NAMES_TR[month]}</Text>
          <TouchableOpacity onPress={nextMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.mNavArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Nokta grid — tam 2 satır */}
      {(() => {
        const perRow = Math.ceil(daysInMonth / 2);
        const GAP = 4;
        const cardInner = SCREEN_W - 32 - 28; // ekran padding + kart padding
        const dotSize = Math.floor((cardInner - (perRow - 1) * GAP) / perRow);
        const row1 = days.slice(0, perRow);
        const row2 = days.slice(perRow);
        return (
          <View style={styles.dotGrid}>
            <View style={[styles.dotRow2, { gap: GAP }]}>
              {row1.map(d => (
                <View key={d.num} style={{
                  width: dotSize, height: dotSize, borderRadius: dotSize / 2,
                  backgroundColor: d.done ? habit.color : C.dot,
                }} />
              ))}
            </View>
            <View style={[styles.dotRow2, { gap: GAP }]}>
              {row2.map(d => (
                <View key={d.num} style={{
                  width: dotSize, height: dotSize, borderRadius: dotSize / 2,
                  backgroundColor: d.done ? habit.color : C.dot,
                }} />
              ))}
            </View>
          </View>
        );
      })()}

      {/* Alt satır: gün sayısı solda, yüzde sağda */}
      <View style={styles.mCardBottom}>
        <Text style={styles.mBottomText}>{doneDays}/{daysInMonth} gün</Text>
        <View style={[styles.pctBadgeSm, { backgroundColor: habit.bgColor }]}>
          <Text style={[styles.pctTextSm, { color: habit.color }]}>{pct}%</Text>
        </View>
      </View>
    </View>
  );
}

// ════════════════════════════════════════════════════════
// YILLIK KART — gerçek 365/366 gün heatmap
// ════════════════════════════════════════════════════════
function YearlyCard({ habit, year, onYearChange }: {
  habit: typeof HABITS[number];
  year: number;
  onYearChange: (y: number) => void;
}) {
  const SQ = 7;
  const SQ_GAP = 2;
  const CELL = SQ + SQ_GAP;

  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);
  const totalDays = Math.round((dec31.getTime() - jan1.getTime()) / 86400000) + 1;

  const rawStart = jan1.getDay(); // 0=Paz
  const startOffset = rawStart === 0 ? 6 : rawStart - 1; // Pazartesi bazlı

  const totalSlots = startOffset + totalDays;
  const totalWeeks = Math.ceil(totalSlots / 7);

  // Her slot için gün numarası (0-based, yılın kaçıncı günü) veya -1 (boş)
  const isDone = (dayOfYear: number) =>
    sr(habit.id * 1234 + year * 400 + dayOfYear) < habit.rate;

  // Haftalar dizisi: weeks[weekIdx][dayIdx] = dayOfYear | -1
  const weeks: number[][] = Array.from({ length: totalWeeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const slot = w * 7 + d;
      const dayOfYear = slot - startOffset;
      return (dayOfYear >= 0 && dayOfYear < totalDays) ? dayOfYear : -1;
    })
  );

  // Ay etiketlerinin konumlarını hesapla
  const monthWeekStarts: number[] = [];
  for (let m = 0; m < 12; m++) {
    const firstOfMonth = new Date(year, m, 1);
    const dayOfYear = Math.round((firstOfMonth.getTime() - jan1.getTime()) / 86400000);
    const slot = dayOfYear + startOffset;
    monthWeekStarts.push(Math.floor(slot / 7));
  }

  let doneDays = 0;
  for (let d = 0; d < totalDays; d++) {
    if (isDone(d)) doneDays++;
  }

  return (
    <View style={styles.card}>
      {/* Başlık */}
      <View style={styles.cardHeader}>
        <View style={[styles.emojiBox, { backgroundColor: habit.bgColor }]}>
          <Text style={styles.emojiText}>{habit.emoji}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{habit.name}</Text>
          <Text style={styles.cardFreq}>{dateLabel(habit.startDate, habit.endDate)}</Text>
        </View>
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
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            {monthWeekStarts.map((startWeek, mIdx) => {
              const endWeek = mIdx < 11 ? monthWeekStarts[mIdx + 1] : totalWeeks;
              return (
                <View key={mIdx} style={{ width: (endWeek - startWeek) * CELL }}>
                  <Text style={styles.monthLabel}>{MONTH_NAMES[mIdx]}</Text>
                </View>
              );
            })}
          </View>

          {/* Grid */}
          <View style={{ flexDirection: 'row', gap: SQ_GAP }}>
            {weeks.map((week, wIdx) => (
              <View key={wIdx} style={{ flexDirection: 'column', gap: SQ_GAP }}>
                {week.map((dayOfYear, dIdx) => (
                  <View key={dIdx} style={{
                    width: SQ, height: SQ, borderRadius: SQ / 2,
                    backgroundColor: dayOfYear === -1
                      ? 'transparent'
                      : (isDone(dayOfYear) ? habit.color : C.dot),
                  }} />
                ))}
              </View>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* Alt satır: gün sayısı solda, yüzde sağda */}
      <View style={styles.mCardBottom}>
        <Text style={styles.mBottomText}>{doneDays}/{totalDays} gün</Text>
        <View style={[styles.pctBadgeSm, { backgroundColor: habit.bgColor }]}>
          <Text style={[styles.pctTextSm, { color: habit.color }]}>
            {Math.round((doneDays / totalDays) * 100)}%
          </Text>
        </View>
      </View>
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
  // Aylık kart
  mCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  mCardTop: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
  },
  emojiBoxSm: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  mCardName: {
    flex: 1, fontSize: 14, fontWeight: '700', color: C.text,
  },
  mMonthNav: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  mNavArrow: { fontSize: 18, fontWeight: '600', color: C.muted },
  mNavLabel: { fontSize: 12, fontWeight: '700', color: C.text, minWidth: 52, textAlign: 'center' },
  dotGrid: {
    paddingVertical: 6,
    gap: 4,
  },
  dotRow2: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  mCardBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 8,
  },
  mBottomText: { fontSize: 13, color: C.muted, fontWeight: '600' },
  pctBadgeSm: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  pctTextSm: { fontSize: 13, fontWeight: '700' },

  // Yıllık
  yearPicker: { flexDirection: 'row', alignItems: 'center' },
  yearArrow: { paddingHorizontal: 6, paddingVertical: 2 },
  yearArrowText: { fontSize: 20, color: C.muted },
  yearBadge: { backgroundColor: '#F6EFEA', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  yearText: { fontSize: 13, fontWeight: '700', color: C.text },
  monthLabel: { fontSize: 9, fontWeight: '600', color: C.dayMuted },
  heatDayLabel: { fontSize: 8, fontWeight: '600', color: '#BBBBBB', textAlign: 'right' },
});
