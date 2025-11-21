
import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { CalendarEvent } from '../types';
import { ChevronLeft, ChevronRight, Plus, Bell, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { audio } from '../services/audioService';

interface CalendarWidgetProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events, onAddEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  
  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [eventType, setEventType] = useState<CalendarEvent['type']>('Study');
  const [emailReminder, setEmailReminder] = useState(true);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);

  const changeMonth = (delta: number) => {
    audio.playClick();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const handleDayClick = (day: number) => {
    audio.playClick();
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleSubmitEvent = () => {
      if (!selectedDate || !newEventTitle.trim()) return;
      audio.playSuccess();
      onAddEvent({
          title: newEventTitle,
          date: selectedDate,
          type: eventType,
          emailReminder: emailReminder
      });
      setIsAddingEvent(false);
      setNewEventTitle('');
  };

  const getEventsForDay = (day: number) => {
      return events.filter(e => {
          const d = new Date(e.date);
          return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
      });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Calendar Grid */}
      <div className="flex-1">
        <GlassCard className="h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-600 dark:text-white"><ChevronLeft /></button>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-600 dark:text-white"><ChevronRight /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2 text-center">
            {DAYS.map(day => (
              <div key={day} className="text-xs font-bold text-gray-400 uppercase tracking-wider py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 bg-transparent"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth();

              return (
                <div 
                  key={day} 
                  onClick={() => handleDayClick(day)}
                  className={`h-24 rounded-xl p-2 cursor-pointer transition-all border ${
                    isSelected 
                      ? 'border-otic-orange bg-otic-orange/10 shadow-[0_0_15px_rgba(249,115,22,0.2)]' 
                      : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                  } ${isToday ? 'bg-blue-500/5' : ''}`}
                >
                  <span className={`text-sm font-medium ${isToday ? 'text-blue-500 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map(ev => (
                        <div key={ev.id} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 truncate border-l-2 border-otic-orange">
                            {ev.title}
                        </div>
                    ))}
                    {dayEvents.length > 2 && (
                        <div className="text-[10px] text-gray-400 pl-1">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Side Panel: Details or Add Form */}
      <div className="w-full lg:w-80">
         <GlassCard className="h-full flex flex-col">
            {selectedDate ? (
                 isAddingEvent ? (
                    <div className="animate-fade-in">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Event</h3>
                        <p className="text-sm text-gray-500 mb-4">{selectedDate.toDateString()}</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                                <input 
                                    type="text" 
                                    value={newEventTitle}
                                    onChange={e => setNewEventTitle(e.target.value)}
                                    className="w-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white mt-1 focus:border-otic-orange outline-none"
                                    placeholder="Event name..."
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                                <select 
                                    value={eventType}
                                    onChange={(e) => setEventType(e.target.value as any)}
                                    className="w-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white mt-1 outline-none"
                                >
                                    <option value="Study">Study Session</option>
                                    <option value="Exam">Exam</option>
                                    <option value="Deadline">Deadline</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3 py-2">
                                <button 
                                    onClick={() => setEmailReminder(!emailReminder)}
                                    className={`w-10 h-6 rounded-full flex items-center transition-colors ${emailReminder ? 'bg-otic-orange' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${emailReminder ? 'translate-x-5' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm text-gray-700 dark:text-gray-300">Email Reminder</span>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => setIsAddingEvent(false)} className="flex-1 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 rounded-lg text-gray-600 dark:text-gray-300 text-sm font-medium">Cancel</button>
                                <button onClick={handleSubmitEvent} disabled={!newEventTitle} className="flex-1 py-2 bg-otic-orange hover:bg-orange-600 rounded-lg text-white text-sm font-bold disabled:opacity-50">Save</button>
                            </div>
                        </div>
                    </div>
                 ) : (
                    <div className="flex flex-col h-full animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Schedule</h3>
                            <p className="text-xs text-gray-500">{selectedDate.toLocaleDateString()}</p>
                        </div>
                        
                        <div className="flex-1 space-y-3 overflow-y-auto">
                            {getEventsForDay(selectedDate.getDate()).length === 0 && (
                                <div className="text-center py-8 text-gray-400 text-sm">No events scheduled</div>
                            )}
                            {getEventsForDay(selectedDate.getDate()).map(ev => (
                                <div key={ev.id} className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border-l-4 border-otic-orange">
                                    <h4 className="font-bold text-gray-800 dark:text-white text-sm">{ev.title}</h4>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-gray-500 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded">{ev.type}</span>
                                        {ev.emailReminder && <Bell size={12} className="text-otic-orange" />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => setIsAddingEvent(true)}
                            className="w-full py-3 mt-4 bg-gradient-to-r from-otic-orange to-otic-gold text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            <Plus size={18} /> Add Event
                        </button>
                    </div>
                 )
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-4">
                    <CalendarIcon size={48} className="mb-4 opacity-50" />
                    <p>Select a date to view or add events.</p>
                </div>
            )}
         </GlassCard>
      </div>
    </div>
  );
};
