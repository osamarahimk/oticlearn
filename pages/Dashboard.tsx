import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { UserStats, Course, AppRoute } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { Trophy, Clock, Book, Zap, ArrowRight } from 'lucide-react';

interface DashboardProps {
  stats: UserStats;
  onNavigate: (route: AppRoute) => void;
}

const activityData = [
  { name: 'Mon', hours: 2 },
  { name: 'Tue', hours: 4.5 },
  { name: 'Wed', hours: 3 },
  { name: 'Thu', hours: 5 },
  { name: 'Fri', hours: 3.5 },
  { name: 'Sat', hours: 6 },
  { name: 'Sun', hours: 4 },
];

const courses: Course[] = [
  { id: '1', title: 'Agentic AI Core', instructor: 'Dr. Smith', progress: 75, totalModules: 10, completedModules: 7, thumbnail: 'https://picsum.photos/seed/ai/200/120' },
  { id: '2', title: 'Business Analytics', instructor: 'Prof. Doe', progress: 30, totalModules: 12, completedModules: 4, thumbnail: 'https://picsum.photos/seed/biz/200/120' },
  { id: '3', title: 'Advanced React Patterns', instructor: 'Sarah Tech', progress: 10, totalModules: 8, completedModules: 1, thumbnail: 'https://picsum.photos/seed/react/200/120' },
];

export const Dashboard: React.FC<DashboardProps> = ({ stats, onNavigate }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600/90 to-purple-600/90 dark:from-indigo-600/40 dark:to-purple-600/40 border border-white/10 p-8 md:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-otic-orange/20 rounded-full blur-3xl animate-blob"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, Student! 👋</h2>
          <p className="text-gray-100 dark:text-gray-200 max-w-xl text-lg">
            Ready to learn & connect? Your study streak is on fire! Check out your latest personalized reading suggestions below.
          </p>
          <button 
            onClick={() => onNavigate(AppRoute.READING_ROOM)}
            className="mt-6 px-6 py-3 bg-otic-orange hover:bg-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2"
          >
            Resume Learning <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="flex items-center gap-4" hoverEffect glowColor="blue">
          <div className="p-3 bg-blue-500/20 rounded-xl text-blue-500 dark:text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Study Time</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{Math.floor(stats.readingTimeMinutes / 60)}h {stats.readingTimeMinutes % 60}m</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4" hoverEffect glowColor="orange">
          <div className="p-3 bg-otic-orange/20 rounded-xl text-otic-orange">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Points</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.points}</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4" hoverEffect glowColor="none">
          <div className="p-3 bg-green-500/20 rounded-xl text-green-600 dark:text-green-400">
            <Book className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Courses Active</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{courses.length}</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4" hoverEffect glowColor="none">
          <div className="p-3 bg-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Current Level</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">Lvl {stats.level}</p>
          </div>
        </GlassCard>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Progress Chart & Courses */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Learning Activity</h3>
              <select className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1 text-sm text-gray-600 dark:text-gray-300 outline-none">
                <option>This Week</option>
                <option>Last Month</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1b4b', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#f3f4f6' }}
                  />
                  <Area type="monotone" dataKey="hours" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Continue Learning</h3>
            <div className="space-y-4">
              {courses.map(course => (
                <GlassCard key={course.id} className="flex flex-col sm:flex-row gap-4 items-center" hoverEffect>
                  <img src={course.thumbnail} alt={course.title} className="w-full sm:w-32 h-24 object-cover rounded-xl" />
                  <div className="flex-1 w-full">
                    <div className="flex justify-between mb-1">
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{course.title}</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{course.completedModules}/{course.totalModules} Modules</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{course.instructor}</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700/50 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-otic-orange to-otic-gold h-full rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigate(AppRoute.READING_ROOM)}
                    className="px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg text-sm font-medium transition-colors whitespace-nowrap text-gray-800 dark:text-white"
                  >
                    Continue
                  </button>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Leaderboard & Challenges */}
        <div className="space-y-8">
          <GlassCard>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="text-otic-gold w-5 h-5" /> Leaderboard
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Alex M.', points: 2450, rank: 1, avatar: 'https://picsum.photos/seed/user1/40/40' },
                { name: 'Sarah K.', points: 2200, rank: 2, avatar: 'https://picsum.photos/seed/user2/40/40' },
                { name: 'You', points: stats.points, rank: 3, avatar: 'https://picsum.photos/seed/me/40/40' },
                { name: 'John D.', points: 1800, rank: 4, avatar: 'https://picsum.photos/seed/user3/40/40' },
              ].map((user) => (
                <div key={user.rank} className={`flex items-center gap-3 p-3 rounded-xl ${user.name === 'You' ? 'bg-otic-orange/20 border border-otic-orange/30' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                  <span className={`font-bold w-6 text-center ${user.rank <= 3 ? 'text-otic-gold' : 'text-gray-500'}`}>#{user.rank}</span>
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{user.name}</span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{user.points} pts</span>
                </div>
              ))}
            </div>
          </GlassCard>
          
          <GlassCard className="bg-gradient-to-b from-purple-100 to-white dark:from-otic-purple/50 dark:to-transparent">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Daily Challenge</h3>
             <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Read "Introduction to Neural Networks" and score >80% on the quiz.</p>
             <div className="flex justify-between items-center">
                <span className="text-xs px-2 py-1 rounded bg-black/5 dark:bg-white/10 text-gray-700 dark:text-white">+500 XP</span>
                <button 
                    onClick={() => onNavigate(AppRoute.READING_ROOM)}
                    className="text-sm text-otic-orange hover:text-orange-700 dark:hover:text-white transition-colors font-medium"
                >
                    Start Now
                </button>
             </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};