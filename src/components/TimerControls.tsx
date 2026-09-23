import type { FC } from 'react';
import type { TimerMode } from '../types/session';
import { IoPlay, IoPause, IoReload } from 'react-icons/io5';


interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  mode: TimerMode;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip?: () => void;
}

export const TimerControls: FC<TimerControlsProps> = ({
  isRunning,
  isPaused,
  mode,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
}) => {
  const startLabel = mode === 'study' ? 'Start Study' : 'Start Break';

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap mt-4">
      {/* 1. When not running and not paused: [ Start Study ] */}
      {!isRunning && !isPaused && (
        <button
          type="button"
          onClick={onStart}
          className="flex items-center gap-2 px-8 py-3 text-xl font-handwriting font-bold bg-[#FDE68A] hover:bg-[#fcd34d] text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[4px_4px_0px_#242424] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#242424] transition-all -rotate-1 hover:rotate-0"
        >
          <IoPlay className="text-xl" />
          <span>[ {startLabel} ]</span>
        </button>
      )}

      {/* 2. When running: [ Pause ] [ Reset ] */}
      {isRunning && (
        <>
          <button
            type="button"
            onClick={onPause}
            className="flex items-center gap-2 px-6 py-2.5 text-lg font-handwriting font-bold bg-[#FBCFE8] hover:bg-[#f472b6] text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[3px_3px_0px_#242424] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#242424] transition-all rotate-1"
          >
            <IoPause className="text-lg" />
            <span>[ Pause ]</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-5 py-2.5 text-lg font-handwriting font-bold bg-white hover:bg-slate-100 text-[#6B6B6B] hover:text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[3px_3px_0px_#242424] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#242424] transition-all"
          >
            <IoReload className="text-lg" />
            <span>[ Reset ]</span>
          </button>
        </>
      )}

      {/* 3. When paused: [ Resume ] [ Reset ] */}
      {!isRunning && isPaused && (
        <>
          <button
            type="button"
            onClick={onResume}
            className="flex items-center gap-2 px-6 py-2.5 text-lg font-handwriting font-bold bg-[#BBF7D0] hover:bg-[#86efac] text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[3px_3px_0px_#242424] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#242424] transition-all -rotate-1"
          >
            <IoPlay className="text-lg" />
            <span>[ Resume ]</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-5 py-2.5 text-lg font-handwriting font-bold bg-white hover:bg-slate-100 text-[#6B6B6B] hover:text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[3px_3px_0px_#242424] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#242424] transition-all"
          >
            <IoReload className="text-lg" />
            <span>[ Reset ]</span>
          </button>
        </>
      )}

      {/* Optional Skip button */}
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="text-sm font-sketch font-bold text-[#6B6B6B] hover:text-[#242424] underline hover:no-underline ml-1"
          title="Skip session"
        >
          skip session →
        </button>
      )}
    </div>
  );
};
