import type { FC } from 'react';
import type { Subject } from '../types/subject';
import { 
  IoPencilOutline, 
  IoTrashOutline, 
  IoCheckmarkCircleOutline, 
  IoTimeOutline, 
  IoPlayOutline,
  IoArrowUndoOutline
} from 'react-icons/io5';


interface SubjectCardProps {
  subject: Subject;
  index: number;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
  onSelectAndStudy?: (id: string) => void;
  onFinishSubject?: (subject: Subject) => void;
  onReopenSubject?: (id: string) => void;
}

export const SubjectCard: FC<SubjectCardProps> = ({
  subject,
  index,
  onEdit,
  onDelete,
  onSelectAndStudy,
  onFinishSubject,
  onReopenSubject,
}) => {
  // Format total studied time
  const studiedHours = Math.floor(subject.totalMinutes / 60);
  const studiedMins = subject.totalMinutes % 60;
  const timeFormatted = studiedHours > 0 
    ? `${studiedHours}h ${studiedMins > 0 ? `${studiedMins}m` : ''}` 
    : `${studiedMins}m`;

  // Format target time
  const targetHours = subject.targetMinutes ? Math.floor(subject.targetMinutes / 60) : 0;
  const targetMins = subject.targetMinutes ? subject.targetMinutes % 60 : 0;
  const targetFormatted = subject.targetMinutes 
    ? (targetHours > 0 ? `${targetHours}h ${targetMins > 0 ? `${targetMins}m` : ''}` : `${targetMins}m`)
    : null;

  // Calculate goal progress percentage
  const goalPercent = subject.targetMinutes && subject.targetMinutes > 0
    ? Math.min(100, Math.round((subject.totalMinutes / subject.targetMinutes) * 100))
    : null;

  // Calculate deadline relative text
  const getDeadlineBadge = (targetDateStr?: string) => {
    if (!targetDateStr) return null;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const parts = targetDateStr.split('-');
      const target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      target.setHours(0, 0, 0, 0);

      const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 3600 * 24));
      const formattedDate = target.toLocaleDateString([], { month: 'short', day: 'numeric' });

      if (diffDays < 0) {
        return {
          text: `⚠ Overdue (${formattedDate})`,
          isOverdue: true,
          bg: 'bg-[#FCA5A5]/50 text-[#242424] border-[#242424]',
        };
      }
      if (diffDays === 0) {
        return {
          text: `📅 Due today!`,
          isOverdue: false,
          bg: 'bg-[#FDE68A] text-[#242424] border-[#242424]',
        };
      }
      if (diffDays === 1) {
        return {
          text: `📅 Due tomorrow (${formattedDate})`,
          isOverdue: false,
          bg: 'bg-[#FDE68A]/70 text-[#242424] border-[#242424]',
        };
      }
      return {
        text: `📅 Due in ${diffDays} days (${formattedDate})`,
        isOverdue: false,
        bg: 'bg-[#FAF9F6] text-[#6B6B6B] border-[#6B6B6B]/60',
      };
    } catch {
      return { text: `📅 Due ${targetDateStr}`, isOverdue: false, bg: 'bg-[#FAF9F6] text-[#6B6B6B]' };
    }
  };

  const deadline = getDeadlineBadge(subject.targetDate);
  const isCompleted = subject.status === 'completed';

  // Rotation for notebook look
  const rotation = (index % 3 === 0 ? -0.8 : index % 3 === 1 ? 0.8 : 0) * 0.7;

  // Hand-drawn progress block meter (16 segments)
  const totalBlocks = 14;
  const filledBlocks = goalPercent !== null ? Math.min(totalBlocks, Math.round((goalPercent / 100) * totalBlocks)) : 0;

  return (
    <div
      className={`relative p-5 bg-white border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[3px_3px_0px_#242424] hover:shadow-[5px_5px_0px_#242424] transition-all flex flex-col justify-between ${
        isCompleted ? 'bg-[#FAF9F6] opacity-90' : ''
      }`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Tape accent */}
      <div
        className="absolute -top-2.5 left-6 w-14 h-5 border border-dashed border-[#6B6B6B] pointer-events-none"
        style={{ backgroundColor: subject.color || '#FDE68A' }}
      />

      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-2 mt-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{subject.icon || '📚'}</span>
            <div>
              <h4 className="text-xl font-handwriting font-bold text-[#242424] leading-tight">
                {subject.name}
              </h4>
              {isCompleted && (
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-[#BBF7D0] border border-[#242424] rounded text-[11px] font-sketch font-bold text-[#242424]">
                  ✓ Finished {subject.completedAt ? `· ${subject.completedAt}` : ''}
                </span>
              )}
            </div>
          </div>

          {/* Edit / Delete actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(subject)}
              title="Edit subject goal and info"
              className="p-1 text-[#6B6B6B] hover:text-[#242424] hover:bg-[#FAF9F6] rounded transition"
            >
              <IoPencilOutline className="text-base" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(subject.id)}
              title="Delete subject"
              className="p-1 text-[#6B6B6B] hover:text-[#242424] hover:bg-rose-100 rounded transition"
            >
              <IoTrashOutline className="text-base" />
            </button>
          </div>
        </div>

        {/* Study Goal description */}
        {subject.goal && (
          <div className="mt-3 p-2 bg-[#FAF9F6] border border-dashed border-[#6B6B6B]/50 rounded-lg text-sm font-sketch text-[#242424]">
            <span className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider block">
              Study Goal:
            </span>
            <p className="font-handwriting text-base text-[#242424]">
              {subject.goal}
            </p>
          </div>
        )}

        {/* Target Deadline Badge */}
        {deadline && !isCompleted && (
          <div className="mt-2.5">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 border rounded-full text-xs font-sketch font-bold ${deadline.bg}`}>
              {deadline.text}
            </span>
          </div>
        )}

        {/* Study Goal Progress Bar */}
        {goalPercent !== null && (
          <div className="mt-3 pt-2.5 border-t border-dashed border-[#6B6B6B]/25">
            <div className="flex items-center justify-between text-xs font-sketch text-[#6B6B6B] mb-1">
              <span className="flex items-center gap-1 text-[#242424] font-bold">
                <IoTimeOutline />
                <span>⏱ {timeFormatted} / {targetFormatted}</span>
              </span>
              <div className="flex items-center gap-1.5 font-timer font-bold text-[#242424]">
                {goalPercent >= 100 && (
                  <span className="px-1.5 py-0.2 bg-[#BBF7D0] border border-[#242424] rounded text-[10px] font-sketch font-bold text-[#242424]">
                    Goal Reached ✓
                  </span>
                )}
                <span>{goalPercent}%</span>
              </div>
            </div>

            {/* Hand-drawn block progress bar */}
            <div className="flex items-center gap-1 py-0.5">
              {Array.from({ length: totalBlocks }).map((_, bIdx) => {
                const isFilled = bIdx < filledBlocks;
                return (
                  <div
                    key={bIdx}
                    className={`h-3.5 flex-1 min-w-[6px] border border-[#242424] rounded-sm transition-all ${
                      isFilled
                        ? 'bg-[#242424] shadow-[1px_1px_0px_#6B6B6B]'
                        : 'bg-white/80 border-dashed'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Sessions Count Summary */}
        <div className="mt-3 flex items-center justify-between text-xs font-sketch text-[#6B6B6B]">
          <span>
            {subject.sessionsCount} study session{subject.sessionsCount === 1 ? '' : 's'}
          </span>
          {goalPercent === null && (
            <span>
              Total: <strong className="text-[#242424] font-handwriting">{timeFormatted}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t-2 border-dashed border-[#6B6B6B]/30 flex flex-col gap-2">
        {/* Start Studying Button */}
        {!isCompleted && onSelectAndStudy && (
          <button
            type="button"
            onClick={() => onSelectAndStudy(subject.id)}
            className="w-full py-2 px-3 text-sm font-handwriting font-bold bg-[#FDE68A] hover:bg-[#fcd34d] text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <IoPlayOutline className="text-base flex-shrink-0" />
            <span className="whitespace-nowrap">[ Start Studying ]</span>
          </button>
        )}

        {/* Finish Subject / Reopen Button */}
        {!isCompleted && onFinishSubject && (
          <button
            type="button"
            onClick={() => onFinishSubject(subject)}
            className="w-full py-1.5 text-xs font-sketch font-bold bg-white hover:bg-[#BBF7D0] text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[1px_1px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-1"
          >
            <IoCheckmarkCircleOutline className="text-base text-emerald-600" />
            <span>[ ✓ Mark as Finished ]</span>
          </button>
        )}

        {isCompleted && onReopenSubject && (
          <button
            type="button"
            onClick={() => onReopenSubject(subject.id)}
            className="w-full py-1.5 text-xs font-sketch font-bold bg-white hover:bg-slate-100 text-[#6B6B6B] hover:text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[1px_1px_0px_#242424] flex items-center justify-center gap-1"
          >
            <IoArrowUndoOutline className="text-sm" />
            <span>[ Reopen Subject ]</span>
          </button>
        )}
      </div>

    </div>
  );
};
