
import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { FileText, X } from 'lucide-react';

interface UploadModalProps {
  fileName: string;
  onConfirm: (title: string) => void;
  onCancel: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ fileName, onConfirm, onCancel }) => {
  const [title, setTitle] = useState('');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <GlassCard className="w-full max-w-md p-6 relative">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-otic-orange/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-otic-orange" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Name Your Document</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            File: <span className="font-mono">{fileName}</span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Biology Unit 1 Notes"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:outline-none focus:border-otic-orange text-gray-800 dark:text-white"
              autoFocus
            />
          </div>
          
          <button
            onClick={() => {
                if (title.trim()) onConfirm(title);
            }}
            disabled={!title.trim()}
            className="w-full py-3 bg-otic-orange hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 transition-all"
          >
            Save & Go to Reading Room
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
