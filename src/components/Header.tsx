import type { FC } from 'react';
import { IoFlame, IoPersonOutline, IoLogOutOutline } from 'react-icons/io5';
import type { User } from '../types/auth';

interface HeaderProps {
  streakDays: number;
  user: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Header: FC<HeaderProps> = ({ 
  streakDays, 
  user, 
  onOpenLogin, 
  onLogout 
}) => {
  return (
    <header className="relative w-full border-b-2 border-[#242424] bg-[#FAF9F6] pb-4 pt-6 px-4 sm:px-8">
      {/* Notebook Binder Rings Decoration */}
      <div className="absolute top-2 left-6 right-6 hidden sm:flex justify-between max-w-4xl mx-auto pointer-events-none opacity-40">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#242424] border border-[#6B6B6B]" />
            <div className="w-1 h-3 bg-[#6B6B6B]" />
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Title & Subtitle with Custom Logo */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <img 
            src="/logo.png" 
            alt="StudyTime" 
            className="h-12 sm:h-16 w-auto object-contain cursor-pointer hover:scale-105 transition-transform" 
          />
          <div>
            <h1 className="sr-only">StudyTime</h1>
            <p className="text-base sm:text-lg text-[#6B6B6B] font-sketch mt-0.5">
              Let's get something done today.
            </p>
          </div>
        </div>

        {/* Top Right Badges: Streak & User Profile */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-end">
          {/* Notebook Streak Sticker - Only show when logged in */}
          {user && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FDE68A] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424] -rotate-1 hover:rotate-0 transition-transform cursor-default select-none">
              <IoFlame className="text-xl text-[#242424]" />
              <span className="font-handwriting font-bold text-base text-[#242424]">
                {streakDays} Day Streak!
              </span>
            </div>
          )}

          {/* User Profile / Sign In Widget */}
          {user ? (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-white border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424] rotate-1 hover:rotate-0 transition-transform">
              {user.avatar && user.avatar.startsWith('http') ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border-2 border-[#242424] shrink-0" 
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#FDE68A] border-2 border-[#242424] flex items-center justify-center font-bold text-xs shrink-0 select-none">
                  {user.avatar || user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-handwriting font-bold text-base text-[#242424] max-w-[140px] sm:max-w-[180px] truncate">
                {user.name}
              </span>
              <button
                type="button"
                onClick={onLogout}
                title="Sign out"
                className="p-1 text-[#6B6B6B] hover:text-rose-600 rounded transition cursor-pointer"
              >
                <IoLogOutOutline className="text-lg" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#BBF7D0] hover:bg-[#86efac] border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-[2px_2px_0px_#242424] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer font-handwriting font-bold text-sm text-[#242424] rotate-1 hover:rotate-0"
            >
              <IoPersonOutline className="text-base" />
              <span>[ 👤 Sign In ]</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
