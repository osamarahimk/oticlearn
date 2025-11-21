
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { TutorMode, FlashcardData } from '../types';
import { chatWithTutor, generateFlashcards } from '../services/geminiService';
import { audio } from '../services/audioService';
import { useSpeech } from '../hooks/useSpeech';
import { 
    Bot, BrainCircuit, Sparkles, Zap, MessageSquare, ArrowLeft, 
    RotateCcw, Send, Loader2, ChevronRight, ChevronLeft, Mic, MicOff, Volume2
} from 'lucide-react';

export const AITutor: React.FC = () => {
    const [mode, setMode] = useState<TutorMode>('HUB');
    
    // --- Chat State (Socratic/ELI5) ---
    const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);

    // --- Flashcard State ---
    const [flashcardTopic, setFlashcardTopic] = useState('');
    const [flashcardData, setFlashcardData] = useState<FlashcardData | null>(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isGeneratingCards, setIsGeneratingCards] = useState(false);

    // --- Speech Hook ---
    const { speak, startListening, stopListening, isListening, transcript, resetTranscript } = useSpeech();

    // Update input from Voice Transcript
    useEffect(() => {
      if (transcript) {
          setChatInput(transcript);
      }
    }, [transcript]);

    // Reset states when switching modes
    const switchMode = (newMode: TutorMode) => {
        audio.playClick();
        setMode(newMode);
        setChatHistory([]);
        setChatInput('');
        setFlashcardData(null);
        setFlashcardTopic('');
        setCurrentCardIndex(0);
        setIsFlipped(false);
    };

    const handleSendMessage = async () => {
        if ((!chatInput.trim() && !transcript) || (mode !== 'SOCRATIC' && mode !== 'ELI5')) return;
        
        const finalText = chatInput.trim() || transcript;
        resetTranscript();
        setChatInput('');

        const newMessage = { role: 'user' as const, text: finalText };
        const newHistory = [...chatHistory, newMessage];
        setChatHistory(newHistory);
        
        setIsChatLoading(true);
        audio.playClick();

        const response = await chatWithTutor(newHistory, finalText, mode);
        setChatHistory([...newHistory, { role: 'ai', text: response }]);
        setIsChatLoading(false);
        audio.playNotification();
    };

    const handleGenerateCards = async () => {
        if (!flashcardTopic.trim()) return;
        setIsGeneratingCards(true);
        audio.playClick();
        const data = await generateFlashcards(flashcardTopic);
        setFlashcardData(data);
        setIsGeneratingCards(false);
        if(data) audio.playSuccess();
    };

    // --- HUB VIEW ---
    if (mode === 'HUB') {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="text-center space-y-4 mb-12">
                    <div className="w-20 h-20 bg-gradient-to-tr from-otic-orange to-otic-gold rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/30 animate-float">
                        <Bot size={40} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">AI Learning Hub</h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                        Choose a specialized AI tool to boost your learning. Whether you need deep understanding, simple explanations, or rapid recall.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Socratic Card */}
                    <button onClick={() => switchMode('SOCRATIC')} className="text-left group">
                        <GlassCard className="h-full hover:border-blue-500/50 transition-all duration-300" hoverEffect>
                            <div className="p-4 bg-blue-500/10 rounded-2xl w-fit mb-4 text-blue-500 group-hover:scale-110 transition-transform">
                                <BrainCircuit size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Socratic Tutor</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Master critical thinking. The AI asks <strong>you</strong> questions to guide you to the answer, ensuring deep comprehension.
                            </p>
                        </GlassCard>
                    </button>

                    {/* ELI5 Card */}
                    <button onClick={() => switchMode('ELI5')} className="text-left group">
                        <GlassCard className="h-full hover:border-green-500/50 transition-all duration-300" hoverEffect>
                            <div className="p-4 bg-green-500/10 rounded-2xl w-fit mb-4 text-green-500 group-hover:scale-110 transition-transform">
                                <Sparkles size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">ELI5 Simplifier</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                "Explain Like I'm 5". Turn complex jargon into simple analogies and fun examples. Perfect for new concepts.
                            </p>
                        </GlassCard>
                    </button>

                    {/* Flashcards Card */}
                    <button onClick={() => switchMode('FLASHCARDS')} className="text-left group">
                        <GlassCard className="h-full hover:border-otic-orange/50 transition-all duration-300" hoverEffect>
                            <div className="p-4 bg-otic-orange/10 rounded-2xl w-fit mb-4 text-otic-orange group-hover:scale-110 transition-transform">
                                <Zap size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Flashcard Generator</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Instant study aids. Input a topic, and generate interactive flashcards for rapid active recall testing.
                            </p>
                        </GlassCard>
                    </button>
                </div>
            </div>
        );
    }

    // --- FLASHCARD VIEW ---
    if (mode === 'FLASHCARDS') {
        return (
            <div className="max-w-4xl mx-auto animate-fade-in h-full flex flex-col">
                <button onClick={() => switchMode('HUB')} className="flex items-center gap-2 text-gray-500 hover:text-otic-orange mb-6 w-fit transition-colors">
                    <ArrowLeft size={20} /> Back to Hub
                </button>

                {!flashcardData ? (
                    <div className="flex-1 flex items-center justify-center">
                        <GlassCard className="w-full max-w-lg p-8 text-center">
                            <Zap size={48} className="mx-auto text-otic-orange mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Generate Flashcards</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">Enter a topic (e.g., "Photosynthesis", "React Hooks") to generate a deck.</p>
                            
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={flashcardTopic}
                                    onChange={(e) => setFlashcardTopic(e.target.value)}
                                    placeholder="Enter topic..."
                                    className="flex-1 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-otic-orange text-gray-800 dark:text-white"
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateCards()}
                                />
                                <button 
                                    onClick={handleGenerateCards}
                                    disabled={isGeneratingCards || !flashcardTopic}
                                    className="bg-otic-orange hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isGeneratingCards ? <Loader2 className="animate-spin" /> : 'Create'}
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{flashcardData.topic}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Card {currentCardIndex + 1} of {flashcardData.cards.length}</p>
                        </div>

                        {/* Flip Card Container */}
                        <div 
                            className="relative w-full max-w-2xl h-80 perspective-1000 cursor-pointer group"
                            onClick={() => { audio.playClick(); setIsFlipped(!isFlipped); }}
                        >
                            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                                {/* Front */}
                                <div className="absolute w-full h-full backface-hidden">
                                    <GlassCard className="h-full flex flex-col items-center justify-center text-center p-10 border-otic-orange/20">
                                        <span className="absolute top-6 left-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Question</span>
                                        <p className="text-2xl font-medium text-gray-800 dark:text-white leading-relaxed">
                                            {flashcardData.cards[currentCardIndex].front}
                                        </p>
                                        <span className="absolute bottom-6 text-xs text-gray-400 animate-bounce">Click to flip</span>
                                    </GlassCard>
                                </div>

                                {/* Back */}
                                <div className="absolute w-full h-full backface-hidden rotate-y-180">
                                    <div className="h-full w-full bg-gradient-to-br from-otic-orange to-otic-gold rounded-2xl shadow-xl p-10 flex flex-col items-center justify-center text-center border border-white/20">
                                        <span className="absolute top-6 left-6 text-xs font-bold text-white/60 uppercase tracking-widest">Answer</span>
                                        <p className="text-2xl font-bold text-white leading-relaxed">
                                            {flashcardData.cards[currentCardIndex].back}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-6 mt-8">
                            <button 
                                onClick={() => {
                                    audio.playClick();
                                    setCurrentCardIndex(prev => Math.max(0, prev - 1));
                                    setIsFlipped(false);
                                }}
                                disabled={currentCardIndex === 0}
                                className="p-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 text-gray-800 dark:text-white transition-all"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button 
                                onClick={() => {
                                    audio.playClick();
                                    setFlashcardData(null);
                                    setFlashcardTopic('');
                                    setIsFlipped(false);
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-white/10 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-white transition-colors"
                            >
                                <RotateCcw size={18} /> New Deck
                            </button>
                            <button 
                                onClick={() => {
                                    audio.playClick();
                                    setCurrentCardIndex(prev => Math.min(flashcardData.cards.length - 1, prev + 1));
                                    setIsFlipped(false);
                                }}
                                disabled={currentCardIndex === flashcardData.cards.length - 1}
                                className="p-4 rounded-full bg-otic-orange hover:bg-orange-600 disabled:opacity-30 text-white shadow-lg shadow-orange-500/30 transition-all"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- CHAT VIEW (SOCRATIC / ELI5) ---
    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <button onClick={() => switchMode('HUB')} className="flex items-center gap-2 text-gray-500 hover:text-otic-orange transition-colors">
                    <ArrowLeft size={20} /> Back
                </button>
                <div className="flex items-center gap-2">
                    {mode === 'SOCRATIC' ? <BrainCircuit className="text-blue-500" /> : <Sparkles className="text-green-500" />}
                    <h2 className="font-bold text-xl text-gray-800 dark:text-white">
                        {mode === 'SOCRATIC' ? 'Socratic Tutor' : 'ELI5 Simplifier'}
                    </h2>
                </div>
            </div>

            <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {chatHistory.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                            <div className={`p-4 rounded-full mb-4 ${mode === 'SOCRATIC' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'}`}>
                                <MessageSquare size={32} />
                            </div>
                            <p className="text-lg font-medium text-gray-800 dark:text-white">
                                {mode === 'SOCRATIC' ? "I'm ready to challenge your thinking." : "I'm ready to simplify complex ideas."}
                            </p>
                            <p className="text-sm text-gray-500">Type a topic or question to start.</p>
                        </div>
                    )}
                    
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-md relative group ${
                                 msg.role === 'user'
                                 ? 'bg-otic-orange text-white rounded-tr-sm'
                                 : 'bg-white/80 dark:bg-white/10 border border-white/20 dark:border-white/10 text-gray-800 dark:text-gray-100 rounded-tl-sm backdrop-blur-md'
                             }`}>
                                 {msg.text}
                                 {msg.role === 'ai' && (
                                     <button 
                                        onClick={() => speak(msg.text)}
                                        className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-otic-orange p-1"
                                     >
                                         <Volume2 size={16} />
                                     </button>
                                 )}
                             </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white/50 dark:bg-white/5 p-4 rounded-2xl rounded-tl-sm border border-white/10 flex items-center gap-2">
                                <Loader2 className="animate-spin w-4 h-4 text-gray-500" />
                                <span className="text-xs text-gray-500">Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/60 dark:bg-black/20 border-t border-white/20 dark:border-white/10 backdrop-blur-xl">
                    <div className="flex gap-3 items-center">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder={isListening ? "Listening..." : (mode === 'SOCRATIC' ? "Enter a topic to discuss..." : "What should I explain?")}
                            className="flex-1 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-otic-orange text-gray-800 dark:text-white placeholder-gray-500"
                        />
                        
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
                            onClick={handleSendMessage}
                            disabled={isChatLoading || (!chatInput.trim() && !transcript)}
                            className="p-3 bg-otic-orange hover:bg-orange-600 rounded-xl text-white transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
