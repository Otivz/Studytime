import type { FC } from 'react';

interface StudyProgressProps {
  todayMinutes: number;
  dailyGoalMinutes: number;
}

export const StudyProgress: FC<StudyProgressProps> = ({
  todayMinutes,
  dailyGoalMinutes,
}) => {
  const percentage = Math.min(100, Math.round((todayMinutes / Math.max(1, dailyGoalMinutes)) * 100));
  const totalBlocks = 16;
  const filledBlocks = Math.min(totalBlocks, Math.round((percentage / 100) * totalBlocks));

  return (
    <div className="w-full mt-3 pt-3 border-t border-dashed border-[#6B6B6B]/40">
      <div className="flex items-center justify-between text-sm sm:text-base font-sketch font-bold mb-1.5">
        <span className="text-[#6B6B6B]">Daily Progress:</span>
        <span className="text-[#242424] font-timer font-bold">
          {percentage}% ({todayMinutes} / {dailyGoalMinutes} min)
        </span>
      </div>

      {/* Hand-drawn sketch block meter */}
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
        {Array.from({ length: totalBlocks }).map((_, index) => {
          const isFilled = index < filledBlocks;
          return (
            <div
              key={index}
              className={`h-5 sm:h-6 flex-1 min-w-[12px] border-2 border-[#242424] rounded-sm transition-all duration-300 ${
                isFilled
                  ? 'bg-[#242424] shadow-[1px_1px_0px_#6B6B6B]'
                  : 'bg-white/70 border-dashed'
              }`}
              style={{
                transform: `rotate(${((index % 3) - 1) * 1.5}deg)`,
              }}
              title={`${percentage}% completed`}
            />
          );
        })}
      </div>

      <div className="text-right text-xs font-sketch text-[#6B6B6B] mt-1">
        {percentage >= 100 ? '🎉 Daily goal reached!' : `${dailyGoalMinutes - todayMinutes} min to go today`}
      </div>
    </div>
  );
};
