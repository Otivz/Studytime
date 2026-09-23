import { useEffect } from 'react';
import type { FC } from 'react';
import { IoCafeOutline, IoPlayOutline, IoCloseOutline } from 'react-icons/io5';
import { stopBreakAlarmLoop } from '../utils/audio';

interface BreakCompleteModalProps {
  isOpen: boolean;
  onStartStudying: () => void;
  onDismiss: () => void;
}

export const BreakCompleteModal: FC<BreakCompleteModalProps> = ({
  isOpen,
  onStartStudying,
  onDismiss,
}) => {
  useEffect(() => {
    return () => {
      stopBreakAlarmLoop();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF9F6] border-3 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-6 sm:p-7 shadow-[6px_6px_0px_#242424] -rotate-0.5">
        
        {/* Tape Accent */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-7 bg-[#BBF7D0] border border-dashed border-[#6B6B6B] rotate-1" />

        <div className="text-center pt-2 pb-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#BBF7D0] border-2 border-[#242424] rounded-full shadow-[2px_2px_0px_#242424] mb-2 text-[#242424]">
            <IoCafeOutline className="text-2xl" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold font-handwriting text-[#242424] tracking-wide">
            ☕ Break's over!
          </h3>

          <p className="text-base font-sketch text-[#6B6B6B] mt-1">
            Ready for another study sprint?
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              stopBreakAlarmLoop();
              onDismiss();
            }}
            className="w-full sm:flex-1 py-2.5 px-4 text-base font-sketch font-bold text-[#6B6B6B] hover:text-[#242424] border-2 border-[#242424] hover:bg-white rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <IoCloseOutline className="text-xl flex-shrink-0" />
            <span className="whitespace-nowrap">[ Dismiss ]</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopBreakAlarmLoop();
              onStartStudying();
            }}
            className="w-full sm:flex-1 py-2.5 px-4 text-base font-handwriting font-bold bg-[#FDE68A] hover:bg-[#fcd34d] text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[3px_3px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <IoPlayOutline className="text-lg flex-shrink-0" />
            <span className="whitespace-nowrap">[ Start Studying ]</span>
          </button>
        </div>

      </div>
    </div>
  );
};
