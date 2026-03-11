import type { Habit, HabitEntry } from '../types/habit';
import { getLocalHabitData, getPlan, saveLocalHabitData, setPlan } from './storage';

const TODAY = () => new Date().toISOString().slice(0, 10);

const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit-1',
    name: 'Küçük Hedef Belirle',
    completed: true,
    bgColor: '#FFF0E0',
    icon: 'target',
    iconColor: '#FF8A1F',
    createdAt: '2026-03-10T08:00:00.000Z',
    startDate: '2026-03-10',
    endDate: '2026-06-10',
    noEndDate: false,
  },
  {
    id: 'habit-2',
    name: 'Çalışma',
    completed: true,
    bgColor: '#ECEEFA',
    icon: 'briefcase-outline',
    iconColor: '#7B8AB8',
    createdAt: '2026-03-10T08:05:00.000Z',
    startDate: '2026-03-10',
    endDate: null,
    noEndDate: true,
  },
  {
    id: 'habit-3',
    name: 'Meditasyon',
    completed: false,
    bgColor: '#F4EEFA',
    icon: 'meditation',
    iconColor: '#A67CC5',
    createdAt: '2026-03-10T08:10:00.000Z',
    startDate: '2026-03-10',
    endDate: '2026-04-30',
    noEndDate: false,
  },
  {
    id: 'habit-4',
    name: 'Basketbol',
    completed: false,
    bgColor: '#FFE8D6',
    icon: 'basketball',
    iconColor: '#E06B00',
    createdAt: '2026-03-10T08:15:00.000Z',
    startDate: '2026-03-10',
    endDate: null,
    noEndDate: true,
  },
  {
    id: 'habit-5',
    name: 'Kitap Okuma',
    completed: false,
    bgColor: '#EEF6DA',
    icon: 'book-open-variant',
    iconColor: '#8FB339',
    createdAt: '2026-03-10T08:20:00.000Z',
    startDate: '2026-03-10',
    endDate: '2026-12-31',
    noEndDate: false,
  },
  {
    id: 'habit-6',
    name: 'Su İç',
    completed: false,
    bgColor: '#E2F0FB',
    icon: 'water',
    iconColor: '#4A90D9',
    createdAt: '2026-03-10T08:25:00.000Z',
    startDate: '2026-03-10',
    endDate: null,
    noEndDate: true,
  },
];

function applyTodayCompletion(habits: Habit[], entries: HabitEntry[]) {
  const today = TODAY();
  const entryMap = new Map(
    entries
      .filter((entry) => entry.date === today)
      .map((entry) => [entry.habitId, entry.completed])
  );

  return habits.map((habit) => ({
    ...habit,
    completed: entryMap.get(habit.id) ?? habit.completed,
  }));
}

async function ensureLocalSeed() {
  const data = await getLocalHabitData();

  if (data.habits.length > 0) {
    // Mevcut habit'lerin endDate/noEndDate alanlarını DEFAULT_HABITS ile güncelle
    const defaultMap = new Map(DEFAULT_HABITS.map((h) => [h.id, h]));
    const mergedHabits = data.habits.map((habit) => {
      const def = defaultMap.get(habit.id);
      if (!def) return habit;
      return {
        ...habit,
        startDate: def.startDate,
        endDate: def.endDate,
        noEndDate: def.noEndDate,
      };
    });
    const mergedData = { ...data, habits: mergedHabits };
    await saveLocalHabitData(mergedData);
    return mergedData;
  }

  const seededData = {
    habits: DEFAULT_HABITS,
    entries: DEFAULT_HABITS.filter((habit) => habit.completed).map((habit) => ({
      habitId: habit.id,
      date: TODAY(),
      completed: true,
      updatedAt: new Date().toISOString(),
    })),
    updatedAt: new Date().toISOString(),
  };

  await saveLocalHabitData(seededData);
  return seededData;
}

export async function getHabits() {
  const plan = await getPlan();
  const data = await ensureLocalSeed();

  if (plan === 'plus') {
    // TODO: replace with backend fetch when Plus sync is added.
    return applyTodayCompletion(data.habits, data.entries);
  }

  await setPlan(plan);
  return applyTodayCompletion(data.habits, data.entries);
}

export async function resetToDefaults() {
  const seededData = {
    habits: DEFAULT_HABITS,
    entries: DEFAULT_HABITS.filter((habit) => habit.completed).map((habit) => ({
      habitId: habit.id,
      date: TODAY(),
      completed: true,
      updatedAt: new Date().toISOString(),
    })),
    updatedAt: new Date().toISOString(),
  };
  await saveLocalHabitData(seededData);
  return seededData;
}

export async function addHabit(habit: Habit) {
  const data = await ensureLocalSeed();

  await saveLocalHabitData({
    ...data,
    habits: [habit, ...data.habits],
  });
}

export async function toggleHabitCompletion(habitId: string, date = TODAY()) {
  const data = await ensureLocalSeed();
  const nextHabits = data.habits.map((habit) =>
    habit.id === habitId
      ? { ...habit, completed: !habit.completed }
      : habit
  );
  const toggledHabit = nextHabits.find((habit) => habit.id === habitId);

  if (!toggledHabit) {
    return applyTodayCompletion(data.habits, data.entries);
  }

  const nextEntries = data.entries.filter(
    (entry) => !(entry.habitId === habitId && entry.date === date)
  );

  nextEntries.push({
    habitId,
    date,
    completed: toggledHabit.completed,
    updatedAt: new Date().toISOString(),
  });

  await saveLocalHabitData({
    ...data,
    habits: nextHabits,
    entries: nextEntries,
  });

  return applyTodayCompletion(nextHabits, nextEntries);
}
