import type { Subject } from '../types/subject';
import type { SessionRecord } from '../types/session';
import type { TimerSettings, DailyGoal } from '../types/settings';
import type { User } from '../types/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'study_notebook_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `API Error: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {
      // ignore
    }
    if (response.status === 401) {
      setAuthToken(null);
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

// ================= AUTH API =================

export async function apiRegister(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
  const res = await request<{ user: User; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
  setAuthToken(res.token);
  return res;
}

export async function apiLogin(email: string, password: string): Promise<{ user: User; token: string }> {
  const res = await request<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setAuthToken(res.token);
  return res;
}

export async function apiGoogleAuth(data: { credential?: string; email?: string; name?: string; avatar?: string }): Promise<{ user: User; token: string }> {
  const res = await request<{ user: User; token: string }>('/auth/google', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  setAuthToken(res.token);
  return res;
}

export async function apiGuestAuth(): Promise<{ user: User; token: string }> {
  const res = await request<{ user: User; token: string }>('/auth/guest', {
    method: 'POST'
  });
  setAuthToken(res.token);
  return res;
}

export async function apiGetCurrentUser(): Promise<User | null> {
  try {
    const res = await request<{ user: User }>('/auth/me');
    return res.user;
  } catch {
    return null;
  }
}

// ================= SUBJECTS API =================

export async function apiGetSubjects(userId: string): Promise<Subject[]> {
  return request<Subject[]>(`/subjects/${userId}`);
}

export async function apiCreateSubject(userId: string, subject: Subject): Promise<Subject> {
  return request<Subject>('/subjects', {
    method: 'POST',
    body: JSON.stringify({ ...subject, userId })
  });
}

export async function apiUpdateSubject(subject: Subject): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/subjects/${subject.id}`, {
    method: 'PUT',
    body: JSON.stringify(subject)
  });
}

export async function apiDeleteSubject(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/subjects/${id}`, {
    method: 'DELETE'
  });
}

// ================= SESSIONS API =================

export async function apiGetSessions(userId: string): Promise<SessionRecord[]> {
  return request<SessionRecord[]>(`/sessions/${userId}`);
}

export async function apiCreateSession(userId: string, session: SessionRecord): Promise<SessionRecord> {
  return request<SessionRecord>('/sessions', {
    method: 'POST',
    body: JSON.stringify({ ...session, userId })
  });
}

export async function apiDeleteSession(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/sessions/${id}`, {
    method: 'DELETE'
  });
}

export async function apiClearAllSessions(userId: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/sessions/user/${userId}`, {
    method: 'DELETE'
  });
}

// ================= SETTINGS API =================

export async function apiGetSettings(userId: string): Promise<TimerSettings> {
  return request<TimerSettings>(`/settings/${userId}`);
}

export async function apiUpdateSettings(userId: string, settings: TimerSettings): Promise<TimerSettings> {
  return request<TimerSettings>(`/settings/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(settings)
  });
}

// ================= GOALS API =================

export async function apiGetDailyGoal(userId: string): Promise<DailyGoal> {
  return request<DailyGoal>(`/goals/${userId}`);
}

export async function apiUpdateDailyGoal(userId: string, goal: DailyGoal): Promise<DailyGoal> {
  return request<DailyGoal>(`/goals/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(goal)
  });
}
