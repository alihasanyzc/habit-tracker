import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LocalHabitData } from '../types/habit';

const STORAGE_KEYS = {
  habits: 'local_habit_data',
  themePreference: 'app_theme_preference',
  languagePreference: 'app_language_preference',
  onboardingDone: 'onboarding_done',
} as const;
const ONBOARDING_VERSION = 'v3';

const DEFAULT_THEME_PREFERENCE: ThemePreference = 'system';
const memoryStorage = new Map<string, string>();
let useMemoryStorage = false;
let hasWarnedAboutMemoryFallback = false;

export type ThemePreference = 'system' | 'light' | 'dark';

function shouldUseMemoryFallback(error: unknown) {
  return error instanceof Error && error.message.includes('Native module is null');
}

function warnAboutMemoryFallback() {
  if (hasWarnedAboutMemoryFallback) {
    return;
  }

  hasWarnedAboutMemoryFallback = true;
  console.warn(
    'AsyncStorage native module is unavailable. Falling back to in-memory storage for this session.'
  );
}

async function getStoredItem(key: string) {
  if (useMemoryStorage) {
    return memoryStorage.get(key) ?? null;
  }

  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    if (shouldUseMemoryFallback(error)) {
      useMemoryStorage = true;
      warnAboutMemoryFallback();
      return memoryStorage.get(key) ?? null;
    }

    throw error;
  }
}

async function setStoredItem(key: string, value: string) {
  if (useMemoryStorage) {
    memoryStorage.set(key, value);
    return;
  }

  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    if (shouldUseMemoryFallback(error)) {
      useMemoryStorage = true;
      warnAboutMemoryFallback();
      memoryStorage.set(key, value);
      return;
    }

    throw error;
  }
}

async function removeStoredItem(key: string) {
  if (useMemoryStorage) {
    memoryStorage.delete(key);
    return;
  }

  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    if (shouldUseMemoryFallback(error)) {
      useMemoryStorage = true;
      warnAboutMemoryFallback();
      memoryStorage.delete(key);
      return;
    }

    throw error;
  }
}

function createEmptyHabitData(): LocalHabitData {
  return {
    habits: [],
    entries: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function getThemePreference(): Promise<ThemePreference> {
  const storedPreference = await getStoredItem(STORAGE_KEYS.themePreference);

  if (storedPreference === 'system' || storedPreference === 'light' || storedPreference === 'dark') {
    return storedPreference;
  }

  return DEFAULT_THEME_PREFERENCE;
}

export async function setThemePreference(preference: ThemePreference) {
  await setStoredItem(STORAGE_KEYS.themePreference, preference);
}

export async function getLocalHabitData(): Promise<LocalHabitData> {
  const rawData = await getStoredItem(STORAGE_KEYS.habits);

  if (!rawData) {
    return createEmptyHabitData();
  }

  try {
    const parsed = JSON.parse(rawData) as LocalHabitData;

    return {
      habits: parsed.habits ?? [],
      entries: parsed.entries ?? [],
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return createEmptyHabitData();
  }
}

export async function saveLocalHabitData(data: LocalHabitData) {
  const nextData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  await setStoredItem(
    STORAGE_KEYS.habits,
    JSON.stringify(nextData)
  );
}

export async function clearLocalHabitData() {
  await removeStoredItem(STORAGE_KEYS.habits);
}

export async function removeHabitDataByIdPrefix(prefix: string) {
  const data = await getLocalHabitData();
  const habits = data.habits.filter((habit) => !habit.id.startsWith(prefix));
  const habitIds = new Set(habits.map((habit) => habit.id));
  const entries = data.entries.filter((entry) => habitIds.has(entry.habitId));

  if (habits.length === data.habits.length && entries.length === data.entries.length) {
    return;
  }

  await saveLocalHabitData({
    ...data,
    habits,
    entries,
  });
}

export async function getLanguagePreference(): Promise<string | null> {
  return getStoredItem(STORAGE_KEYS.languagePreference);
}

export async function setLanguagePreference(language: string) {
  await setStoredItem(STORAGE_KEYS.languagePreference, language);
}

export async function getOnboardingDone(): Promise<boolean> {
  const value = await getStoredItem(STORAGE_KEYS.onboardingDone);
  return value === ONBOARDING_VERSION;
}

export async function setOnboardingDone() {
  await setStoredItem(STORAGE_KEYS.onboardingDone, ONBOARDING_VERSION);
}
