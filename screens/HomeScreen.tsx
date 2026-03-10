import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  PanResponder,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getThemedAccentSurface,
  useAppColors,
  useIsDark,
  type AppColors,
} from '../constants/colors';
import { getTimeOfDay, AnimatedTimeIcon } from '../utils/timeOfDay';
import { useFocusEffect } from '@react-navigation/native';
import type { Habit } from '../types/habit';
import { getHabits, toggleHabitCompletion } from '../utils/habitRepository';

const WEEK_DAYS = [
  { day: 'Pzt', date: 7, pct: 75 },
  { day: 'Sal', date: 8, pct: 100 },
  { day: 'Çar', date: 9, pct: 50 },
  { day: 'Per', date: 10, isToday: true },
  { day: 'Cum', date: 11, pct: 25 },
  { day: 'Cmt', date: 12, pct: 0 },
  { day: 'Paz', date: 13, pct: 60 },
];

function CircleDay({
  day, date, pct, isSelected, isToday, onPress,
}: {
  day: string;
  date: number;
  pct: number;
  isSelected: boolean;
  isToday?: boolean;
  onPress: () => void;
}) {
  const colors = useAppColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const size = 44;
  const radius = 17;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  const ringColor = pct > 0 ? colors.orange : colors.border;

  return (
    <TouchableOpacity onPress={onPress} style={styles.dayBtn} activeOpacity={0.7}>
      <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>{day}</Text>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill={isSelected ? colors.ringFill : 'transparent'}
            stroke={colors.border}
            strokeWidth={strokeWidth}
          />
          {pct > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          )}
        </Svg>
        <View style={styles.dayNumWrap}>
          <Text style={[styles.dayNum, isSelected && { color: colors.orange, fontWeight: '700' }]}>
            {date}
          </Text>
          {isToday && (
            <View style={[styles.todayDot, { backgroundColor: isSelected ? colors.orange : colors.border }]} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const SWIPE_THRESHOLD = 80;
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function HabitCard({
  habit,
  onToggle,
}: {
  habit: Habit;
  onToggle: (id: string) => void;
}) {
  const colors = useAppColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const habitSurface = useMemo(
    () => getThemedAccentSurface(habit.bgColor, colors, isDark, 0.8),
    [habit.bgColor, colors, isDark]
  );
  const translateX = useRef(new Animated.Value(0)).current;
  const revealOpacity = translateX.interpolate({
    inputRange: [-130, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const bgColor = translateX.interpolate({
    inputRange: [-130, -SWIPE_THRESHOLD, 0],
    outputRange: [colors.orangeDark, colors.orange, colors.orange],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        !habit.completed && Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 5,
      onPanResponderMove: (_, g) => {
        const value = Math.min(0, Math.max(-130, g.dx));
        translateX.setValue(value);
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
      <Animated.View style={[styles.cardReveal, { backgroundColor: bgColor, opacity: revealOpacity }]}>
        <Text style={styles.checkIcon}>✓</Text>
      </Animated.View>

      <AnimatedTouchable
        style={[
          styles.card,
          { backgroundColor: habit.completed ? colors.surfaceAlt : habitSurface },
          { transform: [{ translateX }] },
        ]}
        onPress={() => onToggle(habit.id)}
        activeOpacity={0.85}
        {...(!habit.completed ? panResponder.panHandlers : {})}
      >
        <View style={[styles.emojiBox, { opacity: habit.completed ? 0.65 : 1 }]}>
          <MaterialCommunityIcons name={habit.icon as any} size={22} color={habit.iconColor} />
        </View>

        <Text style={[styles.habitName, habit.completed && styles.habitNameDone]}>
          {habit.name}
        </Text>

        {habit.completed && (
          <TouchableOpacity style={styles.doneCircle} onPress={() => onToggle(habit.id)} activeOpacity={0.7}>
            <Text style={styles.doneCheck}>✓</Text>
          </TouchableOpacity>
        )}
      </AnimatedTouchable>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useAppColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedDate, setSelectedDate] = useState(10);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadHabits = async () => {
        const storedHabits = await getHabits();
        if (isActive) {
          setHabits(storedHabits);
        }
      };

      void loadHabits();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const toggleHabit = useCallback((id: string) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
    void toggleHabitCompletion(id).then((nextHabits) => {
      if (nextHabits) {
        setHabits(nextHabits);
      }
    });
  }, []);

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
      <View style={{ height: insets.top, backgroundColor: colors.bg }} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{timeOfDay.greeting}</Text>
            <Text style={styles.dateText}>Salı, 10 Mart 2025</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.avatar, { backgroundColor: timeOfDay.bg }]}>
              <AnimatedTimeIcon icon={timeOfDay.icon} type={timeOfDay.type} />
            </View>
          </View>
        </View>

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

        {active.map(h => (
          <HabitCard key={h.id} habit={h} onToggle={toggleHabit} />
        ))}

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

function createStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    scroll: { flex: 1, backgroundColor: colors.bg },
    scrollContent: { paddingTop: 12, paddingBottom: 16 },

    header: {
      backgroundColor: colors.bg,
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
    greeting: { fontSize: 24, fontWeight: '700', color: colors.text, lineHeight: 30 },
    dateText: { fontSize: 13, color: colors.muted, marginTop: 3 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowSoft,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.26 : 0.12,
          shadowRadius: 6,
        },
        android: { elevation: 3 },
      }),
    },

    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 18,
    },
    dayBtn: { alignItems: 'center', gap: 5 },
    dayLabel: { fontSize: 11, color: colors.muted, fontWeight: '400' },
    dayLabelActive: { color: colors.text, fontWeight: '700' },
    dayNumWrap: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayNum: { fontSize: 14, fontWeight: '500', color: colors.text },
    todayDot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },

    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 6,
      paddingBottom: 8,
      backgroundColor: colors.bg,
    },
    sectionTitle: { fontSize: 13, fontWeight: '500', color: colors.muted },

    cardWrap: { paddingHorizontal: 16, marginBottom: 7, position: 'relative' },
    cardReveal: {
      position: 'absolute',
      top: 0,
      left: 16,
      right: 16,
      bottom: 0,
      borderRadius: 18,
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingRight: 22,
    },
    checkIcon: { fontSize: 22, color: colors.white, fontWeight: '700' },

    card: {
      borderRadius: 16,
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    emojiBox: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: colors.translucentCard,
      alignItems: 'center',
      justifyContent: 'center',
    },
    habitName: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
    habitNameDone: { color: colors.muted, textDecorationLine: 'line-through' },

    doneCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.orange,
      alignItems: 'center',
      justifyContent: 'center',
    },
    doneCheck: { color: colors.white, fontSize: 15, fontWeight: '700' },

    completedLabel: {
      fontSize: 13,
      color: colors.muted,
      fontWeight: '500',
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 8,
    },
  });
}
