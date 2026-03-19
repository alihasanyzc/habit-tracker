export interface Habit {
  id: string;
  name: string;
  completed: boolean;
  bgColor: string;
  icon: string;
  iconColor: string;
  createdAt: string;
  startDate: string;
  endDate: string | null;
  noEndDate: boolean;
}

export interface HabitEntry {
  habitId: string;
  date: string;
  completed: boolean;
  updatedAt: string;
}

export interface LocalHabitData {
  habits: Habit[];
  entries: HabitEntry[];
  updatedAt: string;
}
