import type { FC } from 'react';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({
  title = '✎ Nothing here yet...',
  subtitle = 'Start your first study session!',
}) => {
  return (
    <div className="w-full py-10 sm:py-12 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-[#6B6B6B]/50 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] bg-[#FAF9F6]/60 my-4">
      {/* Hand-drawn Notebook & Pencil Doodle */}
      <div className="relative mb-3 select-none">
        <svg
          className="w-20 h-20 text-[#242424] -rotate-6"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Sketch Notebook */}
          <rect x="25" y="15" width="50" height="70" rx="3" stroke="#242424" fill="#FAF9F6" />
          <line x1="33" y1="28" x2="67" y2="28" stroke="#6B6B6B" strokeDasharray="3 3" />
          <line x1="33" y1="40" x2="67" y2="40" stroke="#6B6B6B" strokeDasharray="3 3" />
          <line x1="33" y1="52" x2="67" y2="52" stroke="#6B6B6B" strokeDasharray="3 3" />
          <line x1="33" y1="64" x2="55" y2="64" stroke="#6B6B6B" strokeDasharray="3 3" />
          
          {/* Notebook Spiral loops */}
          <circle cx="25" cy="25" r="2.5" fill="#242424" />
          <circle cx="25" cy="40" r="2.5" fill="#242424" />
          <circle cx="25" cy="55" r="2.5" fill="#242424" />
          <circle cx="25" cy="70" r="2.5" fill="#242424" />

          {/* Pencil doodle crossing */}
          <path d="M68 22 L82 8 L88 14 L74 28 Z" fill="#FDE68A" stroke="#242424" />
          <path d="M68 22 L63 27 L69 28 Z" fill="#242424" />
        </svg>
      </div>

      <h4 className="text-xl sm:text-2xl font-handwriting font-bold text-[#242424]">
        {title}
      </h4>
      <p className="text-base sm:text-lg font-sketch text-[#6B6B6B] mt-1">
        {subtitle}
      </p>
    </div>
  );
};
