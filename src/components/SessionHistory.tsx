import type { FC } from 'react';
import type { SessionRecord } from '../types/session';
import { EmptyState } from './EmptyState';
import { IoTrashOutline } from 'react-icons/io5';


interface SessionHistoryProps {
  sessions: SessionRecord[];
  onDeleteSession?: (id: string) => void;
  showAll?: boolean; // if false, shows today's sessions only
}

export const SessionHistory: FC<SessionHistoryProps> = ({
  sessions,
  onDeleteSession,
  showAll = false,
}) => {
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full bg-white border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-5 sm:p-6 shadow-[4px_4px_0px_#242424] relative">
      
      {/* Tape accent */}
      <div className="absolute -top-3 left-8 w-16 h-6 bg-[#FBCFE8]/80 border border-dashed border-[#6B6B6B] -rotate-2 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-dashed border-[#6B6B6B]/30">
        <h3 className="text-xl sm:text-2xl font-handwriting font-bold text-[#242424]">
          <span className="highlight-pink">
            {showAll ? "All Study Sessions" : "Today's Sessions"}
          </span>
        </h3>
        <span className="text-sm font-sketch font-bold text-[#6B6B6B]">
          ({sessions.length} recorded)
        </span>
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {sessions.map((session, index) => (
            <div
              key={session.id}
              className="group relative p-3.5 bg-[#FAF9F6] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424] hover:shadow-[3px_3px_0px_#242424] transition-all"
              style={{
                transform: `rotate(${((index % 2 === 0 ? 1 : -1) * 0.4)}deg)`,
              }}
            >
              {/* Header row: Checkmark, Subject, Duration & Time */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Handwritten Checkmark */}
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#BBF7D0] border-2 border-[#242424] text-xs font-bold text-[#242424]">
                    ✓
                  </span>
                  
                  {/* Subject Name */}
                  <h4 className="text-base sm:text-lg font-handwriting font-bold text-[#242424]">
                    {session.subjectName}
                  </h4>

                  {/* Duration & Time metadata */}
                  <span className="text-xs sm:text-sm font-sketch text-[#6B6B6B]">
                    · {session.durationMinutes} min · {showAll ? `${formatDate(session.timestamp)} ` : ''}{formatTime(session.timestamp)}
                  </span>
                </div>

                {/* Delete button if provided */}
                {onDeleteSession && (
                  <button
                    type="button"
                    onClick={() => onDeleteSession(session.id)}
                    title="Delete entry"
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#6B6B6B] hover:text-[#242424] transition-opacity"
                  >
                    <IoTrashOutline className="text-sm" />
                  </button>
                )}
              </div>

              {/* Goal Row */}
              {session.goal && (
                <div className="mt-1.5 pl-7 text-sm font-sketch text-[#242424]">
                  <strong className="text-[#6B6B6B]">Goal:</strong> {session.goal}
                </div>
              )}

              {/* Notes / Accomplishment Row */}
              {session.notes && (
                <div className="mt-1 pl-7 text-xs sm:text-sm font-sketch text-[#6B6B6B] italic">
                  ✎ {session.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
