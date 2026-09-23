import type { FC } from 'react';
import type { Subject } from '../types/subject';
import { IoAddOutline } from 'react-icons/io5';


interface SessionFormProps {
  subjects: Subject[];
  selectedSubjectId: string;
  goal: string;
  onSelectSubject: (id: string) => void;
  onChangeGoal: (goal: string) => void;
  onOpenNewSubject: () => void;
  onPickRandomSubject: () => void;
}

export const SessionForm: FC<SessionFormProps> = ({
  subjects,
  selectedSubjectId,
  goal,
  onSelectSubject,
  onChangeGoal,
  onOpenNewSubject,
  onPickRandomSubject,
}) => {
  return (
    <div className="w-full bg-white border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-5 sm:p-6 shadow-[4px_4px_0px_#242424] relative">
      
      {/* Tape accent at top center */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#FDE68A]/70 border border-dashed border-[#6B6B6B] -rotate-1 pointer-events-none" />

      {/* Section Title */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h2 className="text-xl sm:text-2xl font-extrabold font-handwriting text-[#242424] tracking-wide inline-block">
          <span className="highlight-yellow">WHAT ARE YOU STUDYING?</span>
        </h2>
        
        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPickRandomSubject}
            className="flex items-center gap-1.5 px-3 py-1 text-sm font-sketch font-bold bg-[#BFDBFE] hover:bg-[#93c5fd] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Pick a random subject to study"
          >
            <span className="text-base">🎲</span>
            <span>Pick for Me</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewSubject}
            className="flex items-center gap-1 px-2.5 py-1 text-sm font-sketch font-bold bg-[#BBF7D0] hover:bg-[#86efac] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Create a new study subject"
          >
            <IoAddOutline className="text-base" />
            <span>New Subject</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* 1. Subject Selector */}
        <div className="md:col-span-5">
          <label className="block text-sm font-sketch font-bold text-[#6B6B6B] mb-1">
            Subject:
          </label>
          <div className="relative">
            <select
              value={selectedSubjectId}
              onChange={(e) => onSelectSubject(e.target.value)}
              className="w-full bg-[#FAF9F6] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] px-3.5 py-2 text-base font-sketch font-bold text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#242424] cursor-pointer shadow-[2px_2px_0px_#242424]"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.icon || '📚'} {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Goal Field */}
        <div className="md:col-span-7">
          <label className="block text-sm font-sketch font-bold text-[#6B6B6B] mb-1">
            What do you want to accomplish?
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => onChangeGoal(e.target.value)}
            placeholder="e.g. Finish the useState lesson"
            className="w-full bg-[#FAF9F6] border-2 border-[#242424] border-dashed rounded-[255px_15px_225px_15px/15px_225px_15px_255px] px-3.5 py-2 text-base font-sketch text-[#242424] placeholder-[#6B6B6B]/60 focus:outline-none focus:border-solid focus:ring-1 focus:ring-[#242424]"
          />
        </div>
      </div>

    </div>
  );
};
