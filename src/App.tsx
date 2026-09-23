import { useState, useEffect, useRef } from 'react';
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
  saveCurrentUser
} from './utils/storage';
import { 
  playStudyCompleteSound, 
  playBreakCompleteSound, 
  playGoalCelebrationSound,
  stopBreakAlarmLoop 
} from './utils/audio';

export function App() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Application Data States
  const [subjects, setSubjects] = useState<Subject[]>(() => loadSubjects());
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => loadActiveSubjectId());
  const [sessions, setSessions] = useState<SessionRecord[]>(() => loadSessions());
  const [settings, setSettings] = useState<TimerSettings>(() => loadSettings());
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>(() => loadDailyGoal());
  const [goal, setGoal] = useState<string>('Finish the useState lesson');
  const [user, setUser] = useState<User | null>(() => loadCurrentUser());

  // Modals
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isRandomPickerOpen, setIsRandomPickerOpen] = useState(false);
  const [celebratingSubject, setCelebratingSubject] = useState<Subject | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isBreakCompleteModalOpen, setIsBreakCompleteModalOpen] = useState(false);

  // Timer states
  const [mode, setMode] = useState<TimerMode>('study');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const getDurationSeconds = (m: TimerMode, currentSettings: TimerSettings) => {
    switch (m) {
      case 'study':
        return currentSettings.studyMinutes * 60;
      case 'shortBreak':
        return currentSettings.shortBreakMinutes * 60;
      case 'longBreak':
        return currentSettings.longBreakMinutes * 60;
    }
  };

  const [totalTime, setTotalTime] = useState<number>(() => settings.studyMinutes * 60);
  const [timeLeft, setTimeLeft] = useState<number>(() => settings.studyMinutes * 60);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Sync state changes with localStorage
  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveDailyGoal(dailyGoal);
  }, [dailyGoal]);

  useEffect(() => {
    saveActiveSubjectId(selectedSubjectId);
  }, [selectedSubjectId]);

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
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
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
    handleSelectMode('study');
    handleStartTimer();
  };

  const handleBreakDismiss = () => {
    stopBreakAlarmLoop();
    setIsBreakCompleteModalOpen(false);
    handleSelectMode('study');
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

      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id === activeSubject.id) {
            const updated: Subject = {
              ...s,
              sessionsCount: s.sessionsCount + 1,
              totalMinutes: newTotal,
              goalCelebrated: s.goalCelebrated || justReachedGoal,
            };
            if (justReachedGoal) {
              subjectToCelebrate = updated;
            }
            return updated;
          }
          return s;
        })
      );
    }

    // Update streak if first study today
    const today = new Date().toISOString().split('T')[0];
    if (dailyGoal.lastActiveDate !== today) {
      setDailyGoal((prev) => ({
        ...prev,
        streakDays: prev.streakDays + 1,
        longestStreak: Math.max(prev.streakDays + 1, prev.longestStreak),
        lastActiveDate: today,
      }));
    }

    setIsCompletionModalOpen(false);

    // Switch to Short Break
    setMode('shortBreak');
    const breakDur = settings.shortBreakMinutes * 60;
    setTotalTime(breakDur);
    setTimeLeft(breakDur);

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
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const handleResumeTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    const dur = getDurationSeconds(mode, settings);
    setTotalTime(dur);
    setTimeLeft(dur);
  };

  const handleSkipTimer = () => {
    if (confirm('Skip to session completion?')) {
      handleTimerComplete();
    }
  };

  const handleSelectMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setIsPaused(false);
    setMode(newMode);
    const dur = getDurationSeconds(newMode, settings);
    setTotalTime(dur);
    setTimeLeft(dur);
  };

  // Subject actions
  const handleAddSubject = (newSub: Omit<Subject, 'id' | 'sessionsCount' | 'totalMinutes' | 'status'>) => {
    const created: Subject = {
      ...newSub,
      id: `sub-${Date.now()}`,
      sessionsCount: 0,
      totalMinutes: 0,
      status: 'active',
    };
    setSubjects((prev) => [...prev, created]);
    setSelectedSubjectId(created.id);
  };

  const handleEditSubject = (updated: Subject) => {
    const isBelowGoal = Boolean(updated.targetMinutes && updated.totalMinutes < updated.targetMinutes);
    const cleaned: Subject = {
      ...updated,
      goalCelebrated: isBelowGoal ? false : updated.goalCelebrated,
    };
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? cleaned : s)));
  };

  const handleFinishSubject = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: 'completed', completedAt: today }
          : s
      )
    );
  };

  const handleReopenSubject = (id: string) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: 'active', completedAt: undefined }
          : s
      )
    );
  };


  const handleDeleteSubject = (id: string) => {
    if (subjects.length <= 1) {
      alert('You need to keep at least one subject in your notebook.');
      return;
    }
    if (confirm('Delete this subject from your study notebook?')) {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      if (selectedSubjectId === id) {
        const remaining = subjects.filter((s) => s.id !== id);
        if (remaining.length > 0) setSelectedSubjectId(remaining[0].id);
      }
    }
  };

  const handleSelectAndStudy = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setActiveTab('dashboard');
    handleResetTimer();
  };

  const handleRandomSelectAndStart = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setIsRandomPickerOpen(false);
    setActiveTab('dashboard');
    handleResetTimer();
    setIsRunning(true);
    setIsPaused(false);
  };

  // History actions
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearAllSessions = () => {
    setSessions([]);
  };

  // Settings actions
  const handleSaveSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    if (!isRunning && !isPaused) {
      const dur = getDurationSeconds(mode, newSettings);
      setTotalTime(dur);
      setTimeLeft(dur);
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
    setSettings(defaultSettings);
    handleResetTimer();
  };

  // User auth actions
  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    if (confirm('Sign out of your study notebook?')) {
      setUser(null);
    }
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
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

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
            onSelectSubject={setSelectedSubjectId}
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
        <p>✎ StudyTime — Handcrafted for focused students</p>
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

    </div>
  );
}

export default App;
