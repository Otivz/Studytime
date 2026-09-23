import type { FC } from 'react';
import { 
  IoBarChartOutline, 
  IoPieChartOutline, 
  IoRibbonOutline
} from 'react-icons/io5';
import type { SessionRecord, Subject } from '../types';

interface AnalyticsViewProps {
  sessions: SessionRecord[];
  subjects: Subject[];
}

export const AnalyticsView: FC<AnalyticsViewProps> = ({

  sessions,
  subjects,
}) => {
  // Compute past 7 days data
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = daysOfWeek[d.getDay()];

    const dayMinutes = sessions
      .filter((s) => s.timestamp.startsWith(dateStr))
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    return {
      dateStr,
      dayName,
      minutes: dayMinutes,
      isToday: i === 6,
    };
  });

  const maxDayMinutes = Math.max(60, ...last7Days.map((d) => d.minutes));

  // Compute subject distribution
  const totalSessionMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  const subjectStats = subjects.map((sub) => {
    const subMinutes = sessions
      .filter((s) => s.subjectId === sub.id)
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    const percentage = totalSessionMinutes > 0 ? Math.round((subMinutes / totalSessionMinutes) * 100) : 0;
    return {
      ...sub,
      minutes: subMinutes,
      percentage,
    };
  }).sort((a, b) => b.minutes - a.minutes);

  const weeklyTotalMinutes = last7Days.reduce((sum, d) => sum + d.minutes, 0);
  const weeklyHours = (weeklyTotalMinutes / 60).toFixed(1);
  const dailyAverageHours = (weeklyTotalMinutes / 7 / 60).toFixed(1);
  const topSubject = subjectStats[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
      
      {/* 7-Day Study Activity Bar Chart */}
      <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl glass-card border border-slate-800/80 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <IoBarChartOutline className="text-lg" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Weekly Activity
                </h3>
                <p className="text-[11px] text-slate-400">Past 7 days focus time</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-xs text-slate-400">Total: </span>
                <span className="text-sm font-bold text-white font-mono">{weeklyHours}h</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xs text-slate-400">Avg: </span>
                <span className="text-sm font-bold text-indigo-400 font-mono">{dailyAverageHours}h/day</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Bars */}
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-52 pt-8 pb-2 px-1">
            {last7Days.map((day) => {
              const heightPercent = Math.max(8, Math.round((day.minutes / maxDayMinutes) * 100));
              const hours = (day.minutes / 60).toFixed(1);

              return (
                <div key={day.dateStr} className="flex-1 flex flex-col items-center h-full justify-end group">
                  
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[10px] text-white font-mono pointer-events-none whitespace-nowrap shadow-xl z-20">
                    {day.minutes}m ({hours}h)
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[42px] bg-slate-800/60 rounded-xl overflow-hidden flex flex-col justify-end p-0.5">
                    <div
                      className={`w-full rounded-lg transition-all duration-700 ${
                        day.isToday
                          ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-purple-400 shadow-lg shadow-indigo-500/30'
                          : 'bg-gradient-to-t from-slate-700 to-indigo-500/70 group-hover:from-indigo-600 group-hover:to-indigo-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <div className="mt-2 text-center">
                    <span
                      className={`text-xs font-semibold ${
                        day.isToday ? 'text-indigo-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {day.dayName}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly achievement badge */}
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-slate-300 mt-2">
          <IoRibbonOutline className="text-lg text-indigo-400 flex-shrink-0" />
          <span>
            {topSubject ? (
              <>Most focused subject this week: <strong className="text-white">{topSubject.name}</strong> ({((topSubject.minutes || 0) / 60).toFixed(1)}h logged)</>
            ) : (
              'Log your first study sprint to unlock weekly analytics.'
            )}
          </span>
        </div>
      </div>

      {/* Subject Time Allocation */}
      <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl glass-card border border-slate-800/80 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <IoPieChartOutline className="text-lg" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Subject Breakdown
                </h3>
                <p className="text-[11px] text-slate-400">Time distribution across topics</p>
              </div>
            </div>
          </div>

          {/* List of subjects with progress */}
          <div className="space-y-3.5 mt-4 max-h-[240px] overflow-y-auto pr-1">
            {subjectStats.map((sub) => {
              const hours = (sub.minutes / 60).toFixed(1);

              return (
                <div key={sub.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{sub.icon || '📖'}</span>
                      <span className="font-semibold text-slate-200">{sub.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-slate-400">
                      <span>{hours}h</span>
                      <span className="text-slate-500">({sub.percentage}%)</span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800/60">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(3, sub.percentage)}%`,
                        backgroundColor: sub.color,
                        boxShadow: `0 0 10px ${sub.color}40`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Total Sprints: <strong className="text-white font-mono">{sessions.length}</strong></span>
          <span>All-time Time: <strong className="text-white font-mono">{(totalSessionMinutes / 60).toFixed(1)}h</strong></span>
        </div>
      </div>

    </div>
  );
};
