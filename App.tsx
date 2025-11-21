
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ReadingRoom } from './pages/ReadingRoom';
import { StudyGroups } from './pages/StudyGroups';
import { AITutor } from './pages/AITutor';
import { Resources } from './pages/Resources';
import { StudentPortal } from './pages/StudentPortal';
import { CalendarPage } from './pages/CalendarPage';
import { AppRoute, UserStats, Document } from './types';
import { GlassCard } from './components/GlassCard';
import { UploadModal } from './components/UploadModal';
import { MessageSquare, Bot, Paperclip, Send, Loader2, Menu } from 'lucide-react';
import { uploadFileToStorage, extractTextContent, createDocumentRecord, updateDocumentStatus } from './services/backendService';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // --- Layout State ---
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Global Search State ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- Document State ---
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  
  const [userStats, setUserStats] = useState<UserStats>({
    points: 1250,
    level: 5,
    streak: 12,
    readingTimeMinutes: 340,
    badges: ['Early Bird', 'Fast Reader']
  });

  const handleFileUploadStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
       setPendingUploadFile(e.target.files[0]);
       setIsUploadModalOpen(true);
       e.target.value = "";
    }
  };

  const openUploadModal = () => {
      setPendingUploadFile(null); // Allow modal to show choice (File vs Camera)
      setIsUploadModalOpen(true);
  };

  const handleUploadConfirm = async (title: string, file: File) => {
      setIsUploading(true);
      setIsUploadModalOpen(false);
      try {
          const fileUrl = await uploadFileToStorage(file);
          const content = await extractTextContent(file);
          const newDoc = await createDocumentRecord(title, file, fileUrl, content);
          setDocuments(prev => [newDoc, ...prev]);
          setPendingUploadFile(null);
          setIsUploading(false);
          setActiveDocumentId(newDoc.id);
          setCurrentRoute(AppRoute.READING_ROOM);
      } catch (error) {
          console.error("Upload failed:", error);
          setIsUploading(false);
          setPendingUploadFile(null);
      }
  };

  const handleDocumentSelect = (doc: Document) => {
      setActiveDocumentId(doc.id);
      setCurrentRoute(AppRoute.READING_ROOM);
  };

  const handleContextUpdate = async (id: string) => {
      setDocuments(docs => docs.map(d => d.id === id ? { ...d, contextReady: true } : d));
      await updateDocumentStatus(id, { contextReady: true });
  };

  const addStudyPoints = (amount: number) => setUserStats(p => ({...p, points: p.points + amount}));
  const updateReadingTime = (min: number) => setUserStats(p => ({...p, readingTimeMinutes: p.readingTimeMinutes + min}));

  const handleSignOut = () => {
      // Simulating sign out by refreshing to default state
      window.location.reload();
  };

  const renderContent = () => {
    if (isUploading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] animate-fade-in">
                <div className="relative">
                    <div className="absolute inset-0 bg-otic-orange/20 blur-xl rounded-full"></div>
                    <Loader2 className="w-16 h-16 text-otic-orange animate-spin relative z-10" />
                </div>
                <h3 className="text-2xl font-bold mt-6 text-gray-800 dark:text-white">Uploading to Cloud Storage...</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Synthesizing document structure</p>
            </div>
        )
    }

    switch (currentRoute) {
      case AppRoute.DASHBOARD:
        return <Dashboard stats={userStats} onNavigate={setCurrentRoute} searchQuery={searchQuery} />;
      
      case AppRoute.READING_ROOM:
        return <ReadingRoom 
            documents={documents}
            activeDocumentId={activeDocumentId}
            onSelectDocument={handleDocumentSelect}
            onCloseDocument={() => setActiveDocumentId(null)}
            onUpdateDocumentContext={handleContextUpdate}
            addStudyPoints={addStudyPoints}
            updateReadingTime={updateReadingTime}
            triggerFileUpload={openUploadModal}
            searchQuery={searchQuery}
        />;

      case AppRoute.STUDY_GROUPS:
        return <StudyGroups />;

      case AppRoute.AI_TUTOR:
        return <AITutor />;

      case AppRoute.RESOURCES:
        return <Resources />;

      case AppRoute.PORTAL:
        return <StudentPortal />;

      case AppRoute.SCHEDULE:
        return <CalendarPage />;

      case AppRoute.PROFILE:
          return (
              <div className="max-w-3xl mx-auto animate-fade-in">
                  <GlassCard className="flex flex-col sm:flex-row items-center gap-6 mb-8 text-center sm:text-left">
                      <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden border-4 border-otic-orange shadow-lg">
                          <img src="https://picsum.photos/seed/me/200/200" alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <div>
                          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Student Name</h2>
                          <p className="text-gray-500 dark:text-gray-400">Computer Science Major</p>
                          <p className="text-otic-orange text-sm font-bold mt-2">Level {userStats.level} • {userStats.points} XP</p>
                      </div>
                  </GlassCard>
                  <GlassCard>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Achievements</h3>
                      <div className="flex flex-wrap gap-3">
                          {userStats.badges.map((badge, i) => (
                              <span key={i} className="px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 rounded-full text-sm font-medium">
                                  {badge}
                              </span>
                          ))}
                      </div>
                  </GlassCard>
              </div>
          )
      default:
        return <Dashboard stats={userStats} onNavigate={setCurrentRoute} searchQuery={searchQuery} />;
    }
  };

  return (
    <div className="flex min-h-screen font-sans selection:bg-otic-orange selection:text-white">
      {/* Hidden input specifically for the dashboard/reading room triggers if needed, 
          though we now use the modal for both choices */}
      <input id="hidden-file-input" type="file" className="hidden" onChange={handleFileUploadStart} accept=".pdf,.docx,.txt" />
      
      {isUploadModalOpen && (
        <UploadModal 
            initialFile={pendingUploadFile} 
            onConfirm={handleUploadConfirm} 
            onCancel={() => { setIsUploadModalOpen(false); setPendingUploadFile(null); }} 
        />
      )}

      {/* Responsive Sidebar */}
      <Sidebar 
        currentRoute={currentRoute} 
        onNavigate={setCurrentRoute} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        toggleMobile={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden w-full transition-all duration-300">
        {/* Header with Mobile Menu Trigger */}
        <header className="flex justify-between items-center mb-8 gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-600 dark:text-white">
                <Menu size={24} />
            </button>

            <div className="relative w-full max-w-sm hidden md:block">
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses, resources, or documents..." 
                    className="w-full bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full py-2.5 px-5 pl-10 focus:outline-none focus:border-otic-orange/50 text-gray-800 dark:text-white placeholder-gray-500 transition-all focus:bg-white dark:focus:bg-white/10"
                />
                <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            </div>
            <div className="flex items-center gap-4 ml-auto md:ml-0">
                 <div className="flex items-center gap-3 pl-4 md:border-l border-gray-300 dark:border-white/10 cursor-pointer" onClick={() => setCurrentRoute(AppRoute.PROFILE)}>
                     <div className="text-right hidden sm:block">
                         <p className="text-sm font-bold text-gray-800 dark:text-white">Student</p>
                         <p className="text-xs text-otic-orange font-semibold">{userStats.points} XP</p>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-otic-orange to-pink-500 p-0.5">
                         <img src="https://picsum.photos/seed/me/100/100" className="w-full h-full rounded-full object-cover border-2 border-white dark:border-otic-dark" alt="Profile" />
                     </div>
                 </div>
            </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default App;
