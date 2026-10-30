import type { FC } from 'react';
import { IoReloadOutline, IoCloseOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';

interface ResetConfirmModalProps {
  isOpen: boolean;
  elapsedMinutes: number;
  onSaveAndReset: () => void;
  onDiscardAndReset: () => void;
  onCancel: () => void;
}

export const ResetConfirmModal: FC<ResetConfirmModalProps> = ({
  isOpen,
  elapsedMinutes,
  onSaveAndReset,
  onDiscardAndReset,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ backgroundColor: 'rgba(36,36,36,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={onCancel}
    >
      <div
        className="relative bg-white border-3 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[8px_8px_0px_#242424] max-w-md w-full p-6 sm:p-8 -rotate-0.5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tape accent */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#FDE68A] border border-dashed border-[#6B6B6B] -rotate-1 pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-[#6B6B6B] hover:text-[#242424] hover:bg-[#FAF9F6] rounded-full transition cursor-pointer"
        >
          <IoCloseOutline className="text-xl" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-3 pt-2">
          <div className="w-14 h-14 rounded-full bg-[#BBF7D0]/60 border-2 border-[#242424] flex items-center justify-center text-2xl">
            ⏱️
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl sm:text-2xl font-extrabold font-handwriting text-[#242424] tracking-wide uppercase mb-2">
          Save Studied Time?
        </h2>

        {/* Description */}
        <p className="text-center text-sm font-sketch text-[#6B6B6B] mb-2">
          You've studied for <strong className="text-[#242424] font-handwriting text-base">{elapsedMinutes} {elapsedMinutes === 1 ? 'minute' : 'minutes'}</strong> in this session.
        </p>
        <p className="text-center text-xs font-sketch text-[#6B6B6B]/80 mb-5">
          Would you like to record this progress in your daily progression before resetting?
        </p>

        {/* Dashed divider */}
        <div className="border-t border-dashed border-[#6B6B6B]/30 mb-5" />

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Option 1: Save & Reset */}
          <button
            type="button"
            onClick={onSaveAndReset}
            className="w-full py-2.5 px-4 font-handwriting font-bold text-base text-[#242424] bg-[#BBF7D0] hover:bg-[#86efac] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[3px_3px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#242424] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <IoCheckmarkCircleOutline className="text-lg" />
            <span>[ Save {elapsedMinutes}m & Reset ]</span>
          </button>

          {/* Option 2: Discard & Reset */}
          <button
            type="button"
            onClick={onDiscardAndReset}
            className="w-full py-2 font-sketch font-bold text-sm text-[#EF4444] hover:text-[#DC2626] bg-[#FAF9F6] hover:bg-red-50 border-2 border-red-300 hover:border-red-500 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <IoReloadOutline className="text-sm" />
            <span>Discard time & Reset</span>
          </button>

          {/* Option 3: Cancel */}
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-1.5 font-sketch text-xs text-[#6B6B6B] hover:text-[#242424] transition-colors text-center"
          >
            Keep studying (Cancel)
          </button>
        </div>
      </div>
    </div>
  );
};
