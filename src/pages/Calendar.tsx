import { useState } from 'react';
import type { FC } from 'react';
import type { Subject } from '../types/subject';
import type { SessionRecord } from '../types/session';
import {
  IoChevronBack,
  IoChevronForward,
  IoCalendarOutline,
  IoPlayOutline
} from 'react-icons/io5';


interface CalendarProps {
  subjects: Subject[];
  sessions: SessionRecord[];
  onSelectSubjectAndStudy: (subjectId: string) => void;
}

interface CalendarCell {
  date: Date;
  dateStr: string; // YYYY-MM-DD in local time
  dayNum: number;
  isCurrentMonth: boolean;
}

// Helper to format Date as YYYY-MM-DD using local time (avoids UTC shifts of toISOString)
export const formatDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const Calendar: FC<CalendarProps> = ({
  subjects,
  sessions,
  onSelectSubjectAndStudy,
}) => {
  // Current viewed month & year
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Selected date string (YYYY-MM-DD in local time)
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return formatDateKey(new Date());
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (0 = Jan, 8 = Sep)

  // Month navigation using real Date objects
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateStr(formatDateKey(now));
  };

  // Month metadata
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Days calculations: Monday as first day of week
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDaysInMonth = lastDayOfMonth.getDate();

  // Day of week index (Monday = 0, Tuesday = 1, ..., Sunday = 6)
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  // Total grid cells in multiples of 7 (typically 35 or 42 cells)
  const totalCells = Math.ceil((startDayOfWeek + totalDaysInMonth) / 7) * 7;

  // Generate consecutive real Date cells without manual day-number stitching
  const allCalendarCells: CalendarCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    // 1 - startDayOfWeek + i produces the exact consecutive calendar date
    const cellDate = new Date(year, month, 1 - startDayOfWeek + i);
    allCalendarCells.push({
      date: cellDate,
      dateStr: formatDateKey(cellDate),
      dayNum: cellDate.getDate(),
      isCurrentMonth: cellDate.getMonth() === month && cellDate.getFullYear() === year,
    });
  }

  // Handle clicking any cell (including prev/next month)
  const handleCellClick = (cell: CalendarCell) => {
    setSelectedDateStr(cell.dateStr);
    if (!cell.isCurrentMonth) {
      setCurrentDate(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
    }
  };

  // Helper to get sessions on a specific date (timezone safe)
  const getSessionsForDate = (dateStr: string) => {
    return sessions.filter((s) => {
      if (s.timestamp.startsWith(dateStr)) return true;
      try {
        const d = new Date(s.timestamp);
        return formatDateKey(d) === dateStr;
      } catch {
        return false;
      }
    });
  };

  // Helper to get subjects with deadline on this date
  const getDeadlinesForDate = (dateStr: string) => {
    return subjects.filter((s) => s.targetDate === dateStr);
  };

  // Helper to get subjects completed on this date
  const getCompletionsForDate = (dateStr: string) => {
    return subjects.filter((s) => s.status === 'completed' && s.completedAt === dateStr);
  };

  // Selected date details
  const selectedSessions = getSessionsForDate(selectedDateStr);
  const selectedDeadlines = getDeadlinesForDate(selectedDateStr);
  const selectedCompletions = getCompletionsForDate(selectedDateStr);

  const selectedDateParts = selectedDateStr.split('-');
  const selectedDateObj = new Date(
    Number(selectedDateParts[0]),
    Number(selectedDateParts[1]) - 1,
    Number(selectedDateParts[2])
  );
  const formattedSelectedHeader = selectedDateObj.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const todayStr = formatDateKey(new Date());

  return (
    <div className="space-y-6">

      {/* Month Navigation & Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-dashed border-[#6B6B6B]/40">
        <div>
          <h2 className="text-2xl sm:text-3xl font-handwriting font-extrabold text-[#242424] flex items-center gap-2 mb-2">
            <IoCalendarOutline className="text-2xl" />
            <span className="highlight-yellow">{monthNames[month]} {year}</span>
          </h2>
          <p className="text-sm sm:text-base font-sketch text-[#6B6B6B] mt-1">
            Monthly notebook planner · Click any day to see study logs and deadlines.
          </p>
        </div>

        {/* Prev / Today / Next Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 text-lg font-handwriting font-bold bg-white hover:bg-slate-100 text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Previous Month"
          >
            <IoChevronBack />
          </button>

          <button
            type="button"
            onClick={handleGoToday}
            className="px-3.5 py-1 text-sm font-handwriting font-bold bg-[#FAF9F6] hover:bg-[#FDE68A] text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] transition-all -rotate-1"
          >
            Today
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 text-lg font-handwriting font-bold bg-white hover:bg-slate-100 text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Next Month"
          >
            <IoChevronForward />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Monthly Calendar Notebook Grid */}
        <div className="lg:col-span-7 bg-white border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-4 sm:p-5 shadow-[4px_4px_0px_#242424] relative">

          {/* Tape accent */}
          <div className="absolute -top-3 left-8 w-16 h-5 bg-[#BBF7D0]/80 border border-dashed border-[#6B6B6B] -rotate-2 pointer-events-none" />

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center pb-2 border-b-2 border-dashed border-[#6B6B6B]/40 font-handwriting font-bold text-sm sm:text-base text-[#6B6B6B]">
            {dayLabels.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-2">
            {allCalendarCells.map((cell) => {
              const isSelected = cell.dateStr === selectedDateStr;
              const isToday = cell.dateStr === todayStr;

              const daySessions = getSessionsForDate(cell.dateStr);
              const dayDeadlines = getDeadlinesForDate(cell.dateStr);
              const dayCompletions = getCompletionsForDate(cell.dateStr);

              const hasSessions = daySessions.length > 0;
              const hasDeadlines = dayDeadlines.length > 0;
              const hasCompletions = dayCompletions.length > 0;

              return (
                <button
                  type="button"
                  key={cell.dateStr}
                  onClick={() => handleCellClick(cell)}
                  className={`min-h-[46px] sm:min-h-[54px] p-1 sm:p-1.5 flex flex-col justify-between items-center rounded-lg border transition-all cursor-pointer select-none w-full text-left ${
                    !cell.isCurrentMonth
                      ? 'opacity-30 border-transparent hover:opacity-60'
                      : isSelected
                        ? 'bg-[#FDE68A] border-2 border-[#242424] shadow-[2px_2px_0px_#242424] -rotate-1'
                        : isToday
                          ? 'bg-[#FAF9F6] border-2 border-[#242424] shadow-[1px_1px_0px_#242424]'
                          : 'bg-white border-transparent hover:border-[#6B6B6B]/40 hover:bg-[#FAF9F6]'
                  }`}
                >
                  {/* Day Number */}
                  <span
                    className={`text-xs sm:text-sm font-timer font-bold ${
                      isToday && !isSelected
                        ? 'underline decoration-2 decoration-amber-500 font-extrabold text-[#242424]'
                        : cell.isCurrentMonth
                          ? 'text-[#242424]'
                          : 'text-[#6B6B6B]'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {/* Indicator Dots/Doodles */}
                  <div className="flex items-center justify-center gap-1 flex-wrap mt-0.5 min-h-[14px]">
                    {/* Session dot */}
                    {hasSessions && (
                      <span
                        className="w-2 h-2 rounded-full bg-[#242424] inline-block shadow-sm"
                        title={`${daySessions.length} session(s) studied`}
                      />
                    )}
                    {/* Deadline target icon */}
                    {hasDeadlines && (
                      <span className="text-[11px] leading-none" title="Subject Deadline">
                        🎯
                      </span>
                    )}
                    {/* Finished subject icon */}
                    {hasCompletions && (
                      <span className="text-[11px] font-bold text-emerald-700 leading-none" title="Subject Completed">
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend row */}
          <div className="mt-4 pt-3 border-t border-dashed border-[#6B6B6B]/30 flex items-center justify-center gap-4 text-xs font-sketch text-[#6B6B6B] flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#242424] inline-block" />
              <span>Study Session</span>
            </span>
            <span className="flex items-center gap-1">
              <span>🎯</span>
              <span>Deadline</span>
            </span>
            <span className="flex items-center gap-1 font-bold text-emerald-700">
              <span>✓</span>
              <span>Subject Finished</span>
            </span>
          </div>

        </div>

        {/* Right Column: Calendar Day Details */}
        <div className="lg:col-span-5 bg-white border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-5 sm:p-6 shadow-[4px_4px_0px_#242424] relative">

          {/* Tape accent */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#FBCFE8] border border-dashed border-[#6B6B6B] rotate-1 pointer-events-none" />

          {/* Day Details Header */}
          <div className="pb-3 border-b-2 border-dashed border-[#6B6B6B]/40">
            <span className="text-xs font-sketch font-bold text-[#6B6B6B] uppercase tracking-wider block">
              Day Planner & Log
            </span>
            <h3 className="text-xl sm:text-2xl font-handwriting font-bold text-[#242424]">
              {formattedSelectedHeader}
            </h3>
          </div>

          {/* Details Content */}
          <div className="space-y-4 mt-4">

            {/* 1. Study Sessions */}
            <div>
              <h4 className="text-sm font-handwriting font-bold text-[#242424] flex items-center gap-1.5 mb-2">
                <span>📚</span> Study Sessions ({selectedSessions.length})
              </h4>

              {selectedSessions.length === 0 ? (
                <p className="text-xs font-sketch text-[#6B6B6B] italic pl-2">
                  No sessions recorded for this day.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedSessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-2.5 bg-[#FAF9F6] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[1px_1px_0px_#242424] text-xs font-sketch"
                    >
                      <div className="flex items-center justify-between font-bold text-[#242424]">
                        <span className="text-sm font-handwriting">{sess.subjectName}</span>
                        <span className="px-2 py-0.5 bg-[#BBF7D0] border border-[#242424] rounded text-[11px] font-timer">
                          {sess.durationMinutes} min
                        </span>
                      </div>
                      {sess.goal && (
                        <p className="text-[#6B6B6B] mt-0.5 truncate">
                          Goal: {sess.goal}
                        </p>
                      )}
                      {sess.notes && (
                        <p className="text-[#6B6B6B] italic mt-0.5 truncate">
                          ✎ {sess.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Deadlines */}
            <div>
              <h4 className="text-sm font-handwriting font-bold text-[#242424] flex items-center gap-1.5 mb-2">
                <span>🎯</span> Deadlines Due ({selectedDeadlines.length})
              </h4>

              {selectedDeadlines.length === 0 ? (
                <p className="text-xs font-sketch text-[#6B6B6B] italic pl-2">
                  No subject deadlines set for this day.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDeadlines.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-2.5 bg-[#FAF9F6] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[1px_1px_0px_#242424] text-xs font-sketch"
                    >
                      <div className="flex items-center justify-between font-bold text-[#242424]">
                        <span className="text-sm font-handwriting">{sub.name}</span>
                        <span className="px-2 py-0.5 bg-[#FDE68A] border border-[#242424] rounded text-[11px]">
                          Target Date
                        </span>
                      </div>
                      {sub.goal && (
                        <p className="text-[#242424] mt-0.5">
                          Goal: <strong className="font-handwriting">{sub.goal}</strong>
                        </p>
                      )}
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => onSelectSubjectAndStudy(sub.id)}
                          className="px-2.5 py-1 text-xs font-sketch font-bold bg-[#FAF9F6] hover:bg-[#FDE68A] text-[#242424] border border-[#242424] rounded shadow-sm flex items-center gap-1 transition"
                        >
                          <IoPlayOutline />
                          <span>Study this subject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Completed Subjects on this date */}
            {selectedCompletions.length > 0 && (
              <div>
                <h4 className="text-sm font-handwriting font-bold text-[#242424] flex items-center gap-1.5 mb-2">
                  <span>🎓</span> Completed Subjects ({selectedCompletions.length})
                </h4>
                <div className="space-y-2">
                  {selectedCompletions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-2.5 bg-[#BBF7D0]/40 border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[1px_1px_0px_#242424] text-xs font-sketch"
                    >
                      <span className="text-sm font-handwriting font-bold text-[#242424] block">
                        ✓ {sub.name}
                      </span>
                      <p className="text-[#6B6B6B] mt-0.5">
                        Finished on {sub.completedAt}!
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
