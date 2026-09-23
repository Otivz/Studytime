import type { FC } from 'react';
import { 
  IoTimeOutline, 
  IoFlame, 
  IoCheckmarkCircleOutline, 
  IoTrophyOutline,
  IoTrendingUp
} from 'react-icons/io5';
import type { DailyGoal, SessionRecord } from '../types';

interface DailyStatsProps {
  todayMinutes: number;
  dailyGoal: DailyGoal;
  todaySessions: SessionRecord[];
}

export const DailyStats: FC<DailyStatsProps> = ({

  todayMinutes,
  dailyGoal,
  todaySessions,
}) => {
  const goalPercent = Math.min(100, Math.round((todayMinutes / Math.max(1, dailyGoal.targetMinutes)) * 100));
  
  const hours = Math.floor(todayMinutes / 60);
  const mins = todayMinutes % 60;
  const timeFormatted = `${hours > 0 ? `${hours}h ` : ''}${mins}m`;

  const targetHours = (dailyGoal.targetMinutes / 60).toFixed(1);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
      
      {/* 1. Today's Focus Time */}
      <div className="relative p-4 sm:p-5 rounded-2xl glass-card border border-slate-800/80 shadow-lg flex flex-col justify-between overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Today's Focus
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition">
            <IoTimeOutline className="text-lg" />
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            {timeFormatted}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Target: {targetHours}h / day
          </p>
        </div>

        {/* Mini progress bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
          <div 
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Goal Completion Rate */}
      <div className="relative p-4 sm:p-5 rounded-2xl glass-card border border-slate-800/80 shadow-lg flex flex-col justify-between overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Daily Goal
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition">
            <IoTrendingUp className="text-lg" />
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            {goalPercent}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {goalPercent >= 100 ? '🎉 Goal smashed today!' : `${Math.max(0, dailyGoal.targetMinutes - todayMinutes)}m remaining`}
          </p>
        </div>

        <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
          <div 
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Pomodoro Sprints */}
      <div className="relative p-4 sm:p-5 rounded-2xl glass-card border border-slate-800/80 shadow-lg flex flex-col justify-between overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Sessions Done
          </span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition">
            <IoCheckmarkCircleOutline className="text-lg" />
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono tracking-tight">
            {todaySessions.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Completed sprints today
          </p>
        </div>

        <div className="flex items-center gap-1 mt-3">
          {Array.from({ length: Math.min(6, Math.max(todaySessions.length, 4)) }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < todaySessions.length ? 'bg-purple-500' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 4. Active Streak */}
      <div className="relative p-4 sm:p-5 rounded-2xl glass-card border border-slate-800/80 shadow-lg flex flex-col justify-between overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Study Streak
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition">
            <IoFlame className="text-lg text-amber-500" />
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tracking-tight flex items-baseline gap-1">
            <span>{dailyGoal.streakDays}</span>
            <span className="text-sm font-sans font-medium text-slate-400">days</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <IoTrophyOutline className="text-amber-400" />
            <span>Best: {dailyGoal.longestStreak} days</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 mt-3 text-[10px] text-amber-300 font-medium">
          <span>Keep the momentum burning 🔥</span>
        </div>
      </div>

    </div>
  );
};
