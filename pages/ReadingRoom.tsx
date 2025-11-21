
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/GlassCard';
import { generateSummary, askDocument, generateQuiz, getStudyTips, synthesizeDocumentContext, generatePodcastScript, generateSpeech } from '../services/geminiService';
import { Document, QuizData, SummaryData, StudyTipsData, AudioTrack } from '../types';
import { EncouragementAvatar } from '../components/EncouragementAvatar';
import { audio } from '../services/audioService';
import { useSpeech } from '../hooks/useSpeech';
import { 
    Book, MessageCircle, FileText, CheckCircle, BrainCircuit, Loader2, 
    Sparkles, ChevronLeft, ChevronRight, Volume2, StopCircle, ArrowLeft,
    Clock, Library, Plus, Zap, ExternalLink, AlertCircle, Check, X as XIcon, RotateCcw,
    ChevronDown, ChevronUp, Lightbulb, Bot, Mic, MicOff, Headphones, Trash2, Edit2
} from 'lucide-react';
import { Send } from 'lucide-react';

interface ReadingRoomProps {
    documents: Document[];
    activeDocumentId: string | null;
    onSelectDocument: (doc: Document) => void;
    onCloseDocument: () => void;
    onUpdateDocumentContext: (id: string) => void;
    onRenameDocument: (id: string, newTitle: string) => void;
    onDeleteDocument: (id: string) => void;
    addStudyPoints: (points: number) => void;
    updateReadingTime: (minutes: number) => void;
    triggerFileUpload: () => void;
    searchQuery: string;
    onPlayAudio: (track: AudioTrack) => void;
}

