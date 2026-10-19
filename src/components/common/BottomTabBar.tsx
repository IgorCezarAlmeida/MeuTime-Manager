import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Users, Trophy, Calendar, ClipboardCheck, Sparkles, User } from 'lucide-react';

export type ScreenTab =
  | 'dashboard'
  | 'roster'
  | 'lineup'
  | 'calendar'
  | 'tactics'
  | 'attendance'
  | 'profile';

interface BottomTabBarProps {
  activeTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
  const { currentUser } = useApp();
  const isCoach = currentUser.role === 'tecnico';

  const coachTabs: { id: ScreenTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Meu Time', icon: Home },
    { id: 'roster', label: 'Elenco', icon: Users },
    { id: 'lineup', label: 'Escalação', icon: Trophy },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'tactics', label: 'Táticas', icon: Sparkles },
  ];

  const playerTabs: { id: ScreenTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Meu Time', icon: Home },
    { id: 'attendance', label: 'Presença', icon: ClipboardCheck },
    { id: 'lineup', label: 'Escalação', icon: Trophy },
    { id: 'calendar', label: 'Jogos', icon: Calendar },
    { id: 'profile', label: 'Meu Perfil', icon: User },
  ];

  const tabs = isCoach ? coachTabs : playerTabs;

  return (
    <nav className="h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center px-1 shrink-0 z-30 select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors relative ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] tracking-tight mt-1 truncate max-w-[64px] text-center">
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
