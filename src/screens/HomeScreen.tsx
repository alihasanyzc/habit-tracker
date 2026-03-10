import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import type { Habit } from '../types';
import { getTimeOfDay } from '../utils/helpers';
import { HabitCard, AnimatedTimeIcon } from '../components';

const C = Colors;

// ── Hafta günleri ──────────────────────────────────────
const WEEK_DAYS = [
  { day: 'Pzt', date: 7, pct: 75 },
  { day: 'Sal', date: 8, pct: 100 },
  { day: 'Çar', date: 9, pct: 50 },
  { day: 'Per', date: 10, isToday: true },
  { day: 'Cum', date: 11, pct: 25 },
  { day: 'Cmt', date: 12, pct: 0 },
  { day: 'Paz', date: 13, pct: 60 },
];

// ── Habit listesi ──────────────────────────────────────
const INITIAL_HABITS: Habit[] = [
  { id: 1, name: 'Küçük Hedef Belirle', completed: true, bgColor: '#FFF0E0', icon: 'target', iconColor: '#FF8A1F' },
  { id: 2, name: 'Çalışma', completed: true, bgColor: '#ECEEFA', icon: 'briefcase-outline', iconColor: '#7B8AB8' },
  { id: 3, name: 'Meditasyon', completed: false, bgColor: '#F4EEFA', icon: 'meditation', iconColor: '#A67CC5' },
  { id: 4, name: 'Basketbol', completed: false, bgColor: '#FFE8D6', icon: 'basketball', iconColor: '#E06B00' },
  { id: 5, name: 'Kitap Okuma', completed: false, bgColor: '#EEF6DA', icon: 'book-open-variant', iconColor: '#8FB339' },
  { id: 6, name: 'Su İç', completed: false, bgColor: '#E2F0FB', icon: 'water', iconColor: '#4A90D9' },
];

// ── Dairesel İlerleme (SVG) ────────────────────────────
function CircleDay({
  day, date, pct, isSelected, isToday, onPress,
}: {
  day: string; date: number; pct: number;
  isSelected: boolean; isToday?: boolean; onPress: () => void;
}) {
  const SIZE = 44;
  const R = 17;
  const STROKE = 3;
  const CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - pct / 100);

  const ringColor = pct > 0 ? C.orange : C.border;

  return (
    <TouchableOpacity onPress={onPress} style={styles.dayBtn} activeOpacity={0.7}>
      <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>{day}</Text>
      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill={isSelected ? 'rgba(255,138,31,0.08)' : 'transparent'}
            stroke={C.border} strokeWidth={STROKE}
          />
          {pct > 0 && (
            <Circle
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none"
              stroke={ringColor}
              strokeWidth={STROKE}
              strokeDasharray={`${CIRC} ${CIRC}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          )}
        </Svg>
        <View style={styles.dayNumWrap}>
          <Text style={[
            styles.dayNum,
            isSelected && { color: C.orange, fontWeight: '700' },
          ]}>
            {date}
          </Text>
          {isToday && (
            <View style={[
              styles.todayDot,
              { backgroundColor: isSelected ? C.orange : C.border },
            ]} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Ana Bileşen ────────────────────────────────────────
export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [selectedDate, setSelectedDate] = useState(10);
  const toggleHabit = (id: number) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const completed = habits.filter(h => h.completed);
  const active = habits.filter(h => !h.completed);
  const todayPct = Math.round((completed.length / habits.length) * 100);

  const weekDays = WEEK_DAYS.map(d => ({
    ...d,
    pct: d.isToday ? todayPct : (d.pct ?? 0),
  }));

  const timeOfDay = getTimeOfDay();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Başlık ──────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{timeOfDay.greeting}, Budi</Text>
          <Text style={styles.dateText}>Salı, 10 Mart, 2025</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.avatar, { backgroundColor: timeOfDay.bg }]}>
            <AnimatedTimeIcon icon={timeOfDay.icon} type={timeOfDay.type} />
          </View>
        </View>
      </View>

      {/* ── Haftalık Takvim ─────────────────────── */}
      <View style={styles.weekRow}>
        {weekDays.map(d => (
          <CircleDay
            key={d.date}
            day={d.day}
            date={d.date}
            pct={d.pct}
            isSelected={d.date === selectedDate}
            isToday={d.isToday}
            onPress={() => setSelectedDate(d.date)}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Daily Routine ────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Günlük Rutinlerim</Text>
        </View>

        {/* Aktif alışkanlıklar */}
        {active.map(h => (
          <HabitCard key={h.id} habit={h} onToggle={toggleHabit} />
        ))}

        {/* Tamamlananlar */}
        {completed.length > 0 && (
          <>
            <Text style={styles.completedLabel}>Tamamlananlar</Text>
            {completed.map(h => (
              <HabitCard key={h.id} habit={h} onToggle={toggleHabit} />
            ))}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Stiller ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

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
  dateText: { fontSize: 13, color: C.muted, marginTop: 3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.orange,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 }, android: { elevation: 3 } }),
  },

  // Haftalık takvim
  weekRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 18,
  },
  dayBtn: { alignItems: 'center', gap: 5 },
  dayLabel: { fontSize: 11, color: C.muted, fontWeight: '400' },
  dayLabelActive: { color: C.text, fontWeight: '700' },
  dayNumWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  dayNum: { fontSize: 14, fontWeight: '500', color: C.text },
  todayDot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },

  // Bölüm başlığı
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: C.text },

  // Tamamlananlar
  completedLabel: {
    fontSize: 13, color: C.muted, fontWeight: '500',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8,
  },
});
