import { useState, useEffect, useRef, useCallback } from 'react';
import type { NavTab } from './components/Navigation';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Calendar } from './pages/Calendar';
import { History } from './pages/History';
import { Subjects } from './pages/Subjects';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';

import { CompletionModal } from './components/CompletionModal';
import { RandomSubjectModal } from './components/RandomSubjectModal';
import { GoalCelebrationModal } from './components/GoalCelebrationModal';
import { BreakCompleteModal } from './components/BreakCompleteModal';
import { LogoutModal } from './components/LogoutModal';
import { SkipConfirmModal } from './components/SkipConfirmModal';

import type { Subject } from './types/subject';
import type { SessionRecord, TimerMode } from './types/session';
import type { TimerSettings, DailyGoal } from './types/settings';
import type { User } from './types/auth';

import { 
  loadSubjects, 
  saveSubjects, 
  loadSessions, 
  saveSessions, 
  loadSettings, 
  saveSettings, 
  loadDailyGoal, 
  saveDailyGoal, 
  loadActiveSubjectId, 
  saveActiveSubjectId,
  loadCurrentUser,
  saveCurrentUser,
  clearAllStoredUserData,
  DEFAULT_SETTINGS,
  DEFAULT_GOAL,
  loadStoredTimer,
  saveStoredTimer,
  clearStoredTimer,
  type TimerModeProgress,
  type StoredTimerState
} from './utils/storage';
import { 
  apiGetSubjects, 
  apiCreateSubject, 
  apiUpdateSubject, 
  apiDeleteSubject, 
  apiGetSessions, 
  apiCreateSession, 
  apiDeleteSession, 
  apiClearAllSessions, 
  apiGetSettings, 
  apiUpdateSettings, 
  apiGetDailyGoal, 
  apiUpdateDailyGoal,
  setAuthToken
} from './utils/api';
import { 
  playStudyCompleteSound, 
  playBreakCompleteSound, 
  playGoalCelebrationSound,
  stopBreakAlarmLoop 
} from './utils/audio';

export const getDurationSeconds = (m: TimerMode, currentSettings: TimerSettings, currentSubject?: Subject) => {
  switch (m) {
    case 'study':
      if (currentSubject?.targetMinutes && currentSubject.targetMinutes > 0) {
        const remaining = currentSubject.targetMinutes - currentSubject.totalMinutes;
        const mins = (remaining > 0)
          ? remaining
          : currentSubject.targetMinutes;
        return mins * 60;
      }
      return currentSettings.studyMinutes * 60;
    case 'shortBreak':
      return currentSettings.shortBreakMinutes * 60;
    case 'longBreak':
      return currentSettings.longBreakMinutes * 60;
  }
};

function computeModeInitialState(
  targetMode: TimerMode,
  currentSettings: TimerSettings,
  currentSubject?: Subject,
  savedData?: TimerModeProgress
): TimerModeProgress {
  const defaultDur = getDurationSeconds(targetMode, currentSettings, currentSubject);

  if (!savedData) {
    return {
      timeLeft: defaultDur,
      totalTime: defaultDur,
      isRunning: false,
      isPaused: false,
      targetEndTime: null,
      subjectId: targetMode === 'study' ? currentSubject?.id : undefined,
    };
  }

  if (savedData.isRunning && savedData.targetEndTime) {
    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((savedData.targetEndTime - now) / 1000));
    if (remaining > 0) {
      return {
        timeLeft: remaining,
        totalTime: savedData.totalTime || defaultDur,
        isRunning: true,
        isPaused: false,
        targetEndTime: savedData.targetEndTime,
        subjectId: savedData.subjectId,
      };
    } else {
      return {
        timeLeft: 0,
        totalTime: savedData.totalTime || defaultDur,
        isRunning: false,
        isPaused: false,
        targetEndTime: null,
        subjectId: savedData.subjectId,
      };
    }
  }

  if (savedData.isPaused) {
    return {
      timeLeft: typeof savedData.timeLeft === 'number' ? savedData.timeLeft : defaultDur,
      totalTime: savedData.totalTime || defaultDur,
      isRunning: false,
      isPaused: true,
      targetEndTime: null,
      subjectId: savedData.subjectId,
    };
  }

  return {
    timeLeft: typeof savedData.timeLeft === 'number' ? savedData.timeLeft : defaultDur,
    totalTime: savedData.totalTime || defaultDur,
    isRunning: false,
    isPaused: false,
    targetEndTime: null,
    subjectId: savedData.subjectId,
  };
}

