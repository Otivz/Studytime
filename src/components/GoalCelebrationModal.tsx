import type { FC } from 'react';
import type { Subject } from '../types/subject';
import { IoCheckmarkCircle, IoTimeOutline, IoCalendarOutline } from 'react-icons/io5';

interface GoalCelebrationModalProps {
  isOpen: boolean;
  subject: Subject | null;
  onClose: () => void;
}

export const GoalCelebrationModal: FC<GoalCelebrationModalProps> = ({
  isOpen,
  subject,
  onClose,
}) => {
  if (!isOpen || !subject) return null;

  // Format completed & target hours / minutes
  const totalMins = subject.totalMinutes;
  const targetMins = subject.targetMinutes || totalMins;

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h${m > 0 ? ` ${m}m` : ''}`;
    return `${m}m`;
  };

  const formattedCompletedTime = formatDuration(totalMins);
  const formattedTargetTime = formatDuration(targetMins);

  // Format today's date nicely: e.g. "September 23, 2026"
  const completedDateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md bg-[#FAF9F6] border-3 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-6 sm:p-8 shadow-[8px_8px_0px_#242424] rotate-0.5 overflow-hidden">
        
        {/* Notebook Tape Accents */}
        <div className="absolute -top-3.5 left-8 w-20 h-7 bg-[#FDE68A] border border-dashed border-[#6B6B6B] -rotate-3 pointer-events-none" />
        <div className="absolute -top-3.5 right-8 w-20 h-7 bg-[#FBCFE8] border border-dashed border-[#6B6B6B] rotate-2 pointer-events-none" />

        {/* Hand-Drawn Confetti / Sparkle Doodles */}
        <div className="text-center pt-2 select-none">
          <div className="inline-flex items-center justify-center gap-3 text-[#242424] text-xl font-handwriting tracking-widest animate-pulse">
            <span className="text-amber-500">✨</span>
            <span className="text-rose-500">✦</span>
            <span className="text-2xl">🎉</span>
            <span className="text-sky-500">✦</span>
            <span className="text-amber-500">✨</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-handwriting text-[#6B6B6B] tracking-wider uppercase mt-1">
            Congratulations!
          </h3>

          <div className="inline-block relative mt-1 mb-2">
            <span className="absolute inset-0 bg-[#FDE68A] -rotate-1 rounded-sm -z-0 scale-105" />
            <h2 className="relative z-10 text-3xl sm:text-4xl font-extrabold font-handwriting text-[#242424] px-3 py-0.5 tracking-wide">
              GOAL REACHED!
            </h2>
          </div>

          <p className="text-base sm:text-lg font-sketch text-[#242424] mt-1 max-w-xs mx-auto">
            You completed your study goal for{' '}
            <strong className="font-handwriting text-xl text-[#242424] underline decoration-wavy decoration-amber-400">
              {subject.name}
            </strong>!
          </p>
        </div>

        {/* Sketched Goal Certificate Card */}
        <div className="my-5 p-4 sm:p-5 bg-white border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[3px_3px_0px_#242424] space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-dashed border-[#6B6B6B]/30">
            <span className="text-3xl">{subject.icon || '📚'}</span>
            <div>
              <h4 className="text-xl font-handwriting font-bold text-[#242424] uppercase tracking-wide leading-none">
                {subject.name}
              </h4>
              {subject.goal && (
                <p className="text-xs font-sketch text-[#6B6B6B] mt-0.5 italic">
                  "{subject.goal}"
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm font-sketch">
            {/* 1. Goal completed badge */}
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <IoCheckmarkCircle className="text-xl text-emerald-600 flex-shrink-0" />
              <span className="px-2 py-0.5 bg-[#BBF7D0] border border-[#242424] rounded text-xs text-[#242424] font-handwriting font-bold">
                ✓ Goal completed (100%)
              </span>
            </div>

            {/* 2. Target time comparison */}
            <div className="flex items-center justify-between text-[#242424]">
              <span className="flex items-center gap-1.5 text-[#6B6B6B]">
                <IoTimeOutline className="text-base" />
                <span>Study time completed:</span>
              </span>
              <span className="font-timer font-bold text-base text-[#242424]">
                ⏱ {formattedCompletedTime} / {formattedTargetTime}
              </span>
            </div>

            {/* 3. Completed date */}
            <div className="flex items-center justify-between text-[#242424]">
              <span className="flex items-center gap-1.5 text-[#6B6B6B]">
                <IoCalendarOutline className="text-base" />
                <span>Date completed:</span>
              </span>
              <span className="font-sketch font-bold text-[#242424]">
                📅 {completedDateStr}
              </span>
            </div>
          </div>
        </div>

        {/* Motivational note */}
        <p className="text-center text-sm font-sketch text-[#6B6B6B] italic mb-5">
          "You did it! Keep turning pages and staying focused." 📚✍️
        </p>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-2.5 text-lg font-handwriting font-bold bg-[#FDE68A] hover:bg-[#fcd34d] text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[4px_4px_0px_#242424] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#242424] transition-all -rotate-1 hover:rotate-0 whitespace-nowrap"
          >
            [ Awesome! 🎉 ]
          </button>
        </div>

      </div>
    </div>
  );
};
