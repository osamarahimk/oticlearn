
import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioTrack } from '../types';

// Helper to decode raw PCM data from Gemini (16-bit, 24kHz, Mono)
const decodeAudioData = async (base64String: string, ctx: AudioContext): Promise<AudioBuffer> => {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // Gemini 2.5 Flash TTS returns Raw PCM 16-bit, 24kHz, Mono
    const sampleRate = 24000;
    const numChannels = 1;
    
    // Create 16-bit integer view of the bytes
    const dataInt16 = new Int16Array(bytes.buffer);
    const frameCount = dataInt16.length / numChannels;
    
    // Create the AudioBuffer
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    
    // Convert Int16 to Float32 (required by Web Audio API)
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            // Normalize 16-bit integer (-32768 to 32767) to float (-1.0 to 1.0)
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    
    return buffer;
};

export const useAudioPlayer = () => {
    const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0); // 0 to 100
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);

    // We use AudioContext for high-quality playback of the Gemini response
    const audioCtxRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const startTimeRef = useRef<number>(0);
    const pausedTimeRef = useRef<number>(0);
    const audioBufferRef = useRef<AudioBuffer | null>(null);

    // Initialize Audio Context
    useEffect(() => {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
            gainNodeRef.current = audioCtxRef.current.createGain();
            gainNodeRef.current.connect(audioCtxRef.current.destination);
        }
        return () => {
            audioCtxRef.current?.close();
        };
    }, []);

    // Setup Media Session (Lock Screen Controls)
    useEffect(() => {
        if ('mediaSession' in navigator && currentTrack) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentTrack.title,
                artist: currentTrack.author,
                album: "OticLearn Audio Notes",
                artwork: [
                    { src: 'https://picsum.photos/512/512', sizes: '512x512', type: 'image/png' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', play);
            navigator.mediaSession.setActionHandler('pause', pause);
            navigator.mediaSession.setActionHandler('seekbackward', () => seekBy(-10));
            navigator.mediaSession.setActionHandler('seekforward', () => seekBy(10));
        }
    }, [currentTrack]);

    // Timer for progress
    useEffect(() => {
        let animationFrameId: number;

        const updateProgress = () => {
            if (isPlaying && audioCtxRef.current && startTimeRef.current) {
                const now = audioCtxRef.current.currentTime;
                const rawElapsed = now - startTimeRef.current;
                
                let current = pausedTimeRef.current + rawElapsed * playbackRate;
                
                if (current >= duration) {
                    current = duration;
                    setIsPlaying(false);
                    pausedTimeRef.current = 0;
                }

                setCurrentTime(current);
                setProgress((current / duration) * 100);
                
                animationFrameId = requestAnimationFrame(updateProgress);
            }
        };

        if (isPlaying) {
            animationFrameId = requestAnimationFrame(updateProgress);
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [isPlaying, duration, playbackRate]);


    const loadTrack = async (track: AudioTrack) => {
        if (!audioCtxRef.current) return;

        // Reset
        stop();
        setCurrentTrack(track);
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        pausedTimeRef.current = 0;

        try {
            // Track.src is base64 data in our Gemini implementation
            const buffer = await decodeAudioData(track.src, audioCtxRef.current);
            audioBufferRef.current = buffer;
            setDuration(buffer.duration);
            play(); // Auto play on load
        } catch (e) {
            console.error("Failed to load audio track", e);
        }
    };

    const play = useCallback(() => {
        if (!audioCtxRef.current || !audioBufferRef.current) return;

        // If context suspended (browser policy), resume it
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }

        // Create new source node (they are one-time use)
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = audioBufferRef.current;
        source.playbackRate.value = playbackRate;
        source.connect(gainNodeRef.current!);
        
        // Start playing from last paused position
        source.start(0, pausedTimeRef.current);
        
        sourceNodeRef.current = source;
        startTimeRef.current = audioCtxRef.current.currentTime;
        setIsPlaying(true);

        // Update Media Session
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';

        source.onended = () => {
            // logic handled in progress effect mostly
        };

    }, [playbackRate]);

    const pause = useCallback(() => {
        if (sourceNodeRef.current && isPlaying) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current = null;
            
            // Calculate time elapsed to save state
            const elapsed = (audioCtxRef.current!.currentTime - startTimeRef.current) * playbackRate;
            pausedTimeRef.current += elapsed;
            
            setIsPlaying(false);
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
        }
    }, [isPlaying, playbackRate]);

    const stop = useCallback(() => {
        if (sourceNodeRef.current) {
            try { sourceNodeRef.current.stop(); } catch(e) {}
            sourceNodeRef.current = null;
        }
        setIsPlaying(false);
        pausedTimeRef.current = 0;
        setCurrentTime(0);
        setProgress(0);
    }, []);

    const seekBy = (seconds: number) => {
        const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
        const wasPlaying = isPlaying;
        
        if (wasPlaying) pause();
        pausedTimeRef.current = newTime;
        setCurrentTime(newTime);
        setProgress((newTime / duration) * 100);
        if (wasPlaying) play();
    };

    const togglePlayPause = () => {
        if (isPlaying) pause();
        else play();
    };

    const changeSpeed = () => {
        const newRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
        setPlaybackRate(newRate);
        if(isPlaying) {
            // For AudioBufferSourceNode, we can update rate dynamically
            if (sourceNodeRef.current) {
                sourceNodeRef.current.playbackRate.value = newRate;
            }
        }
    };
    
    // Effect to handle dynamic speed change while playing
    useEffect(() => {
        if (isPlaying && sourceNodeRef.current) {
             sourceNodeRef.current.playbackRate.value = playbackRate;
        }
    }, [playbackRate]);

    return {
        currentTrack,
        isPlaying,
        progress,
        currentTime,
        duration,
        playbackRate,
        loadTrack,
        togglePlayPause,
        seekBy,
        changeSpeed,
        closePlayer: () => { stop(); setCurrentTrack(null); }
    };
};
