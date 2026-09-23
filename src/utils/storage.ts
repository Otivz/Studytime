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

// No mock data — fresh users start with nothing until they add subjects
export const DEFAULT_SUBJECTS: Subject[] = [];

export const DEFAULT_SETTINGS: TimerSettings = {
  studyMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  dailyGoalMinutes: 120,
  soundEnabled: true,
};

export const DEFAULT_GOAL: DailyGoal = {
  targetMinutes: 120,
  streakDays: 0,
  lastActiveDate: '',
  longestStreak: 0,
};

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
  return [];
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
  return '';
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

export function clearAllStoredUserData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('study_notebook_token');
    localStorage.removeItem('study_remembered_email');
  } catch (e) {
    console.error('Failed to clear stored data', e);
  }
}
