import { Platform } from 'react-native';
import type { Habit, LocalHabitData } from '../types/habit';
import {
  addDaysToKey,
  applyCompletionForDate,
  getTodayKey,
  getHabitStatusOnDate,
  getWeekDateKeys,
  isHabitScheduledOnDate,
  parseDateKey,
  getHabitStreak,
} from '../utils/habitMetrics';
import { getLanguagePreference, getLocalHabitData } from '../utils/storage';
import type { GlassHabitWidgetProps } from './glassHabitWidget.types';

function isExpoWidgetsUnavailable(error: unknown) {
  return error instanceof Error && error.message.includes("Cannot find native module 'ExpoWidgets'");
}

function getWeekdayLabels(language: string | null): string[] {
  if (language === 'tr') {
    return ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  }
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}

function getMonthsShort(language: string | null) {
  if (language === 'tr') {
    return ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  }
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
}

function pickPrimaryHabit(data: LocalHabitData, todayKey: string) {
  // Bugün için planlanmış alışkanlıkları al
  const scheduledToday = data.habits.filter((habit) => isHabitScheduledOnDate(habit, todayKey));

  if (scheduledToday.length > 0) {
    // Tamamlanmamış olanlara öncelik ver
    const incomplete = scheduledToday.find((h) => {
      const entry = data.entries.find(e => e.habitId === h.id && e.date === todayKey);
      return !entry?.completed;
    });
    return incomplete ?? scheduledToday[0];
  }

  return data.habits[0] ?? null;
}

function buildCompletionStates(habit: Habit | null, data: LocalHabitData, todayKey: string) {
  if (!habit) {
    return Array.from({ length: 7 }, () => 'inactive' as const);
  }

  // Mevcut haftanın tüm günlerini al (Pazartesi'den başlar)
  return getWeekDateKeys(todayKey).map((dateKey) => {
    return getHabitStatusOnDate(habit, data.entries, dateKey);
  });
}

function createSnapshot(data: LocalHabitData, language: string | null): GlassHabitWidgetProps {
  const todayKey = getTodayKey();
  const primaryHabit = pickPrimaryHabit(data, todayKey);

  const weekKeys = getWeekDateKeys(todayKey);
  const activeIndex = weekKeys.indexOf(todayKey);

  const statuses = buildCompletionStates(primaryHabit, data, todayKey);
  const doneCount = statuses.filter((status) => status === 'done').length;
  const totalCount = statuses.filter((status) => status !== 'inactive').length;

  const weekStart = parseDateKey(weekKeys[0]);
  const monthsShort = getMonthsShort(language);

  // Seri bilgisini hesapla
  const streak = primaryHabit ? getHabitStreak(primaryHabit, data.entries, todayKey) : 0;

  return {
    habitName: primaryHabit?.name ?? (language === 'tr' ? 'Henüz alışkanlık yok' : 'No habit yet'),
    habitEmoji: primaryHabit?.icon ?? '✨',
    accentColor: primaryHabit?.iconColor ?? '#FF7A14',
    weekdayLabels: getWeekdayLabels(language),
    weekdayActiveIndex: activeIndex !== -1 ? activeIndex : 0,
    weeklyCompletionStates: statuses,
    weekLabel: `${weekStart.getDate()} ${monthsShort[weekStart.getMonth()]}`,
    doneCount,
    totalCount,
    streakCount: streak,
  };
}

export async function syncGlassHabitWidget(data: LocalHabitData, language: string | null) {
  if (Platform.OS !== 'ios') {
    return;
  }

  try {
    const { glassHabitWidget } = await import('./glassHabitWidget');
    await glassHabitWidget.updateSnapshot(createSnapshot(data, language));
  } catch (error) {
    if (isExpoWidgetsUnavailable(error)) {
      return;
    }
    throw error;
  }
}

export async function syncGlassHabitWidgetFromStorage() {
  if (Platform.OS !== 'ios') {
    return;
  }

  const [data, language] = await Promise.all([getLocalHabitData(), getLanguagePreference()]);
  await syncGlassHabitWidget(data, language);
}
