
import React, { useState, useEffect } from 'react';
import { CalendarWidget } from '../components/CalendarWidget';
import { fetchEvents, createEvent } from '../services/backendService';
import { CalendarEvent } from '../types';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';

export const CalendarPage: React.FC = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await fetchEvents();
            setEvents(data);
            setLoading(false);
        };
        load();
    }, []);

    const handleAddEvent = async (newEventData: Omit<CalendarEvent, 'id'>) => {
        const added = await createEvent(newEventData);
        setEvents([...events, added]);
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-otic-orange"/></div>;

    return (
        <div className="space-y-8 animate-fade-in">
             <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 to-purple-600 border border-white/10 p-8 shadow-xl text-white">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <CalendarIcon /> Study Schedule
                    </h2>
                    <p className="text-pink-100 text-lg max-w-2xl">
                        Plan your reading sessions, exams, and deadlines. We'll send email reminders so you never miss a beat.
                    </p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            </div>

            <CalendarWidget events={events} onAddEvent={handleAddEvent} />
        </div>
    );
};
