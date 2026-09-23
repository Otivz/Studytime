import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import type { TimerSettings } from '../types/settings';
import { IoRefreshOutline } from 'react-icons/io5';

interface SettingsProps {
  settings: TimerSettings;
  onSaveSettings: (settings: TimerSettings) => void;
  onResetDefaults: () => void;
}

type DurationUnit = 'minutes' | 'hours';

interface DurationFieldState {
  value: string;
  unit: DurationUnit;
}

// Convert minute value to initial field state
function initFieldState(minutes: number, preferHoursIfEven = false): DurationFieldState {
  if (preferHoursIfEven && minutes >= 60 && minutes % 60 === 0) {
    return {
      value: (minutes / 60).toString(),
      unit: 'hours',
    };
  }
  return {
    value: minutes.toString(),
    unit: 'minutes',
  };
}

// Helper to convert field value to minutes
function toMinutes(val: string, unit: DurationUnit): number {
  const num = parseFloat(val);
  if (isNaN(num) || num <= 0) return 0;
  return unit === 'hours' ? Math.round(num * 60) : Math.round(num);
}

// Helper for dynamic singular/plural unit text
function getUnitLabels(numericVal: number) {
  return {
    minuteLabel: numericVal === 1 ? 'Minute' : 'Minutes',
    hourLabel: numericVal === 1 ? 'Hour' : 'Hours',
  };
}

