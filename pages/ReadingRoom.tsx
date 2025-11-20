
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/GlassCard';
import { generateSummary, askDocument, generateQuiz, getStudyTips, synthesizeDocumentContext } from '../services/geminiService';
import { Document } from '../types';
import { EncouragementAvatar } from '../components/EncouragementAvatar';
import { 
    Book, MessageCircle, FileText, CheckCircle, BrainCircuit, Loader2, 
    Sparkles, ChevronLeft, ChevronRight, Volume2, StopCircle, ArrowLeft,
    Clock, Library, Plus, Zap
} from 'lucide-react';

interface ReadingRoomProps {
    documents: Document[];
    activeDocumentId: string | null;
    onSelectDocument: (doc: Document) => void;
    onCloseDocument: () => void;
    onUpdateDocumentContext: (id: string) => void;
    addStudyPoints: (points: number) => void;
    updateReadingTime: (minutes: number) => void;
    triggerFileUpload: () => void;
}

export const ReadingRoom: React.FC<ReadingRoomProps> = ({ 
    documents, 
    activeDocumentId, 
    onSelectDocument, 
    onCloseDocument,
    onUpdateDocumentContext,
    addStudyPoints,
    updateReadingTime,
    triggerFileUpload
}) => {
  // --- AI & UI State ---
  const [aiSidebarOpen, setAiSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'summary' | 'quiz' | 'tips'>('chat');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<string | null>(null);
  const [tips, setTips] = useState<string | null>(null);

  // --- Timer & Gamification State ---
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Text-to-Speech State ---
  const [isSpeaking, setIsSpeaking] = useState(false);

  const activeDocument = documents.find(d => d.id === activeDocumentId);

  // --- Timer Logic ---
  useEffect(() => {
      if (activeDocument) {
          timerRef.current = setInterval(() => {
              setSessionSeconds(prev => {
                  const next = prev + 1;
                  
                  // Every 15 minutes (900 seconds) -> Show Encouragement
                  if (next > 0 && next % 900 === 0) {
                      setShowEncouragement(true);
                  }

                  // Every 30 minutes (1800 seconds) -> Add Points
                  if (next > 0 && next % 1800 === 0) {
                      addStudyPoints(50);
                  }

                  // Every 1 minute -> Update global reading time
                  if (next % 60 === 0) {
                      updateReadingTime(1);
                  }

                  return next;
              });
          }, 1000);
      } else {
          if (timerRef.current) clearInterval(timerRef.current);
          setSessionSeconds(0);
      }

      return () => {
          if (timerRef.current) clearInterval(timerRef.current);
      };
  }, [activeDocument, addStudyPoints, updateReadingTime]);

  // --- Initial AI Synthesis (Background Task) ---
  useEffect(() => {
      const initContext = async () => {
          if (activeDocument && !activeDocument.contextReady && !isSynthesizing) {
              // Start background synthesis but DO NOT block the UI
              setIsSynthesizing(true);
              
              // Simulate the backend storage/database vectorization process
              await synthesizeDocumentContext(activeDocument.title, activeDocument.content);
              
              onUpdateDocumentContext(activeDocument.id);
              setIsSynthesizing(false);
              
              // Optional: Add a welcome message when ready, but don't overwrite if user already started chatting
              if (chatMessages.length === 0) {
                 setChatMessages([{ role: 'ai', text: `I've finished analyzing "${activeDocument.title}". You can now ask me specific questions about it!` }]);
              }
          } else if (activeDocument && activeDocument.contextReady && chatMessages.length === 0) {
               setChatMessages([{ role: 'ai', text: `Welcome back to "${activeDocument.title}". What would you like to review?` }]);
          }
      };
      initContext();
      
      // Reset view states when document changes
      if (activeDocument) {
          // Don't clear chat history if it's the same doc session ideally, but here we reset for simplicity
          // In a real app with persistent storage, we'd load the chat history here.
          setSummary(null);
          setQuiz(null);
          setTips(null);
          setActiveTab('chat');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDocumentId]);

  // --- AI Handlers ---
  const handleAskAI = async () => {
    if (!chatInput.trim() || !activeDocument) return;
    
    const newMessages = [...chatMessages, { role: 'user' as const, text: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsLoading(true);

    const response = await askDocument(activeDocument.content, chatInput);
    
    setChatMessages([...newMessages, { role: 'ai', text: response }]);
    setIsLoading(false);
  };

  const handleGenerateSummary = async () => {
    if (summary || !activeDocument) return;
    setIsLoading(true);
    const result = await generateSummary(activeDocument.content);
    setSummary(result);
    setIsLoading(false);
  };

  const handleGenerateQuiz = async () => {
    if (quiz || !activeDocument) return;
    setIsLoading(true);
    const result = await generateQuiz(activeDocument.content);
    setQuiz(result);
    setIsLoading(false);
  };

  const handleGetTips = async () => {
      if (tips || !activeDocument) return;
      setIsLoading(true);
      const result = await getStudyTips(activeDocument.title);
      setTips(result);
      setIsLoading(false);
  }

  useEffect(() => {
    if (activeTab === 'summary') handleGenerateSummary();
    if (activeTab === 'quiz') handleGenerateQuiz();
    if (activeTab === 'tips') handleGetTips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // --- Speech Handler ---
  const toggleReadAloud = () => {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    } else if (activeDocument) {
        const utterance = new SpeechSynthesisUtterance(activeDocument.content);
        utterance.rate = 0.9; 
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    }
  };
  useEffect(() => () => window.speechSynthesis.cancel(), []);


  // === VIEW: LIBRARY (No active document) ===
  if (!activeDocument) {
      return (
          <div className="animate-fade-in space-y-6">
              <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reading Room</h2>
                    <p className="text-gray-500 dark:text-gray-400">Your personal library. Select a document to start your AI-powered study session.</p>
                </div>
                <button 
                    onClick={triggerFileUpload}
                    className="px-6 py-3 bg-otic-orange hover:bg-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2"
                >
                    <Plus size={20} /> Upload Document
                </button>
              </div>

              {documents.length === 0 ? (
                   <div className="h-[50vh] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-gray-50/50 dark:bg-white/5">
                        <Library size={64} className="mb-4 opacity-50" />
                        <p className="text-lg">Your library is empty.</p>
                        <p className="text-sm text-gray-500">Upload a document to begin studying.</p>
                   </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {documents.map(doc => (
                          <GlassCard 
                            key={doc.id} 
                            className="cursor-pointer group relative overflow-hidden" 
                            hoverEffect 
                            glowColor="blue"
                          >
                              <div 
                                onClick={() => onSelectDocument(doc)}
                                className="relative z-10"
                              >
                                  <div className="flex items-start justify-between mb-4">
                                      <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                                          <FileText size={24} />
                                      </div>
                                      {doc.contextReady ? (
                                          <span className="px-2 py-1 bg-green-500/10 text-green-600 text-xs rounded-full flex items-center gap-1">
                                              <Sparkles size={10} /> AI Ready
                                          </span>
                                      ) : (
                                          <span className="px-2 py-1 bg-yellow-500/10 text-yellow-600 text-xs rounded-full flex items-center gap-1">
                                              <Loader2 size={10} className="animate-spin" /> Processing
                                          </span>
                                      )}
                                  </div>
                                  <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 line-clamp-1">{doc.title}</h3>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">{doc.type} • {doc.category}</p>
                                  <div className="flex items-center justify-between text-xs text-gray-400">
                                      <span>Added: {new Date(doc.uploadDate).toLocaleDateString()}</span>
                                      <span className="group-hover:translate-x-1 transition-transform text-otic-orange font-medium">Open →</span>
                                  </div>
                              </div>
                          </GlassCard>
                      ))}
                  </div>
              )}
          </div>
      );
  }

  // === VIEW: READER (Active Document) ===
  return (
    <div className="flex h-[calc(100vh-2rem)] gap-6 overflow-hidden animate-fade-in relative">
      
      {/* Encouragement Popup */}
      {showEncouragement && <EncouragementAvatar onClose={() => setShowEncouragement(false)} />}

      {/* Left Side: Document Content */}
      <div className={`flex-1 flex flex-col transition-all duration-500 ${aiSidebarOpen ? 'w-full lg:w-2/3' : 'w-full'}`}>
        <GlassCard className="flex-1 flex flex-col overflow-hidden h-full relative p-0">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-white/5 backdrop-blur">
                <div className="flex items-center gap-3">
                    <button onClick={onCloseDocument} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-600 dark:text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white max-w-[200px] sm:max-w-md truncate">{activeDocument.title}</h2>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                             <span className="flex items-center gap-1"><Clock size={12}/> {Math.floor(sessionSeconds / 60)}m session</span>
                             {isSynthesizing && (
                                 <span className="flex items-center gap-1 text-otic-orange animate-pulse">
                                     <Zap size={12} /> Synthesizing Context...
                                 </span>
                             )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                     <button 
                        onClick={toggleReadAloud}
                        className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isSpeaking ? 'bg-red-500/20 text-red-500' : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'}`}
                     >
                         {isSpeaking ? <><StopCircle size={16} /> Stop</> : <><Volume2 size={16} /> Read Aloud</>}
                     </button>
                     <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-600 dark:text-white" onClick={() => setAiSidebarOpen(!aiSidebarOpen)}>
                        {aiSidebarOpen ? <ChevronRight /> : <ChevronLeft />}
                     </button>
                </div>
            </div>

            {/* Content Rendering - Immediate Access */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-white text-gray-900 font-serif text-lg leading-loose select-text">
                {activeDocument.content ? (
                    activeDocument.content.split('\n').map((line, i) => (
                        <p key={i} className="mb-4">{line}</p>
                    ))
                ) : (
                    <div className="text-center text-gray-400 mt-20">
                        <p>No content available.</p>
                    </div>
                )}
                
                {/* Add some bottom padding for easier reading */}
                <div className="h-20"></div>
            </div>
        </GlassCard>
      </div>

      {/* Right Side: AI Sidebar */}
      {aiSidebarOpen && (
        <div className="w-full lg:w-[400px] flex flex-col animate-fade-in-right absolute lg:relative right-0 h-full z-20 shadow-2xl lg:shadow-none">
          <GlassCard className="h-full flex flex-col p-0 overflow-hidden border-otic-orange/30 bg-white dark:bg-black/40 backdrop-blur-xl">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-white/10">
                {['chat', 'summary', 'quiz', 'tips'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 p-4 text-sm font-medium flex justify-center items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors capitalize ${
                            activeTab === tab 
                            ? 'text-otic-orange border-b-2 border-otic-orange' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                    >
                         {tab === 'chat' && <MessageCircle size={16} />}
                         {tab === 'summary' && <FileText size={16} />}
                         {tab === 'quiz' && <CheckCircle size={16} />}
                         {tab === 'tips' && <BrainCircuit size={16} />}
                    </button>
                ))}
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 dark:bg-black/20">
                {isLoading && (
                    <div className="flex justify-center items-center h-40 flex-col gap-3 text-otic-orange">
                        <Loader2 className="animate-spin w-8 h-8" />
                        <span className="text-sm animate-pulse">AI is thinking...</span>
                    </div>
                )}

                {!isLoading && activeTab === 'chat' && (
                    <div className="space-y-4 pb-4">
                         {chatMessages.length === 0 && isSynthesizing && (
                             <div className="text-center p-4 text-gray-500 text-sm italic">
                                 I'm reading the document now. I'll be ready in a moment...
                             </div>
                         )}
                         {chatMessages.length === 0 && !isSynthesizing && (
                             <div className="text-center p-4 text-gray-500 text-sm">
                                 Ask me anything about this document!
                             </div>
                         )}
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-otic-orange text-white rounded-tr-none' 
                                    : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-white/5'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                 {/* Other Tabs Content Rendering (Summary, Quiz, Tips) */}
                 {!isLoading && activeTab !== 'chat' && (
                     <div className="prose prose-invert prose-sm max-w-none">
                         {activeTab === 'summary' && (
                             <>
                                 <h3 className="text-gray-900 dark:text-white font-semibold mb-2">Executive Summary</h3>
                                 <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 text-sm">
                                     {summary || "Click generate to see summary."}
                                 </div>
                             </>
                         )}
                         {activeTab === 'quiz' && (
                             <>
                                <h3 className="text-gray-900 dark:text-white font-semibold mb-2">Knowledge Check</h3>
                                <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 text-sm">
                                    {quiz || "Click generate to create a quiz."}
                                </div>
                             </>
                         )}
                         {activeTab === 'tips' && (
                             <>
                                <h3 className="text-gray-900 dark:text-white font-semibold mb-2">Study Strategy</h3>
                                <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 text-sm">
                                    {tips || "Click generate to get tips."}
                                </div>
                             </>
                         )}
                     </div>
                 )}
            </div>

            {/* Input Area */}
            {activeTab === 'chat' && (
                <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                            placeholder="Ask about the document..."
                            className="flex-1 bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-otic-orange transition-colors"
                        />
                        <button 
                            onClick={handleAskAI}
                            className="p-2 bg-otic-orange hover:bg-orange-600 rounded-xl text-white transition-colors disabled:opacity-50 shadow-lg shadow-orange-500/20"
                            disabled={isLoading || !chatInput}
                        >
                            <Sparkles size={20} />
                        </button>
                    </div>
                </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
};
