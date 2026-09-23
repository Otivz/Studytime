export interface TimerSettings {
  studyMinutes: number; // default 25
  shortBreakMinutes: number; // default 5
  longBreakMinutes: number; // default 15
  dailyGoalMinutes: number; // default 120
  soundEnabled: boolean;
}

export interface DailyGoal {
  targetMinutes: number;
  streakDays: number;
  lastActiveDate: string;
  longestStreak: number;
}