export function App() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Application Data States (initialized from user cache if logged in, else clean defaults)
  const [user, setUser] = useState<User | null>(() => loadCurrentUser());
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const initialUser = loadCurrentUser();
    return initialUser ? loadSubjects() : [];
  });
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => loadActiveSubjectId());
  const [sessions, setSessions] = useState<SessionRecord[]>(() => {
    const initialUser = loadCurrentUser();
    return initialUser ? loadSessions() : [];
  });
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const initialUser = loadCurrentUser();
    return initialUser ? loadSettings() : DEFAULT_SETTINGS;
  });
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>(() => {
    const initialUser = loadCurrentUser();
    return initialUser ? loadDailyGoal() : DEFAULT_GOAL;
  });

  // Modals
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isRandomPickerOpen, setIsRandomPickerOpen] = useState(false);
  const [celebratingSubject, setCelebratingSubject] = useState<Subject | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isBreakCompleteModalOpen, setIsBreakCompleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Saved timer cache for persistent session across refresh and mode switches
  const [initialStored] = useState<StoredTimerState | null>(() => loadStoredTimer());

  const [modeStates, setModeStates] = useState<{
    study: TimerModeProgress;
    shortBreak: TimerModeProgress;
    longBreak: TimerModeProgress;
  }>(() => {
    const initialUser = loadCurrentUser();
    const loadedSubs = initialUser ? loadSubjects() : [];
    const activeSubId = loadActiveSubjectId();
    const initialSub = loadedSubs.find((s) => s.id === activeSubId) || loadedSubs[0];
    const loadedSettings = initialUser ? loadSettings() : DEFAULT_SETTINGS;

    return {
      study: computeModeInitialState('study', loadedSettings, initialSub, initialStored?.modes?.study),
      shortBreak: computeModeInitialState('shortBreak', loadedSettings, initialSub, initialStored?.modes?.shortBreak),
      longBreak: computeModeInitialState('longBreak', loadedSettings, initialSub, initialStored?.modes?.longBreak),
    };
  });

  const initialMode: TimerMode = initialStored?.currentMode || 'study';
  const initialActive = modeStates[initialMode];

  const [mode, setMode] = useState<TimerMode>(initialMode);
  const [isRunning, setIsRunning] = useState<boolean>(initialActive.isRunning);
  const [isPaused, setIsPaused] = useState<boolean>(initialActive.isPaused);
  const [totalTime, setTotalTime] = useState<number>(initialActive.totalTime);
  const [timeLeft, setTimeLeft] = useState<number>(initialActive.timeLeft);
  const [goal, setGoal] = useState<string>(() => initialStored?.goal || '');

  const targetEndTimeRef = useRef<number | null>(initialActive.isRunning ? initialActive.targetEndTime : null);

  // Auto-complete timer on load if expired while page was closed
  useEffect(() => {
    if (initialStored?.modes?.[initialMode]?.isRunning && initialActive.timeLeft <= 0) {
      handleTimerComplete();
    }
  }, []);

  // Keep timer synced with active subject ONLY if study timer is completely idle (never started or reset)
  const isStudyTimerIdle = !isRunning && !isPaused && mode === 'study' && timeLeft === totalTime;
  useEffect(() => {
    if (isStudyTimerIdle) {
      const dur = getDurationSeconds('study', settings, activeSubject);
      setTotalTime(dur);
      setTimeLeft(dur);
      setModeStates((prev) => ({
        ...prev,
        study: {
          ...prev.study,
          timeLeft: dur,
          totalTime: dur,
          subjectId: activeSubject?.id,
        }
      }));
    }
  }, [selectedSubjectId, activeSubject?.id, activeSubject?.targetMinutes, activeSubject?.totalMinutes, settings.studyMinutes, isStudyTimerIdle]);

  // ================= MYSQL BACKEND SYNC =================
  const fetchBackendUserData = useCallback(async (userId: string) => {
    try {
      // 1. Fetch Subjects
      const backendSubjects = await apiGetSubjects(userId);
      if (backendSubjects && backendSubjects.length > 0) {
        setSubjects(backendSubjects);
        setSelectedSubjectId((prev) => 
          backendSubjects.some(s => s.id === prev) ? prev : backendSubjects[0].id
        );
      }

      // 2. Fetch Sessions
      const backendSessions = await apiGetSessions(userId);
      if (backendSessions) {
        setSessions(backendSessions);
      }

      // 3. Fetch Settings
      const backendSettings = await apiGetSettings(userId);
      if (backendSettings) {
        setSettings(backendSettings);
      }

      // 4. Fetch Daily Goals
      const backendGoal = await apiGetDailyGoal(userId);
      if (backendGoal) {
        setDailyGoal(backendGoal);
      }
    } catch (err) {
      console.warn('Could not sync with MySQL backend, using local cache:', err);
    }
  }, []);

  // When user changes or on initial mount, load from MySQL if logged in
  useEffect(() => {
    if (user?.id) {
      fetchBackendUserData(user.id);
    }
  }, [user?.id, fetchBackendUserData]);

  // Sync state changes with localStorage ONLY if user is logged in
  useEffect(() => {
    if (user) saveSubjects(subjects);
  }, [subjects, user]);

  useEffect(() => {
    if (user) saveSessions(sessions);
  }, [sessions, user]);

  useEffect(() => {
    if (user) saveSettings(settings);
  }, [settings, user]);

  useEffect(() => {
    if (user) saveDailyGoal(dailyGoal);
  }, [dailyGoal, user]);

  useEffect(() => {
    if (user) saveActiveSubjectId(selectedSubjectId);
  }, [selectedSubjectId, user]);

  useEffect(() => {
    saveCurrentUser(user);
  }, [user]);

  // Today's calculated stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s) => s.timestamp.startsWith(todayStr));
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  // Timer Tick Interval
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      }

      timerRef.current = window.setInterval(() => {
        if (!targetEndTimeRef.current) return;
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((targetEndTimeRef.current - now) / 1000));
        setTimeLeft(diff);

        if (diff <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          targetEndTimeRef.current = null;
          handleTimerComplete();
        }
      }, 500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, settings, activeSubject, goal]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    setIsPaused(false);
    targetEndTimeRef.current = null;

    if (mode === 'study') {
      if (settings.soundEnabled) {
        playStudyCompleteSound();
      }
      // Trigger Completion Modal for notes and celebration
      setIsCompletionModalOpen(true);
    } else {
      if (settings.soundEnabled) {
        playBreakCompleteSound();
      }
      // Show Break's Over modal
      setIsBreakCompleteModalOpen(true);
    }
  };

  // Break completion actions
  const handleBreakStartStudying = () => {
    stopBreakAlarmLoop();
    setIsBreakCompleteModalOpen(false);

    // Reset break timer in modeStates so next break is fresh
    const breakDur = settings.shortBreakMinutes * 60;
    const resetBreak: TimerModeProgress = {
      timeLeft: breakDur,
      totalTime: breakDur,
      isRunning: false,
      isPaused: false,
      targetEndTime: null,
    };

    // Switch to study mode and start (resuming paused or starting fresh)
    const studyProgress = modeStates.study;
    const studyLeft = studyProgress.timeLeft > 0 ? studyProgress.timeLeft : getDurationSeconds('study', settings, activeSubject);
    const studyTotal = studyProgress.totalTime > 0 ? studyProgress.totalTime : getDurationSeconds('study', settings, activeSubject);
    const end = Date.now() + studyLeft * 1000;
    targetEndTimeRef.current = end;

    setMode('study');
    setTimeLeft(studyLeft);
    setTotalTime(studyTotal);
    setIsRunning(true);
    setIsPaused(false);

    setModeStates((prev) => ({
      ...prev,
      shortBreak: resetBreak,
      study: {
        ...prev.study,
        timeLeft: studyLeft,
        totalTime: studyTotal,
        isRunning: true,
        isPaused: false,
        targetEndTime: end,
      }
    }));
  };

  const handleBreakDismiss = () => {
    stopBreakAlarmLoop();
    setIsBreakCompleteModalOpen(false);

    // Reset break timer in modeStates so next break is fresh
    const breakDur = settings.shortBreakMinutes * 60;
    const resetBreak: TimerModeProgress = {
      timeLeft: breakDur,
      totalTime: breakDur,
      isRunning: false,
      isPaused: false,
      targetEndTime: null,
    };

    // Switch to study mode (staying paused or idle)
    const studyProgress = modeStates.study;
    const studyLeft = studyProgress.timeLeft > 0 ? studyProgress.timeLeft : getDurationSeconds('study', settings, activeSubject);
    const studyTotal = studyProgress.totalTime > 0 ? studyProgress.totalTime : getDurationSeconds('study', settings, activeSubject);
    const isStudyPaused = studyProgress.isPaused || (studyLeft < studyTotal);

    setMode('study');
    setTimeLeft(studyLeft);
    setTotalTime(studyTotal);
    setIsRunning(false);
    setIsPaused(isStudyPaused);
    targetEndTimeRef.current = null;

    setModeStates((prev) => ({
      ...prev,
      shortBreak: resetBreak,
      study: {
        ...prev.study,
        timeLeft: studyLeft,
        totalTime: studyTotal,
        isRunning: false,
        isPaused: isStudyPaused,
        targetEndTime: null,
      }
    }));
  };

  // Completion modal save
  const handleSaveCompletedSession = (notes: string) => {
    const durationMins = Math.round(totalTime / 60);

    const newRecord: SessionRecord = {
      id: `sess-${Date.now()}`,
      subjectId: activeSubject ? activeSubject.id : 'general',
      subjectName: activeSubject ? activeSubject.name : 'General Focus',
      durationMinutes: durationMins,
      timestamp: new Date().toISOString(),
      goal: goal.trim() || undefined,
      notes: notes.trim() || undefined,
      completed: true,
    };

    setSessions((prev) => [newRecord, ...prev]);

    // Save session to MySQL backend
    if (user?.id) {
      apiCreateSession(user.id, newRecord).catch(e => console.error('Failed to save session to DB:', e));
    }

    let justReachedGoal = false;
    let subjectToCelebrate: Subject | null = null;

    // Update subject counters
    if (activeSubject) {
      const prevTotal = activeSubject.totalMinutes;
      const newTotal = prevTotal + durationMins;
      const target = activeSubject.targetMinutes;

      // Only trigger celebration when transitioning from < 100% to >= 100% and not previously celebrated
      if (target && target > 0 && prevTotal < target && newTotal >= target && !activeSubject.goalCelebrated) {
        justReachedGoal = true;
      }

      const updatedSubject: Subject = {
        ...activeSubject,
        sessionsCount: activeSubject.sessionsCount + 1,
        totalMinutes: newTotal,
        goalCelebrated: activeSubject.goalCelebrated || justReachedGoal,
      };

      if (justReachedGoal) {
        subjectToCelebrate = updatedSubject;
      }

      setSubjects((prev) =>
        prev.map((s) => (s.id === activeSubject.id ? updatedSubject : s))
      );

      // Save updated subject to MySQL backend
      if (user?.id) {
        apiUpdateSubject(updatedSubject).catch(e => console.error('Failed to update subject in DB:', e));
      }
    }

    // Update streak if first study today
    const today = new Date().toISOString().split('T')[0];
    if (dailyGoal.lastActiveDate !== today) {
      const updatedGoal: DailyGoal = {
        ...dailyGoal,
        streakDays: dailyGoal.streakDays + 1,
        longestStreak: Math.max(dailyGoal.streakDays + 1, dailyGoal.longestStreak),
        lastActiveDate: today,
      };
      setDailyGoal(updatedGoal);

      // Save streak to MySQL backend
      if (user?.id) {
        apiUpdateDailyGoal(user.id, updatedGoal).catch(e => console.error('Failed to update streak in DB:', e));
      }
    }

    setIsCompletionModalOpen(false);

    // Reset study mode for the next session
    const nextStudyDur = getDurationSeconds('study', settings, activeSubject);
    const freshStudyState: TimerModeProgress = {
      timeLeft: nextStudyDur,
      totalTime: nextStudyDur,
      isRunning: false,
      isPaused: false,
      targetEndTime: null,
      subjectId: activeSubject?.id,
    };

    // Switch to Short Break
    const breakDur = settings.shortBreakMinutes * 60;
    const freshBreakState: TimerModeProgress = {
      timeLeft: breakDur,
      totalTime: breakDur,
      isRunning: false,
      isPaused: false,
      targetEndTime: null,
    };

    setMode('shortBreak');
    setTotalTime(breakDur);
    setTimeLeft(breakDur);
    setIsRunning(false);
    setIsPaused(false);
    targetEndTimeRef.current = null;

    setModeStates((prev) => ({
      ...prev,
      study: freshStudyState,
      shortBreak: freshBreakState,
    }));

    // If goal was just reached, sequence celebration modal & sound
    if (justReachedGoal && subjectToCelebrate) {
      setTimeout(() => {
        setCelebratingSubject(subjectToCelebrate);
        setIsGoalModalOpen(true);
        if (settings.soundEnabled) {
          playGoalCelebrationSound();
        }
      }, 350);
    }
  };

  const handleSkipCompletedModal = () => {
    handleSaveCompletedSession('');
  };

  // Timer controls
  const handleStartTimer = () => {
    const end = Date.now() + timeLeft * 1000;
    targetEndTimeRef.current = end;
    setIsRunning(true);
    setIsPaused(false);
    setModeStates((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        timeLeft,
        totalTime,
        isRunning: true,
        isPaused: false,
        targetEndTime: end,
        subjectId: mode === 'study' ? activeSubject?.id : undefined,
      }
    }));
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
    targetEndTimeRef.current = null;
    setModeStates((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        timeLeft,
        totalTime,
        isRunning: false,
        isPaused: true,
        targetEndTime: null,
        subjectId: mode === 'study' ? activeSubject?.id : undefined,
      }
    }));
  };

  const handleResumeTimer = () => {
    const end = Date.now() + timeLeft * 1000;
    targetEndTimeRef.current = end;
    setIsRunning(true);
    setIsPaused(false);
    setModeStates((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        timeLeft,
        totalTime,
        isRunning: true,
        isPaused: false,
        targetEndTime: end,
        subjectId: mode === 'study' ? activeSubject?.id : undefined,
      }
    }));
  };

  const handleResetTimer = (targetSub?: Subject) => {
    setIsRunning(false);
    setIsPaused(false);
    targetEndTimeRef.current = null;
    const sub = targetSub || activeSubject;
    const dur = getDurationSeconds(mode, settings, sub);
    setTotalTime(dur);
    setTimeLeft(dur);
    setModeStates((prev) => ({
      ...prev,
      [mode]: {
        timeLeft: dur,
        totalTime: dur,
        isRunning: false,
        isPaused: false,
        targetEndTime: null,
        subjectId: mode === 'study' ? sub?.id : undefined,
      }
    }));
  };

  const handleSkipTimer = () => {
    setIsSkipModalOpen(true);
  };

  const handleConfirmSkip = () => {
    setIsSkipModalOpen(false);
    handleTimerComplete();
  };

  const handleSelectMode = (newMode: TimerMode) => {
    if (newMode === mode) return;

    // 1. Snapshot and preserve current mode progress
    const currentModeRemaining = isRunning && targetEndTimeRef.current
      ? Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000))
      : timeLeft;

    const currentPaused = isPaused || isRunning || (currentModeRemaining < totalTime && currentModeRemaining > 0);

    const savedCurrentMode: TimerModeProgress = {
      timeLeft: currentModeRemaining,
      totalTime,
      isRunning: false, // Always pause when changing modes
      isPaused: currentPaused,
      targetEndTime: null,
      subjectId: mode === 'study' ? activeSubject?.id : undefined,
    };

    const updatedModes = {
      ...modeStates,
      [mode]: savedCurrentMode,
    };

    // 2. Prepare incoming mode
    const incomingModeProgress = updatedModes[newMode];
    let nextTotalTime = incomingModeProgress?.totalTime;
    let nextTimeLeft = incomingModeProgress?.timeLeft;
    let nextIsPaused = incomingModeProgress?.isPaused ?? false;

    // If incoming mode has no valid duration, initialize it from settings/subject
    if (!nextTotalTime || nextTotalTime <= 0) {
      const dur = getDurationSeconds(newMode, settings, activeSubject);
      nextTotalTime = dur;
      nextTimeLeft = dur;
      nextIsPaused = false;
    }

    // 3. Switch React active timer state
    setIsRunning(false);
    setIsPaused(nextIsPaused);
    targetEndTimeRef.current = null;
    setMode(newMode);
    setTotalTime(nextTotalTime);
    setTimeLeft(nextTimeLeft);

    setModeStates({
      ...updatedModes,
      [newMode]: {
        timeLeft: nextTimeLeft,
        totalTime: nextTotalTime,
        isRunning: false,
        isPaused: nextIsPaused,
        targetEndTime: null,
        subjectId: newMode === 'study' ? activeSubject?.id : undefined,
      }
    });
  };

  // Sync timer state changes to localStorage
  useEffect(() => {
    const currentModeRemaining = isRunning && targetEndTimeRef.current
      ? Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000))
      : timeLeft;

    const currentModeData: TimerModeProgress = {
      timeLeft: currentModeRemaining,
      totalTime,
      isRunning,
      isPaused,
      targetEndTime: isRunning ? targetEndTimeRef.current : null,
      subjectId: mode === 'study' ? selectedSubjectId : undefined,
    };

    const fullState: StoredTimerState = {
      currentMode: mode,
      goal,
      modes: {
        ...modeStates,
        [mode]: currentModeData,
      },
    };

    saveStoredTimer(fullState);
  }, [mode, isRunning, isPaused, totalTime, modeStates, goal, selectedSubjectId]);

  // Window beforeunload listener to catch exact second on browser refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentRemaining = isRunning && targetEndTimeRef.current
        ? Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000))
        : timeLeft;

      const currentModeData: TimerModeProgress = {
        timeLeft: currentRemaining,
        totalTime,
        isRunning,
        isPaused,
        targetEndTime: isRunning ? targetEndTimeRef.current : null,
        subjectId: mode === 'study' ? selectedSubjectId : undefined,
      };

      const fullState: StoredTimerState = {
        currentMode: mode,
        goal,
        modes: {
          ...modeStates,
          [mode]: currentModeData,
        },
      };

      saveStoredTimer(fullState);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [mode, timeLeft, totalTime, isRunning, isPaused, modeStates, goal, selectedSubjectId]);

  // Subject actions
  const handleAddSubject = (newSub: Omit<Subject, 'id' | 'sessionsCount' | 'totalMinutes' | 'status'>) => {
    const created: Subject = {
      ...newSub,
      id: `sub-${Date.now()}`,
      sessionsCount: 0,
      totalMinutes: 0,
      status: 'active',
      goalCelebrated: false
    };

    setSubjects((prev) => [...prev, created]);
    setSelectedSubjectId(created.id);

    // Save to MySQL backend
    if (user?.id) {
      apiCreateSubject(user.id, created).catch(e => console.error('Failed to save subject to DB:', e));
    }
  };

  const handleEditSubject = (updated: Subject) => {
    const isBelowGoal = Boolean(updated.targetMinutes && updated.totalMinutes < updated.targetMinutes);
    const cleaned: Subject = {
      ...updated,
      goalCelebrated: isBelowGoal ? false : updated.goalCelebrated,
    };
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? cleaned : s)));

    // Save to MySQL backend
    if (user?.id) {
      apiUpdateSubject(cleaned).catch(e => console.error('Failed to update subject in DB:', e));
    }
  };

  const handleFinishSubject = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const target = subjects.find(s => s.id === id);
    if (!target) return;

    const updated: Subject = {
      ...target,
      status: 'completed',
      completedAt: today
    };

    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? updated : s))
    );

    // Save to MySQL backend
    if (user?.id) {
      apiUpdateSubject(updated).catch(e => console.error('Failed to update subject status in DB:', e));
    }
  };

  const handleReopenSubject = (id: string) => {
    const target = subjects.find(s => s.id === id);
    if (!target) return;

    const updated: Subject = {
      ...target,
      status: 'active',
      completedAt: undefined
    };

    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? updated : s))
    );

    // Save to MySQL backend
    if (user?.id) {
      apiUpdateSubject(updated).catch(e => console.error('Failed to reopen subject in DB:', e));
    }
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm('Delete this subject from your study notebook?')) {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      if (selectedSubjectId === id) {
        const remaining = subjects.filter((s) => s.id !== id);
        setSelectedSubjectId(remaining.length > 0 ? remaining[0].id : '');
      }

      // Delete from MySQL backend
      if (user?.id) {
        apiDeleteSubject(id).catch(e => console.error('Failed to delete subject from DB:', e));
      }
    }
  };

  const handleSelectAndStudy = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setActiveTab('dashboard');
    setIsRunning(false);
    setIsPaused(false);
    targetEndTimeRef.current = null;
    setMode('study');
    const targetSub = subjects.find(s => s.id === subjectId);
    const dur = getDurationSeconds('study', settings, targetSub);
    setTotalTime(dur);
    setTimeLeft(dur);
    setModeStates((prev) => ({
      ...prev,
      study: {
        timeLeft: dur,
        totalTime: dur,
        isRunning: false,
        isPaused: false,
        targetEndTime: null,
        subjectId,
      }
    }));
  };

  const handleRandomSelectAndStart = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setIsRandomPickerOpen(false);
    setActiveTab('dashboard');
    setMode('study');
    const targetSub = subjects.find(s => s.id === subjectId);
    const dur = getDurationSeconds('study', settings, targetSub);
    const end = Date.now() + dur * 1000;
    targetEndTimeRef.current = end;
    setTotalTime(dur);
    setTimeLeft(dur);
    setIsRunning(true);
    setIsPaused(false);
    setModeStates((prev) => ({
      ...prev,
      study: {
        timeLeft: dur,
        totalTime: dur,
        isRunning: true,
        isPaused: false,
        targetEndTime: end,
        subjectId,
      }
    }));
  };

  const handleSelectSubject = (id: string) => {
    setSelectedSubjectId(id);
    if (!isRunning && !isPaused && mode === 'study') {
      const targetSub = subjects.find(s => s.id === id);
      const dur = getDurationSeconds('study', settings, targetSub);
      setTotalTime(dur);
      setTimeLeft(dur);
    }
  };

  // History actions
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));

    // Delete from MySQL backend
    if (user?.id) {
      apiDeleteSession(id).catch(e => console.error('Failed to delete session from DB:', e));
    }
  };

  const handleClearAllSessions = () => {
    setSessions([]);

    // Clear all from MySQL backend
    if (user?.id) {
      apiClearAllSessions(user.id).catch(e => console.error('Failed to clear sessions in DB:', e));
    }
  };

  // Settings actions
  const handleSaveSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    if (!isRunning && !isPaused && timeLeft === totalTime) {
      const dur = getDurationSeconds(mode, newSettings, activeSubject);
      setTotalTime(dur);
      setTimeLeft(dur);
      setModeStates((prev) => ({
        ...prev,
        [mode]: {
          ...prev[mode],
          timeLeft: dur,
          totalTime: dur,
        }
      }));
    }

    // Save to MySQL backend
    if (user?.id) {
      apiUpdateSettings(user.id, newSettings).catch(e => console.error('Failed to save settings to DB:', e));
    }
  };

  const handleResetDefaults = () => {
    const defaultSettings: TimerSettings = {
      studyMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      dailyGoalMinutes: 120,
      soundEnabled: true,
    };
    handleSaveSettings(defaultSettings);
    handleResetTimer();
  };

  // User auth actions
  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    // 1. Wipe all saved account data from local storage
    clearAllStoredUserData();
    clearStoredTimer();
    setAuthToken(null);

    // 2. Reset React memory state so previous user data is not retained
    setUser(null);
    setSubjects([]);
    setSelectedSubjectId('');
    setSessions([]);
    setSettings(DEFAULT_SETTINGS);
    setDailyGoal(DEFAULT_GOAL);
    setTotalTime(DEFAULT_SETTINGS.studyMinutes * 60);
    setTimeLeft(DEFAULT_SETTINGS.studyMinutes * 60);
    setIsRunning(false);
    setIsPaused(false);
    targetEndTimeRef.current = null;
    setGoal('');
    setMode('study');
    setModeStates({
      study: {
        timeLeft: DEFAULT_SETTINGS.studyMinutes * 60,
        totalTime: DEFAULT_SETTINGS.studyMinutes * 60,
        isRunning: false,
        isPaused: false,
        targetEndTime: null,
      },
      shortBreak: {
        timeLeft: DEFAULT_SETTINGS.shortBreakMinutes * 60,
        totalTime: DEFAULT_SETTINGS.shortBreakMinutes * 60,
        isRunning: false,
        isPaused: false,
        targetEndTime: null,
      },
      longBreak: {
        timeLeft: DEFAULT_SETTINGS.longBreakMinutes * 60,
        totalTime: DEFAULT_SETTINGS.longBreakMinutes * 60,
        isRunning: false,
        isPaused: false,
        targetEndTime: null,
      },
    });
    setActiveTab('dashboard');
  };


  const handleOpenLogin = () => {
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#242424] flex flex-col font-hand selection:bg-[#FDE68A] selection:text-[#242424] notebook-ruled pb-12">
      
      {/* 1. Header (Notebook page top) */}
      <Header 
        streakDays={dailyGoal.streakDays} 
        user={user}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
      />

      {/* 2. Navigation Tabs */}
      {activeTab !== 'login' && (
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      {/* 3. Main Page Content */}
      <main className="max-w-4xl w-full mx-auto px-4 mt-6 flex-1">
        {activeTab === 'dashboard' && (
          <Dashboard
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            goal={goal}
            mode={mode}
            timeLeft={timeLeft}
            totalTime={totalTime}
            isRunning={isRunning}
            isPaused={isPaused}
            streakDays={dailyGoal.streakDays}
            todaySessions={todaySessions}
            todayMinutes={todayMinutes}
            dailyGoalMinutes={settings.dailyGoalMinutes}
            onSelectSubject={handleSelectSubject}
            onChangeGoal={setGoal}
            onOpenNewSubject={() => setActiveTab('subjects')}
            onPickRandomSubject={() => setIsRandomPickerOpen(true)}
            onSelectMode={handleSelectMode}
            onStartTimer={handleStartTimer}
            onPauseTimer={handlePauseTimer}
            onResumeTimer={handleResumeTimer}
            onResetTimer={handleResetTimer}
            onSkipTimer={handleSkipTimer}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {activeTab === 'calendar' && (
          <Calendar
            subjects={subjects}
            sessions={sessions}
            onSelectSubjectAndStudy={handleSelectAndStudy}
          />
        )}

        {activeTab === 'subjects' && (
          <Subjects
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onEditSubject={handleEditSubject}
            onDeleteSubject={handleDeleteSubject}
            onSelectAndStudy={handleSelectAndStudy}
            onFinishSubject={handleFinishSubject}
            onReopenSubject={handleReopenSubject}
          />
        )}

        {activeTab === 'history' && (
          <History
            sessions={sessions}
            onDeleteSession={handleDeleteSession}
            onClearAllSessions={handleClearAllSessions}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onResetDefaults={handleResetDefaults}
          />
        )}

        {activeTab === 'login' && (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setActiveTab('dashboard')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 text-center mt-12 text-sm font-sketch text-[#6B6B6B] select-none">
        <p>✎ StudyTime — Handcrafted for focused students & connected to MySQL</p>
      </footer>

      {/* Completion Modal */}
      <CompletionModal
        isOpen={isCompletionModalOpen}
        subject={activeSubject}
        durationMinutes={Math.round(totalTime / 60)}
        goal={goal}
        onSave={handleSaveCompletedSession}
        onSkip={handleSkipCompletedModal}
      />

      {/* Random Subject Roulette Modal */}
      <RandomSubjectModal
        isOpen={isRandomPickerOpen}
        subjects={subjects}
        onClose={() => setIsRandomPickerOpen(false)}
        onSelectAndStart={handleRandomSelectAndStart}
      />

      {/* Goal Reached 100% Celebration Modal */}
      <GoalCelebrationModal
        isOpen={isGoalModalOpen}
        subject={celebratingSubject}
        onClose={() => setIsGoalModalOpen(false)}
      />

      {/* Break Complete Notification Modal */}
      <BreakCompleteModal
        isOpen={isBreakCompleteModalOpen}
        onStartStudying={handleBreakStartStudying}
        onDismiss={handleBreakDismiss}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        userName={user?.name || 'Guest'}
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />

      {/* Skip Session Confirmation Modal */}
      <SkipConfirmModal
        isOpen={isSkipModalOpen}
        mode={mode}
        onConfirm={handleConfirmSkip}
        onCancel={() => setIsSkipModalOpen(false)}
      />

    </div>
  );
}

export default App;
