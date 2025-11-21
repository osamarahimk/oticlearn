
import React, { useState, useEffect } from 'react';
import { AppRoute } from '../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Bot, 
  User, 
  LogOut,
  GraduationCap,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Menu,
  Library,
  Building2,
  Calendar
} from 'lucide-react';
import { audio } from '../services/audioService';

interface SidebarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  toggleMobile: () => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    currentRoute, 
    onNavigate, 
    isDarkMode, 
    toggleTheme,
    isCollapsed,
    toggleCollapse,
    isMobileOpen,
    toggleMobile,
    onSignOut
}) => {
  const menuItems = [
    { id: AppRoute.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppRoute.READING_ROOM, label: 'Reading Room', icon: BookOpen },
    { id: AppRoute.AI_TUTOR, label: 'AI Tutoring', icon: Bot },
    { id: AppRoute.STUDY_GROUPS, label: 'Study Groups', icon: Users },
    { id: AppRoute.SCHEDULE, label: 'Schedule', icon: Calendar },
    { id: AppRoute.RESOURCES, label: 'Library Resources', icon: Library },
    { id: AppRoute.PORTAL, label: 'Student Portal', icon: Building2 },
    { id: AppRoute.PROFILE, label: 'Profile', icon: User },
  ];

  // Mobile Overlay
  const MobileOverlay = () => (
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleMobile}
      />
  );

  const handleNavClick = (route: AppRoute) => {
      audio.playClick();
      onNavigate(route);
      if(window.innerWidth < 1024) toggleMobile();
  };

  return (
    <>
    <MobileOverlay />
    
    <div className={`
        fixed lg:sticky top-0 h-screen z-50
        bg-white/80 dark:bg-otic-glass backdrop-blur-xl border-r border-gray-200 dark:border-otic-glassBorder 
        text-gray-800 dark:text-white transition-all duration-300 ease-in-out flex flex-col
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
    `}>
      
      {/* Header */}
      <div className={`flex items-center h-20 px-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={() => handleNavClick(AppRoute.DASHBOARD)}>
            <div className="min-w-[40px] h-10 rounded-xl bg-gradient-to-br from-otic-orange to-otic-gold flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                <GraduationCap className="text-white" size={24} />
            </div>
            <div className={`transition-opacity duration-200 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                <h1 className="font-bold text-xl tracking-tight">OticLearn</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI Learning</p>
            </div>
        </div>
        {/* Desktop Collapse Toggle */}
        <button onClick={toggleCollapse} className="hidden lg:block p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-500">
             {isCollapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
        </button>
        {/* Mobile Close */}
        <button onClick={toggleMobile} className="lg:hidden p-1.5 text-gray-500">
             <ChevronLeft size={24}/>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-2 px-3 mt-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={isCollapsed ? item.label : ''}
              className={`
                w-full flex items-center rounded-xl transition-all duration-300 group relative
                ${isCollapsed ? 'justify-center py-3 px-0' : 'justify-start gap-3 px-4 py-3'}
                ${isActive 
                  ? 'bg-gradient-to-r from-otic-orange/20 to-transparent text-otic-orange dark:text-white shadow-[0_0_10px_rgba(249,115,22,0.1)]' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}
                ${isActive && !isCollapsed ? 'border-l-4 border-otic-orange' : ''}
              `}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-otic-orange' : 'text-gray-500 dark:text-gray-400 group-hover:text-otic-orange dark:group-hover:text-white'}`} />
              <span className={`font-medium whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                  {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 pb-6 border-t border-gray-200 dark:border-white/10 px-3 space-y-4">
        
        {/* Theme Toggle */}
        <button 
          onClick={() => { audio.playClick(); toggleTheme(); }}
          className={`w-full flex items-center rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors ${isCollapsed ? 'justify-center py-3' : 'justify-between px-4 py-2'}`}
        >
          <span className={`text-sm font-medium ${isCollapsed ? 'hidden' : 'block'}`}>Mode</span>
          {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {!isCollapsed && (
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
        )}

        <button 
            onClick={onSignOut}
            className={`w-full flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ${isCollapsed ? 'justify-center' : 'px-4 py-2'}`}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
    </>
  );
};
