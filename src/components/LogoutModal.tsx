import type { FC } from 'react';
import { IoLogOutOutline, IoCloseOutline } from 'react-icons/io5';

interface LogoutModalProps {
  isOpen: boolean;
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutModal: FC<LogoutModalProps> = ({ isOpen, userName, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(36,36,36,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={onCancel}
    >
      <div
        className="relative bg-white border-3 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[8px_8px_0px_#242424] max-w-sm w-full p-8 -rotate-0.5 overflow-hidden"
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
        <div className="flex justify-center mb-4 pt-2">
          <div className="w-14 h-14 rounded-full bg-[#FCA5A5]/30 border-2 border-[#242424] flex items-center justify-center">
            <IoLogOutOutline className="text-3xl text-[#242424]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-extrabold font-handwriting text-[#242424] tracking-wide uppercase mb-1">
          Sign Out?
        </h2>

        {/* Description */}
        <p className="text-center text-sm font-sketch text-[#6B6B6B] mb-2">
          You are signed in as{' '}
          <span className="font-bold text-[#242424]">{userName}</span>.
        </p>
        <p className="text-center text-xs font-sketch text-[#6B6B6B] mb-7">
          Your study data is saved to the cloud and will be waiting when you sign back in.
        </p>

        {/* Dashed divider */}
        <div className="border-t border-dashed border-[#6B6B6B]/30 mb-5" />

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 font-sketch font-bold text-sm text-[#6B6B6B] hover:text-[#242424] bg-[#FAF9F6] hover:bg-[#f0ede6] border-2 border-[#6B6B6B]/60 hover:border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] transition-all cursor-pointer"
          >
            Stay Here
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 font-handwriting font-bold text-sm text-[#242424] bg-[#FCA5A5] hover:bg-[#f87171] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[3px_3px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#242424] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <IoLogOutOutline className="text-base" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
