import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import type { Subject } from '../types/subject';

interface CompletionModalProps {
  isOpen: boolean;
  subject: Subject | undefined;
  durationMinutes: number;
  goal: string;
  onSave: (notes: string) => void;
  onSkip: () => void;
}

export const CompletionModal: FC<CompletionModalProps> = ({
  isOpen,
  subject,
  durationMinutes,
  goal,
  onSave,
  onSkip,
}) => {
  const [accomplishment, setAccomplishment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(accomplishment.trim());
    setAccomplishment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF9F6] border-3 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-6 sm:p-7 shadow-[6px_6px_0px_#242424] -rotate-0.5">
        
        {/* Sticky note tape accent at top */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-7 bg-[#FDE68A] border border-dashed border-[#6B6B6B] rotate-1" />

        {/* Modal Header */}
        <div className="text-center pt-2 pb-3 border-b-2 border-dashed border-[#6B6B6B]/40">
          <span className="text-3xl">🎉</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-handwriting text-[#242424] tracking-wide mt-1">
            SESSION COMPLETE!
          </h3>
          <p className="text-sm font-sketch text-[#6B6B6B]">
            Another page turned in your study journal!
          </p>
        </div>

        {/* Summary Details */}
        <div className="my-4 p-3.5 bg-white border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-handwriting font-bold text-lg text-[#242424]">
              {subject?.name || 'General Focus'}
            </span>
            <span className="px-2 py-0.5 bg-[#BBF7D0] border border-[#242424] rounded text-xs font-timer font-bold text-[#242424]">
              {durationMinutes} minutes
            </span>
          </div>

          {goal.trim() && (
            <p className="text-sm font-sketch text-[#242424]">
              <strong className="text-[#6B6B6B]">Goal:</strong> {goal}
            </p>
          )}
        </div>

        {/* Form: What did you accomplish? */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-sketch font-bold text-[#242424] mb-1">
              What did you accomplish? (optional)
            </label>
            <textarea
              rows={3}
              value={accomplishment}
              onChange={(e) => setAccomplishment(e.target.value)}
              placeholder="e.g. Practiced useState and useEffect, fixed the counter bug..."
              className="w-full bg-white border-2 border-[#242424] border-dashed rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-3 text-base font-sketch text-[#242424] placeholder-[#6B6B6B]/60 focus:outline-none focus:border-solid focus:ring-1 focus:ring-[#242424] resize-none"
              autoFocus
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onSkip}
              className="px-4 py-2 text-base font-handwriting font-bold text-[#6B6B6B] hover:text-[#242424] border-2 border-transparent hover:border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] transition-all whitespace-nowrap"
            >
              [ Skip ]
            </button>

            <button
              type="submit"
              className="px-6 py-2 text-base font-handwriting font-bold bg-[#FDE68A] hover:bg-[#fcd34d] text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[3px_3px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#242424] transition-all -rotate-1 whitespace-nowrap"
            >
              [ Save Session ]
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
