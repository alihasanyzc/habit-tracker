import type { Habit, LocalHabitData } from '../types/habit';
import { applyCompletionForDate, createEntryLookup, getTodayKey } from './habitMetrics';
import { clearLocalHabitData, getLocalHabitData, saveLocalHabitData } from './storage';

async function getStoredHabitData() {
  return getLocalHabitData();
}

export async function getHabitData(date = getTodayKey()): Promise<LocalHabitData> {
  const data = await getStoredHabitData();

  return {
    ...data,
    habits: applyCompletionForDate(data.habits, data.entries, date),
  };
}

export async function getHabits(date = getTodayKey()) {
  const data = await getHabitData(date);
  return data.habits;
}

export async function resetToDefaults() {
  await clearLocalHabitData();
  return {
    habits: [],
    entries: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function addHabit(habit: Habit) {
  const data = await getStoredHabitData();

  await saveLocalHabitData({
    ...data,
    habits: [habit, ...data.habits],
  });
}

export async function deleteHabit(habitId: string) {
  const data = await getStoredHabitData();

  await saveLocalHabitData({
    ...data,
    habits: data.habits.filter(h => h.id !== habitId),
    entries: data.entries.filter(e => e.habitId !== habitId),
  });
}

export async function updateHabit(habitId: string, updates: Partial<Omit<Habit, 'id'>>) {
  const data = await getStoredHabitData();

  await saveLocalHabitData({
    ...data,
    habits: data.habits.map(h => h.id === habitId ? { ...h, ...updates } : h),
  });
}

export async function toggleHabitCompletion(habitId: string, date = getTodayKey()) {
  const data = await getStoredHabitData();
  const lookup = createEntryLookup(data.entries);
  const currentCompleted = lookup.get(`${habitId}:${date}`)?.completed === true;
  const nextCompleted = !currentCompleted;
  const nextEntries = data.entries.filter(
    (entry) => !(entry.habitId === habitId && entry.date === date)
  );

  nextEntries.push({
    habitId,
    date,
    completed: nextCompleted,
    updatedAt: new Date().toISOString(),
  });

  await saveLocalHabitData({
    ...data,
    entries: nextEntries,
  });

  return applyCompletionForDate(data.habits, nextEntries, date);
}
