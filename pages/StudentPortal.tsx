
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { fetchStudentPortalData } from '../services/backendService';
import { StudentGrade, TimetableEntry, FinancialStatus } from '../types';
import { GraduationCap, Calendar, DollarSign, Clock, AlertCircle, CheckCircle, Download } from 'lucide-react';

export const StudentPortal: React.FC = () => {
    const [grades, setGrades] = useState<StudentGrade[]>([]);
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [finance, setFinance] = useState<FinancialStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchStudentPortalData();
            setGrades(data.grades);
            setTimetable(data.timetable);
            setFinance(data.finance);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading) {
        return <div className="p-10 text-center text-gray-500 animate-pulse">Loading Portal Data...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Portal</h1>
                    <p className="text-gray-500 dark:text-gray-400">Makerere University Integration • Sem 1 2025</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-bold border border-green-500/20 flex items-center gap-1">
                        <CheckCircle size={14} /> Registered
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Financial Status Card */}
                <GlassCard className="relative overflow-hidden border-l-4 border-l-otic-orange">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl text-otic-orange">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding Balance</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {finance?.balance.toLocaleString()} {finance?.currency}
                            </h3>
                        </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-white/5 rounded-lg p-3 text-sm">
                         <div className="flex justify-between mb-2">
                            <span className="text-gray-500">Status</span>
                            <span className={`font-bold ${finance?.status === 'Pending' ? 'text-yellow-500' : 'text-green-500'}`}>{finance?.status}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-gray-500">Next Due</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">{finance?.nextDueDate}</span>
                         </div>
                    </div>
                    <button className="w-full mt-4 py-2 bg-otic-orange text-white rounded-lg font-bold text-sm shadow-lg shadow-orange-500/20">
                        Pay Now (Mobile Money)
                    </button>
                </GlassCard>

                {/* GPA Card */}
                <GlassCard className="border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-500">
                            <GraduationCap size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Current CGPA</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">4.42 / 5.0</h3>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {grades.slice(0,2).map((g, i) => (
                            <div key={i} className="flex justify-between items-center text-sm border-b border-gray-200 dark:border-white/10 pb-2 last:border-0">
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-gray-200">{g.courseCode}</p>
                                    <p className="text-xs text-gray-500">{g.courseTitle}</p>
                                </div>
                                <span className="font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded">{g.grade}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
                
                {/* Next Class */}
                <GlassCard className="border-l-4 border-l-purple-500">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl text-purple-500">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Next Lecture</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">14:00</h3>
                        </div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                         <p className="font-bold text-purple-600 dark:text-purple-300">CSC3101 - AI Systems</p>
                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Room 4B • Dr. Smith</p>
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Timetable */}
                <GlassCard>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="text-otic-orange" /> Weekly Timetable
                        </h3>
                        <button className="text-xs text-gray-500 hover:text-otic-orange flex items-center gap-1">
                            <Download size={12} /> PDF
                        </button>
                    </div>
                    <div className="space-y-3">
                        {timetable.map((entry) => (
                            <div key={entry.id} className="flex items-start gap-4 p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
                                <div className="w-16 text-center pt-1">
                                    <span className="block text-xs font-bold text-gray-400 uppercase">{entry.day.substring(0,3)}</span>
                                    <span className="block text-sm font-bold text-gray-800 dark:text-white">{entry.time.split(' - ')[0]}</span>
                                </div>
                                <div className="flex-1 border-l-2 border-otic-orange/30 pl-4">
                                    <p className="font-bold text-gray-800 dark:text-white">{entry.course}</p>
                                    <p className="text-sm text-gray-500">{entry.room} • <span className="italic">{entry.type}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Detailed Grades */}
                <GlassCard>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <CheckCircle className="text-green-500" /> Recent Results
                    </h3>
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">Course</th>
                                <th className="px-4 py-3">Credits</th>
                                <th className="px-4 py-3">Score</th>
                                <th className="px-4 py-3 rounded-tr-lg">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.map((g, i) => (
                                <tr key={i} className="border-b border-gray-100 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5">
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                        {g.courseCode}
                                        <span className="block text-xs text-gray-500 font-normal">{g.courseTitle}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{g.credits}</td>
                                    <td className="px-4 py-3 text-gray-500">{g.score}%</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded font-bold text-xs ${g.grade.startsWith('A') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {g.grade}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </GlassCard>
            </div>
        </div>
    );
};