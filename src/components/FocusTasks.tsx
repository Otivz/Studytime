import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { 
  IoCheckmarkCircle, 
  IoEllipseOutline, 
  IoAdd, 
  IoTrashOutline, 
  IoListOutline,
  IoCheckmarkDoneOutline
} from 'react-icons/io5';
import type { StudyTask, Subject } from '../types';

interface FocusTasksProps {
  tasks: StudyTask[];
  activeSubject: Subject | undefined;
  onAddTask: (text: string, subjectId?: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearCompleted: () => void;
}

export const FocusTasks: FC<FocusTasksProps> = ({
  tasks,
  activeSubject,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
}) => {
  const [newText, setNewText] = useState('');

  const handleSubmit = (e: FormEvent) => {

    e.preventDefault();
    if (!newText.trim()) return;
    onAddTask(newText.trim(), activeSubject?.id);
    setNewText('');
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="flex flex-col h-full p-5 sm:p-6 rounded-3xl glass-card border border-slate-800/80 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <IoListOutline className="text-lg" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Focus Tasks
            </h3>
            <p className="text-[11px] text-slate-400">Current session objectives</p>
          </div>
        </div>

        {tasks.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {completedCount}/{tasks.length}
            </span>
            {completedCount > 0 && (
              <button
                onClick={onClearCompleted}
                title="Clear completed tasks"
                className="text-[11px] text-slate-400 hover:text-rose-400 transition"
              >
                Clear Done
              </button>
            )}
          </div>
        )}
      </div>

      {/* Task Input */}
      <form onSubmit={handleSubmit} className="relative mt-4 mb-3">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder={`Add goal for ${activeSubject ? activeSubject.name : 'this session'}...`}
          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
        />
        <button
          type="submit"
          disabled={!newText.trim()}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 rounded-lg bg-indigo-600 disabled:bg-slate-800 text-white disabled:text-slate-600 transition flex items-center justify-center shadow-sm"
        >
          <IoAdd className="text-lg" />
        </button>
      </form>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[140px] max-h-[220px]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-slate-500 text-center">
            <IoCheckmarkDoneOutline className="text-3xl mb-1 opacity-40" />
            <p className="text-xs">No active study tasks.</p>
            <p className="text-[11px] text-slate-600">Write down what you want to complete!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all duration-150 ${
                task.completed
                  ? 'bg-slate-950/40 border-slate-800/40 opacity-60'
                  : 'bg-slate-900/70 border-slate-850 hover:border-slate-700'
              }`}
            >
              <div
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                onClick={() => onToggleTask(task.id)}
              >
                <button
                  type="button"
                  className="flex-shrink-0 text-lg transition"
                >
                  {task.completed ? (
                    <IoCheckmarkCircle className="text-emerald-400" />
                  ) : (
                    <IoEllipseOutline className="text-slate-500 group-hover:text-indigo-400" />
                  )}
                </button>
                <span
                  className={`text-xs sm:text-sm font-medium truncate ${
                    task.completed
                      ? 'line-through text-slate-500'
                      : 'text-slate-200 group-hover:text-white'
                  }`}
                >
                  {task.text}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onDeleteTask(task.id)}
                title="Delete task"
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition ml-2"
              >
                <IoTrashOutline className="text-sm" />
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
