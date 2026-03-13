import type { Habit, HabitEntry } from '../types/habit';

const DAY_MS = 24 * 60 * 60 * 1000;

export type DayStatus = 'done' | 'missed' | 'inactive';

export function toDateKey(value: Date | string) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = typeof value === 'string' ? new Date(value) : value;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayKey() {
  return toDateKey(new Date());
}

export function parseDateKey(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDaysToKey(value: string, amount: number) {
  const next = parseDateKey(value);
  next.setDate(next.getDate() + amount);
  return toDateKey(next);
}

export function compareDateKeys(left: string, right: string) {
  return left.localeCompare(right);
}

export function getWeekDateKeys(anchor = getTodayKey()) {
  const anchorDate = parseDateKey(anchor);
  const day = anchorDate.getDay();
  const mondayDiff = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(anchorDate);
  weekStart.setDate(anchorDate.getDate() + mondayDiff);

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(weekStart);
    current.setDate(weekStart.getDate() + index);
    return toDateKey(current);
  });
}

export function getDateKeysInMonth(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, index) =>
    toDateKey(new Date(year, month, index + 1))
  );
}

export function getDateKeysInYear(year: number) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const totalDays = Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;

  return Array.from({ length: totalDays }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    return toDateKey(current);
  });
}

export function getDateKeysBetween(start: string, end: string) {
  const range: string[] = [];
  let current = start;

  while (compareDateKeys(current, end) <= 0) {
    range.push(current);
    current = addDaysToKey(current, 1);
  }

  return range;
}

export function createEntryLookup(entries: HabitEntry[]) {
  const lookup = new Map<string, HabitEntry>();

  for (const entry of entries) {
    lookup.set(`${entry.habitId}:${entry.date}`, entry);
  }

  return lookup;
}

export function isHabitScheduledOnDate(habit: Habit, dateKey: string) {
  if (compareDateKeys(dateKey, habit.startDate) < 0) {
    return false;
  }

  if (!habit.noEndDate && habit.endDate && compareDateKeys(dateKey, habit.endDate) > 0) {
    return false;
  }

  return true;
}

export function getHabitStatusOnDate(
  habit: Habit,
  entries: HabitEntry[],
  dateKey: string,
  lookup = createEntryLookup(entries)
): DayStatus {
  if (!isHabitScheduledOnDate(habit, dateKey)) {
    return 'inactive';
  }

  return lookup.get(`${habit.id}:${dateKey}`)?.completed ? 'done' : 'missed';
}

export function isHabitCompletedOnDate(
  habitId: string,
  dateKey: string,
  entries: HabitEntry[],
  lookup = createEntryLookup(entries)
) {
  return lookup.get(`${habitId}:${dateKey}`)?.completed === true;
}

export function applyCompletionForDate(habits: Habit[], entries: HabitEntry[], dateKey: string) {
  const lookup = createEntryLookup(entries);

  return habits.map((habit) => ({
    ...habit,
    completed: isHabitScheduledOnDate(habit, dateKey)
      ? lookup.get(`${habit.id}:${dateKey}`)?.completed === true
      : false,
  }));
}

export function getScheduledHabitsForDate(habits: Habit[], dateKey: string) {
  return habits.filter((habit) => isHabitScheduledOnDate(habit, dateKey));
}

export function countCompletedHabitsForDate(habits: Habit[], entries: HabitEntry[], dateKey: string) {
  const lookup = createEntryLookup(entries);

  return habits.reduce((count, habit) => (
    isHabitScheduledOnDate(habit, dateKey) && lookup.get(`${habit.id}:${dateKey}`)?.completed
      ? count + 1
      : count
  ), 0);
}

export function getCompletionRateForRange(
  habits: Habit[],
  entries: HabitEntry[],
  startDateKey: string,
  endDateKey: string
) {
  const lookup = createEntryLookup(entries);
  let completed = 0;
  let total = 0;

  for (const dateKey of getDateKeysBetween(startDateKey, endDateKey)) {
    for (const habit of habits) {
      if (!isHabitScheduledOnDate(habit, dateKey)) {
        continue;
      }

      total += 1;
      if (lookup.get(`${habit.id}:${dateKey}`)?.completed) {
        completed += 1;
      }
    }
  }

  return {
    completed,
    total,
    rate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function getHabitStreak(habit: Habit, entries: HabitEntry[], anchor = getTodayKey()) {
  const lookup = createEntryLookup(entries);
  let streak = 0;
  let cursor = anchor;

  if (!habit.noEndDate && habit.endDate && compareDateKeys(cursor, habit.endDate) > 0) {
    cursor = habit.endDate;
  }

  while (compareDateKeys(cursor, habit.startDate) >= 0) {
    if (!isHabitScheduledOnDate(habit, cursor)) {
      cursor = addDaysToKey(cursor, -1);
      continue;
    }

    if (!lookup.get(`${habit.id}:${cursor}`)?.completed) {
      break;
    }

    streak += 1;
    cursor = addDaysToKey(cursor, -1);
  }

  return streak;
}

export function getLongestHabitStreak(habit: Habit, entries: HabitEntry[]) {
  const completedDates = entries
    .filter((entry) => entry.habitId === habit.id && entry.completed)
    .map((entry) => entry.date)
    .sort(compareDateKeys);

  if (completedDates.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (let index = 1; index < completedDates.length; index += 1) {
    if (addDaysToKey(completedDates[index - 1], 1) === completedDates[index]) {
      current += 1;
      longest = Math.max(longest, current);
      continue;
    }

    current = 1;
  }

  return longest;
}
