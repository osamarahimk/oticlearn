
import React, { useEffect, useState } from 'react';
import { Bot, X, Sparkles } from 'lucide-react';

interface EncouragementAvatarProps {
  onClose: () => void;
  message?: string;
}

const MESSAGES = [
    "You're doing great! Keep that focus sharp! 🧠",
    "15 minutes down! Hydrate and keep learning! 💧",
    "You're crushing it! A deeper understanding is just a few pages away. 🚀",
    "Fantastic effort! Remember to take deep breaths. 🧘‍♂️",
    "Consistency is key! You are building great habits. ⭐"
];

export const EncouragementAvatar: React.FC<EncouragementAvatarProps> = ({ onClose }) => {
  const [message, setMessage] = useState("");

  useEffect(() => {
      setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-blob">
      <div className="relative">
        {/* Bubble */}
        <div className="absolute bottom-24 right-0 w-64 bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-br-none shadow-2xl border border-otic-orange/20 animate-fade-in">
            <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X size={14}/></button>
            <h4 className="font-bold text-otic-orange text-sm mb-1 flex items-center gap-1"><Sparkles size={12}/> Study Buddy</h4>
            <p className="text-gray-700 dark:text-gray-200 text-sm">{message}</p>
        </div>

        {/* Avatar */}
        <div 
            onClick={onClose}
            className="w-20 h-20 bg-gradient-to-tr from-otic-orange to-otic-gold rounded-full shadow-[0_0_20px_rgba(249,115,22,0.5)] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border-4 border-white dark:border-gray-900"
        >
            <Bot className="text-white w-10 h-10" />
        </div>
      </div>
    </div>
  );
};
