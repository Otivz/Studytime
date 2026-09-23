import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { 
  IoClose, 
  IoSettingsOutline, 
  IoVolumeHigh, 
  IoMusicalNotes, 
  IoTimeOutline,
  IoFlameOutline,
  IoRefreshOutline
} from 'react-icons/io5';
import type { TimerSettings, DailyGoal } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  settings: TimerSettings;
  dailyGoal: DailyGoal;
  onClose: () => void;
  onSaveSettings: (settings: TimerSettings, dailyGoal: DailyGoal) => void;
  onResetAllData: () => void;
}

export const SettingsModal: FC<SettingsModalProps> = ({
  isOpen,
  settings,
  dailyGoal,
  onClose,
  onSaveSettings,
  onResetAllData,
}) => {
  const [pomodoroMinutes, setPomodoroMinutes] = useState(settings.pomodoroMinutes);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(settings.shortBreakMinutes);
  const [longBreakMinutes, setLongBreakMinutes] = useState(settings.longBreakMinutes);
  const [longBreakInterval, setLongBreakInterval] = useState(settings.longBreakInterval);
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings.autoStartBreaks);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(settings.autoStartPomodoros);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [soundVolume, setSoundVolume] = useState(settings.soundVolume);
  const [ambientSound, setAmbientSound] = useState(settings.ambientSound);
  const [ambientVolume, setAmbientVolume] = useState(settings.ambientVolume);
  const [targetHours, setTargetHours] = useState((dailyGoal.targetMinutes / 60).toString());

  if (!isOpen) return null;

  const handleSave = (e: FormEvent) => {

    e.preventDefault();
    onSaveSettings(
      {
        ...settings,
        pomodoroMinutes: Math.max(1, Number(pomodoroMinutes)),
        shortBreakMinutes: Math.max(1, Number(shortBreakMinutes)),
        longBreakMinutes: Math.max(1, Number(longBreakMinutes)),
        longBreakInterval: Math.max(1, Number(longBreakInterval)),
        autoStartBreaks,
        autoStartPomodoros,
        soundEnabled,
        soundVolume,
        ambientSound,
        ambientVolume,
      },
      {
        ...dailyGoal,
        targetMinutes: Math.max(15, Math.round(Number(targetHours) * 60)),
      }
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <IoSettingsOutline className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Timer Preferences</h3>
              <p className="text-xs text-slate-400">Customize durations, audio, and study goals</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6 mt-5">
          
          {/* Section 1: Durations */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              <IoTimeOutline className="text-indigo-400 text-sm" />
              <span>Intervals (Minutes)</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <label className="block text-[11px] text-slate-400 font-medium mb-1">Focus</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={pomodoroMinutes}
                  onChange={(e) => setPomodoroMinutes(Number(e.target.value))}
                  className="w-full bg-transparent text-center font-mono text-lg font-bold text-indigo-400 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <label className="block text-[11px] text-slate-400 font-medium mb-1">Short Break</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={shortBreakMinutes}
                  onChange={(e) => setShortBreakMinutes(Number(e.target.value))}
                  className="w-full bg-transparent text-center font-mono text-lg font-bold text-emerald-400 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <label className="block text-[11px] text-slate-400 font-medium mb-1">Long Break</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={longBreakMinutes}
                  onChange={(e) => setLongBreakMinutes(Number(e.target.value))}
                  className="w-full bg-transparent text-center font-mono text-lg font-bold text-sky-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
              <span>Long Break Interval:</span>
              <div className="flex items-center gap-1 font-mono font-bold text-slate-200">
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={longBreakInterval}
                  onChange={(e) => setLongBreakInterval(Number(e.target.value))}
                  className="w-14 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-center text-xs"
                />
                <span>sessions</span>
              </div>
            </div>
          </div>

          {/* Section 2: Daily Target Goal */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              <IoFlameOutline className="text-amber-400 text-sm" />
              <span>Daily Study Goal</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-300">Daily focus target (Hours)</span>
              <input
                type="number"
                min="0.5"
                max="16"
                step="0.5"
                value={targetHours}
                onChange={(e) => setTargetHours(e.target.value)}
                className="w-20 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-center font-mono font-bold text-amber-400 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Automation & Audio */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <IoVolumeHigh className="text-purple-400 text-sm" />
              <span>Audio & Automation</span>
            </div>

            {/* Notification Chime */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-200">Session Chime</span>
                  <p className="text-[11px] text-slate-400">Play pleasant bell on completion</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-5 h-5 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                />
              </div>

              {soundEnabled && (
                <div className="flex items-center gap-3 pt-1 border-t border-slate-900">
                  <span className="text-[11px] text-slate-400 w-14">Volume:</span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(Number(e.target.value))}
                    className="flex-1 accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-400 w-8">{soundVolume}%</span>
                </div>
              )}
            </div>


            {/* Ambient Noise Selector */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IoMusicalNotes className="text-purple-400 text-sm" />
                  <span className="text-xs font-medium text-slate-200">Ambient Background Sound</span>
                </div>
                <select
                  value={ambientSound}
                  onChange={(e) => setAmbientSound(e.target.value as TimerSettings['ambientSound'])}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="none">Off (Silent)</option>
                  <option value="rain">🌧️ Gentle Rain</option>
                  <option value="stream">🌊 Forest Stream</option>
                  <option value="whitenoise">📻 Soft White Noise</option>
                </select>
              </div>

              {ambientSound !== 'none' && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[11px] text-slate-400 w-14">Volume:</span>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={ambientVolume}
                    onChange={(e) => setAmbientVolume(Number(e.target.value))}
                    className="flex-1 accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-400 w-8">{ambientVolume}%</span>
                </div>
              )}
            </div>

            {/* Auto Start Toggles */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoStartBreaks}
                  onChange={(e) => setAutoStartBreaks(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                />
                <span>Auto-start breaks</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoStartPomodoros}
                  onChange={(e) => setAutoStartPomodoros(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                />
                <span>Auto-start Pomodoros</span>
              </label>
            </div>
          </div>

          {/* Reset All Data Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to reset all data and restore initial defaults?')) {
                  onResetAllData();
                }
              }}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition"
            >
              <IoRefreshOutline className="text-base" />
              <span>Reset All Study Data to Defaults</span>
            </button>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              Save Preferences
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
