import { useState } from 'react';
import type { FC } from 'react';
import type { SessionRecord } from '../types/session';
import { EmptyState } from '../components/EmptyState';
import { IoTrashOutline } from 'react-icons/io5';


interface HistoryProps {
  sessions: SessionRecord[];
  onDeleteSession: (id: string) => void;
  onClearAllSessions: () => void;
}

type TimeFilter = 'all' | 'today' | 'week' | 'month';

export const History: FC<HistoryProps> = ({
  sessions,
  onDeleteSession,
  onClearAllSessions,
}) => {
  const [filter, setFilter] = useState<TimeFilter>('all');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filteredSessions = sessions.filter((s) => {
    if (filter === 'all') return true;
    const sessionDate = new Date(s.timestamp);
    if (filter === 'today') {
      return s.timestamp.startsWith(todayStr);
    }
    if (filter === 'week') {
      const diffMs = now.getTime() - sessionDate.getTime();
      return diffMs <= 7 * 24 * 3600 * 1000;
    }
    if (filter === 'month') {
      const diffMs = now.getTime() - sessionDate.getTime();
      return diffMs <= 30 * 24 * 3600 * 1000;
    }
    return true;
  });

  const totalFilteredMinutes = filteredSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalFilteredHours = (totalFilteredMinutes / 60).toFixed(1);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b-2 border-dashed border-[#6B6B6B]/40">
        <div>
          <h2 className="text-2xl sm:text-3xl font-handwriting font-extrabold text-[#242424] mb-2">
            <span className="highlight-blue">STUDY LOG & JOURNAL</span>
          </h2>
          <p className="text-sm sm:text-base font-sketch text-[#6B6B6B] mt-1">
            All completed focus sprints written in your study history.
          </p>
        </div>

        {/* Quick summary sticker */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-[#FAF9F6] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424] text-sm font-sketch font-bold text-[#242424]">
            Total: <span className="font-timer">{totalFilteredHours}h</span> ({totalFilteredMinutes}m)
          </div>

          {sessions.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Clear all study history records from your notebook?')) {
                  onClearAllSessions();
                }
              }}
              className="text-xs font-sketch text-[#6B6B6B] hover:text-[#242424] underline hover:no-underline"
            >
              Clear Log
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-sketch font-bold text-[#6B6B6B] mr-1">Filter by:</span>
        {(['all', 'today', 'week', 'month'] as TimeFilter[]).map((f) => {
          const labels: Record<TimeFilter, string> = {
            all: 'All Time',
            today: 'Today',
            week: 'This Week',
            month: 'This Month',
          };
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm font-sketch font-bold border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] transition-all ${
                isActive
                  ? 'bg-[#FDE68A] shadow-[2px_2px_0px_#242424] -rotate-1'
                  : 'bg-white text-[#6B6B6B] hover:text-[#242424]'
              }`}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      {/* History Notebook Entries */}
      {filteredSessions.length === 0 ? (
        <EmptyState
          title="✎ No sessions found for this filter"
          subtitle="Try selecting another time range or complete a study session!"
        />
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session, index) => (
            <div
              key={session.id}
              className="relative p-4 sm:p-5 bg-white border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[3px_3px_0px_#242424] hover:shadow-[4px_4px_0px_#242424] transition-all"
              style={{
                transform: `rotate(${((index % 2 === 0 ? 0.5 : -0.5) * 0.6)}deg)`,
              }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#BBF7D0] border-2 border-[#242424] text-xs font-bold text-[#242424]">
                    ✓
                  </span>
                  <h3 className="text-xl font-handwriting font-bold text-[#242424]">
                    {session.subjectName}
                  </h3>
                  <span className="px-2 py-0.5 bg-[#FAF9F6] border border-[#242424] rounded text-xs font-timer font-bold text-[#242424]">
                    {session.durationMinutes} min
                  </span>
                </div>

                {/* Date & Time and Delete */}
                <div className="flex items-center gap-3 text-xs sm:text-sm font-sketch text-[#6B6B6B]">
                  <span>
                    📅 {formatDate(session.timestamp)} · {formatTime(session.timestamp)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteSession(session.id)}
                    title="Delete log entry"
                    className="p-1 text-[#6B6B6B] hover:text-[#242424] transition"
                  >
                    <IoTrashOutline className="text-base" />
                  </button>
                </div>
              </div>

              {/* Goal Description */}
              {session.goal && (
                <div className="mt-2 pl-8 text-base font-sketch text-[#242424]">
                  <strong className="text-[#6B6B6B]">Goal:</strong> {session.goal}
                </div>
              )}

              {/* Notes / Accomplishment */}
              {session.notes && (
                <div className="mt-1.5 pl-8 text-sm font-sketch text-[#6B6B6B] bg-[#FAF9F6] p-2 rounded-lg border border-dashed border-[#6B6B6B]/40">
                  <span className="font-bold text-[#242424]">Accomplished:</span> {session.notes}
                </div>
              )}

              {/* Status footer */}
              <div className="mt-2 pl-8 flex items-center gap-2 text-xs font-sketch text-[#242424]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Completed successfully</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
