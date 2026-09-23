import type { FC } from 'react';
import { 
  IoGridOutline, 
  IoCalendarOutline,
  IoLibraryOutline, 
  IoTimeOutline, 
  IoCogOutline 
} from 'react-icons/io5';

export type NavTab = 'dashboard' | 'calendar' | 'subjects' | 'history' | 'settings' | 'login';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navigation: FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <IoGridOutline />, color: '#FDE68A' },
    { id: 'calendar', label: 'Calendar', icon: <IoCalendarOutline />, color: '#BBF7D0' },
    { id: 'subjects', label: 'Subjects', icon: <IoLibraryOutline />, color: '#BFDBFE' },
    { id: 'history', label: 'History', icon: <IoTimeOutline />, color: '#FBCFE8' },
    { id: 'settings', label: 'Settings', icon: <IoCogOutline />, color: '#FED7AA' },
  ];


  return (
    <nav className="w-full max-w-4xl mx-auto px-4 mt-4">
      <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 flex-wrap border-b border-[#6B6B6B]/30 pb-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-base sm:text-lg font-sketch font-bold transition-all duration-150 border-2 border-[#242424] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] ${
                isActive
                  ? `shadow-[3px_3px_0px_#242424] translate-y-[-2px] -rotate-1`
                  : 'bg-white/80 hover:bg-white text-[#6B6B6B] hover:text-[#242424] shadow-[1px_1px_0px_#242424] hover:shadow-[2px_2px_0px_#242424]'
              }`}
              style={{
                backgroundColor: isActive ? tab.color : undefined,
              }}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
