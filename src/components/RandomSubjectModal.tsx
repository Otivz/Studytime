import { useState, useEffect } from 'react';
import type { FC } from 'react';
import type { Subject } from '../types/subject';
import { IoClose } from 'react-icons/io5';

interface RandomSubjectModalProps {
  isOpen: boolean;
  subjects: Subject[];
  onClose: () => void;
  onSelectAndStart: (subjectId: string) => void;
}

export const RandomSubjectModal: FC<RandomSubjectModalProps> = ({
  isOpen,
  subjects,
  onClose,
  onSelectAndStart,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isShuffling, setIsShuffling] = useState(true);

  useEffect(() => {
    if (!isOpen || subjects.length === 0) return;

    setIsShuffling(true);
    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * subjects.length);
      setSelectedSubject(subjects[randomIndex]);
      count++;
      if (count > 12) {
        clearInterval(interval);
        const finalIndex = Math.floor(Math.random() * subjects.length);
        setSelectedSubject(subjects[finalIndex]);
        setIsShuffling(false);
      }
    }, 90);

    return () => clearInterval(interval);
  }, [isOpen, subjects]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF9F6] border-3 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-6 sm:p-8 shadow-[6px_6px_0px_#242424] text-center -rotate-0.5">
        
        {/* Sticky note tape accent */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-7 bg-[#BFDBFE] border border-dashed border-[#6B6B6B] -rotate-1" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-[#6B6B6B] hover:text-[#242424] text-xl"
        >
          <IoClose />
        </button>

        {/* Header */}
        <div className="pt-2 pb-2">
          <span className="text-3xl">🎲</span>
          <p className="text-lg font-sketch text-[#6B6B6B] mt-1">
            {isShuffling ? "Rolling the study dice..." : "Your subject is..."}
          </p>
        </div>

        {/* Prominent ASCII / Sketched Box for Subject */}
        <div className="my-6">
          <div
            className={`inline-block px-8 py-5 border-3 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[4px_4px_0px_#242424] transition-all duration-200 ${
              isShuffling
                ? 'bg-[#FAF9F6] scale-95 opacity-75'
                : 'bg-[#FDE68A] scale-105 rotate-1'
            }`}
          >
            <div className="font-mono text-xs text-[#6B6B6B] select-none tracking-widest hidden sm:block">
              ┌──────────────────────────┐
            </div>
            <div className="text-2xl sm:text-3xl font-handwriting font-extrabold text-[#242424] py-1">
              {selectedSubject ? `${selectedSubject.icon || '📚'} ${selectedSubject.name.toUpperCase()}` : 'PICKING...'}
            </div>
            <div className="font-mono text-xs text-[#6B6B6B] select-none tracking-widest hidden sm:block">
              └──────────────────────────┘
            </div>
          </div>
        </div>

        {/* Call to action subtitle */}
        {!isShuffling && selectedSubject && (
          <p className="text-lg font-handwriting text-[#242424] mb-6">
            ✨ Time to work on <strong className="underline decoration-wavy decoration-[#6B6B6B]">{selectedSubject.name}</strong>!
          </p>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={isShuffling}
            onClick={() => {
              if (selectedSubject) onSelectAndStart(selectedSubject.id);
            }}
            className="px-8 py-3 text-lg font-handwriting font-bold bg-[#BBF7D0] hover:bg-[#86efac] disabled:bg-slate-200 text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[3px_3px_0px_#242424] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#242424] transition-all -rotate-1"
          >
            [ Start Session ]
          </button>
        </div>

      </div>
    </div>
  );
};
