import type { FC } from 'react';
import type { TimerMode } from '../types/session';

interface TimerModeSelectorProps {
  currentMode: TimerMode;
  onSelectMode: (mode: TimerMode) => void;
}

export const TimerModeSelector: FC<TimerModeSelectorProps> = ({
  currentMode,
  onSelectMode,
}) => {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 my-2">
      {/* STUDY MODE BUTTON */}
      <button
        type="button"
        onClick={() => onSelectMode('study')}
        className={`px-4 sm:px-6 py-1.5 text-base sm:text-lg font-handwriting font-bold border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] transition-all duration-150 ${
          currentMode === 'study'
            ? 'bg-[#FDE68A] shadow-[3px_3px_0px_#242424] -rotate-1 scale-105'
            : 'bg-white/80 text-[#6B6B6B] hover:text-[#242424] hover:bg-white shadow-[2px_2px_0px_#242424]'
        }`}
      >
        <span>✎ STUDY</span>
      </button>

      {/* SHORT BREAK BUTTON */}
      <button
        type="button"
        onClick={() => onSelectMode('shortBreak')}
        className={`px-4 sm:px-6 py-1.5 text-base sm:text-lg font-handwriting font-bold border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] transition-all duration-150 ${
          currentMode === 'shortBreak'
            ? 'bg-[#BBF7D0] shadow-[3px_3px_0px_#242424] rotate-1 scale-105'
            : 'bg-white/80 text-[#6B6B6B] hover:text-[#242424] hover:bg-white shadow-[2px_2px_0px_#242424]'
        }`}
      >
        <span>☕ SHORT BREAK</span>
      </button>
    </div>
  );
};
