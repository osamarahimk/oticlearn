
import React, { useState, useEffect } from 'react';
import { AudioTrack } from '../types';
import { GlassCard } from './GlassCard';
import { 
    Play, Pause, FastForward, Rewind, X, Minimize2, Maximize2, 
    Volume2, MoreHorizontal, Mic 
} from 'lucide-react';

interface AudioPlayerOverlayProps {
    track: AudioTrack;
    isPlaying: boolean;
    progress: number; // 0-100
    currentTime: number;
    duration: number;
    playbackRate: number;
    onTogglePlay: () => void;
    onSeekBy: (seconds: number) => void;
    onChangeSpeed: () => void;
    onClose: () => void;
}

export const AudioPlayerOverlay: React.FC<AudioPlayerOverlayProps> = ({
    track, isPlaying, progress, currentTime, duration, playbackRate,
    onTogglePlay, onSeekBy, onChangeSpeed, onClose
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatTime = (sec: number) => {
        if (!sec || isNaN(sec)) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Visualizer bars simulation
    const [bars, setBars] = useState<number[]>(new Array(30).fill(10));
    useEffect(() => {
        if (!isPlaying || !isExpanded) return;
        const interval = setInterval(() => {
            setBars(prev => prev.map(() => Math.random() * 100));
        }, 100);
        return () => clearInterval(interval);
    }, [isPlaying, isExpanded]);

    if (!track) return null;

    return (
        <div className={`fixed z-[100] transition-all duration-500 ease-in-out shadow-2xl
            ${isExpanded 
                ? 'inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6' 
                : 'bottom-4 right-4 w-full max-w-sm'}`
        }>
            <div className={`relative overflow-hidden transition-all duration-500
                ${isExpanded 
                    ? 'w-full max-w-md bg-gray-900/90 border border-white/10 rounded-3xl p-8' 
                    : 'bg-white/80 dark:bg-[#0f0c29]/90 border border-white/20 dark:border-white/10 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4'}`
            }>
                
                {/* Expanded View Content */}
                {isExpanded && (
                    <div className="flex flex-col items-center text-center animate-fade-in">
                        <button onClick={() => setIsExpanded(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white">
                            <Minimize2 size={24} />
                        </button>
                        
                        <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-otic-orange to-pink-600 shadow-[0_0_50px_rgba(249,115,22,0.4)] mb-8 flex items-center justify-center animate-float">
                            <Mic size={64} className="text-white" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2 line-clamp-1">{track.title}</h2>
                        <p className="text-otic-orange text-sm font-bold uppercase tracking-wider mb-8">{track.author}</p>

                        {/* Visualizer */}
                        <div className="flex items-end justify-center gap-1 h-16 w-full mb-8 px-4">
                            {bars.map((h, i) => (
                                <div 
                                    key={i} 
                                    className="w-2 bg-gradient-to-t from-otic-orange to-otic-gold rounded-full transition-all duration-100"
                                    style={{ height: `${isPlaying ? h : 10}%`, opacity: 0.8 }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Mini View Left Section (Image) */}
                {!isExpanded && (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-otic-orange to-pink-500 flex-shrink-0 flex items-center justify-center shadow-lg shadow-orange-500/20" onClick={() => setIsExpanded(true)}>
                        <div className={`w-2 h-2 bg-white rounded-full ${isPlaying ? 'animate-ping' : ''}`} />
                    </div>
                )}

                {/* Controls Section */}
                <div className="flex-1 min-w-0">
                    {!isExpanded && (
                        <div className="mb-2 cursor-pointer" onClick={() => setIsExpanded(true)}>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{track.title}</h4>
                            <p className="text-xs text-otic-orange font-medium truncate">Narrator Mode</p>
                        </div>
                    )}

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 mb-4 w-full">
                         <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono w-8 text-right">{formatTime(currentTime)}</span>
                         <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-otic-orange transition-all duration-200" style={{ width: `${progress}%` }} />
                         </div>
                         <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono w-8">{formatTime(duration)}</span>
                    </div>

                    {/* Buttons Row */}
                    <div className={`flex items-center ${isExpanded ? 'justify-center gap-8' : 'justify-between gap-2'}`}>
                        <button onClick={onChangeSpeed} className="text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:text-otic-orange transition-colors w-8">
                            {playbackRate}x
                        </button>
                        
                        <button onClick={() => onSeekBy(-10)} className="text-gray-600 dark:text-gray-300 hover:text-white transition-colors">
                            <Rewind size={isExpanded ? 28 : 20} />
                        </button>

                        <button 
                            onClick={onTogglePlay}
                            className={`rounded-full flex items-center justify-center bg-white text-black hover:scale-105 transition-transform shadow-lg shadow-white/10 ${isExpanded ? 'w-16 h-16' : 'w-10 h-10'}`}
                        >
                            {isPlaying ? <Pause size={isExpanded ? 24 : 16} fill="currentColor" /> : <Play size={isExpanded ? 24 : 16} fill="currentColor" className="ml-1"/>}
                        </button>

                        <button onClick={() => onSeekBy(10)} className="text-gray-600 dark:text-gray-300 hover:text-white transition-colors">
                            <FastForward size={isExpanded ? 28 : 20} />
                        </button>

                         {!isExpanded && (
                            <button onClick={onClose} className="text-gray-500 hover:text-red-500 ml-2">
                                <X size={18} />
                            </button>
                         )}
                    </div>
                </div>

            </div>
        </div>
    );
};
