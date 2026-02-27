import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  PanResponder,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

// ── Renk Paleti ────────────────────────────────────────
const C = {
  bg: '#FFFFFF',
  cardCream: '#F6EFEA',
  cardWarm: '#FFF4EA',
  cardBeige: '#EFE5DD',
  orange: '#FF8A1F',
  orangeDark: '#E06B00',
  green: '#8FB339',
  text: '#1F1F1F',
  muted: '#7A7A7A',
  border: '#E6E6E6',
  navBg: '#EFE5DD',
};

// ── Hafta günleri ──────────────────────────────────────
const WEEK_DAYS = [
  { day: 'Mon', date: 7,  pct: 75  },
  { day: 'Tue', date: 8,  pct: 100 },
  { day: 'Wed', date: 9,  pct: 50  },
  { day: 'Thu', date: 10, isToday: true },
  { day: 'Fri', date: 11, pct: 25  },
  { day: 'Sat', date: 12, pct: 0   },
  { day: 'Sun', date: 13, pct: 60  },
];

// ── Habit listesi ──────────────────────────────────────
interface Habit {
  id: number;
  name: string;
  streak: number;
  duration: string;
  completed: boolean;
  bgColor: string;
  emoji: string;
  skippable?: boolean;
}

const INITIAL_HABITS: Habit[] = [
  { id: 1, name: 'Set Small Goals', streak: 3,  duration: '5 min',  completed: true,  bgColor: C.cardCream, emoji: '🎯' },
  { id: 2, name: 'Work',            streak: 6,  duration: '15 min', completed: true,  bgColor: C.cardWarm,  emoji: '🏆' },
  { id: 3, name: 'Meditation',      streak: 5,  duration: '10 min', completed: false, bgColor: C.cardBeige, emoji: '😇', skippable: true },
  { id: 4, name: 'Basketball',      streak: 3,  duration: '20 min', completed: false, bgColor: C.cardCream, emoji: '🏀' },
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

  const ringColor = isSelected
    ? C.orange
    : pct === 100 ? C.green
    : pct > 0 ? '#FFC58A'
    : C.border;

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
            pct === 100 && !isSelected && { color: C.green },
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

// ── Swipeable Habit Card ───────────────────────────────
const SCREEN_W = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;

function HabitCard({
  habit,
  isFirst,
  onToggle,
}: {
  habit: Habit; isFirst: boolean; onToggle: (id: number) => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const revealOpacity = translateX.interpolate({
    inputRange: [-130, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const bgColor = translateX.interpolate({
    inputRange: [-130, -SWIPE_THRESHOLD, 0],
    outputRange: [C.orangeDark, C.orange, C.orange],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        !habit.completed && Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 5,
      onPanResponderMove: (_, g) => {
        const v = Math.min(0, Math.max(-130, g.dx));
        translateX.setValue(v);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_THRESHOLD) {
          Animated.sequence([
            Animated.timing(translateX, { toValue: -120, duration: 200, useNativeDriver: false }),
            Animated.timing(translateX, { toValue: 0,    duration: 300, useNativeDriver: false }),
          ]).start(() => onToggle(habit.id));
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.cardWrap}>
      {/* Swipe arka planı */}
      <Animated.View style={[styles.cardReveal, { backgroundColor: bgColor, opacity: revealOpacity }]}>
        <Text style={styles.checkIcon}>✓</Text>
      </Animated.View>

      {/* Kart içeriği */}
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: habit.completed ? '#F9F5F2' : habit.bgColor },
          { transform: [{ translateX }] },
        ]}
        {...(!habit.completed ? panResponder.panHandlers : {})}
      >
        {/* Emoji */}
        <View style={[styles.emojiBox, { opacity: habit.completed ? 0.65 : 1 }]}>
          <Text style={styles.emojiText}>{habit.emoji}</Text>
        </View>

        {/* İsim */}
        <Text style={[
          styles.habitName,
          habit.completed && styles.habitNameDone,
        ]}>
          {habit.name}
        </Text>

        {/* Sağ taraf */}
        {habit.completed ? (
          <View style={styles.doneCircle}>
            <Text style={styles.doneCheck}>✓</Text>
          </View>
        ) : habit.skippable ? (
          <TouchableOpacity style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip →</Text>
          </TouchableOpacity>
        ) : null}
      </Animated.View>

      {/* Swipe ipucu (ilk aktif kart) */}
      {isFirst && !habit.completed && (
        <View style={styles.swipeHintWrap} pointerEvents="none">
          <Text style={styles.swipeHintIcon}>👈</Text>
        </View>
      )}
    </View>
  );
}

// ── Ana Bileşen ────────────────────────────────────────
export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [selectedDate, setSelectedDate] = useState(10);
  const [showNotif, setShowNotif] = useState(false);

  const toggleHabit = (id: number) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const completed = habits.filter(h => h.completed);
  const active    = habits.filter(h => !h.completed);
  const todayPct  = Math.round((completed.length / habits.length) * 100);

  const weekDays = WEEK_DAYS.map(d => ({
    ...d,
    pct: d.isToday ? todayPct : (d.pct ?? 0),
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Başlık ──────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Morning, Budi</Text>
            <Text style={styles.dateText}>Thursday, 10 March, 2025</Text>
          </View>
          <View style={styles.headerRight}>
            {/* Bildirim */}
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => setShowNotif(v => !v)}
              activeOpacity={0.8}
            >
              <Text style={styles.bellIcon}>🔔</Text>
              <View style={styles.bellDot} />
            </TouchableOpacity>
            {/* Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>🐯</Text>
            </View>
          </View>
        </View>

        {/* Bildirim dropdown */}
        {showNotif && (
          <View style={styles.notifBox}>
            <Text style={styles.notifTitle}>Bildirimler</Text>
            {[
              { text: 'Günlük rutinin başlamak üzere! 🌅', time: '5 dk önce' },
              { text: "Streak'ini koru — bugün 10. günün! 🔥", time: '2 saat önce' },
            ].map((n, i) => (
              <View key={i} style={styles.notifItem}>
                <Text style={styles.notifText}>{n.text}</Text>
                <Text style={styles.notifTime}>{n.time}</Text>
              </View>
            ))}
          </View>
        )}

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

        {/* ── Daily Routine ────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily routine</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.swipeHint}>← Sola kaydır tamamlamak için</Text>

        {/* Aktif alışkanlıklar */}
        {active.map((h, i) => (
          <HabitCard
            key={h.id}
            habit={h}
            isFirst={i === 0}
            onToggle={toggleHabit}
          />
        ))}

        {/* Tamamlananlar */}
        {completed.length > 0 && (
          <>
            <Text style={styles.completedLabel}>Completed</Text>
            {completed.map(h => (
              <HabitCard key={h.id} habit={h} isFirst={false} onToggle={toggleHabit} />
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
    paddingBottom: 4,
  },
  greeting: { fontSize: 24, fontWeight: '700', color: C.text, lineHeight: 30 },
  dateText: { fontSize: 13, color: C.muted, marginTop: 3 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  bellBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.cardCream,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 }, android: { elevation: 2 } }),
  },
  bellIcon: { fontSize: 18 },
  bellDot: {
    position: 'absolute', top: 9, right: 9,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.orange, borderWidth: 1.5, borderColor: C.bg,
  },

  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#F5C87A',
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 }, android: { elevation: 3 } }),
  },
  avatarEmoji: { fontSize: 26 },

  // Bildirim
  notifBox: {
    marginHorizontal: 20, marginTop: 8,
    backgroundColor: C.bg, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: C.border,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 }, android: { elevation: 6 } }),
  },
  notifTitle: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 10 },
  notifItem: {
    padding: 10, backgroundColor: C.cardCream,
    borderRadius: 12, borderLeftWidth: 3, borderLeftColor: C.orange,
    marginBottom: 8,
  },
  notifText: { fontSize: 12, color: C.text },
  notifTime: { fontSize: 11, color: C.muted, marginTop: 2 },

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
  seeAll: { fontSize: 13, color: C.muted },
  swipeHint: { fontSize: 11, color: '#A39590', paddingHorizontal: 16, marginBottom: 10 },

  // Kart
  cardWrap: { paddingHorizontal: 16, marginBottom: 10, position: 'relative' },
  cardReveal: {
    position: 'absolute',
    top: 0, left: 16, right: 16, bottom: 0,
    borderRadius: 18,
    alignItems: 'flex-end', justifyContent: 'center',
    paddingRight: 22,
  },
  checkIcon: { fontSize: 22, color: '#fff', fontWeight: '700' },

  card: {
    borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  emojiBox: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  emojiText: { fontSize: 26 },
  habitName: { flex: 1, fontSize: 16, fontWeight: '600', color: C.text },
  habitNameDone: { color: C.muted, textDecorationLine: 'line-through' },

  doneCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.green,
    alignItems: 'center', justifyContent: 'center',
  },
  doneCheck: { color: '#fff', fontSize: 15, fontWeight: '700' },

  skipBtn: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6,
  },
  skipText: { fontSize: 13, fontWeight: '600', color: C.muted },

  swipeHintWrap: {
    position: 'absolute', right: 28, top: '50%',
    transform: [{ translateY: -12 }],
  },
  swipeHintIcon: { fontSize: 18 },

  // Tamamlananlar
  completedLabel: {
    fontSize: 13, color: C.muted, fontWeight: '500',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8,
  },
});
