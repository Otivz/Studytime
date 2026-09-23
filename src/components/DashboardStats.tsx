import type { FC } from 'react';
import { StudyProgress } from './StudyProgress';

interface DashboardStatsProps {
  streakDays: number;
  sessionsCount: number;
  todayMinutes: number;
  dailyGoalMinutes: number;
}

export const DashboardStats: FC<DashboardStatsProps> = ({
  streakDays,
  sessionsCount,
  todayMinutes,
  dailyGoalMinutes,
}) => {
  const hours = Math.floor(todayMinutes / 60);
  const mins = todayMinutes % 60;
  const timeFormatted = `${hours > 0 ? `${hours}h ` : ''}${mins}m Studied`;

  return (
    <div className="w-full bg-white border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-5 sm:p-6 shadow-[4px_4px_0px_#242424] relative">
      
      {/* Tape accent */}
      <div className="absolute -top-3 right-8 w-16 h-6 bg-[#BBF7D0]/80 border border-dashed border-[#6B6B6B] rotate-2 pointer-events-none" />

      {/* Header */}
      <h3 className="text-xl font-handwriting font-bold text-[#242424] mb-3">
        <span className="highlight-green">TODAY'S PROGRESS</span>
      </h3>

      {/* 4 Stats Chips/Notes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
        {/* Streak */}
        <div className="bg-[#FAF9F6] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-3 text-center shadow-[2px_2px_0px_#242424] -rotate-1 hover:rotate-0 transition-transform">
          <span className="text-xl">🔥</span>
          <div className="font-handwriting font-bold text-lg text-[#242424]">
            {streakDays} Day
          </div>
          <span className="text-xs font-sketch text-[#6B6B6B]">Streak</span>
        </div>

        {/* Sessions Done */}
        <div className="bg-[#FAF9F6] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-3 text-center shadow-[2px_2px_0px_#242424] rotate-1 hover:rotate-0 transition-transform">
          <span className="text-xl">📚</span>
          <div className="font-handwriting font-bold text-lg text-[#242424]">
            {sessionsCount}
          </div>
          <span className="text-xs font-sketch text-[#6B6B6B]">Sessions</span>
        </div>

        {/* Studied Time */}
        <div className="bg-[#FAF9F6] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-3 text-center shadow-[2px_2px_0px_#242424] -rotate-0.5 hover:rotate-0 transition-transform">
          <span className="text-xl">⏱️</span>
          <div className="font-handwriting font-bold text-lg text-[#242424]">
            {timeFormatted}
          </div>
          <span className="text-xs font-sketch text-[#6B6B6B]">Total Today</span>
        </div>

        {/* Daily Goal */}
        <div className="bg-[#FAF9F6] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-3 text-center shadow-[2px_2px_0px_#242424] rotate-1 hover:rotate-0 transition-transform">
          <span className="text-xl">🎯</span>
          <div className="font-handwriting font-bold text-lg text-[#242424]">
            {dailyGoalMinutes}m
          </div>
          <span className="text-xs font-sketch text-[#6B6B6B]">Daily Goal</span>
        </div>
      </div>

      {/* Hand-Drawn Progress Bar */}
      <StudyProgress
        todayMinutes={todayMinutes}
        dailyGoalMinutes={dailyGoalMinutes}
      />

    </div>
  );
};
