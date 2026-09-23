import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { 
  IoAdd, 
  IoBookOutline, 
  IoTrashOutline, 
  IoCheckmark, 
  IoClose
} from 'react-icons/io5';
import type { Subject } from '../types';

interface SubjectSelectorProps {
  subjects: Subject[];
  activeSubjectId: string;
  onSelectSubject: (id: string) => void;
  onAddSubject: (subject: Omit<Subject, 'id' | 'totalMinutes'>) => void;
  onDeleteSubject: (id: string) => void;
}

const COLOR_PALETTE = [

  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#14b8a6', // Teal
];

const DEFAULT_ICONS = ['📚', '💻', '📐', '⚡', '🔬', '🎨', '📝', '🧠', '🌐', '🎸'];

export const SubjectSelector: FC<SubjectSelectorProps> = ({
  subjects,
  activeSubjectId,
  onSelectSubject,
  onAddSubject,
  onDeleteSubject,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [selectedIcon, setSelectedIcon] = useState(DEFAULT_ICONS[0]);
  const [goalMinutes, setGoalMinutes] = useState(120);

  const handleSubmit = (e: FormEvent) => {

    e.preventDefault();
    if (!name.trim()) return;

    onAddSubject({
      name: name.trim(),
      color: selectedColor,
      icon: selectedIcon,
      goalMinutes: Number(goalMinutes) || 120,
    });

    setName('');
    setIsModalOpen(false);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IoBookOutline className="text-indigo-400 text-lg" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Study Subjects
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {subjects.length}
          </span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition"
        >
          <IoAdd className="text-base" />
          <span>New Subject</span>
        </button>
      </div>

      {/* Subject Pills list */}
      <div className="flex flex-wrap gap-2">
        {subjects.map((sub) => {
          const isActive = sub.id === activeSubjectId;
          const hours = (sub.totalMinutes / 60).toFixed(1);

          return (
            <div
              key={sub.id}
              className={`group relative flex items-center gap-2.5 px-3.5 py-2 rounded-2xl cursor-pointer border transition-all duration-200 ${
                isActive
                  ? 'bg-slate-800/90 border-slate-600 shadow-md ring-2'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700 text-slate-400'
              }`}
              style={{
                borderColor: isActive ? sub.color : undefined,
                boxShadow: isActive ? `0 0 16px -2px ${sub.color}40` : undefined,
              }}
              onClick={() => onSelectSubject(sub.id)}
            >
              {/* Color indicator / Icon */}
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs shadow-inner"
                style={{ backgroundColor: `${sub.color}25`, color: sub.color }}
              >
                <span>{sub.icon || '📖'}</span>
              </div>

              {/* Title & Time */}
              <div className="flex flex-col text-left">
                <span
                  className={`text-xs font-semibold leading-tight ${
                    isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}
                >
                  {sub.name}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {hours}h logged
                </span>
              </div>

              {/* Active Checkmark */}
              {isActive && (
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] ml-1"
                  style={{ backgroundColor: sub.color }}
                >
                  <IoCheckmark />
                </div>
              )}

              {/* Delete Subject Option (shown on hover if more than 1 subject exists) */}
              {subjects.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete subject "${sub.name}"?`)) {
                      onDeleteSubject(sub.id);
                    }
                  }}
                  title="Delete subject"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition ml-1"
                >
                  <IoTrashOutline className="text-xs" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <span>✨</span> Create New Subject
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <IoClose className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry, Algorithms, French..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                  autoFocus
                />
              </div>

              {/* Emoji Icon Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Choose Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedIcon(emoji)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition ${
                        selectedIcon === emoji
                          ? 'bg-indigo-600/30 border-indigo-500 text-white scale-110'
                          : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Theme Color
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        selectedColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Target Goal (Hours) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Weekly Goal Target (Minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={goalMinutes}
                  onChange={(e) => setGoalMinutes(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition active:scale-95"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
