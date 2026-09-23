export type TimerMode = 'study' | 'shortBreak' | 'longBreak';

export interface SessionRecord {
  id: string;
  subjectId: string;
  subjectName: string;
  durationMinutes: number;
  timestamp: string; // ISO date string
  goal?: string;
  notes?: string;
  completed: boolean;
}
