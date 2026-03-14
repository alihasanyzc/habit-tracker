export type CompletionState = 'done' | 'missed' | 'inactive';

export type GlassHabitWidgetProps = {
  habitName: string;
  habitEmoji: string;
  accentColor: string;
  weekdayLabels: string[];
  weekdayActiveIndex: number;
  weeklyCompletionStates: CompletionState[];
  weekLabel: string;
  doneCount: number;
  totalCount: number;
  streakCount: number;
};
