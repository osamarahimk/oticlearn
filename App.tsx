
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ReadingRoom } from './pages/ReadingRoom';
import { AppRoute, UserStats, Document } from './types';
import { GlassCard } from './components/GlassCard';
import { UploadModal } from './components/UploadModal';
import { UploadCloud, MessageSquare, Bot, Paperclip, Send } from 'lucide-react';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // --- Document State (Simulating Real-time DB) ---
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);

  // --- Interactive States ---
  const [activeForum, setActiveForum] = useState<number | null>(null);
  const [tutorChat, setTutorChat] = useState<string | null>(null);

  // --- Theme Toggle ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  
  // --- User Stats ---
  const [userStats, setUserStats] = useState<UserStats>({
    points: 1250,
    level: 5,
    streak: 12,
    readingTimeMinutes: 340,
    badges: ['Early Bird', 'Fast Reader']
  });

  // --- Handlers ---

  const handleFileUploadStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
       setPendingUploadFile(e.target.files[0]);
       setIsUploadModalOpen(true);
       // Reset input
       e.target.value = "";
    }
  };

  const readFileContent = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          // In a real app using Google Cloud Storage, we would upload the file here 
          // and get a URL. For this demo, we read text directly.
          if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
               resolve("PDF content extraction would happen here via backend service.\n\nFor this demo, please upload a .txt file to see real content, or imagine this is the parsed text of your PDF.");
          } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith('.docx')) {
               resolve("DOCX content extraction would happen here via backend service.\n\nFor this demo, please upload a .txt file to see real content, or imagine this is the parsed text of your Word doc.");
          } else {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string || "");
              reader.onerror = (e) => reject(e);
              reader.readAsText(file);
          }
      });
  };

  const handleUploadConfirm = async (title: string) => {
      if (!pendingUploadFile) return;

      try {
          const content = await readFileContent(pendingUploadFile);
          
          const newDoc: Document = {
              id: Date.now().toString(),
              title: title,
              type: pendingUploadFile.name.endsWith('.pdf') ? 'PDF' : pendingUploadFile.name.endsWith('.docx') ? 'DOCX' : 'TXT',
              uploadDate: new Date().toISOString(),
              category: 'Personal Upload',
              content: content,
              contextReady: false // Will be synthesized in background
          };

          // Simulate DB update
          setDocuments(prev => [newDoc, ...prev]);
          setIsUploadModalOpen(false);
          setPendingUploadFile(null);
          
          // Open immediately
          setActiveDocumentId(newDoc.id);
          setCurrentRoute(AppRoute.READING_ROOM);
      } catch (error) {
          console.error("Error reading file:", error);
          alert("Failed to read file. Please try again.");
      }
  };

  const handleDocumentSelect = (doc: Document) => {
      setActiveDocumentId(doc.id);
      setCurrentRoute(AppRoute.READING_ROOM);
  };

  const handleContextUpdate = (id: string) => {
      setDocuments(docs => docs.map(d => d.id === id ? { ...d, contextReady: true } : d));
  };

  const addStudyPoints = (amount: number) => {
      setUserStats(prev => ({
          ...prev,
          points: prev.points + amount
      }));
  };

  const updateReadingTime = (minutes: number) => {
      setUserStats(prev => ({
          ...prev,
          readingTimeMinutes: prev.readingTimeMinutes + minutes
      }));
  };

  // --- Renderers ---

  const renderContent = () => {
    switch (currentRoute) {
      case AppRoute.DASHBOARD:
        return <Dashboard stats={userStats} onNavigate={setCurrentRoute} />;
      
      case AppRoute.READING_ROOM:
        return <ReadingRoom 
            documents={documents}
            activeDocumentId={activeDocumentId}
            onSelectDocument={handleDocumentSelect}
            onCloseDocument={() => setActiveDocumentId(null)}
            onUpdateDocumentContext={handleContextUpdate}
            addStudyPoints={addStudyPoints}
            updateReadingTime={updateReadingTime}
            triggerFileUpload={() => document.getElementById('hidden-file-input')?.click()}
        />;

      case AppRoute.DOCUMENTS:
        return (
            <div className="flex flex-col gap-6 animate-fade-in">
                 <div className="flex items-center justify-center h-[60vh] flex-col text-center border-2 border-dashed border-gray-300 dark:border-white/20 rounded-3xl bg-white/30 dark:bg-white/5 p-10 transition-all hover:border-otic-orange/50">
                     <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6">
                        <UploadCloud className="w-10 h-10 text-otic-orange" />
                     </div>
                     <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Upload Documents</h2>
                     <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">Drag and drop your PDFs, DOCX, or TXT files here to add them to your Reading Room library.</p>
                     
                     <label className="px-8 py-3 bg-otic-orange text-white rounded-xl hover:bg-orange-600 transition-all cursor-pointer shadow-lg shadow-orange-500/20">
                        Browse Files
                        <input 
                            id="hidden-file-input-docs"
                            type="file" 
                            className="hidden" 
                            onChange={handleFileUploadStart} 
                            accept=".pdf,.docx,.txt" 
                        />
                     </label>
                 </div>
            </div>
        );

      case AppRoute.COMMUNITY:
        if (activeForum !== null) {
            return (
                <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setActiveForum(null)} className="text-sm text-gray-500 dark:text-gray-400 hover:text-otic-orange flex items-center gap-1">
                            ← Back to Forums
                        </button>
                        <h2 className="font-bold text-xl text-gray-800 dark:text-white">Advanced AI Concepts Group</h2>
                    </div>
                    <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden bg-white/80 dark:bg-black/30">
                        <div className="flex-1 p-6 overflow-y-auto space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs text-white font-bold">JD</div>
                                <div>
                                    <div className="bg-gray-100 dark:bg-white/10 p-3 rounded-2xl rounded-tl-none text-sm text-gray-800 dark:text-gray-200 max-w-md">
                                        Has anyone managed to get good results summarizing the Transformer paper?
                                    </div>
                                    <span className="text-xs text-gray-400 ml-2">10:30 AM</span>
                                </div>
                            </div>
                            <div className="flex gap-3 flex-row-reverse">
                                <div className="w-8 h-8 rounded-full bg-otic-orange flex items-center justify-center text-xs text-white font-bold">ME</div>
                                <div className="text-right">
                                    <div className="bg-otic-orange p-3 rounded-2xl rounded-tr-none text-sm text-white max-w-md">
                                        Yes! I used the "Summary" feature in the Reading Room. It broke down the Attention Mechanism really well.
                                    </div>
                                    <span className="text-xs text-gray-400 mr-2">10:32 AM</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 flex gap-2">
                            <button className="p-2 text-gray-400 hover:text-otic-orange"><Paperclip size={20}/></button>
                            <input type="text" placeholder="Type a message..." className="flex-1 bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-500" />
                            <button className="p-2 bg-otic-orange text-white rounded-full hover:bg-orange-600"><Send size={18} /></button>
                        </div>
                    </GlassCard>
                </div>
            )
        }
        return (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                <GlassCard>
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Course Forums</h2>
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div 
                                key={i} 
                                onClick={() => setActiveForum(i)}
                                className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-otic-orange/50 hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Advanced AI Concepts Group</h3>
                                    <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-1 rounded">Active</span>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Discussion about recent transformer architectures and implementing LoRA.</p>
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><MessageSquare size={12}/> 24 new messages</span>
                                    <span>• 2 mins ago</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
                 <GlassCard className="bg-gradient-to-br from-indigo-100 to-white dark:from-indigo-900/40 dark:to-transparent">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Live Discussions</h2>
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400 text-center">
                        <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                        <p>Select a forum to join the live chat.</p>
                    </div>
                </GlassCard>
             </div>
        );

      case AppRoute.AI_TUTOR:
        if (tutorChat) {
             return (
                 <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
                     <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setTutorChat(null)} className="text-sm text-gray-500 hover:text-otic-orange flex items-center gap-1">
                            ← Back to Options
                        </button>
                         <div className="flex items-center gap-2">
                             <Bot className="text-otic-orange" />
                             <h2 className="font-bold text-xl text-gray-800 dark:text-white">AI Tutor</h2>
                         </div>
                     </div>
                     <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden">
                         <div className="flex-1 p-6 overflow-y-auto">
                             <div className="flex gap-3">
                                <div className="p-2 rounded-full bg-otic-orange/20 h-fit"><Bot className="w-5 h-5 text-otic-orange" /></div>
                                <div className="bg-gray-100 dark:bg-white/10 p-4 rounded-2xl rounded-tl-none text-sm text-gray-800 dark:text-gray-200 max-w-2xl">
                                    Okay, let's work on <strong>{tutorChat}</strong>. I've prepared a few initial concepts. Should we start with a quick summary or jump straight into a quiz to test your baseline knowledge?
                                </div>
                             </div>
                         </div>
                         <div className="p-4 border-t border-gray-200 dark:border-white/10">
                             <div className="flex gap-2">
                                 <button className="px-4 py-2 rounded-full border border-gray-300 dark:border-white/20 hover:bg-otic-orange hover:text-white hover:border-otic-orange transition-colors text-sm text-gray-600 dark:text-gray-300">Start Quiz</button>
                                 <button className="px-4 py-2 rounded-full border border-gray-300 dark:border-white/20 hover:bg-otic-orange hover:text-white hover:border-otic-orange transition-colors text-sm text-gray-600 dark:text-gray-300">Explain Basic Concepts</button>
                             </div>
                         </div>
                     </GlassCard>
                 </div>
             )
        }
        return (
             <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6 animate-fade-in">
                 <div className="relative">
                    <div className="absolute inset-0 bg-otic-orange/20 blur-3xl rounded-full"></div>
                    <Bot className="w-24 h-24 text-gray-800 dark:text-white relative z-10" />
                 </div>
                 <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 dark:from-white dark:to-gray-400">AI Personal Tutor</h2>
                 <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                     I can generate custom quizzes, explain complex topics, or help you schedule your revision based on your weak points.
                 </p>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
                     <button onClick={() => setTutorChat("Math Quiz")} className="p-4 bg-white/40 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-white/60 dark:hover:bg-white/10 hover:border-otic-orange/50 hover:-translate-y-1 transition-all shadow-lg text-gray-800 dark:text-white font-medium">
                        Generate Math Quiz
                     </button>
                     <button onClick={() => setTutorChat("Quantum Computing")} className="p-4 bg-white/40 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-white/60 dark:hover:bg-white/10 hover:border-otic-orange/50 hover:-translate-y-1 transition-all shadow-lg text-gray-800 dark:text-white font-medium">
                        Explain "Quantum Computing"
                     </button>
                     <button onClick={() => setTutorChat("My Notes Review")} className="p-4 bg-white/40 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-white/60 dark:hover:bg-white/10 hover:border-otic-orange/50 hover:-translate-y-1 transition-all shadow-lg text-gray-800 dark:text-white font-medium">
                        Review my notes
                     </button>
                 </div>
             </div>
        );

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
                          <div className="flex gap-3 mt-3 justify-center sm:justify-start">
                              <span className="px-3 py-1 bg-otic-gold/20 text-otic-gold rounded-full text-xs font-bold uppercase tracking-wider border border-otic-gold/30">Pro Member</span>
                              <span className="px-3 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-500/30">Level {userStats.level}</span>
                          </div>
                      </div>
                  </GlassCard>
                  <GlassCard>
                      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Achievements</h3>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                           {userStats.badges.map(badge => (
                               <div key={badge} className="flex flex-col items-center p-4 bg-gray-50 dark:bg-white/5 rounded-xl hover:scale-105 transition-transform">
                                   <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-2 shadow-lg flex items-center justify-center text-xl">🏆</div>
                                   <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{badge}</span>
                               </div>
                           ))}
                       </div>
                  </GlassCard>
              </div>
          )
      default:
        return <Dashboard stats={userStats} onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <div className="flex min-h-screen font-sans selection:bg-otic-orange selection:text-white">
      {/* Hidden Global File Input for Header */}
      <input 
        id="hidden-file-input"
        type="file" 
        className="hidden" 
        onChange={handleFileUploadStart} 
        accept=".pdf,.docx,.txt" 
      />

      {isUploadModalOpen && pendingUploadFile && (
        <UploadModal 
            fileName={pendingUploadFile.name}
            onConfirm={handleUploadConfirm}
            onCancel={() => {
                setIsUploadModalOpen(false);
                setPendingUploadFile(null);
            }}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar 
        currentRoute={currentRoute} 
        onNavigate={setCurrentRoute} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {/* Top Bar */}
        <header className="flex justify-between items-center mb-8">
            <div className="relative w-full max-w-sm hidden sm:block">
                <input 
                    type="text" 
                    placeholder="Search courses, documents, or ask AI..." 
                    className="w-full bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full py-2.5 px-5 pl-10 focus:outline-none focus:border-otic-orange/50 focus:bg-white dark:focus:bg-white/10 transition-all text-gray-800 dark:text-white placeholder-gray-500"
                />
                <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            </div>
            <div className="flex items-center gap-4 ml-auto sm:ml-0">
                <button className="w-10 h-10 rounded-full bg-white/60 dark:bg-white/5 flex items-center justify-center hover:bg-white dark:hover:bg-white/10 transition-colors relative text-gray-600 dark:text-white shadow-sm">
                    🔔
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                 <div className="flex items-center gap-3 pl-4 border-l border-gray-300 dark:border-white/10 cursor-pointer" onClick={() => setCurrentRoute(AppRoute.PROFILE)}>
                     <div className="text-right hidden md:block">
                         <p className="text-sm font-bold text-gray-800 dark:text-white">Student</p>
                         <p className="text-xs text-otic-orange font-semibold">{userStats.points} XP</p>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-otic-orange to-pink-500 p-0.5">
                         <img src="https://picsum.photos/seed/me/100/100" className="w-full h-full rounded-full object-cover border-2 border-white dark:border-otic-dark" alt="Profile" />
                     </div>
                 </div>
            </div>
        </header>

        {/* Route Content */}
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
