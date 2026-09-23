export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon?: string;
  totalMinutes: number;
  goalMinutes?: number;
}

export interface SessionRecord {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  mode: TimerMode;
  durationMinutes: number;
  timestamp: string; // ISO date string
  notes?: string;
}

export interface StudyTask {
  id: string;
  text: string;
  completed: boolean;
  subjectId?: string;
  createdAt: string;
}

export interface TimerSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number; // default: 4 cycles
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 100
  ambientSound: 'none' | 'rain' | 'whitenoise' | 'stream';
  ambientVolume: number; // 0 to 100
}

export interface DailyGoal {
  targetMinutes: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  longestStreak: number;
}
