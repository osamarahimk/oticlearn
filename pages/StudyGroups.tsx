
import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Video, Users, MessageCircle, Calendar, ArrowUpRight, Mic, Plus } from 'lucide-react';

interface Group {
    id: number;
    title: string;
    topic: string;
    members: number;
    active: number;
    color: string;
    joined?: boolean;
}

const initialGroups = [
    { id: 1, title: "Calculus I Study Hall", topic: "Mathematics", members: 124, active: 12, color: "bg-blue-500", joined: true },
    { id: 2, title: "Organic Chemistry", topic: "Science", members: 89, active: 8, color: "bg-green-500" },
    { id: 3, title: "React & TypeScript", topic: "Computer Science", members: 230, active: 45, color: "bg-otic-orange" },
    { id: 4, title: "World History 101", topic: "History", members: 56, active: 3, color: "bg-purple-500" },
];

export const StudyGroups: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>(initialGroups);

    const createGMeetRoom = () => {
        window.open('https://meet.google.com/new', '_blank');
    };

    const handleJoinGroup = (id: number) => {
        setGroups(groups.map(g => {
            if (g.id === id) {
                return { 
                    ...g, 
                    joined: !g.joined,
                    members: g.joined ? g.members - 1 : g.members + 1 
                };
            }
            return g;
        }));
    };

    const handleCreateGroup = () => {
        const newGroup = {
            id: groups.length + 1,
            title: "New Study Group " + (groups.length + 1),
            topic: "General Study",
            members: 1,
            active: 1,
            color: "bg-indigo-500",
            joined: true
        };
        setGroups([...groups, newGroup]);
    };

    const handleSchedule = () => {
        alert("Schedule feature would integrate with Google Calendar API here.");
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 border border-white/10 p-8 md:p-10 shadow-xl text-white">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl font-bold mb-4">Collaborative Study Groups</h2>
                    <p className="text-gray-300 text-lg mb-8">
                        Join a room to study together, share notes, or launch an instant video session to solve problems in real-time.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button 
                            onClick={createGMeetRoom}
                            className="px-6 py-3 bg-otic-orange hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2"
                        >
                            <Video size={20} /> Create Fast Room (GMeet)
                        </button>
                        <button 
                            onClick={handleSchedule}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold border border-white/10 transition-all flex items-center gap-2"
                        >
                            <Calendar size={20} /> Schedule Session
                        </button>
                    </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                     <Users size={300} />
                </div>
            </div>

            {/* Active Groups */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Mic className="text-otic-orange" /> Live Study Rooms
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {groups.map(group => (
                        <GlassCard key={group.id} hoverEffect className="group cursor-pointer transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${group.color} bg-opacity-20 text-${group.color.replace('bg-', '')}`}>
                                    <Users size={24} className={group.id === 3 ? "text-otic-orange" : group.id === 1 ? "text-blue-600" : group.id === 2 ? "text-green-600" : "text-purple-600"} />
                                </div>
                                <span className="px-2 py-1 bg-green-500/10 text-green-600 text-xs rounded-full flex items-center gap-1 font-medium">
                                    ● {group.active} Online
                                </span>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{group.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{group.topic}</p>
                            
                            <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/10 pt-4 mt-4">
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs overflow-hidden">
                                            <img src={`https://picsum.photos/seed/${group.id * i}/50`} alt="user" />
                                        </div>
                                    ))}
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs text-gray-500 font-bold">
                                        +{group.members - 3}
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleJoinGroup(group.id); }}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${group.joined ? 'bg-green-500/10 text-green-600' : 'bg-gray-100 dark:bg-white/10 hover:bg-otic-orange hover:text-white text-gray-600 dark:text-white'}`}
                                >
                                    {group.joined ? 'Joined' : 'Join'}
                                </button>
                            </div>
                        </GlassCard>
                    ))}
                    <div onClick={handleCreateGroup}>
                        <GlassCard className="h-full border-dashed border-2 border-gray-300 dark:border-white/10 flex flex-col items-center justify-center text-center bg-transparent hover:bg-white/5 cursor-pointer group">
                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="text-gray-400 group-hover:text-otic-orange" size={24} />
                            </div>
                            <h4 className="font-bold text-gray-600 dark:text-gray-300 group-hover:text-otic-orange transition-colors">Create New Group</h4>
                            <p className="text-sm text-gray-400">Start a community for your specific course</p>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
};
