export interface Subject {
  id: string;
  name: string;
  color?: string; // e.g. '#FDE68A' (Yellow), '#BBF7D0' (Green), '#BFDBFE' (Blue), '#FBCFE8' (Pink)
  icon?: string;
  sessionsCount: number;
  totalMinutes: number;
  goal?: string; // e.g. 'Finish Chapters 1–5'
  targetDate?: string; // YYYY-MM-DD
  targetMinutes?: number; // total target study minutes, e.g. 600 for 10 Hours
  status: 'active' | 'completed';
  completedAt?: string; // YYYY-MM-DD or ISO date string
  goalCelebrated?: boolean; // tracks if 100% goal celebration has already been triggered
}
