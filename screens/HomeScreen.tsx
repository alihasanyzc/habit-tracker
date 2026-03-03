import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  PanResponder,
  Animated,
  Platform,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ── Renk Paleti ────────────────────────────────────────
const C = {
  bg: '#F6EFEA',
  orange: '#FF8A1F',
  orangeDark: '#E06B00',
  text: '#1F1F1F',
  muted: '#7A7A7A',
  border: '#E6E6E6',
};

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
export interface Habit {
  id: number;
  name: string;
  completed: boolean;
  bgColor: string;
  icon: string;
  iconColor: string;
}

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

// ── Swipeable Habit Card ───────────────────────────────
const SWIPE_THRESHOLD = 80;
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function HabitCard({
  habit,
  onToggle,
}: {
  habit: Habit; onToggle: (id: number) => void;
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
            Animated.timing(translateX, { toValue: 0, duration: 300, useNativeDriver: false }),
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
      <AnimatedTouchable
        style={[
          styles.card,
          { backgroundColor: habit.completed ? '#F5F5F5' : habit.bgColor },
          { transform: [{ translateX }] },
        ]}
        onPress={() => onToggle(habit.id)}
        activeOpacity={0.85}
        {...(!habit.completed ? panResponder.panHandlers : {})}
      >
        {/* İkon */}
        <View style={[styles.emojiBox, { opacity: habit.completed ? 0.65 : 1 }]}>
          <MaterialCommunityIcons name={habit.icon as any} size={22} color={habit.iconColor} />
        </View>

        {/* İsim */}
        <Text style={[
          styles.habitName,
          habit.completed && styles.habitNameDone,
        ]}>
          {habit.name}
        </Text>

        {/* Sağ taraf */}
        {habit.completed && (
          <TouchableOpacity style={styles.doneCircle} onPress={() => onToggle(habit.id)} activeOpacity={0.7}>
            <Text style={styles.doneCheck}>✓</Text>
          </TouchableOpacity>
        )}
      </AnimatedTouchable>

    </View>
  );
}

// ── Saate göre selamlama & ikon ───────────────────────
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { greeting: 'Günaydın', icon: 'weather-sunny', bg: '#FF8A1F', type: 'day' };
  if (hour >= 12 && hour < 17) return { greeting: 'İyi Günler', icon: 'white-balance-sunny', bg: '#F5A623', type: 'day' };
  if (hour >= 17 && hour < 21) return { greeting: 'İyi Akşamlar', icon: 'weather-sunset', bg: '#E06B00', type: 'night' };
  return { greeting: 'İyi Geceler', icon: 'weather-night', bg: '#3D5A99', type: 'night' };
}

// ── AnimatedTimeIcon ──────────────────────────────────
function AnimatedTimeIcon({ icon, type }: { icon: string, type: string }) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (type === 'day') {
      // Sürekli dönme animasyonu
      Animated.loop(
        Animated.timing(animValue, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // Gece için nefes/pulse animasyonu
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();
    }
  }, [type, animValue]);

  const animatedStyle = type === 'day' ? {
    transform: [{
      rotate: animValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
      })
    }]
  } : {
    transform: [{
      scale: animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.15]
      })
    }]
  };

  return (
    <Animated.View style={animatedStyle}>
      <MaterialCommunityIcons name={icon as any} size={26} color="#fff" />
    </Animated.View>
  );
}

// ── Ana Bileşen ────────────────────────────────────────
export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [selectedDate, setSelectedDate] = useState(10);
  const insets = useSafeAreaInsets();
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
    <View style={styles.safe}>
      <View style={{ height: insets.top, backgroundColor: C.bg }} />
      {/* ── Başlık + Haftalık Takvim ─────────────── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
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
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alışkanlıklarım</Text>
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
    </View>
  );
}

// ── Stiller ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingTop: 12, paddingBottom: 16 },

  // Header
  header: {
    backgroundColor: C.bg,
    paddingBottom: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
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
    paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8, backgroundColor: C.bg,
  },
  sectionTitle: { fontSize: 13, fontWeight: '500', color: C.muted },

  // Kart
  cardWrap: { paddingHorizontal: 16, marginBottom: 7, position: 'relative' },
  cardReveal: {
    position: 'absolute',
    top: 0, left: 16, right: 16, bottom: 0,
    borderRadius: 18,
    alignItems: 'flex-end', justifyContent: 'center',
    paddingRight: 22,
  },
  checkIcon: { fontSize: 22, color: '#fff', fontWeight: '700' },

  card: {
    borderRadius: 16, padding: 10,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  emojiBox: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  habitName: { flex: 1, fontSize: 15, fontWeight: '600', color: C.text },
  habitNameDone: { color: C.muted, textDecorationLine: 'line-through' },

  doneCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.orange,
    alignItems: 'center', justifyContent: 'center',
  },
  doneCheck: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Tamamlananlar
  completedLabel: {
    fontSize: 13, color: C.muted, fontWeight: '500',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8,
  },
});
