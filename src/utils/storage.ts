import type { Subject } from '../types/subject';
import type { SessionRecord } from '../types/session';
import type { TimerSettings, DailyGoal } from '../types/settings';
import type { User } from '../types/auth';

const STORAGE_KEYS = {
  SUBJECTS: 'study_notebook_subjects',
  SESSIONS: 'study_notebook_sessions',
  SETTINGS: 'study_notebook_settings',
  DAILY_GOAL: 'study_notebook_goal',
  ACTIVE_SUBJECT: 'study_notebook_active_subject_id',
  USER: 'study_notebook_current_user',
};

const DEFAULT_SUBJECTS: Subject[] = [
  { 
    id: 'sub-1', 
    name: 'React Development', 
    color: '#BFDBFE', 
    icon: '📚', 
    sessionsCount: 6, 
    totalMinutes: 150, 
    goal: 'Build interactive StudyTime app and state hooks',
    targetDate: '2026-09-28',
    targetMinutes: 300, // 5 hours
    status: 'active',
  },
  { 
    id: 'sub-2', 
    name: 'Database Systems', 
    color: '#BBF7D0', 
    icon: '📚', 
    sessionsCount: 4, 
    totalMinutes: 100, 
    goal: 'Finish Chapters 1–5',
    targetDate: '2026-09-30',
    targetMinutes: 600, // 10 hours
    status: 'active',
  },
  { 
    id: 'sub-3', 
    name: 'Capstone Project', 
    color: '#FDE68A', 
    icon: '📚', 
    sessionsCount: 3, 
    totalMinutes: 75, 
    goal: 'Complete architecture diagram and schema',
    targetDate: '2026-10-05',
    targetMinutes: 480, // 8 hours
    status: 'active',
  },
  { 
    id: 'sub-4', 
    name: 'Python', 
    color: '#FBCFE8', 
    icon: '📚', 
    sessionsCount: 5, 
    totalMinutes: 125, 
    goal: 'Master algorithm patterns and LeetCode sets',
    targetDate: '2026-10-10',
    targetMinutes: 360, // 6 hours
    status: 'active',
  },
  { 
    id: 'sub-5', 
    name: 'Flutter', 
    color: '#BFDBFE', 
    icon: '📚', 
    sessionsCount: 2, 
    totalMinutes: 50, 
    goal: 'Read widget lifecycle guide',
    status: 'completed',
    completedAt: '2026-09-20',
  },
];


const DEFAULT_SETTINGS: TimerSettings = {
  studyMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  dailyGoalMinutes: 120, // 120 minutes default from prompt
  soundEnabled: true,
};

const DEFAULT_GOAL: DailyGoal = {
  targetMinutes: 120,
  streakDays: 5, // "🔥 5 Day Streak"
  lastActiveDate: new Date().toISOString().split('T')[0],
  longestStreak: 8,
};

function generateInitialSessions(): SessionRecord[] {
  const now = new Date();
  const sessions: SessionRecord[] = [];

  // Today's sessions matching the prompt's examples
  const today1 = new Date(now.getTime() - 25 * 60000);
  const today2 = new Date(now.getTime() - 65 * 60000);
  const today3 = new Date(now.getTime() - 110 * 60000);
  const today4 = new Date(now.getTime() - 160 * 60000);

  sessions.push({
    id: 'sess-today-1',
    subjectId: 'sub-1',
    subjectName: 'React Development',
    durationMinutes: 25,
    timestamp: today1.toISOString(),
    goal: 'Finish the useState lesson',
    notes: 'Practiced component state and conditional rendering',
    completed: true,
  });

  sessions.push({
    id: 'sess-today-2',
    subjectId: 'sub-2',
    subjectName: 'Database Systems',
    durationMinutes: 25,
    timestamp: today2.toISOString(),
    goal: 'Review normalization',
    notes: 'Covered 1NF, 2NF, 3NF with practice queries',
    completed: true,
  });

  sessions.push({
    id: 'sess-today-3',
    subjectId: 'sub-3',
    subjectName: 'Capstone Project',
    durationMinutes: 20,
    timestamp: today3.toISOString(),
    goal: 'Draft architecture diagram',
    notes: 'Completed system schema blueprint',
    completed: true,
  });

  sessions.push({
    id: 'sess-today-4',
    subjectId: 'sub-4',
    subjectName: 'Python',
    durationMinutes: 15,
    timestamp: today4.toISOString(),
    goal: 'List comprehension practice',
    notes: 'Solved 8 LeetCode problems',
    completed: true,
  });

  // Yesterday's session
  const yesterday = new Date(now.getTime() - 24 * 3600000);
  sessions.push({
    id: 'sess-yesterday-1',
    subjectId: 'sub-1',
    subjectName: 'React Development',
    durationMinutes: 25,
    timestamp: yesterday.toISOString(),
    goal: 'Read useEffect documentation',
    notes: 'Understood dependency array rules',
    completed: true,
  });

  return sessions;
}

export function loadSubjects(): Subject[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.map((s: Subject) => {
        const isGoalAlreadyReached = Boolean(s.targetMinutes && s.targetMinutes > 0 && s.totalMinutes >= s.targetMinutes);
        return {
          ...s,
          status: s.status || 'active',
          goalCelebrated: s.goalCelebrated ?? (isGoalAlreadyReached || s.status === 'completed'),
        };
      });
    }
  } catch (e) {
    console.error('Failed to load subjects', e);
  }
  saveSubjects(DEFAULT_SUBJECTS);
  return DEFAULT_SUBJECTS;
}


export function saveSubjects(subjects: Subject[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed to save subjects', e);
  }
}

export function loadSessions(): SessionRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load sessions', e);
  }
  const initial = generateInitialSessions();
  saveSessions(initial);
  return initial;
}

export function saveSessions(sessions: SessionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions', e);
  }
}

export function loadSettings(): TimerSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: TimerSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadDailyGoal(): DailyGoal {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_GOAL);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load daily goal', e);
  }
  saveDailyGoal(DEFAULT_GOAL);
  return DEFAULT_GOAL;
}

export function saveDailyGoal(goal: DailyGoal): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_GOAL, JSON.stringify(goal));
  } catch (e) {
    console.error('Failed to save daily goal', e);
  }
}

export function loadActiveSubjectId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_SUBJECT);
    if (id) return id;
  } catch {
    // ignore
  }
  return DEFAULT_SUBJECTS[0].id;
}

export function saveActiveSubjectId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SUBJECT, id);
  } catch {
    // ignore
  }
}

export function loadCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load user', e);
  }
  return null;
}

export function saveCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  } catch (e) {
    console.error('Failed to save user', e);
  }
}
