import { useEffect } from 'react';
import type { FC } from 'react';
import type { TimerMode } from '../types/session';
import type { Subject } from '../types/subject';
import { TimerModeSelector } from './TimerModeSelector';
import { TimerControls } from './TimerControls';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
  isRunning: boolean;
  isPaused: boolean;
  mode: TimerMode;
  activeSubject: Subject | undefined;
  goal: string;
  onSelectMode: (mode: TimerMode) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip?: () => void;
}

export const Timer: FC<TimerProps> = ({
  timeLeft,
  totalTime,
  isRunning,
  isPaused,
  mode,
  activeSubject,
  goal,
  onSelectMode,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
}) => {
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const formattedTime = hours > 0
    ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Update document title
  useEffect(() => {
    const label = mode === 'study' ? 'Study' : 'Break';
    document.title = `${formattedTime} - ${label} | Study Notebook`;
  }, [formattedTime, mode]);

  // SVG Circular countdown calculations
  const radius = 152;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = totalTime > 0 ? Math.max(0, Math.min(1, timeLeft / totalTime)) : 0;
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Generate 12 sketch tick marks around clock face
  const tickMarks = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const isMajor = i % 3 === 0;
    const innerR = isMajor ? 138 : 143;
    const outerR = 162;
    return {
      x1: 170 + innerR * Math.cos(angle),
      y1: 170 + innerR * Math.sin(angle),
      x2: 170 + outerR * Math.cos(angle),
      y2: 170 + outerR * Math.sin(angle),
      isMajor,
    };
  });

  return (
    <div className="w-full bg-[#FAF9F6] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-6 sm:p-8 shadow-[5px_5px_0px_#242424] text-center relative overflow-hidden">
      
      {/* Hand-drawn corner tape */}
      <div className="absolute top-2 left-2 w-10 h-4 bg-[#FBCFE8]/80 border border-dashed border-[#6B6B6B] -rotate-45 pointer-events-none" />
      <div className="absolute top-2 right-2 w-10 h-4 bg-[#BFDBFE]/80 border border-dashed border-[#6B6B6B] rotate-45 pointer-events-none" />

      {/* Mode Selector Tabs */}
      <TimerModeSelector currentMode={mode} onSelectMode={onSelectMode} />

      {/* Circular Countdown Timer */}
      <div className="relative my-6 sm:my-8 flex items-center justify-center">
        <div className="relative w-[310px] h-[310px] sm:w-[350px] sm:h-[350px] flex items-center justify-center">
          
          {/* SVG Countdown Ring & Dial */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 transform pointer-events-none"
            viewBox="0 0 340 340"
          >
            {/* Outer faint pencil guide line */}
            <circle
              cx="170"
              cy="170"
              r="164"
              stroke="#6B6B6B"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.35"
              fill="none"
            />

            {/* Highlighter base track */}
            <circle
              cx="170"
              cy="170"
              r={radius}
              stroke={mode === 'study' ? '#FDE68A' : '#BBF7D0'}
              strokeWidth="14"
              fill="none"
              opacity="0.5"
            />

            {/* 12 Pencil Clock Tick Marks */}
            {tickMarks.map((tick, index) => (
              <line
                key={index}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke="#6B6B6B"
                strokeWidth={tick.isMajor ? '2.5' : '1.5'}
                opacity={tick.isMajor ? '0.6' : '0.35'}
                strokeLinecap="round"
              />
            ))}

            {/* Active Ink Countdown Stroke */}
            <circle
              cx="170"
              cy="170"
              r={radius}
              stroke="#242424"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: isRunning ? 'stroke-dashoffset 0.85s linear' : 'stroke-dashoffset 0.3s ease',
              }}
            />
          </svg>

          {/* Center Sketched Paper Card */}
          <div className="relative z-10 w-[240px] h-[240px] sm:w-[270px] sm:h-[270px] rounded-full bg-white border-2 border-[#242424] shadow-[3px_3px_0px_#242424] flex flex-col items-center justify-center p-4 text-center select-none -rotate-0.5">
            
            {/* Small tape accent */}
            <div className="absolute -top-2.5 w-12 h-4 bg-[#FDE68A]/80 border border-dashed border-[#6B6B6B] -rotate-2" />

            {/* Digits Display */}
            <div className={`font-timer font-bold tracking-wider text-[#242424] mt-1 ${
              hours > 0 ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-4xl sm:text-5xl md:text-6xl'
            }`}>
              {formattedTime}
            </div>

            {/* Hand-drawn divider line */}
            <div className="w-20 sm:w-28 h-0.5 border-b-2 border-dashed border-[#6B6B6B]/40 my-2 opacity-70" />

            {/* Subject Status */}
            <div className="text-xs sm:text-sm font-sketch text-[#6B6B6B] max-w-[210px] truncate">
              {mode === 'study' ? (
                <span>
                  Focusing on: <strong className="text-[#242424] font-handwriting">{activeSubject ? activeSubject.name : 'Study Session'}</strong>
                </span>
              ) : (
                <span className="text-[#242424] font-handwriting">
                  ☕ Break time! Rest your eyes.
                </span>
              )}
            </div>

            {/* Goal Tag */}
            {goal.trim() && mode === 'study' && (
              <div className="mt-2 inline-block px-2.5 py-0.5 bg-[#FDE68A]/60 border border-dashed border-[#242424] rounded-md text-[11px] sm:text-xs font-sketch text-[#242424] max-w-[190px] truncate shadow-sm">
                🎯 Goal: "{goal}"
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Timer Controls */}
      <TimerControls
        isRunning={isRunning}
        isPaused={isPaused}
        mode={mode}
        onStart={onStart}
        onPause={onPause}
        onResume={onResume}
        onReset={onReset}
        onSkip={onSkip}
      />

    </div>
  );
};