export const ReadingRoom: React.FC<ReadingRoomProps> = ({ 
    documents, 
    activeDocumentId, 
    onSelectDocument, 
    onCloseDocument,
    onUpdateDocumentContext,
    onRenameDocument,
    onDeleteDocument,
    addStudyPoints,
    updateReadingTime,
    triggerFileUpload,
    searchQuery,
    onPlayAudio
}) => {
  // --- AI & UI State ---
  const [aiSidebarOpen, setAiSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'summary' | 'quiz' | 'tips'>('chat');
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  // Content States
  const [isLoading, setIsLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false); // Audio State
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [tipsData, setTipsData] = useState<StudyTipsData | null>(null);
  
  // Quiz State
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: number}>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Accordion State for Summary
  const [openSummarySection, setOpenSummarySection] = useState<number | null>(0);

  // --- Timer & Gamification State ---
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Document Management State ---
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // --- Audio & Speech Hooks ---
  const { speak, stopSpeaking, isSpeaking, startListening, stopListening, isListening, transcript, resetTranscript } = useSpeech();

  const activeDocument = documents.find(d => d.id === activeDocumentId);

  // Update input from Voice Transcript
  useEffect(() => {
      if (transcript) {
          setChatInput(transcript);
      }
  }, [transcript]);

  // --- Timer Logic ---
  useEffect(() => {
      if (activeDocument) {
          timerRef.current = setInterval(() => {
              setSessionSeconds(prev => {
                  const next = prev + 1;
                  
                  // Encouragement every 2 minutes (120 seconds)
                  if (next > 0 && next % 120 === 0) {
                      audio.playNotification();
                      setShowEncouragement(true);
                  }

                  // Points every 15 minutes (900 seconds)
                  if (next > 0 && next % 900 === 0) {
                      addStudyPoints(50);
                      audio.playSuccess();
                  }

                  // Update generic reading stats every minute
                  if (next % 60 === 0) updateReadingTime(1);
                  return next;
              });
          }, 1000);
      } else {
          if (timerRef.current) clearInterval(timerRef.current);
          setSessionSeconds(0);
      }
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeDocument, addStudyPoints, updateReadingTime]);

  // --- Initial AI Synthesis ---
  useEffect(() => {
      const initContext = async () => {
          if (activeDocument && !activeDocument.contextReady && !isSynthesizing) {
              setIsSynthesizing(true);
              await synthesizeDocumentContext(activeDocument.title, activeDocument.content);
              onUpdateDocumentContext(activeDocument.id);
              setIsSynthesizing(false);
              if (chatMessages.length === 0) {
                 audio.playSuccess();
                 setChatMessages([{ role: 'ai', text: `I've analyzed "${activeDocument.title}". Ready to help!` }]);
              }
          }
      };
      initContext();
      if (activeDocument) {
          setSummaryData(null);
          setQuizData(null);
          setQuizAnswers({});
          setQuizSubmitted(false);
          setTipsData(null);
          setActiveTab('chat');
          if(activeDocumentId !== activeDocument.id) setChatMessages([]);
          stopSpeaking();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDocumentId]);

  // --- AI Handlers ---
  const handleAskAI = async () => {
    if ((!chatInput.trim() && !transcript) || !activeDocument) return;
    
    const finalText = chatInput.trim() || transcript;
    resetTranscript();
    setChatInput('');
    
    const userMsg = { role: 'user' as const, text: finalText };
    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    
    setIsLoading(true);
    audio.playClick();
    
    const response = await askDocument(activeDocument.content, newHistory, finalText);
    
    setChatMessages([...newHistory, { role: 'ai', text: response }]);
    setIsLoading(false);
    audio.playSuccess();
  };

  const handleGenerateSummary = async () => {
    if (summaryData || !activeDocument) return;
    setIsLoading(true);
    const result = await generateSummary(activeDocument.content);
    setSummaryData(result);
    setIsLoading(false);
    if(result) audio.playSuccess();
  };

  const handleGenerateQuiz = async () => {
    if (quizData || !activeDocument) return;
    setIsLoading(true);
    const result = await generateQuiz(activeDocument.content);
    setQuizData(result);
    setIsLoading(false);
    if(result) audio.playSuccess();
  };

  const handleGetTips = async () => {
      if (tipsData || !activeDocument) return;
      setIsLoading(true);
      const result = await getStudyTips(activeDocument.title);
      setTipsData(result);
      setIsLoading(false);
      if(result) audio.playSuccess();
  }

  const handleGenerateNarratorAudio = async () => {
      if (!activeDocument) return;
      setIsGeneratingAudio(true);
      audio.playClick();

      // 1. Generate Script
      const script = await generatePodcastScript(activeDocument.content);
      
      if (script) {
          // 2. Generate Audio
          const audioBase64 = await generateSpeech(script);
          if (audioBase64) {
              onPlayAudio({
                  id: activeDocument.id,
                  title: activeDocument.title,
                  author: "AI Narrator",
                  src: audioBase64
              });
              audio.playSuccess();
          }
      }
      setIsGeneratingAudio(false);
  };

  useEffect(() => {
    if (activeTab === 'summary') handleGenerateSummary();
    if (activeTab === 'quiz') handleGenerateQuiz();
    if (activeTab === 'tips') handleGetTips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const toggleReadDoc = () => {
    if (isSpeaking) {
        stopSpeaking();
    } else if (activeDocument) {
        speak(activeDocument.content.substring(0, 1000)); // Limit reading to first 1000 chars for demo
    }
  };

  const startEditing = (e: React.MouseEvent, doc: Document) => {
      e.stopPropagation();
      setEditingDocId(doc.id);
      setEditTitle(doc.title);
  };

  const saveTitle = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (editTitle.trim()) {
          onRenameDocument(id, editTitle);
          audio.playSuccess();
      }
      setEditingDocId(null);
  };

  const cancelEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingDocId(null);
  };

  const triggerDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm("Are you sure you want to delete this document?")) {
          onDeleteDocument(id);
          audio.playNotification();
      }
  };

  // Filter logic
  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // === VIEW: LIBRARY ===
  if (!activeDocument) {
      return (
          <div className="animate-fade-in space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reading Room</h2>
                    <p className="text-gray-500 dark:text-gray-400">Your personal library. Select a document to start your AI-powered study session.</p>
                </div>
                <button 
                    onClick={() => { audio.playClick(); triggerFileUpload(); }}
                    className="px-6 py-3 bg-otic-orange hover:bg-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 whitespace-nowrap"
                >
                    <Plus size={20} /> Upload Document
                </button>
              </div>

              {searchQuery && <p className="text-sm text-gray-500">Searching for "{searchQuery}"...</p>}

              {documents.length === 0 ? (
                   <div className="h-[50vh] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-gray-50/50 dark:bg-white/5">
                        <Library size={64} className="mb-4 opacity-50" />
                        <p className="text-lg">Your library is empty.</p>
                        <p className="text-sm text-gray-500">Upload a document to begin studying.</p>
                   </div>
              ) : filteredDocs.length === 0 ? (
                  <div className="h-[30vh] flex flex-col items-center justify-center text-gray-400">
                       <p>No documents found matching "{searchQuery}"</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredDocs.map(doc => (
                          <GlassCard 
                            key={doc.id} 
                            className="cursor-pointer group relative overflow-visible" 
                            hoverEffect 
                            glowColor="blue"
                          >
                              <div onClick={() => { audio.playClick(); onSelectDocument(doc); }} className="relative z-10">
                                  <div className="flex items-start justify-between mb-4">
                                      <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                                          <FileText size={24} />
                                      </div>
                                      {/* Action Buttons */}
                                      <div className="flex items-center gap-1">
                                         <button 
                                            onClick={(e) => startEditing(e, doc)}
                                            className="p-2 text-gray-400 hover:text-otic-orange hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                                            title="Rename"
                                         >
                                             <Edit2 size={16} />
                                         </button>
                                         <button 
                                            onClick={(e) => triggerDelete(e, doc.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                                            title="Delete"
                                         >
                                             <Trash2 size={16} />
                                         </button>
                                      </div>
                                  </div>
                                  
                                  {editingDocId === doc.id ? (
                                      <div className="mb-2 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                          <input 
                                            type="text" 
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full bg-white/50 dark:bg-black/20 border border-gray-300 dark:border-white/20 rounded-lg px-2 py-1 text-sm font-bold text-gray-800 dark:text-white focus:border-otic-orange outline-none"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveTitle(e as any, doc.id);
                                                if (e.key === 'Escape') cancelEdit(e as any);
                                            }}
                                          />
                                          <button onClick={(e) => saveTitle(e, doc.id)} className="text-green-500 hover:text-green-600"><Check size={18}/></button>
                                          <button onClick={(e) => cancelEdit(e)} className="text-red-500 hover:text-red-600"><XIcon size={18}/></button>
                                      </div>
                                  ) : (
                                      <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 line-clamp-1 group-hover:text-otic-orange transition-colors">{doc.title}</h3>
                                  )}
                                  
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">{doc.type} • {doc.category}</p>
                                  <div className="flex items-center justify-between text-xs text-gray-400">
                                      <span>Added: {new Date(doc.uploadDate).toLocaleDateString()}</span>
                                      <span className="group-hover:translate-x-1 transition-transform text-otic-orange font-medium">Open →</span>
                                  </div>
                                  {doc.contextReady && (
                                       <div className="absolute bottom-4 right-16 px-2 py-1 bg-green-500/10 text-green-600 text-[10px] rounded-full flex items-center gap-1">
                                          <Sparkles size={8} /> AI Ready
                                      </div>
                                  )}
                              </div>
                          </GlassCard>
                      ))}
                  </div>
              )}
          </div>
      );
  }

  // === VIEW: READER ===
  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 overflow-hidden animate-fade-in relative">
      {showEncouragement && <EncouragementAvatar onClose={() => setShowEncouragement(false)} />}

      {/* Document Viewer */}
      <div className={`flex-1 flex flex-col transition-all duration-500 ${aiSidebarOpen ? 'w-full lg:w-2/3 hidden lg:flex' : 'w-full'}`}>
        <GlassCard className="flex-1 flex flex-col overflow-hidden h-full relative p-0 shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => { stopSpeaking(); onCloseDocument(); }} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-600 dark:text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="overflow-hidden">
                        <h2 className="font-semibold text-gray-900 dark:text-white truncate">{activeDocument.title}</h2>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                             <span className="flex items-center gap-1"><Clock size={12}/> {Math.floor(sessionSeconds / 60)}m session</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                     <button 
                        onClick={handleGenerateNarratorAudio} 
                        disabled={isGeneratingAudio}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isGeneratingAudio ? 'bg-gray-500/20 text-gray-400' : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg shadow-pink-500/30'}`}
                     >
                        {isGeneratingAudio ? <Loader2 size={14} className="animate-spin" /> : <Headphones size={14} />}
                        {isGeneratingAudio ? "Creating..." : "Listen"}
                     </button>

                     {activeDocument.type === 'TXT' && (
                        <button onClick={toggleReadDoc} className={`p-2 rounded-lg ${isSpeaking ? 'bg-red-500/20 text-red-500' : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-white'}`}>
                            {isSpeaking ? <StopCircle size={20} /> : <Volume2 size={20} />}
                        </button>
                     )}

                     <button 
                        onClick={(e) => { 
                            if(window.confirm("Delete this document?")) { 
                                onDeleteDocument(activeDocument.id); 
                                audio.playNotification();
                            } 
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                        title="Delete Document"
                     >
                        <Trash2 size={20} />
                     </button>

                     <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-600 dark:text-white lg:hidden" onClick={() => setAiSidebarOpen(true)}>
                        <MessageCircle size={20} />
                     </button>
                     <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-600 dark:text-white hidden lg:block" onClick={() => setAiSidebarOpen(!aiSidebarOpen)}>
                        {aiSidebarOpen ? <ChevronRight /> : <ChevronLeft />}
                     </button>
                </div>
            </div>

            <div className="flex-1 bg-gray-50 dark:bg-gray-900 text-gray-900 overflow-hidden relative flex flex-col">
                {activeDocument.type === 'PDF' && activeDocument.fileUrl ? (
                    <div className="w-full h-full flex flex-col">
                         <iframe 
                            src={activeDocument.fileUrl} 
                            type="application/pdf"
                            title="PDF Viewer" 
                            className="w-full h-full border-none block flex-1" 
                         />
                         <div className="p-2 bg-gray-100 dark:bg-gray-800 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-white/10">
                            PDF not loading? <a href={activeDocument.fileUrl} target="_blank" rel="noreferrer" className="text-otic-orange hover:underline">Open in new tab</a>
                         </div>
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto p-8 md:p-12 font-serif text-lg leading-loose select-text bg-white text-gray-900">
                        {activeDocument.content ? activeDocument.content.split('\n').map((l, i) => <p key={i} className="mb-4">{l}</p>) : <p>No content.</p>}
                    </div>
                )}
            </div>
        </GlassCard>
      </div>

      {/* AI Sidebar - Redesigned for Liquid Glass UI */}
      {aiSidebarOpen && (
        <div className="w-full lg:w-[450px] flex flex-col animate-fade-in-right absolute lg:relative right-0 top-0 h-full z-20">
          {/* Main Glass Container */}
          <div className="h-full flex flex-col p-0 overflow-hidden border-l border-white/20 dark:border-white/10 bg-white/80 dark:bg-[#0f0c29]/95 backdrop-blur-2xl shadow-2xl rounded-l-2xl lg:rounded-none">
            
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-3 lg:hidden border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-otic-orange" size={18} />
                    <span className="text-sm font-bold text-gray-800 dark:text-white">AI Companion</span>
                </div>
                <button onClick={() => setAiSidebarOpen(false)} className="p-2 text-gray-500 dark:text-white"><XIcon size={20}/></button>
            </div>
            
            {/* Tabs */}
            <div className="grid grid-cols-4 border-b border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/5">
                {[
                    { id: 'chat', icon: MessageCircle, label: 'Chat' },
                    { id: 'summary', icon: FileText, label: 'Summary' },
                    { id: 'quiz', icon: CheckCircle, label: 'Quiz' },
                    { id: 'tips', icon: BrainCircuit, label: 'Tips' }
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => { audio.playClick(); setActiveTab(tab.id as any); }}
                        className={`flex flex-col justify-center items-center gap-1 p-4 transition-all relative group ${
                            activeTab === tab.id 
                            ? 'text-otic-orange' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                    >
                         <tab.icon size={18} className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                         <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
                         {activeTab === tab.id && (
                             <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-otic-orange to-otic-gold shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                         )}
                    </button>
                ))}
            </div>

            {/* Sidebar Content Area */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-transparent relative">
                {isLoading && (
                    <div className="absolute inset-0 flex justify-center items-center flex-col gap-3 z-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                        <div className="relative">
                             <div className="absolute inset-0 bg-otic-orange/30 blur-xl rounded-full animate-pulse"></div>
                             <Loader2 className="animate-spin w-10 h-10 text-otic-orange relative z-10" />
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-white animate-pulse">AI is thinking...</span>
                    </div>
                )}

                {!isLoading && activeTab === 'chat' && (
                    <div className="space-y-4 pb-4">
                         {chatMessages.length === 0 && (
                             <div className="text-center p-6 text-gray-500 dark:text-gray-400 text-sm bg-white/40 dark:bg-white/5 rounded-2xl border border-white/20 dark:border-white/10 backdrop-blur-sm">
                                 <div className="w-12 h-12 bg-gradient-to-br from-otic-orange to-otic-gold rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/20">
                                     <Bot size={24} className="text-white" />
                                 </div>
                                 <p>Ask me to explain concepts, find definitions, or create a practice schedule based on this document!</p>
                             </div>
                         )}
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-md backdrop-blur-md relative group ${
                                    msg.role === 'user' 
                                    ? 'bg-gradient-to-br from-otic-orange to-orange-600 text-white rounded-tr-sm shadow-orange-500/20' 
                                    : 'bg-white/70 dark:bg-white/10 border border-white/20 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                                }`}>
                                    {msg.text}
                                    {msg.role === 'ai' && (
                                        <button 
                                            onClick={() => speak(msg.text)}
                                            className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-otic-orange p-1"
                                        >
                                            <Volume2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                 {/* Interactive Accordion Summary */}
                 {!isLoading && activeTab === 'summary' && (
                     <div className="space-y-3">
                         {!summaryData ? (
                            <div className="text-center text-gray-400 p-8 flex flex-col items-center justify-center h-full opacity-50">
                                <FileText size={48} className="mb-4 text-otic-orange" />
                                <p>No summary yet.</p>
                            </div>
                         ) : (
                             <>
                                <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-otic-orange to-otic-gold mb-4 px-1">
                                    {summaryData.title}
                                </h3>
                                {summaryData.sections.map((section, idx) => {
                                    const isOpen = openSummarySection === idx;
                                    return (
                                        <div key={idx} className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 dark:border-white/10 overflow-hidden transition-all hover:border-otic-orange/30">
                                            <button 
                                                onClick={() => { audio.playClick(); setOpenSummarySection(isOpen ? null : idx); }}
                                                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/20 transition-colors"
                                            >
                                                <span className="font-semibold text-gray-800 dark:text-white text-sm">{section.heading}</span>
                                                {isOpen ? <ChevronUp size={16} className="text-otic-orange"/> : <ChevronDown size={16} className="text-gray-400"/>}
                                            </button>
                                            {isOpen && (
                                                <div className="p-4 pt-0 text-sm text-gray-600 dark:text-gray-300 border-t border-white/10 bg-white/20 dark:bg-black/10">
                                                    <p className="mb-3 leading-relaxed">{section.content}</p>
                                                    <ul className="space-y-2">
                                                        {section.keyPoints.map((pt, i) => (
                                                            <li key={i} className="flex gap-2 items-start">
                                                                <div className="min-w-[6px] h-[6px] rounded-full bg-otic-orange mt-1.5"></div>
                                                                <span className="opacity-90">{pt}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                             </>
                         )}
                     </div>
                 )}

                 {/* Quiz Tab */}
                 {!isLoading && activeTab === 'quiz' && (
                     <div className="space-y-6">
                        {!quizData ? (
                            <div className="text-center text-gray-400 p-8 flex flex-col items-center justify-center opacity-50">
                                <CheckCircle size={48} className="mb-4 text-otic-orange" />
                                <p>Ready to generate quiz?</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center sticky top-0 bg-white/80 dark:bg-[#1a1635]/95 backdrop-blur-md py-2 z-10 -mx-1 px-1">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate pr-2">{quizData.title}</h3>
                                    {quizSubmitted && <span className="text-xs font-bold text-otic-orange bg-otic-orange/10 px-2 py-1 rounded-lg border border-otic-orange/20">Score: {quizScore}/{quizData.questions.length}</span>}
                                </div>
                                <div className="space-y-6">
                                    {quizData.questions.map((q, qIdx) => (
                                        <div key={qIdx} className="bg-white/50 dark:bg-white/5 p-4 rounded-xl border border-white/20 dark:border-white/10 shadow-sm">
                                            <p className="font-medium text-gray-800 dark:text-white mb-3 text-sm leading-relaxed">
                                                <span className="text-otic-orange mr-1">{qIdx + 1}.</span> {q.question}
                                            </p>
                                            <div className="space-y-2">
                                                {q.options.map((opt, oIdx) => {
                                                    const isSelected = quizAnswers[qIdx] === oIdx;
                                                    const isCorrect = q.correctAnswerIndex === oIdx;
                                                    let btnClass = "border-white/20 dark:border-white/10 bg-white/30 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/10";
                                                    
                                                    if (quizSubmitted) {
                                                        if (isCorrect) btnClass = "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300 ring-1 ring-green-500/30";
                                                        else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-700 dark:text-red-300 ring-1 ring-red-500/30";
                                                        else btnClass = "opacity-50 border-transparent";
                                                    } else if (isSelected) {
                                                        btnClass = "border-otic-orange bg-otic-orange/10 text-otic-orange ring-1 ring-otic-orange/50 shadow-[0_0_10px_rgba(249,115,22,0.1)]";
                                                    }
                                                    
                                                    return (
                                                        <button 
                                                            key={oIdx} 
                                                            onClick={() => { audio.playClick(); !quizSubmitted && setQuizAnswers(prev => ({...prev, [qIdx]: oIdx}))}} 
                                                            className={`w-full text-left px-4 py-3 rounded-lg border text-xs transition-all duration-200 ${btnClass}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {quizSubmitted && (
                                                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic border-t border-white/10 pt-2">
                                                    <span className="font-bold">Note:</span> {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {!quizSubmitted && (
                                    <button onClick={() => {
                                        let s = 0; quizData.questions.forEach((q, i) => { if(quizAnswers[i] === q.correctAnswerIndex) s++; });
                                        setQuizScore(s); 
                                        setQuizSubmitted(true); 
                                        if(s >= 4) {
                                            addStudyPoints(100);
                                            audio.playSuccess();
                                        } else {
                                            audio.playNotification();
                                        }
                                    }} className="w-full py-3 bg-gradient-to-r from-otic-orange to-otic-gold text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all mt-4">
                                        Submit Quiz
                                    </button>
                                )}
                            </>
                        )}
                     </div>
                 )}

                 {/* Interactive Tips Cards */}
                 {!isLoading && activeTab === 'tips' && (
                     <div className="space-y-4">
                        {!tipsData ? (
                            <div className="text-center text-gray-400 p-8 flex flex-col items-center justify-center opacity-50">
                                <BrainCircuit size={48} className="mb-4 text-otic-orange" />
                                <p>Get optimized strategies.</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Optimized Learning Path</h3>
                                {tipsData.tips.map((tip, idx) => (
                                    <div key={idx} className="bg-white/50 dark:bg-white/5 p-5 rounded-2xl border border-white/20 dark:border-white/10 shadow-sm hover:-translate-y-1 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="p-2.5 bg-gradient-to-br from-otic-orange/20 to-otic-gold/20 rounded-xl text-2xl group-hover:scale-110 transition-transform text-otic-orange border border-otic-orange/10">
                                                {tip.icon}
                                            </div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-otic-orange border border-otic-orange/20 bg-otic-orange/5 px-2 py-1 rounded-full">
                                                {tip.method}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-gray-800 dark:text-white mb-2">{tip.title}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{tip.description}</p>
                                    </div>
                                ))}
                            </>
                        )}
                     </div>
                 )}
            </div>

            {/* Chat Input - Floating Glass Style */}
            {activeTab === 'chat' && (
                <div className="p-4 bg-white/60 dark:bg-black/20 border-t border-white/20 dark:border-white/10 backdrop-blur-xl z-20">
                    <div className="relative flex gap-2 items-center bg-white/50 dark:bg-white/5 rounded-2xl p-1 border border-white/30 dark:border-white/10 shadow-inner focus-within:border-otic-orange/50 focus-within:ring-1 focus-within:ring-otic-orange/20 transition-all">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                            placeholder={isListening ? "Listening..." : "Ask a question..."}
                            className="flex-1 bg-transparent border-none px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        
                        {/* Microphone Button */}
                        <button 
                            onClick={() => {
                                if(isListening) stopListening();
                                else startListening();
                            }}
                            className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/10'}`}
                        >
                            {isListening ? <MicOff size={20}/> : <Mic size={20}/>}
                        </button>

                        <button 
                            onClick={handleAskAI}
                            className="p-3 bg-gradient-to-br from-otic-orange to-otic-gold hover:from-orange-600 hover:to-orange-500 rounded-xl text-white transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transform hover:scale-105 active:scale-95"
                            disabled={isLoading || (!chatInput && !transcript)}
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin"/> : <Send size={20} />}
                        </button>
                    </div>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