export const Settings: FC<SettingsProps> = ({
  settings,
  onSaveSettings,
  onResetDefaults,
}) => {
  // Field states with value string and selected unit
  const [studyField, setStudyField] = useState<DurationFieldState>(() =>
    initFieldState(settings.studyMinutes)
  );
  const [shortBreakField, setShortBreakField] = useState<DurationFieldState>(() =>
    initFieldState(settings.shortBreakMinutes)
  );
  const [longBreakField, setLongBreakField] = useState<DurationFieldState>(() =>
    initFieldState(settings.longBreakMinutes)
  );
  // Default Daily Study Goal to Hours (e.g. 120 minutes -> 2 Hours)
  const [dailyGoalField, setDailyGoalField] = useState<DurationFieldState>(() =>
    initFieldState(settings.dailyGoalMinutes, true)
  );

  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle switching units (Minutes <-> Hours) with automatic value conversion
  const handleUnitChange = (
    currentField: DurationFieldState,
    setField: (state: DurationFieldState) => void,
    newUnit: DurationUnit
  ) => {
    if (currentField.unit === newUnit) return;

    const currentMinutes = toMinutes(currentField.value, currentField.unit);
    if (newUnit === 'hours') {
      const hoursVal = Math.round((currentMinutes / 60) * 100) / 100;
      setField({
        value: hoursVal > 0 ? hoursVal.toString() : '1',
        unit: 'hours',
      });
    } else {
      const minsVal = Math.round(currentMinutes);
      setField({
        value: minsVal > 0 ? minsVal.toString() : '25',
        unit: 'minutes',
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Convert all fields to internal minutes
    const rawStudy = toMinutes(studyField.value, studyField.unit);
    const rawShort = toMinutes(shortBreakField.value, shortBreakField.unit);
    const rawLong = toMinutes(longBreakField.value, longBreakField.unit);
    const rawGoal = toMinutes(dailyGoalField.value, dailyGoalField.unit);

    // Validate limits
    // Study Duration: 1–180 minutes
    const validStudy = Math.min(180, Math.max(1, rawStudy || 25));
    // Short Break: 1–60 minutes
    const validShort = Math.min(60, Math.max(1, rawShort || 5));
    // Long Break: 1–120 minutes
    const validLong = Math.min(120, Math.max(1, rawLong || 15));
    // Daily Study Goal: 1–1440 minutes
    const validGoal = Math.min(1440, Math.max(1, rawGoal || 120));

    // Update field values if clamped
    if (rawStudy !== validStudy) {
      setStudyField((prev) => ({
        ...prev,
        value: prev.unit === 'hours' ? (validStudy / 60).toString() : validStudy.toString(),
      }));
    }
    if (rawShort !== validShort) {
      setShortBreakField((prev) => ({
        ...prev,
        value: prev.unit === 'hours' ? (validShort / 60).toString() : validShort.toString(),
      }));
    }
    if (rawLong !== validLong) {
      setLongBreakField((prev) => ({
        ...prev,
        value: prev.unit === 'hours' ? (validLong / 60).toString() : validLong.toString(),
      }));
    }
    if (rawGoal !== validGoal) {
      setDailyGoalField((prev) => ({
        ...prev,
        value: prev.unit === 'hours' ? (validGoal / 60).toString() : validGoal.toString(),
      }));
    }

    // Save to parent state in minutes
    onSaveSettings({
      studyMinutes: validStudy,
      shortBreakMinutes: validShort,
      longBreakMinutes: validLong,
      dailyGoalMinutes: validGoal,
      soundEnabled,
    });

    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset timer settings to defaults (25m study, 5m short break, 15m long break, 2h goal)?')) {
      onResetDefaults();
      // Set sensible defaults as requested
      setStudyField({ value: '25', unit: 'minutes' });
      setShortBreakField({ value: '5', unit: 'minutes' });
      setLongBreakField({ value: '15', unit: 'minutes' });
      setDailyGoalField({ value: '2', unit: 'hours' }); // 2 Hours default
      setSoundEnabled(true);
      setErrorMessage(null);
    }
  };

  // Render helper for duration row with sketch input and unit selector
  const renderDurationRow = (
    label: string,
    subtitle: string,
    field: DurationFieldState,
    setField: (state: DurationFieldState) => void,
    limitHint: string,
    maxMinutes: number
  ) => {
    const num = parseFloat(field.value) || 0;
    const { minuteLabel, hourLabel } = getUnitLabels(num);
    const convertedMinutes = toMinutes(field.value, field.unit);

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#FAF9F6] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424]">
        <div>
          <label className="font-handwriting font-bold text-lg text-[#242424] block">
            {label}
          </label>
          <span className="text-xs font-sketch text-[#6B6B6B]">
            {subtitle} · <span className="opacity-75">{limitHint}</span>
          </span>
        </div>

        <div className="flex flex-col sm:items-end gap-1">
          <div className="flex items-center gap-2">
            {/* Number Input */}
            <input
              type="number"
              min={field.unit === 'hours' ? 0.05 : 1}
              max={field.unit === 'hours' ? Math.round((maxMinutes / 60) * 100) / 100 : maxMinutes}
              step={field.unit === 'hours' ? 'any' : '1'}
              value={field.value}
              onChange={(e) => setField({ ...field, value: e.target.value })}
              className="w-24 px-3 py-1.5 bg-white border-2 border-[#242424] rounded-lg text-center font-timer font-bold text-lg text-[#242424] focus:outline-none shadow-[1px_1px_0px_#242424]"
            />

            {/* Unit Dropdown Selector */}
            <select
              value={field.unit}
              onChange={(e) => handleUnitChange(field, setField, e.target.value as DurationUnit)}
              className="bg-white border-2 border-[#242424] rounded-lg px-3 py-1.5 font-sketch font-bold text-base text-[#242424] focus:outline-none shadow-[1px_1px_0px_#242424] cursor-pointer"
            >
              <option value="minutes">{minuteLabel}</option>
              <option value="hours">{hourLabel}</option>
            </select>
          </div>

          {/* Subtext preview annotation */}
          <div className="text-[11px] font-sketch text-[#6B6B6B] italic px-1">
            {field.unit === 'hours' ? (
              <span>✎ = {convertedMinutes} {convertedMinutes === 1 ? 'minute' : 'minutes'}</span>
            ) : num >= 60 ? (
              <span>✎ = {(num / 60).toFixed(1).replace(/\.0$/, '')} {num === 60 ? 'hour' : 'hours'}</span>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b-2 border-dashed border-[#6B6B6B]/40 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-handwriting font-extrabold text-[#242424] mb-2">
          <span className="highlight-yellow">NOTEBOOK SETTINGS</span>
        </h2>
        <p className="text-sm sm:text-base font-sketch text-[#6B6B6B] mt-1">
          Adjust your study sprint durations and daily goals in Minutes or Hours.
        </p>
      </div>

      {/* Main Settings Card */}
      <form onSubmit={handleSubmit} className="bg-white border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-6 sm:p-8 shadow-[5px_5px_0px_#242424] space-y-5 relative">
        
        {/* Tape accent */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-7 bg-[#FBCFE8] border border-dashed border-[#6B6B6B] -rotate-1 pointer-events-none" />

        {errorMessage && (
          <div className="p-2.5 bg-[#FCA5A5]/40 border-2 border-[#242424] rounded-lg text-sm font-sketch font-bold text-[#242424]">
            ⚠ {errorMessage}
          </div>
        )}

        {/* 1. Study Duration */}
        {renderDurationRow(
          'Study Duration',
          'Standard Pomodoro focus block',
          studyField,
          setStudyField,
          'Max 180m / 3h',
          180
        )}

        {/* 2. Short Break */}
        {renderDurationRow(
          'Short Break',
          'Quick breather between study sprints',
          shortBreakField,
          setShortBreakField,
          'Max 60m / 1h',
          60
        )}

        {/* 3. Long Break */}
        {renderDurationRow(
          'Long Break',
          'Extended rest after 4 completed study cycles',
          longBreakField,
          setLongBreakField,
          'Max 120m / 2h',
          120
        )}

        {/* 4. Daily Study Goal */}
        {renderDurationRow(
          'Daily Study Goal',
          'Target focus time for the day',
          dailyGoalField,
          setDailyGoalField,
          'Max 1440m / 24h',
          1440
        )}

        {/* Bell Sound Toggle */}
        <div className="flex items-center justify-between p-3.5 bg-[#FAF9F6] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424]">
          <div>
            <label className="font-handwriting font-bold text-base text-[#242424] block">
              Bell Sound
            </label>
            <span className="text-xs font-sketch text-[#6B6B6B]">
              Play gentle chime on session completion
            </span>
          </div>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="w-5 h-5 accent-[#242424] cursor-pointer"
          />
        </div>

        {/* Submit Button & Feedback */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-[#6B6B6B]/40">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 text-sm font-sketch font-bold text-[#6B6B6B] hover:text-[#242424] p-1.5 rounded hover:bg-[#FAF9F6] transition"
          >
            <IoRefreshOutline className="text-base" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-3">
            {savedFeedback && (
              <span className="text-sm font-sketch font-bold text-emerald-700 bg-[#BBF7D0] px-2.5 py-1 border border-[#242424] rounded-md -rotate-1">
                ✓ Saved to notebook!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 text-lg font-handwriting font-bold bg-[#FDE68A] hover:bg-[#fcd34d] text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[3px_3px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] -rotate-1 hover:rotate-0 transition-all"
            >
              [ Save Preferences ]
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
