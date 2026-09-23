import { useState } from 'react';
import type { FC } from 'react';
import { 
  IoFlame, 
  IoSettingsOutline, 
  IoExpandOutline, 
  IoContractOutline, 
  IoMusicalNotesOutline
} from 'react-icons/io5';
import type { DailyGoal, TimerSettings } from '../types';


interface NavbarProps {
  dailyGoal: DailyGoal;
  todayMinutes: number;
  settings: TimerSettings;
  onOpenSettings: () => void;
  onToggleAmbient: () => void;
  isAmbientPlaying: boolean;
}

export const Navbar: FC<NavbarProps> = ({

  dailyGoal,
  todayMinutes,
  settings,
  onOpenSettings,
  onToggleAmbient,
  isAmbientPlaying,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const goalPercent = Math.min(100, Math.round((todayMinutes / Math.max(1, dailyGoal.targetMinutes)) * 100));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25">
            <span className="text-xl">⏱️</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                StudyPulse
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Focus & Deep Work Tracker</p>
          </div>
        </div>

        {/* Center: Daily Progress Chip */}
        <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Daily Goal:</span>
          <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
          <span className="font-semibold text-slate-200">
            {todayMinutes}m / {dailyGoal.targetMinutes}m ({goalPercent}%)
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Badge */}
          <div 
            title={`Current streak: ${dailyGoal.streakDays} days! Longest: ${dailyGoal.longestStreak} days`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold transition hover:bg-amber-500/15 cursor-default"
          >
            <IoFlame className="text-lg text-amber-500 animate-pulse" />
            <span>{dailyGoal.streakDays}</span>
            <span className="text-xs text-amber-400/80 font-normal hidden sm:inline">days</span>
          </div>

          {/* Ambient Sound Button */}
          <button
            onClick={onToggleAmbient}
            title={isAmbientPlaying ? `Playing: ${settings.ambientSound}` : 'Toggle Ambient Focus Sound'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition border ${
              isAmbientPlaying
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-300 shadow-sm shadow-purple-500/20'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <IoMusicalNotesOutline className={`text-base ${isAmbientPlaying ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">
              {isAmbientPlaying ? settings.ambientSound : 'Ambient'}
            </span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
            title="Toggle Fullscreen"
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {isFullscreen ? <IoContractOutline className="text-lg" /> : <IoExpandOutline className="text-lg" />}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            title="Settings"
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition group"
          >
            <IoSettingsOutline className="text-lg group-hover:rotate-45 transition-transform duration-300" />
          </button>
        </div>

      </div>
    </header>
  );
};
