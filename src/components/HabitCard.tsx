import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import type { Habit } from '../types';

const C = Colors;
const SWIPE_THRESHOLD = 80;
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: number) => void;
}

export default function HabitCard({ habit, onToggle }: HabitCardProps) {
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
    }),
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
        <Text style={[styles.habitName, habit.completed && styles.habitNameDone]}>
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

const styles = StyleSheet.create({
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
});
