import React from 'react';
import { AppRoute } from '../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Bot, 
  User, 
  LogOut,
  GraduationCap,
  Moon,
  Sun
} from 'lucide-react';

interface SidebarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate, isDarkMode, toggleTheme }) => {
  const menuItems = [
    { id: AppRoute.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppRoute.READING_ROOM, label: 'Reading Room', icon: BookOpen },
    { id: AppRoute.DOCUMENTS, label: 'My Notes & Docs', icon: FileText },
    { id: AppRoute.AI_TUTOR, label: 'AI Tutoring', icon: Bot },
    { id: AppRoute.COMMUNITY, label: 'Course Forums', icon: MessageSquare },
    { id: AppRoute.PROFILE, label: 'Profile', icon: User },
  ];

  return (
    <div className="h-screen w-64 sticky top-0 flex flex-col bg-white/80 dark:bg-otic-glass backdrop-blur-xl border-r border-gray-200 dark:border-otic-glassBorder text-gray-800 dark:text-white p-4 z-50 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => onNavigate(AppRoute.DASHBOARD)}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-otic-orange to-otic-gold flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)]">
            <GraduationCap className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight">OticLearn</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">AI Learning Journey</p>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-otic-orange/20 to-transparent border-l-4 border-otic-orange text-otic-orange dark:text-white shadow-[0_0_10px_rgba(249,115,22,0.1)]' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-otic-orange' : 'text-gray-500 dark:text-gray-400 group-hover:text-otic-orange dark:group-hover:text-white'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-white/10 space-y-4">
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        >
          <span className="text-sm font-medium">Mode</span>
          {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-100 dark:border-white/5">
             <p className="text-xs text-gray-500 dark:text-gray-300 mb-2">Study Streak</p>
             <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-800 dark:text-white">12 Days</span>
                <span className="text-xl">🔥</span>
             </div>
             <div className="w-full bg-gray-300 dark:bg-gray-700 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-otic-orange h-full rounded-full w-3/4 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
             </div>
        </div>
        <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};