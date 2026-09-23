import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import type { Subject } from '../types/subject';
import { SubjectCard } from '../components/SubjectCard';
import { EmptyState } from '../components/EmptyState';
import { IoAddOutline, IoClose } from 'react-icons/io5';


interface SubjectsPageProps {
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, 'id' | 'sessionsCount' | 'totalMinutes' | 'status'>) => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
  onSelectAndStudy: (id: string) => void;
  onFinishSubject: (id: string) => void;
  onReopenSubject: (id: string) => void;
}

const COLOR_HIGHLIGHTS = [
  { name: 'Yellow', code: '#FDE68A' },
  { name: 'Green', code: '#BBF7D0' },
  { name: 'Blue', code: '#BFDBFE' },
  { name: 'Pink', code: '#FBCFE8' },
];

const EMOJI_ICONS = ['📚', '💻', '📐', '⚡', '🔬', '📝', '🧠', '🌐', '🎨', '🚀'];

type SubjectFilter = 'active' | 'completed';

export const Subjects: FC<SubjectsPageProps> = ({
  subjects,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  onSelectAndStudy,
  onFinishSubject,
  onReopenSubject,
}) => {
  const [filter, setFilter] = useState<SubjectFilter>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Subject To Finish Confirmation Modal state
  const [subjectToFinish, setSubjectToFinish] = useState<Subject | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [targetTimeValue, setTargetTimeValue] = useState('10');
  const [targetTimeUnit, setTargetTimeUnit] = useState<'minutes' | 'hours'>('hours');
  const [color, setColor] = useState(COLOR_HIGHLIGHTS[0].code);
  const [icon, setIcon] = useState(EMOJI_ICONS[0]);

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setName('');
    setGoal('');
    setTargetDate('');
    setTargetTimeValue('');
    setTargetTimeUnit('hours');
    setColor(COLOR_HIGHLIGHTS[0].code);
    setIcon(EMOJI_ICONS[0]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setName(sub.name);
    setGoal(sub.goal || '');
    setTargetDate(sub.targetDate || '');
    if (sub.targetMinutes && sub.targetMinutes > 0) {
      if (sub.targetMinutes % 60 === 0) {
        setTargetTimeValue((sub.targetMinutes / 60).toString());
        setTargetTimeUnit('hours');
      } else {
        setTargetTimeValue(sub.targetMinutes.toString());
        setTargetTimeUnit('minutes');
      }
    } else {
      setTargetTimeValue('');
      setTargetTimeUnit('hours');
    }
    setColor(sub.color || COLOR_HIGHLIGHTS[0].code);
    setIcon(sub.icon || EMOJI_ICONS[0]);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let targetMinutes: number | undefined = undefined;
    const parsedTime = parseFloat(targetTimeValue);
    if (!isNaN(parsedTime) && parsedTime > 0) {
      targetMinutes = targetTimeUnit === 'hours' ? Math.round(parsedTime * 60) : Math.round(parsedTime);
    }

    if (editingSubject) {
      onEditSubject({
        ...editingSubject,
        name: name.trim(),
        goal: goal.trim() || undefined,
        targetDate: targetDate || undefined,
        targetMinutes,
        color,
        icon,
      });
    } else {
      onAddSubject({
        name: name.trim(),
        goal: goal.trim() || undefined,
        targetDate: targetDate || undefined,
        targetMinutes,
        color,
        icon,
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmFinish = () => {
    if (subjectToFinish) {
      onFinishSubject(subjectToFinish.id);
      setSubjectToFinish(null);
    }
  };

  const activeSubjects = subjects.filter((s) => s.status !== 'completed');
  const completedSubjects = subjects.filter((s) => s.status === 'completed');
  const filteredSubjects = filter === 'active' ? activeSubjects : completedSubjects;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b-2 border-dashed border-[#6B6B6B]/40">
        <div>
          <h2 className="text-2xl sm:text-3xl font-handwriting font-extrabold text-[#242424] mb-2">
            <span className="highlight-yellow">MY SUBJECTS</span>
          </h2>
          <p className="text-sm sm:text-base font-sketch text-[#6B6B6B] mt-1">
            Define study goals, track accumulated hours, and celebrate finishing subjects.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-base font-handwriting font-bold bg-[#BBF7D0] hover:bg-[#86efac] text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[3px_3px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] transition-all -rotate-1 hover:rotate-0"
        >
          <IoAddOutline className="text-xl" />
          <span>[ + Add Subject ]</span>
        </button>
      </div>

      {/* Filter Tabs: Active vs Completed */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('active')}
          className={`px-4 py-1.5 text-base font-sketch font-bold border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] transition-all ${
            filter === 'active'
              ? 'bg-[#FDE68A] shadow-[2px_2px_0px_#242424] -rotate-1'
              : 'bg-white text-[#6B6B6B] hover:text-[#242424]'
          }`}
        >
          Active Subjects ({activeSubjects.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('completed')}
          className={`px-4 py-1.5 text-base font-sketch font-bold border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] transition-all ${
            filter === 'completed'
              ? 'bg-[#BBF7D0] shadow-[2px_2px_0px_#242424] rotate-1'
              : 'bg-white text-[#6B6B6B] hover:text-[#242424]'
          }`}
        >
          Completed Subjects ({completedSubjects.length})
        </button>
      </div>

      {/* Grid of Subject Cards */}
      {filteredSubjects.length === 0 ? (
        <EmptyState
          title={filter === 'active' ? '✎ No active subjects' : '✓ No completed subjects yet'}
          subtitle={
            filter === 'active'
              ? 'Create your first study subject and set a goal!'
              : 'When you achieve your study goal, mark a subject as finished!'
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredSubjects.map((sub, index) => (
            <SubjectCard
              key={sub.id}
              subject={sub}
              index={index}
              onEdit={handleOpenEdit}
              onDelete={onDeleteSubject}
              onSelectAndStudy={onSelectAndStudy}
              onFinishSubject={(s) => setSubjectToFinish(s)}
              onReopenSubject={onReopenSubject}
            />
          ))}
        </div>
      )}

      {/* Finish Subject Confirmation Modal */}
      {subjectToFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#FAF9F6] border-3 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-6 sm:p-7 shadow-[6px_6px_0px_#242424] text-center -rotate-0.5">
            {/* Tape Accent */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-7 bg-[#BBF7D0] border border-dashed border-[#6B6B6B] rotate-1" />

            <div className="pt-2">
              <span className="text-3xl">🎓</span>
              <h3 className="text-2xl sm:text-3xl font-handwriting font-extrabold text-[#242424] mt-1">
                Finish {subjectToFinish.name}?
              </h3>
              <p className="text-base font-sketch text-[#6B6B6B] mt-2">
                Are you sure you want to mark this subject as finished? It will be archived under Completed Subjects with today's date.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setSubjectToFinish(null)}
                className="px-5 py-2 text-base font-handwriting text-[#6B6B6B] hover:text-[#242424] border-2 border-transparent hover:border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] transition-all"
              >
                [ Cancel ]
              </button>
              <button
                type="button"
                onClick={handleConfirmFinish}
                className="px-6 py-2.5 text-base font-handwriting font-bold bg-[#BBF7D0] hover:bg-[#86efac] text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[3px_3px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] transition-all -rotate-1"
              >
                [ Yes, Finish Subject ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#FAF9F6] border-3 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-6 sm:p-7 shadow-[6px_6px_0px_#242424] max-h-[90vh] overflow-y-auto">
            
            {/* Tape Accent */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#FDE68A] border border-dashed border-[#6B6B6B] rotate-1" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#6B6B6B]/40">
              <h3 className="text-xl sm:text-2xl font-handwriting font-bold text-[#242424]">
                {editingSubject ? 'Edit Subject & Goals' : 'Add New Subject'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#6B6B6B] hover:text-[#242424] text-xl"
              >
                <IoClose />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Subject Name (Required) */}
              <div>
                <label className="block text-sm font-sketch font-bold text-[#242424] mb-1">
                  Subject Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Systems, Web Development..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] px-3.5 py-2 text-base font-sketch text-[#242424] placeholder-[#6B6B6B]/60 focus:outline-none focus:ring-1 focus:ring-[#242424]"
                  autoFocus
                />
              </div>

              {/* Study Goal (Optional) */}
              <div>
                <label className="block text-sm font-sketch font-bold text-[#242424] mb-1">
                  Study Goal <span className="text-[#6B6B6B] text-xs font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Finish Chapters 1–5, Master algebra..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-white border-2 border-[#242424] border-dashed rounded-[255px_15px_225px_15px/15px_225px_15px_255px] px-3.5 py-2 text-base font-sketch text-[#242424] placeholder-[#6B6B6B]/60 focus:outline-none focus:border-solid focus:ring-1 focus:ring-[#242424]"
                />
              </div>

              {/* Target Date & Target Study Time row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Target Date */}
                <div>
                  <label className="block text-sm font-sketch font-bold text-[#242424] mb-1">
                    Target Date <span className="text-[#6B6B6B] text-xs font-normal">(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-white border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] px-3 py-1.5 text-sm font-sketch text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#242424]"
                  />
                </div>

                {/* Target Study Time */}
                <div>
                  <label className="block text-sm font-sketch font-bold text-[#242424] mb-1">
                    Target Study Time <span className="text-[#6B6B6B] text-xs font-normal">(optional)</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      step={targetTimeUnit === 'hours' ? '0.5' : '1'}
                      placeholder="e.g. 10"
                      value={targetTimeValue}
                      onChange={(e) => setTargetTimeValue(e.target.value)}
                      className="w-20 bg-white border-2 border-[#242424] rounded-lg px-2.5 py-1.5 text-base font-timer font-bold text-[#242424] text-center focus:outline-none"
                    />
                    <select
                      value={targetTimeUnit}
                      onChange={(e) => setTargetTimeUnit(e.target.value as 'minutes' | 'hours')}
                      className="bg-white border-2 border-[#242424] rounded-lg px-2 py-1.5 font-sketch font-bold text-sm text-[#242424] cursor-pointer"
                    >
                      <option value="hours">Hours</option>
                      <option value="minutes">Minutes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Emoji Icon Picker */}
              <div>
                <label className="block text-sm font-sketch font-bold text-[#6B6B6B] mb-1">
                  Subject Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`w-9 h-9 text-lg flex items-center justify-center border-2 border-[#242424] rounded-lg transition-all ${
                        icon === emoji
                          ? 'bg-[#FDE68A] scale-110 shadow-[2px_2px_0px_#242424]'
                          : 'bg-white hover:bg-slate-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Highlighter */}
              <div>
                <label className="block text-sm font-sketch font-bold text-[#6B6B6B] mb-1">
                  Notebook Tape Color
                </label>
                <div className="flex gap-3">
                  {COLOR_HIGHLIGHTS.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setColor(c.code)}
                      className={`flex-1 py-1.5 px-2 text-xs font-sketch font-bold text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] transition-all ${
                        color === c.code
                          ? 'scale-105 shadow-[2px_2px_0px_#242424] -rotate-1 font-bold'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.code }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-dashed border-[#6B6B6B]/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 text-base font-handwriting text-[#6B6B6B] hover:text-[#242424]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-base font-handwriting font-bold bg-[#FDE68A] hover:bg-[#fcd34d] text-[#242424] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px]"
                >
                  {editingSubject ? 'Save Changes' : 'Save Subject'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};
