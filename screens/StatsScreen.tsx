import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { C } from '../constants/colors';
import IconBox from '../components/IconBox';
import NavControl from '../components/NavControl';
import PillTabs from '../components/PillTabs';
import CardFooter from '../components/CardFooter';


// ── Tipler ─────────────────────────────────────────────
type TabType = 'weekly' | 'monthly' | 'yearly';

const DAY_LABELS_LONG  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SUN_IDX = 6;
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_NAMES_TR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

// ── Seed'li sahte-rastgele ─────────────────────────────
function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ── Alışkanlık verisi ──────────────────────────────────
const HABITS = [
  { id: 1, name: 'Su İç',         icon: 'water',      color: '#FF8A1F', bgColor: '#FFF4EA', rate: 0.88, week: [true,true,true,true,true,true,false] },
  { id: 2, name: 'Meditasyon',    icon: 'meditation', color: '#8FB339', bgColor: '#F4F8E6', rate: 0.68, week: [true,true,true,false,true,false,false] },
  { id: 3, name: 'Egzersiz Yap', icon: 'run',        color: '#A35414', bgColor: '#F8EDE4', rate: 0.79, week: [true,true,true,true,true,true,false] },
  { id: 4, name: '8 Saat Uyu',   icon: 'sleep',      color: '#E78AC3', bgColor: '#FDF0F8', rate: 0.72, week: [true,true,true,true,true,true,true] },
];

// ── Yardımcı: Ekran genişliğine göre kart içi genişlik ─
const SCREEN_W = Dimensions.get('window').width;
const CARD_INNER = SCREEN_W - 32 - 32; // padding + iç padding
const CARD_CONTENT_H = 82;             // tüm kartlarda sabit içerik yüksekliği

// ════════════════════════════════════════════════════════
// HAFTALIK KART
// ════════════════════════════════════════════════════════
function WeeklyCard({ habit }: { habit: typeof HABITS[number] }) {
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
      {/* Başlık satırı */}
      <View style={styles.cardHeader}>
        <IconBox icon={habit.icon} iconColor={habit.color} iconSize={22} size={42} borderRadius={13} bgColor={habit.bgColor} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{habit.name}</Text>
        </View>
        <NavControl label={weekLabel} onPrev={() => setWeekOffset(w => w - 1)} onNext={() => setWeekOffset(w => w + 1)} />
      </View>

      {/* Gün etiketleri + Daireler — sabit yükseklik */}
      <View style={{ height: CARD_CONTENT_H, justifyContent: 'space-around' }}>
        <View style={[styles.dayRow, { marginBottom: 0 }]}>
          {DAY_LABELS_LONG.map((lbl, i) => (
            <View key={i} style={{ width: circleSize, alignItems: 'center' }}>
              <Text style={[styles.dayLabel, i === SUN_IDX && { color: C.orange }]}>{lbl}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.dayRow, { marginBottom: 0 }]}>
          {weekDone.map((done, i) => (
            <View key={i} style={[
              styles.dayCircle,
              { width: circleSize, height: circleSize, borderRadius: circleSize / 2 },
              done
                ? { backgroundColor: habit.color, borderWidth: 0 }
                : { backgroundColor: 'transparent', borderWidth: 2, borderColor: i === SUN_IDX ? '#FFC58A' : C.border },
            ]} />
          ))}
        </View>
      </View>

      {/* Alt satır: gün sayısı + yüzde */}
      <CardFooter done={doneDays} total={7} color={habit.color} bgColor={habit.bgColor} />
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

  return (
    <View style={styles.card}>
      {/* Başlık satırı */}
      <View style={styles.cardHeader}>
        <IconBox icon={habit.icon} iconColor={habit.color} iconSize={22} size={42} borderRadius={13} bgColor={habit.bgColor} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{habit.name}</Text>
        </View>
        <NavControl label={MONTH_NAMES_TR[month]} onPrev={prevMonth} onNext={nextMonth} />
      </View>

      {/* Nokta grid — tam 2 satır */}
      {(() => {
        const perRow = Math.ceil(daysInMonth / 2);
        const GAP = 4;
        const dotSize = Math.floor((CARD_INNER - (perRow - 1) * GAP) / perRow);
        const row1 = days.slice(0, perRow);
        const row2 = days.slice(perRow);
        return (
          <View style={[styles.dotGrid, { height: CARD_CONTENT_H, justifyContent: 'center', paddingVertical: 0 }]}>
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

      {/* Alt satır */}
      <CardFooter done={doneDays} total={daysInMonth} color={habit.color} bgColor={habit.bgColor} />
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
        <IconBox icon={habit.icon} iconColor={habit.color} iconSize={22} size={42} borderRadius={13} bgColor={habit.bgColor} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{habit.name}</Text>
        </View>
        <NavControl label={String(year)} onPrev={() => onYearChange(year - 1)} onNext={() => onYearChange(year + 1)} />
      </View>

      {/* Heatmap */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ height: CARD_CONTENT_H }}>
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

      {/* Alt satır */}
      <CardFooter done={doneDays} total={totalDays} color={habit.color} bgColor={habit.bgColor} />
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
      {/* ── Başlık ──────────────────────────────────── */}
      <ScreenHeader title="İstatistikler" subtitle="Alışkanlık takibi" />

      {/* Tab Switcher */}
      <View style={styles.tabWrap}>
        <PillTabs tabs={tabs} activeKey={activeTab} onChange={(k) => setActiveTab(k as TabType)} />
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


  // Tab
  tabWrap: { paddingHorizontal: 16, paddingBottom: 16 },

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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: C.text },
  // Haftalık
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayLabel: { fontSize: 11, fontWeight: '600', color: C.muted, textAlign: 'center' },
  dayCircle: { alignItems: 'center', justifyContent: 'center' },

  dotGrid: {
    paddingVertical: 6,
    gap: 4,
  },
  dotRow2: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  // Yıllık
  monthLabel: { fontSize: 9, fontWeight: '600', color: C.dayMuted },
});
