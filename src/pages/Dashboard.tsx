import type { FC } from 'react';
import type { Subject } from '../types/subject';
import type { SessionRecord, TimerMode } from '../types/session';
import { SessionForm } from '../components/SessionForm';
import { Timer } from '../components/Timer';
import { DashboardStats } from '../components/DashboardStats';
import { SessionHistory } from '../components/SessionHistory';

interface DashboardProps {
  subjects: Subject[];
  selectedSubjectId: string;
  goal: string;
  mode: TimerMode;
  timeLeft: number;
  totalTime: number;
  isRunning: boolean;
  isPaused: boolean;
  streakDays: number;
  todaySessions: SessionRecord[];
  todayMinutes: number;
  dailyGoalMinutes: number;
  onSelectSubject: (id: string) => void;
  onChangeGoal: (goal: string) => void;
  onOpenNewSubject: () => void;
  onPickRandomSubject: () => void;
  onSelectMode: (mode: TimerMode) => void;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onResetTimer: () => void;
  onSkipTimer?: () => void;
  onDeleteSession: (id: string) => void;
}

export const Dashboard: FC<DashboardProps> = ({
  subjects,
  selectedSubjectId,
  goal,
  mode,
  timeLeft,
  totalTime,
  isRunning,
  isPaused,
  streakDays,
  todaySessions,
  todayMinutes,
  dailyGoalMinutes,
  onSelectSubject,
  onChangeGoal,
  onOpenNewSubject,
  onPickRandomSubject,
  onSelectMode,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onSkipTimer,
  onDeleteSession,
}) => {
  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  return (
    <div className="space-y-6">
      {/* 1. Main Study Session Area: What are you studying? */}
      <SessionForm
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        goal={goal}
        onSelectSubject={onSelectSubject}
        onChangeGoal={onChangeGoal}
        onOpenNewSubject={onOpenNewSubject}
        onPickRandomSubject={onPickRandomSubject}
      />

      {/* 2. Main Sketch Timer */}
      <Timer
        timeLeft={timeLeft}
        totalTime={totalTime}
        isRunning={isRunning}
        isPaused={isPaused}
        mode={mode}
        activeSubject={activeSubject}
        goal={goal}
        onSelectMode={onSelectMode}
        onStart={onStartTimer}
        onPause={onPauseTimer}
        onResume={onResumeTimer}
        onReset={onResetTimer}
        onSkip={onSkipTimer}
      />

      {/* 3. Today's Progress Stats */}
      <DashboardStats
        streakDays={streakDays}
        sessionsCount={todaySessions.length}
        todayMinutes={todayMinutes}
        dailyGoalMinutes={dailyGoalMinutes}
      />

      {/* 4. Today's Sessions Log */}
      <SessionHistory
        sessions={todaySessions}
        onDeleteSession={onDeleteSession}
        showAll={false}
      />
    </div>
  );
};
